import { clanActionDefinitions, getClanActionDefinition } from '@dinorpg/core/models/clan/clanActions.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { clanIdParamSchema } from '../Schema/clan.schema.js';
import { clanActionContributionSchema, clanActionParamsSchema } from '../Schema/clanAction.schema.js';

function actionResult(clanId: number, key: string, progress: number, total: number) {
	return {
		clanId,
		actionKey: key,
		progress,
		total,
		remaining: Math.max(0, total - progress),
		percentage: Math.min(100, Math.floor((progress / total) * 100)),
		completed: progress >= total
	};
}

export async function listClanActions(userId: string, clanId: number) {
	const membership = await prisma.clanMember.findUnique({
		where: { userId },
		select: { clanId: true }
	});
	if (!membership || membership.clanId !== clanId) {
		throw new ExpectedError('clanAction.notMember', { statusCode: 403 });
	}

	const definitions = Object.values(clanActionDefinitions);
	const [rows, scenarios] = await Promise.all([
		prisma.clanActionProgress.findMany({ where: { clanId } }),
		prisma.userScenario.findMany({
			where: { userId, scenarioKey: { in: definitions.map(def => def.scenarioKey) } },
			select: { scenarioKey: true, progression: true }
		})
	]);
	const byAction = new Map(rows.map(row => [row.actionKey, row.progress]));
	const byScenario = new Map(scenarios.map(row => [row.scenarioKey, row.progression]));

	return definitions.map(def => ({
		...actionResult(clanId, def.key, byAction.get(def.key) ?? 0, def.requiredActions),
		placeId: def.placeId,
		available: (byScenario.get(def.scenarioKey) ?? 0) >= def.minimumScenarioProgression
	}));
}

export async function contributeToClanAction(userId: string, clanId: number, actionKey: string, dinozId: number) {
	const definition = getClanActionDefinition(actionKey);
	if (!definition) {
		throw new ExpectedError('clanAction.unknown', { statusCode: 404 });
	}

	return prisma.$transaction(
		async tx => {
			// Verrou gameplay du joueur, puis verrou collectif de cet objectif.
			// Les opérations critiques restent dans la MÊME transaction Prisma.
			await tx.$executeRaw`
			SELECT pg_advisory_xact_lock(hashtextextended(${`gameplay:${userId}`}, 0::bigint))
		`;

			const membership = await tx.clanMember.findUnique({
				where: { userId },
				select: { clanId: true }
			});
			if (!membership || membership.clanId !== clanId) {
				throw new ExpectedError('clanAction.notMember', { statusCode: 403 });
			}

			await tx.$executeRaw`
			SELECT pg_advisory_xact_lock(hashtextextended(${`clan-action:${clanId}:${actionKey}`}, 0::bigint))
		`;

			const scenario = await tx.userScenario.findUnique({
				where: { scenarioKey_userId: { scenarioKey: definition.scenarioKey, userId } },
				select: { progression: true }
			});
			if ((scenario?.progression ?? 0) < definition.minimumScenarioProgression) {
				throw new ExpectedError('clanAction.scenarioLocked', { statusCode: 403 });
			}

			const dinoz = await tx.dinoz.findUnique({
				where: { id: dinozId },
				select: {
					userId: true,
					placeId: true,
					leaderId: true,
					state: true,
					life: true,
					fight: true,
					canRename: true
				}
			});
			if (!dinoz || dinoz.userId !== userId) {
				throw new ExpectedError('dinozDoesNotBelongToUser', { statusCode: 403 });
			}
			if (
				dinoz.placeId !== definition.placeId ||
				dinoz.state !== null ||
				dinoz.life <= 0 ||
				!dinoz.fight ||
				dinoz.canRename
			) {
				throw new ExpectedError('clanAction.dinozUnavailable', { statusCode: 409 });
			}

			const concentration = await tx.dinozConcentration.findUnique({
				where: { dinozId },
				select: { dinozId: true }
			});
			if (concentration) {
				throw new ExpectedError('clanAction.dinozUnavailable', { statusCode: 409 });
			}

			const activeDungeon = await tx.mtDungeonRun.findFirst({
				where: { userId, leaderDinozId: dinoz.leaderId ?? dinozId },
				select: { id: true }
			});
			if (activeDungeon) {
				throw new ExpectedError('clanAction.dinozUnavailable', { statusCode: 409 });
			}

			const where = { clanId_actionKey: { clanId, actionKey } };
			const current = await tx.clanActionProgress.findUnique({ where });
			if ((current?.progress ?? 0) >= definition.requiredActions) {
				throw new ExpectedError('clanAction.completed', { statusCode: 409 });
			}

			// MT : give="action:1". Une action de Dinoz, pas une Potion d'Irma.
			// On conserve remaining/gather : le renouvellement passe par le flux existant.
			const consumed = await tx.dinoz.updateMany({
				where: {
					id: dinozId,
					userId,
					placeId: definition.placeId,
					fight: true,
					state: null,
					life: { gt: 0 },
					canRename: false
				},
				data: { fight: false }
			});
			if (consumed.count !== 1) {
				throw new ExpectedError('clanAction.dinozUnavailable', { statusCode: 409 });
			}

			const nextProgress = (current?.progress ?? 0) + 1;
			const completedAt = nextProgress === definition.requiredActions ? new Date() : null;
			await tx.clanActionProgress.upsert({
				where,
				create: { clanId, actionKey, progress: nextProgress, completedAt },
				update: { progress: nextProgress, completedAt }
			});

			return actionResult(clanId, actionKey, nextProgress, definition.requiredActions);
		},
		{ maxWait: 5_000, timeout: 30_000 }
	);
}

export async function getClanActions(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);
	return reply.send({ actions: await listClanActions(req.user.id, clanId) });
}

export async function contributeClanAction(req: FastifyRequest, reply: FastifyReply) {
	const { clanId, actionKey } = clanActionParamsSchema.parse(req.params);
	const { dinozId } = clanActionContributionSchema.parse(req.body);
	return reply.send(await contributeToClanAction(req.user.id, clanId, actionKey, dinozId));
}
