/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/reward/Rewarder.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-02-09.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { ElementType } from '../enums/ElementType.js';
import { RewardEnum } from '../enums/Parser.js';
import { ServiceEnum } from '../enums/Services.js';
import { Place } from '../place/place.js';

export type Rewarder =
	| {
			rewardType: RewardEnum.CHANGE_ELEMENT;
			value: ElementType;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.EPIC;
			value: number;
			reverse?: boolean;
			service?: ServiceEnum[];
	  }
	| {
			rewardType: RewardEnum.ITEM;
			value: number;
			quantity: number;
			reverse?: boolean;
			notify?: boolean;
	  }
	| {
			rewardType: RewardEnum.MAX_ITEM;
			value: number;
	  }
	| {
			rewardType: RewardEnum.STATUS;
			value: number;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.SCENARIO;
			value: number;
			step: number;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.TELEPORT;
			place: Place;
	  }
	| {
			rewardType: RewardEnum.REDIRECT;
			service: ServiceEnum[];
	  }
	| {
			rewardType: Exclude<
				RewardEnum,
				| RewardEnum.CHANGE_ELEMENT
				| RewardEnum.STATUS
				| RewardEnum.ITEM
				| RewardEnum.EPIC
				| RewardEnum.SCENARIO
				| RewardEnum.TELEPORT
				| RewardEnum.REDIRECT
			>;
			value: number;
			reverse?: boolean;
	  };
