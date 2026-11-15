import { getClanActionDefinition } from '@dinorpg/core/models/clan/clanActions.js';
import {
	canStartClinicTreatmentAgain,
	clinicTreatmentIsReady,
	clinicTreatmentReadyAt
} from '@dinorpg/core/models/clinic/clinicTreatment.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { CLINIC_SCENARIO_KEY, CLINIC_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/clinicScenario.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { DinozState, Prisma } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';

const clinicAction = getClanActionDefinition('hopita');
if (!clinicAction) {
	throw new Error('Clan action hopita is not registered');
}
const CLINIC_REQUIRED_ACTIONS = clinicAction.requiredActions;

/**
 * Compatible avec le verrouillage déjà utilisé pour les actions de clan.
 * Il interdit notamment de commencer simultanément deux soins avec deux Dinoz.
 */
async function lockPlayer(tx: Prisma.TransactionClient, userId: string): Promise<void> {
	await tx.$executeRaw`
		SELECT pg_advisory_xact_lock(hashtextextended(${`gameplay:${userId}`}, 0::bigint))
	`;
}

/**
 * Appelé par l'effet de dialogue « soinok », dans la transaction du dialogue.
 * Aucun soin instantané : l'état et l'échéance sont persistés, puis le joueur
 * retrouvera son Dinoz guéri après une heure (réconciliation à la lecture).
 */
export async function beginClinicTreatment(
	tx: Prisma.TransactionClient,
	userId: string,
	dinozId: number,
	now = new Date()
) {
	await lockPlayer(tx, userId);
	if (!gameConfig.world.activeFeatures.includes('clinik')) {
		throw new ExpectedError('clinic.unavailable', { statusCode: 403 });
	}
	const membership = await tx.clanMember.findUnique({
		where: { userId },
		select: { clanId: true }
	});
	if (!membership) throw new ExpectedError('clinic.clanRequired', { statusCode: 403 });

	const completed = await tx.clanActionProgress.findUnique({
		where: { clanId_actionKey: { clanId: membership.clanId, actionKey: 'hopita' } },
		select: { progress: true, completedAt: true }
	});
	if (!completed?.completedAt || completed.progress < CLINIC_REQUIRED_ACTIONS) {
		throw new ExpectedError('clinic.notBuilt', { statusCode: 403 });
	}

	const scenario = await tx.userScenario.findUnique({
		where: { scenarioKey_userId: { scenarioKey: CLINIC_SCENARIO_KEY, userId } },
		select: { progression: true }
	});
	if (!scenario || scenario.progression < CLINIC_SCENARIO_STEPS.CLINIC_OPEN) {
		throw new ExpectedError('clinic.scenarioLocked', { statusCode: 403 });
	}

	const previous = await tx.clinicTreatment.findUnique({ where: { userId } });
	if (previous?.finishedAt === null) {
		throw new ExpectedError('clinic.alreadyTreating', { statusCode: 409 });
	}
	if (!canStartClinicTreatmentAgain(previous?.startedAt, now)) {
		throw new ExpectedError('clinic.cooldown', { statusCode: 409 });
	}

	const dinoz = await tx.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			userId: true,
			placeId: true,
			state: true,
			life: true,
			maxLife: true,
			canRename: true
		}
	});
	if (!dinoz || dinoz.userId !== userId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', { statusCode: 403 });
	}
	if (
		dinoz.placeId !== PlaceEnum.CLINIQUE ||
		dinoz.state !== null ||
		dinoz.life <= 0 ||
		dinoz.life >= dinoz.maxLife ||
		dinoz.canRename
	) {
		throw new ExpectedError('clinic.dinozUnavailable', { statusCode: 409 });
	}
	// Requêtes séquentielles : un client PostgreSQL transactionnel ne doit pas exécuter plusieurs queries simultanément.
	const concentration = await tx.dinozConcentration.findUnique({ where: { dinozId }, select: { dinozId: true } });
	const dungeon = await tx.mtDungeonRun.findFirst({ where: { userId, leaderDinozId: dinozId }, select: { id: true } });
	const defender = await tx.devourerControl.findFirst({
		where: { dinozs: { some: { id: dinozId } } },
		select: { id: true }
	});
	if (concentration || dungeon || defender) {
		throw new ExpectedError('clinic.dinozUnavailable', { statusCode: 409 });
	}

	const readyAt = clinicTreatmentReadyAt(now);
	const updated = await tx.dinoz.updateMany({
		where: { id: dinozId, userId, placeId: PlaceEnum.CLINIQUE, state: null, life: { gt: 0, lt: dinoz.maxLife } },
		data: { state: DinozState.clinic, stateTimer: readyAt }
	});
	if (updated.count !== 1) {
		throw new ExpectedError('clinic.dinozUnavailable', { statusCode: 409 });
	}

	// Le patient quitte son groupe lors de son admission.
	// S'il est meneur, ses suiveurs deviennent indépendants.
	// S'il est suiveur, les autres membres restent ensemble.
	// La déliaison est atomique avec le soin : toute erreur provoque un rollback.
	await tx.dinoz.updateMany({
		where: { userId, OR: [{ id: dinozId }, { leaderId: dinozId }] },
		data: { leaderId: null }
	});

	await tx.clinicTreatment.upsert({
		where: { userId },
		create: { userId, dinozId, startedAt: now, readyAt, finishedAt: null },
		update: { dinozId, startedAt: now, readyAt, finishedAt: null }
	});
	await tx.userScenario.update({
		where: { scenarioKey_userId: { scenarioKey: CLINIC_SCENARIO_KEY, userId } },
		data: { progression: CLINIC_SCENARIO_STEPS.TREATMENT_STARTED }
	});
	return { dinozId, readyAt: readyAt.toISOString() };
}

/**
 * La disparition du statut temporaire « soin » est automatique à l'expiration.
 * L'opération est déclenchée lors du chargement d'une fiche ou du menu Dinoz,
 * et rend immédiatement tous les PV. Aucun second clic ni action nécessaire.
 * Le verrou protège cette transition si deux lectures se produisent en parallèle.
 */
export async function finishClinicTreatmentIfReady(
	tx: Prisma.TransactionClient,
	userId: string,
	dinozId: number,
	now = new Date()
): Promise<boolean> {
	await lockPlayer(tx, userId);
	const treatment = await tx.clinicTreatment.findUnique({ where: { userId } });
	if (
		!treatment ||
		treatment.dinozId !== dinozId ||
		treatment.finishedAt !== null ||
		!clinicTreatmentIsReady(treatment.readyAt, now)
	) {
		return false;
	}
	const dinoz = await tx.dinoz.findUnique({
		where: { id: dinozId },
		select: { id: true, userId: true, state: true, stateTimer: true, maxLife: true }
	});
	if (
		!dinoz ||
		dinoz.userId !== userId ||
		dinoz.state !== DinozState.clinic ||
		dinoz.stateTimer?.getTime() !== treatment.readyAt.getTime()
	) {
		return false;
	}
	const updated = await tx.dinoz.updateMany({
		where: { id: dinozId, userId, state: DinozState.clinic, stateTimer: treatment.readyAt },
		data: { state: null, stateTimer: null, life: dinoz.maxLife }
	});
	if (updated.count !== 1) return false;
	await tx.clinicTreatment.update({ where: { userId }, data: { finishedAt: now } });
	return true;
}
