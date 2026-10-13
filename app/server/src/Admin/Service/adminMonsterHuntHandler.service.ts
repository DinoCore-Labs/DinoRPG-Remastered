import type { AdminMonsterHuntOverview } from '@dinorpg/core/models/admin/adminMonsterHunt.js';
import {
	MonsterHuntPresetKey,
	MonsterHuntStatus as CoreMonsterHuntStatus
} from '@dinorpg/core/models/monsterHunt/monsterHunt.js';
import { MONSTER_HUNT_PRESETS } from '@dinorpg/core/models/monsterHunt/monsterHuntEditions.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { MonsterHuntStatus } from '../../../../prisma/index.js';
import {
	MONSTER_HUNT_LIFECYCLE_JOB_KEY,
	MonsterHuntManager
} from '../../MonsterHunt/Controller/monsterHuntManager.controller.js';
import { prisma } from '../../prisma.js';
import { adminCreateMonsterHuntBodySchema, adminMonsterHuntIdParamsSchema } from '../Schema/adminMonsterHunt.schema.js';

function getStartNewsSlug(huntSlug: string): string {
	return `monster-hunt-${huntSlug}-start`;
}

function getEndNewsSlug(huntSlug: string): string {
	return `monster-hunt-${huntSlug}-end`;
}

async function runLifecycleAndReschedule() {
	const result = await MonsterHuntManager.lifecycleJob(prisma);

	await prisma.jobDefinition.updateMany({
		where: {
			key: MONSTER_HUNT_LIFECYCLE_JOB_KEY
		},

		data: {
			nextRunAt: result.nextRunAt,
			lastError: null
		}
	});

	return result;
}

export async function getAdminMonsterHuntsHandler(
	_request: FastifyRequest,
	_reply: FastifyReply
): Promise<AdminMonsterHuntOverview> {
	const hunts = await prisma.monsterHunt.findMany({
		orderBy: {
			startAt: 'desc'
		},

		select: {
			id: true,
			name: true,
			slug: true,
			status: true,
			startAt: true,
			endAt: true,

			_count: {
				select: {
					participants: true
				}
			}
		}
	});

	const stats = await prisma.monsterHuntParticipant.groupBy({
		by: ['huntId'],

		_sum: {
			points: true,
			objects: true,
			kills: true
		}
	});

	const statsByHunt = new Map(stats.map(stat => [stat.huntId, stat._sum]));

	const newsSlugs = hunts.flatMap(hunt => [getStartNewsSlug(hunt.slug), getEndNewsSlug(hunt.slug)]);

	const existingNews =
		newsSlugs.length > 0
			? await prisma.news.findMany({
					where: {
						slug: {
							in: newsSlugs
						}
					},

					select: {
						slug: true
					}
				})
			: [];

	const existingNewsSlugs = new Set(existingNews.map(news => news.slug));

	return {
		presets: Object.entries(MONSTER_HUNT_PRESETS).map(([key, config]) => ({
			key: key as MonsterHuntPresetKey,

			slug: config.slug,

			nameKey: config.nameKey
		})),

		editions: hunts.map(hunt => {
			const huntStats = statsByHunt.get(hunt.id);

			return {
				id: hunt.id,
				name: hunt.name,
				slug: hunt.slug,

				status: hunt.status as CoreMonsterHuntStatus,

				startAt: hunt.startAt.toISOString(),

				endAt: hunt.endAt.toISOString(),

				participants: hunt._count.participants,

				points: huntStats?.points ?? 0,

				objects: huntStats?.objects ?? 0,

				kills: huntStats?.kills ?? 0,

				startNewsPublished: existingNewsSlugs.has(getStartNewsSlug(hunt.slug)),

				endNewsPublished: existingNewsSlugs.has(getEndNewsSlug(hunt.slug))
			};
		})
	};
}

export async function createAdminMonsterHuntHandler(request: FastifyRequest, reply: FastifyReply) {
	const body = adminCreateMonsterHuntBodySchema.parse(request.body);

	const config = MONSTER_HUNT_PRESETS[body.presetKey];

	if (!config) {
		return reply.code(400).send({
			message: `Preset Monster Hunt "${body.presetKey}" inconnu.`
		});
	}

	const hunt = await MonsterHuntManager.createEdition({
		config,

		startAt: new Date(body.startAt),

		endAt: new Date(body.endAt)
	});

	return {
		message: `Édition "${hunt.slug}" créée avec succès.`,

		id: hunt.id
	};
}

export async function startAdminMonsterHuntNowHandler(request: FastifyRequest, reply: FastifyReply) {
	const { id } = adminMonsterHuntIdParamsSchema.parse(request.params);

	const hunt = await prisma.monsterHunt.findUnique({
		where: {
			id
		}
	});

	if (!hunt) {
		return reply.code(404).send({
			message: 'Monster Hunt introuvable.'
		});
	}

	if (hunt.status !== MonsterHuntStatus.SCHEDULED) {
		return reply.code(400).send({
			message: 'Seule une édition planifiée peut être démarrée immédiatement.'
		});
	}

	const now = new Date();

	if (hunt.endAt <= now) {
		return reply.code(400).send({
			message: 'La date de fin de cette édition est déjà dépassée.'
		});
	}

	const overlapping = await prisma.monsterHunt.findFirst({
		where: {
			id: {
				not: hunt.id
			},

			status: {
				in: [MonsterHuntStatus.SCHEDULED, MonsterHuntStatus.ACTIVE]
			},

			startAt: {
				lt: hunt.endAt
			},

			endAt: {
				gt: now
			}
		},

		select: {
			id: true,
			name: true
		}
	});

	if (overlapping) {
		return reply.code(409).send({
			message: `Impossible de démarrer cette édition : elle chevaucherait "${overlapping.name}".`
		});
	}

	await prisma.monsterHunt.update({
		where: {
			id: hunt.id
		},

		data: {
			startAt: now
		}
	});

	await runLifecycleAndReschedule();

	return {
		message: 'La Chasse aux Monstres a été démarrée.'
	};
}

export async function endAdminMonsterHuntNowHandler(request: FastifyRequest, reply: FastifyReply) {
	const { id } = adminMonsterHuntIdParamsSchema.parse(request.params);

	const hunt = await prisma.monsterHunt.findUnique({
		where: {
			id
		}
	});

	if (!hunt) {
		return reply.code(404).send({
			message: 'Monster Hunt introuvable.'
		});
	}

	if (hunt.status !== MonsterHuntStatus.ACTIVE) {
		return reply.code(400).send({
			message: 'Seule une édition active peut être terminée immédiatement.'
		});
	}

	await prisma.monsterHunt.update({
		where: {
			id: hunt.id
		},

		data: {
			endAt: new Date()
		}
	});

	/*
	 * This performs:
	 *
	 * ACTIVE → ENDED
	 * final rewards
	 * ENDED → REWARDED
	 * final news
	 */
	await runLifecycleAndReschedule();

	return {
		message: 'La Chasse aux Monstres a été terminée.'
	};
}

export async function publishAdminMonsterHuntStartNewsHandler(request: FastifyRequest, reply: FastifyReply) {
	const { id } = adminMonsterHuntIdParamsSchema.parse(request.params);

	const created = await MonsterHuntManager.ensureStartNews(id, prisma);

	return {
		message: created ? 'News de début publiée.' : 'La news de début existe déjà ou l’édition n’est pas active.'
	};
}

export async function publishAdminMonsterHuntEndNewsHandler(request: FastifyRequest, reply: FastifyReply) {
	const { id } = adminMonsterHuntIdParamsSchema.parse(request.params);

	const created = await MonsterHuntManager.ensureEndNews(id, prisma);

	return {
		message: created ? 'News de fin publiée.' : 'La news de fin existe déjà ou l’édition n’est pas encore REWARDED.'
	};
}

export async function distributeAdminMonsterHuntRewardsHandler(request: FastifyRequest, reply: FastifyReply) {
	const { id } = adminMonsterHuntIdParamsSchema.parse(request.params);

	const result = await MonsterHuntManager.distributeRankingRewards(id, prisma);

	return {
		message: `${result.rewardedPlayers} joueur(s) récompensé(s), ` + `${result.alreadyRewardedPlayers} déjà traité(s).`
	};
}

export async function runAdminMonsterHuntLifecycleHandler() {
	const result = await runLifecycleAndReschedule();

	return {
		message: `Lifecycle exécuté. Prochain passage : ${result.nextRunAt.toISOString()}.`
	};
}

export async function deleteAdminMonsterHuntHandler(request: FastifyRequest, reply: FastifyReply) {
	const { id } = adminMonsterHuntIdParamsSchema.parse(request.params);

	const hunt = await prisma.monsterHunt.findUnique({
		where: {
			id
		},

		select: {
			id: true,
			status: true,

			_count: {
				select: {
					participants: true
				}
			}
		}
	});

	if (!hunt) {
		return reply.code(404).send({
			message: 'Monster Hunt introuvable.'
		});
	}

	if (hunt.status !== MonsterHuntStatus.DRAFT && hunt.status !== MonsterHuntStatus.SCHEDULED) {
		return reply.code(400).send({
			message: 'Une édition ayant déjà commencé ne peut plus être supprimée.'
		});
	}

	if (hunt._count.participants > 0) {
		return reply.code(409).send({
			message: 'Cette édition possède déjà des participants et ne peut plus être supprimée.'
		});
	}

	await prisma.monsterHunt.delete({
		where: {
			id: hunt.id
		}
	});

	await MonsterHuntManager.rescheduleLifecycleJob(prisma);

	return {
		message: 'Édition supprimée.'
	};
}
