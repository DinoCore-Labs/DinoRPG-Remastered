import type { StartDinozMissionResponse } from '@dinorpg/core/models/missions/missionResponse.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import type { Prisma } from '../../../../prisma/index.js';
import { refreshTutorialProgressTx } from '../../Tutorial/Controller/tutorial.controller.js';
import { assertOwnedDinoz } from './mission.access.js';
import { getMissionDefinitionByKey } from './mission.registry.js';
import { assertMissionStartCondition } from './mission.startConditions.js';

type MissionTransaction = Prisma.TransactionClient;

export async function startDinozMissionService(
	tx: MissionTransaction,
	params: {
		userId: string;
		dinozId: number;
		missionKey: string;
	}
): Promise<StartDinozMissionResponse> {
	const dinoz = await assertOwnedDinoz(tx, params.userId, params.dinozId);
	const missionDefinition = getMissionDefinitionByKey(params.missionKey);
	const existingMission = await tx.dinozMissions.findUnique({
		where: {
			missionKey_dinozId: {
				missionKey: params.missionKey,
				dinozId: params.dinozId
			}
		},
		select: {
			missionKey: true,
			progression: true,
			tracking: true,
			isCompleted: true
		}
	});
	if (existingMission) {
		if (existingMission.isCompleted) {
			throw new ExpectedError(`Mission "${params.missionKey}" is already completed for this dinoz`);
		}
		throw new ExpectedError(`Mission "${params.missionKey}" is already active for this dinoz`);
	}

	const activeMission = await tx.dinozMissions.findFirst({
		where: {
			dinozId: params.dinozId,
			isCompleted: false
		},
		select: {
			missionKey: true
		}
	});
	if (activeMission) {
		throw new ExpectedError(`Dinoz "${params.dinozId}" already has an active mission "${activeMission.missionKey}"`);
	}
	await assertMissionStartCondition(tx, {
		dinoz,
		condition: missionDefinition.condition
	});
	const createdMission = await tx.dinozMissions.create({
		data: {
			dinozId: params.dinozId,
			missionKey: missionDefinition.key,
			progression: 0,
			tracking: 0,
			isCompleted: false
		},
		select: {
			missionKey: true,
			progression: true,
			tracking: true,
			isCompleted: true
		}
	});
	/*
	 * Le tutoriel peut attendre une mission courante.
	 *
	 * L'objectif "papy" est validé lorsque le Dinoz vient
	 * d'accepter :
	 * - fish
	 * OU
	 * - dog
	 * On reste dans la même transaction afin que la mission,
	 * la progression du tutoriel et sa récompense soient
	 * atomiques.
	 */
	await refreshTutorialProgressTx(tx, {
		userId: params.userId,
		dinozId: params.dinozId
	});
	return {
		success: true,
		missionKey: createdMission.missionKey,
		progression: createdMission.progression,
		tracking: createdMission.tracking,
		isCompleted: createdMission.isCompleted
	};
}
