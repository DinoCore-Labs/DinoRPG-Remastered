/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/item/ItemEffects.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-01-20.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { ElementType } from '../enums/ElementType.js';
import { ItemEffect } from '../enums/ItemEffect.js';
import { RaceEnum } from '../enums/Race.js';

export type ItemEffects =
	| {
			category: ItemEffect.HEAL | ItemEffect.RESURRECT | ItemEffect.ACTION | ItemEffect.GOLD;
			value: number;
	  }
	| {
			category: ItemEffect.EGG;
			race: RaceEnum;
	  }
	| {
			category: ItemEffect.SPHERE;
			value: ElementType;
	  }
	| {
			category: ItemEffect.SPECIAL;
			value: string;
	  };
