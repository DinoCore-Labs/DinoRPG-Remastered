/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/dinoz/DigData.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-04-04 through 2026-05-08.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Condition } from '../conditions/conditions.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { DinozStatusId } from './statusList.js';

export type DigReward =
	| { type: 'status'; statusId: DinozStatusId }
	| { type: 'item'; itemId: number; quantity: number }
	| {
			type: 'scenario';
			scenarioKey: string;
			progression: number;
			messageKey?: string;
	  };

export type DigResponse = {
	treasureId: string | null;
	rewards: Array<
		| { type: 'gold'; amount: number }
		| { type: 'status'; statusId: number }
		| { type: 'item'; itemId: number; quantity: number }
		| {
				type: 'scenario';
				scenarioKey: string;
				progression: number;
				messageKey?: string;
		  }
	>;
};

export type DigTreasure = {
	id: string;
	place: PlaceEnum;
	cond?: Condition;
	rewards: DigReward[];
};
