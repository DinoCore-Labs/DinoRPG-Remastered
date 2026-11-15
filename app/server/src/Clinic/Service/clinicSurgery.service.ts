import { getClanActionDefinition } from '@dinorpg/core/models/clan/clanActions.js';
import {
	canStartClinicSurgeryAgain,
	chooseClinicSurgeryVisualTraits,
	clinicSurgeryIsReady,
	clinicSurgeryReadyAt
} from '@dinorpg/core/models/clinic/clinicSurgery.js';
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { CLINIC_SCENARIO_KEY, CLINIC_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/clinicScenario.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { DinozState, Prisma } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { generateDinozDisplay } from '../../utils/dinoz/displayDinoz.js';

function getRequiredClinicActions(): number {
	const definition = getClanActionDefinition('hopita');
	if (!definition) throw new Error('Missing clan action hopita');
	return definition.requiredActions;
}

const requiredActions: number = getRequiredClinicActions();

/** Same lock as the existing clinic treatment, to serialize changes for the player. */
async function lockPlayer(tx: Prisma.TransactionClient, userId: string): Promise<void> {
	await tx.$executeRaw`
		SELECT pg_advisory_xact_lock(hashtextextended(${`gameplay:${userId}`}, 0::bigint))
	`;
}

/** Called only by the confirmed « oui » phase of Anna Tomie's dialog. */
export async function beginClinicSurgery(
	tx: Prisma.TransactionClient,
	userId: string,
	dinozId: number,
	now = new Date()
) {
	await lockPlayer(tx, userId);
	if (!gameConfig.world.activeFeatures.includes('clinik')) {
		throw new ExpectedError('clinic.surgeryUnavailable', { statusCode: 403 });
	}
	const membership = await tx.clanMember.findUnique({ where: { userId }, select: { clanId: true } });
	if (!membership) throw new ExpectedError('clinic.clanRequired', { statusCode: 403 });
	const completed = await tx.clanActionProgress.findUnique({
		where: { clanId_actionKey: { clanId: membership.clanId, actionKey: 'hopita' } },
		select: { progress: true, completedAt: true }
	});
	if (!completed?.completedAt || completed.progress < requiredActions) {
		throw new ExpectedError('clinic.notBuilt', { statusCode: 403 });
	}
	const scenario = await tx.userScenario.findUnique({
		where: { scenarioKey_userId: { scenarioKey: CLINIC_SCENARIO_KEY, userId } },
		select: { progression: true }
	});
	if (!scenario || scenario.progression < CLINIC_SCENARIO_STEPS.CLINIC_OPEN) {
		throw new ExpectedError('clinic.scenarioLocked', { statusCode: 403 });
	}
	const dinoz = await tx.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			userId: true,
			placeId: true,
			state: true,
			life: true,
			canRename: true,
			raceId: true,
			display: true,
			leaderId: true,
			followers: { select: { id: true } }
		}
	});
	if (!dinoz || dinoz.userId !== userId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', { statusCode: 403 });
	}
	if (
		dinoz.placeId !== PlaceEnum.CLINIQUE ||
		dinoz.life <= 0 ||
		dinoz.state !== null ||
		dinoz.canRename ||
		dinoz.leaderId !== null ||
		dinoz.followers.length > 0
	) {
		throw new ExpectedError('clinic.surgeryDinozUnavailable', { statusCode: 409 });
	}
	// Requêtes séquentielles : un client PostgreSQL transactionnel ne doit pas exécuter plusieurs queries simultanément.
	const concentration = await tx.dinozConcentration.findUnique({ where: { dinozId }, select: { dinozId: true } });
	const dungeon = await tx.mtDungeonRun.findFirst({ where: { userId, leaderDinozId: dinozId }, select: { id: true } });
	const defender = await tx.devourerControl.findFirst({
		where: { dinozs: { some: { id: dinozId } } },
		select: { id: true }
	});
	if (concentration || dungeon || defender) {
		throw new ExpectedError('clinic.surgeryDinozUnavailable', { statusCode: 409 });
	}
	const previous = await tx.dinozSurgery.findUnique({ where: { dinozId } });
	if (previous?.finishedAt === null) {
		throw new ExpectedError('clinic.surgeryInProgress', { statusCode: 409 });
	}
	if (!canStartClinicSurgeryAgain(previous?.startedAt, now)) {
		throw new ExpectedError('clinic.surgeryCooldown', { statusCode: 409 });
	}
	const race = raceList[dinoz.raceId as RaceEnum];
	if (!race) throw new ExpectedError('clinic.surgeryDinozUnavailable', { statusCode: 409 });
	let newDisplay: string;
	try {
		const traits = chooseClinicSurgeryVisualTraits(race, dinoz.display);
		newDisplay = generateDinozDisplay(race, traits.palette, traits.rare1, traits.rare2);
		// L'opération doit produire une apparence différente.
		if (newDisplay === dinoz.display) {
			newDisplay = generateDinozDisplay(race, traits.palette, traits.rare1, traits.rare2);
		}
		if (newDisplay === dinoz.display) throw new Error('Unchanged Dinoz display');
	} catch {
		throw new ExpectedError('clinic.surgeryDinozUnavailable', { statusCode: 409 });
	}
	const readyAt = clinicSurgeryReadyAt(now);
	const reserved = await tx.dinoz.updateMany({
		where: { id: dinozId, userId, placeId: PlaceEnum.CLINIQUE, state: null, life: { gt: 0 } },
		data: { state: DinozState.clinic, stateTimer: readyAt }
	});
	if (reserved.count !== 1) throw new ExpectedError('clinic.surgeryDinozUnavailable', { statusCode: 409 });
	await tx.dinozSurgery.upsert({
		where: { dinozId },
		create: { dinozId, userId, startedAt: now, readyAt, finishedAt: null, oldDisplay: dinoz.display, newDisplay },
		update: { userId, startedAt: now, readyAt, finishedAt: null, oldDisplay: dinoz.display, newDisplay }
	});
	return { dinozId, readyAt: readyAt.toISOString() };
}

/** Lazy completion on fiche/menu, after the full hour has elapsed. */
export async function finishClinicSurgeryIfReady(
	tx: Prisma.TransactionClient,
	userId: string,
	dinozId: number,
	now = new Date()
): Promise<boolean> {
	await lockPlayer(tx, userId);
	const surgery = await tx.dinozSurgery.findUnique({ where: { dinozId } });
	if (
		!surgery ||
		surgery.userId !== userId ||
		surgery.finishedAt !== null ||
		!clinicSurgeryIsReady(surgery.readyAt, now)
	)
		return false;
	const changed = await tx.dinoz.updateMany({
		where: { id: dinozId, userId, state: DinozState.clinic, stateTimer: surgery.readyAt },
		data: { state: null, stateTimer: null, display: surgery.newDisplay }
	});
	if (changed.count !== 1) return false;
	await tx.dinozSurgery.update({ where: { dinozId }, data: { finishedAt: now } });
	return true;
}
