/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-be/src/utils/boxesLogic.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-15 through 2026-05-18.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import gameConfig from '../../config/game.config.js';
import { getBoxHandlerInformations } from '../../User/Controller/getBoxHandlerInfo.controller.js';

/**
 * Calculate a player completion, an approximate score of its progress in the game and its content
 * The completion score depends on the epic rewards of the player, the average level of its active dinoz and
 * their average mission completion rate.
 * @param playerId {number} id of the player
 * @returns Completion score
 */
export async function calculatePlayerCompletion(playerId: string) {
	const boxInfo = await getBoxHandlerInformations(playerId);
	if (!boxInfo) throw new ExpectedError(`Player doesn't exist`);
	const dinozCount = boxInfo._count.dinoz;
	if (dinozCount <= 0) return dinozCount;
	const missionTotal = boxInfo.dinoz.reduce((partialSum, a) => partialSum + a._count.missions, 0);
	const AVAILABLE_MISSIONS = 61;
	const dinozLevelTotal = boxInfo.dinoz.reduce((partialSum, a) => partialSum + a.level, 0);
	const totalRewards = boxInfo.rewards.filter(r => r.rewardId <= 24).length;
	const AVAILABLE_REWARDS = 23;
	const universalCount =
		(boxInfo.cooker ? 1 : 0) +
		(boxInfo.engineer ? 1 : 0) +
		(boxInfo.matelasseur ? 1 : 0) +
		(boxInfo.merchant ? 1 : 0) +
		(boxInfo.messie ? 1 : 0) +
		(boxInfo.leader ? 1 : 0) +
		(boxInfo.priest ? 1 : 0) +
		(boxInfo.shopKeeper ? 1 : 0) +
		(boxInfo.teacher ? 1 : 0);
	const AVAILABLE_UNIVERSAL = 9;

	const coefficients = {
		dinoz: 1,
		universal: 1,
		missions: 5,
		level: 3,
		rewards: 10
	};
	const completion =
		(((dinozCount / gameConfig.dinoz.maxQuantity) * coefficients.dinoz +
			(universalCount / AVAILABLE_UNIVERSAL) * coefficients.universal +
			(missionTotal / (AVAILABLE_MISSIONS * gameConfig.dinoz.maxQuantity)) * coefficients.missions +
			(dinozLevelTotal / (gameConfig.dinoz.maxLevel * gameConfig.dinoz.maxQuantity)) * coefficients.level +
			(totalRewards / AVAILABLE_REWARDS) * coefficients.rewards) /
			(coefficients.dinoz +
				coefficients.universal +
				coefficients.missions +
				coefficients.level +
				coefficients.rewards)) *
		100;

	return completion;
}
