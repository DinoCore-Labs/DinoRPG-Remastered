/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/item/boxOpening.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-01-20 through 2026-05-18.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { ItemFiche } from './itemFiche.js';

export interface BoxOpening {
	boxType: BoxType;
	items: ItemProbability[];
}

export interface ItemProbability {
	item: ItemFiche;
	odds: number;
	quantity: number;
}

export enum BoxType {
	COMMON = 'box_common',
	RARE = 'box_rare',
	EPIC = 'box_epic',
	LEGENDARY = 'box_legendary'
}
