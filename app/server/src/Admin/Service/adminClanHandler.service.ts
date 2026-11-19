import { clanActionDefinitions, getClanActionDefinition } from '@dinorpg/core/models/clan/clanActions.js';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { GameLogType, Role } from '../../../../prisma/index.js';
import { CreateGameLogInput, safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import {
	adminClanActionParamsSchema,
	adminClanPageParamsSchema,
	adminClanParamsSchema,
	kickClanMemberSchema,
	searchClanQuerySchema,
	updateAdminClanActionProgressSchema,
	updateClanIngredientSchema,
	updateClanLeaderSchema,
	updateClanNameSchema,
	updateClanTreasureSchema
} from '../Schema/adminClan.schema.js';

async function logAdminClanAction(
	request: FastifyRequest,
	clanId: number,
	metadata?: CreateGameLogInput['metadata'],
	values: string[] = []
) {
	await safeCreateGameLog(
		{
			type: GameLogType.AdminUpdateClan,
			actorUserId: request.user.id,
			values: [clanId.toString(), ...values],
			...(metadata ? { metadata } : {})
		},
		request.log
	);
}

export async function searchAdminClanHandler(request: FastifyRequest, reply: FastifyReply) {
	const query = searchClanQuerySchema.safeParse(request.query);
	if (!query.success) return reply.status(400).send({ message: 'Invalid query' });

	const clans = await prisma.clan.findMany({
		where: {
			name: {
				contains: query.data.q,
				mode: 'insensitive'
			}
		},
		take: 10,
		select: {
			id: true,
			name: true
		}
	});

	return reply.send(clans);
}

export async function getAdminClanHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	if (!params.success) return reply.status(400).send({ message: 'Invalid clan id' });

	const clan = await prisma.clan.findUnique({
		where: { id: params.data.id },
		include: {
			leader: { select: { id: true, name: true } },
			members: { include: { user: { select: { id: true, name: true } } } },
			ingredients: true,
			pages: { select: { id: true, name: true, home: true, public: true, content: true } }
		}
	});

	if (!clan) return reply.status(404).send({ message: 'Clan not found' });

	const progressRows = await prisma.clanActionProgress.findMany({
		where: { clanId: clan.id },
		select: { actionKey: true, progress: true, completedAt: true }
	});
	const byKey = new Map(progressRows.map(row => [row.actionKey, row]));
	const actions = Object.values(clanActionDefinitions).map(definition => {
		const current = byKey.get(definition.key);
		return {
			actionKey: definition.key,
			progress: current?.progress ?? 0,
			total: definition.requiredActions,
			completedAt: current?.completedAt ?? null
		};
	});
	return reply.send({ ...clan, actions });
}

/**
 * Saisie manuelle de la progression d'une action de clan.
 * Utilise le même advisory lock que contributeToClanAction : pas de perte de mise
 * à jour lorsqu'un joueur contribue pendant qu'un administrateur intervient.
 */
export async function updateAdminClanActionProgressHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanActionParamsSchema.safeParse(request.params);
	const body = updateAdminClanActionProgressSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const { id: clanId, actionKey } = params.data;
	const definition = getClanActionDefinition(actionKey);
	if (!definition) return reply.status(404).send({ message: 'Unknown clan action' });
	if (body.data.progress > definition.requiredActions) {
		return reply.status(400).send({ message: 'Progress exceeds required actions' });
	}

	const updated = await prisma.$transaction(
		async tx => {
			await tx.$executeRaw`
			SELECT pg_advisory_xact_lock(hashtextextended(${`clan-action:${clanId}:${actionKey}`}, 0::bigint))
		`;
			const clan = await tx.clan.findUnique({ where: { id: clanId }, select: { id: true } });
			if (!clan) return null;

			const where = { clanId_actionKey: { clanId, actionKey } };
			const current = await tx.clanActionProgress.findUnique({ where });
			const progress = body.data.progress;
			// Complétion liée à la progression, comme les contributions normales.
			// Une valeur inférieure au seuil rouvre l'objectif.
			const completedAt = progress === definition.requiredActions ? (current?.completedAt ?? new Date()) : null;
			await tx.clanActionProgress.upsert({
				where,
				create: { clanId, actionKey, progress, completedAt },
				update: { progress, completedAt }
			});
			return {
				clanId,
				actionKey,
				progress,
				total: definition.requiredActions,
				completedAt,
				previousProgress: current?.progress ?? 0
			};
		},
		{ maxWait: 5_000, timeout: 30_000 }
	);

	if (!updated) return reply.status(404).send({ message: 'Clan not found' });
	await logAdminClanAction(request, clanId, {
		action: 'UPDATE_CLAN_ACTION_PROGRESS',
		actionKey,
		previousProgress: updated.previousProgress,
		progress: updated.progress
	});
	return reply.send({
		clanId: updated.clanId,
		actionKey: updated.actionKey,
		progress: updated.progress,
		total: updated.total,
		completedAt: updated.completedAt
	});
}

export async function updateAdminClanNameHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	const body = updateClanNameSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const updated = await prisma.clan.update({
		where: { id: params.data.id },
		data: { name: body.data.name }
	});

	await logAdminClanAction(request, params.data.id, { action: 'UPDATE_NAME', newName: body.data.name });

	return reply.send(updated);
}

export async function updateAdminClanLeaderHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	const body = updateClanLeaderSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const clan = await prisma.clan.findUnique({ where: { id: params.data.id }, include: { members: true } });
	if (!clan) return reply.status(404).send({ message: 'Clan not found' });

	// Reassigning leadership also modifies the old and new leader's rights.
	if (request.user.role !== Role.SUPER_ADMIN) {
		const protectedLeader = await prisma.user.findFirst({
			where: {
				id: { in: [clan.leaderId, body.data.newLeaderId] },
				role: Role.SUPER_ADMIN
			},
			select: { id: true }
		});
		if (protectedLeader) {
			return reply.status(403).send({
				code: 'admin.superAdminProtected',
				message: 'Only SUPER_ADMIN may change the SUPER_ADMIN clan rights.'
			});
		}
	}

	const newLeaderIsMember = clan.members.some(m => m.userId === body.data.newLeaderId);
	if (!newLeaderIsMember) return reply.status(400).send({ message: 'New leader must be a member of the clan' });

	const updated = await prisma.$transaction(async tx => {
		// Remove rights from the old leader
		await tx.clanMember.update({
			where: { userId: clan.leaderId },
			data: { rights: [] }
		});

		// Update the clan's leaderId
		await tx.clan.update({
			where: { id: params.data.id },
			data: { leaderId: body.data.newLeaderId }
		});

		// Give all rights to the new leader
		await tx.clanMember.update({
			where: { userId: body.data.newLeaderId },
			data: { rights: Object.values(ClanMemberRight) }
		});

		return await tx.clan.findUnique({
			where: { id: params.data.id },
			include: { leader: { select: { id: true, name: true } } }
		});
	});

	await logAdminClanAction(request, params.data.id, { action: 'UPDATE_LEADER', newLeaderId: body.data.newLeaderId });

	return reply.send(updated);
}

export async function kickAdminClanMemberHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = kickClanMemberSchema.safeParse(request.params);
	if (!params.success) return reply.status(400).send({ message: 'Invalid payload' });

	const clan = await prisma.clan.findUnique({ where: { id: params.data.id }, include: { members: true } });
	if (!clan) return reply.status(404).send({ message: 'Clan not found' });

	const isLeader = clan.leaderId === params.data.userId;
	if (clan.members.length === 1) {
		// Only member left, delete clan completely
		const clanId = params.data.id;
		await prisma.$transaction([
			prisma.user.updateMany({ where: { clanId }, data: { clanId: null } }),
			prisma.clanJoinRequest.deleteMany({ where: { clanId } }),
			prisma.clanMember.deleteMany({ where: { clanId } }),
			prisma.clanPage.deleteMany({ where: { clanId } }),
			prisma.clanIngredient.deleteMany({ where: { clanId } }),
			prisma.clanHistory.deleteMany({ where: { clanId } }),
			prisma.clanMessage.deleteMany({ where: { clanId } }),
			prisma.clan.delete({ where: { id: clanId } })
		]);
		await logAdminClanAction(request, clanId, { action: 'DELETE_CLAN' });
		return reply.send({ message: 'Clan deleted as it was empty', deleted: true });
	}

	if (isLeader) {
		return reply
			.status(400)
			.send({ message: 'Cannot kick the leader unless they are the last member. Change leader first.' });
	}

	await prisma.clanMember.delete({ where: { userId: params.data.userId } });
	await prisma.user.update({ where: { id: params.data.userId }, data: { clanId: null } });

	await logAdminClanAction(request, params.data.id, { action: 'KICK_MEMBER', kickedUserId: params.data.userId });

	return reply.send({ message: 'Member kicked successfully', deleted: false });
}

export async function deleteAdminClanHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	if (!params.success) return reply.status(400).send({ message: 'Invalid clan id' });

	const clanId = params.data.id;
	await prisma.$transaction([
		prisma.user.updateMany({ where: { clanId }, data: { clanId: null } }),
		prisma.clanJoinRequest.deleteMany({ where: { clanId } }),
		prisma.clanMember.deleteMany({ where: { clanId } }),
		prisma.clanPage.deleteMany({ where: { clanId } }),
		prisma.clanIngredient.deleteMany({ where: { clanId } }),
		prisma.clanHistory.deleteMany({ where: { clanId } }),
		prisma.clanMessage.deleteMany({ where: { clanId } }),
		prisma.clan.delete({ where: { id: clanId } })
	]);

	await logAdminClanAction(request, clanId, { action: 'DELETE_CLAN' });

	return reply.send({ message: 'Clan deleted' });
}

export async function updateAdminClanTreasureHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	const body = updateClanTreasureSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const updated = await prisma.clan.update({
		where: { id: params.data.id },
		data: { treasureValue: body.data.amount }
	});

	await logAdminClanAction(request, params.data.id, { action: 'UPDATE_TREASURE', amount: body.data.amount });

	return reply.send(updated);
}

export async function updateAdminClanIngredientHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	const body = updateClanIngredientSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const clan = await prisma.clan.findUnique({ where: { id: params.data.id }, include: { ingredients: true } });
	if (!clan) return reply.status(404).send({ message: 'Clan not found' });

	const { ingredientId, amountToAddOrRemove } = body.data;

	// @ts-ignore
	const ingredientData = ingredientList[ingredientId];
	if (!ingredientData) return reply.status(400).send({ message: 'Ingredient not found' });

	const price = ingredientData.price || 0;
	const goldDiff = price * amountToAddOrRemove;

	const existing = clan.ingredients.find(i => i.ingredientId === ingredientId);

	await prisma.$transaction(async tx => {
		if (existing) {
			const newQty = existing.quantity + amountToAddOrRemove;
			if (newQty <= 0) {
				await tx.clanIngredient.delete({ where: { ingredientId_clanId: { ingredientId, clanId: params.data.id } } });
			} else {
				await tx.clanIngredient.update({
					where: { ingredientId_clanId: { ingredientId, clanId: params.data.id } },
					data: { quantity: newQty }
				});
			}
		} else {
			if (amountToAddOrRemove > 0) {
				await tx.clanIngredient.create({
					data: {
						clanId: params.data.id,
						ingredientId,
						quantity: amountToAddOrRemove
					}
				});
			} else {
				// Can't remove if not exists
				return;
			}
		}

		// Update treasure
		const newTreasure = Math.max(0, clan.treasureValue + goldDiff);
		await tx.clan.update({
			where: { id: params.data.id },
			data: { treasureValue: newTreasure }
		});
	});

	await logAdminClanAction(request, params.data.id, {
		action: 'UPDATE_INGREDIENT',
		ingredientId,
		amountToAddOrRemove
	});

	return reply.send({ message: 'Ingredient updated' });
}

export async function clearAdminClanPageHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanPageParamsSchema.safeParse(request.params);
	if (!params.success) return reply.status(400).send({ message: 'Invalid payload' });

	const page = await prisma.clanPage.findUnique({ where: { id: params.data.pageId } });
	if (!page || page.clanId !== params.data.id) return reply.status(404).send({ message: 'Page not found' });

	if (page.home) {
		await prisma.clanPage.update({
			where: { id: params.data.pageId },
			data: { content: '[Contenu supprimé par la Modération]' }
		});
		await logAdminClanAction(request, params.data.id, { action: 'CLEAR_PAGE', pageId: params.data.pageId });
		return reply.send({ message: 'Page cleared' });
	} else {
		await prisma.clanPage.delete({ where: { id: params.data.pageId } });
		await logAdminClanAction(request, params.data.id, { action: 'DELETE_PAGE', pageId: params.data.pageId });
		return reply.send({ message: 'Page deleted' });
	}
}
