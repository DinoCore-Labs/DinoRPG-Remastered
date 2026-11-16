import { getClanActionDefinition } from '@dinorpg/core/models/clan/clanActions.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { CLINIC_SCENARIO_KEY, CLINIC_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/clinicScenario.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import type { Prisma } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';

const hopita = getClanActionDefinition('hopita');
if (!hopita) throw new Error('Missing clan construction action hopita');
const requiredActions = hopita.requiredActions;

/** Protéger les URL de groupe/start contre une utilisation sans clinique construite. */
export async function assertClinicMissionAccess(
	tx: Prisma.TransactionClient,
	params: { userId: string; dinozId: number }
): Promise<void> {
	if (!gameConfig.world.activeFeatures.includes('clinik')) {
		throw new ExpectedError('clinic.missionsUnavailable', { statusCode: 403 });
	}
	// Requêtes séquentielles sur le même client de transaction Prisma.
	const dinoz = await tx.dinoz.findUnique({
		where: { id: params.dinozId },
		select: { userId: true, placeId: true, state: true, life: true }
	});
	const scenario = await tx.userScenario.findUnique({
		where: { scenarioKey_userId: { userId: params.userId, scenarioKey: CLINIC_SCENARIO_KEY } },
		select: { progression: true }
	});
	const member = await tx.clanMember.findUnique({
		where: { userId: params.userId },
		select: { clanId: true }
	});
	if (
		!dinoz ||
		dinoz.userId !== params.userId ||
		dinoz.placeId !== PlaceEnum.CLINIQUE ||
		dinoz.state !== null ||
		dinoz.life <= 0 ||
		!scenario ||
		scenario.progression < CLINIC_SCENARIO_STEPS.CLINIC_OPEN ||
		!member
	) {
		throw new ExpectedError('clinic.missionsUnavailable', { statusCode: 403 });
	}
	const progress = await tx.clanActionProgress.findUnique({
		where: { clanId_actionKey: { clanId: member.clanId, actionKey: 'hopita' } },
		select: { progress: true, completedAt: true }
	});
	if (!progress?.completedAt || progress.progress < requiredActions) {
		throw new ExpectedError('clinic.missionsUnavailable', { statusCode: 403 });
	}
}
