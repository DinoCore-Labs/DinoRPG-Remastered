/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/item/feedBack.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-09 through 2026-04-04.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { DinozFiche } from '../dinoz/dinozFiche.js';
import { ItemEffect } from '../enums/ItemEffect.js';

export type ItemFeedBack =
	| {
			category: ItemEffect.HEAL | ItemEffect.GOLD | ItemEffect.ACTION;
			value: number;
	  }
	| {
			category: ItemEffect.RESURRECT;
	  }
	| {
			category: ItemEffect.EGG | ItemEffect.SPHERE;
			value: string;
	  }
	| {
			category: ItemEffect.SPECIAL;
			value: string;
			effect: string;
			quantity: number;
	  }
	| {
			category: ItemEffect.QUEST;
			value: string;
	  };

export type UseItemResult = {
	effects: ItemFeedBack[];
	createdDinoz?: DinozFiche;
};

export type SpecialItemResult = {
	specialEffect?: ItemFeedBack;
	extraEffects?: ItemFeedBack[];
};
