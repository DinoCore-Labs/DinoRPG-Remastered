/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/gather/gatherRewards.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-15 through 2026-04-01.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { GatherType } from '../enums/GatherType.js';
import { IngredientFiche } from '../ingredients/ingredientFiche.js';
import { ItemFicheDTO } from '../items/itemFiche.js';

export interface GatherRewards {
	item: ItemFicheDTO[];
	ingredients: IngredientFiche[];
	gold: number;
}

export const GRID_FINISHED_GOLD_REWARD = 1000;

export const HARVEST_GATHER_TYPES: readonly GatherType[] = [
	GatherType.FISH,
	GatherType.CUEILLE1,
	GatherType.CUEILLE2,
	GatherType.CUEILLE3,
	GatherType.CUEILLE4,
	GatherType.ENERGY1,
	GatherType.ENERGY2,
	GatherType.HUNT,
	GatherType.SEEK
] as const;

export const isHarvestGatherType = (gatherType: GatherType): boolean => {
	return (HARVEST_GATHER_TYPES as readonly GatherType[]).includes(gatherType);
};
