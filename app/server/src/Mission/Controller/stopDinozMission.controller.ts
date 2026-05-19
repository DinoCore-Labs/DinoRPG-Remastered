import type { StopDinozMissionResponse } from '@dinorpg/core/models/missions/missionResponse.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { GameLogType, type Prisma } from '../../../../prisma/client.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { assertOwnedDinoz } from './mission.access.js';

type MissionTransaction = Prisma.TransactionClient;

export async function stopDinozMissionService(
	tx: MissionTransaction,
	params: {
		userId: string;
		dinozId: number;
		missionKey: string;
	}
): Promise<StopDinozMissionResponse> {
	await assertOwnedDinoz(tx, params.userId, params.dinozId);

	const existingMission = await tx.dinozMissions.findUnique({
		where: {
			missionKey_dinozId: {
				missionKey: params.missionKey,
				dinozId: params.dinozId
			}
		},
		select: {
			missionKey: true,
			isCompleted: true
		}
	});

	if (!existingMission) {
		throw new ExpectedError(`Mission "${params.missionKey}" is not active for this dinoz`);
	}

	if (existingMission.isCompleted) {
		throw new ExpectedError(`Mission "${params.missionKey}" is already completed and cannot be abandoned`);
	}

	await tx.dinozMissions.delete({
		where: {
			missionKey_dinozId: {
				missionKey: params.missionKey,
				dinozId: params.dinozId
			}
		}
	});

	await safeCreateGameLog({
		type: GameLogType.MissionCanceled,
		userId: params.userId,
		dinozId: params.dinozId,
		values: [],
		metadata: {
			missionKey: params.missionKey
		}
	});

	return {
		success: true,
		missionKey: params.missionKey,
		aborted: true
	};
}
