/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/item/ItemFiche.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-01-20.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { ItemType } from '../enums/ItemType.js';
import type { PassiveEffects } from '../skills/skillDetails.js';
import { SkillFightCondition } from '../skills/skillFightCondition.js';
import type { ItemEffects } from './itemEffects.js';

export interface ItemFiche {
	itemId: number;
	name: string;
	display: string;
	price: number;
	quantity?: number;
	maxQuantity: number;
	itemType: ItemType;
	effect?: ItemEffects;
	passiveEffect?: PassiveEffects;
	fightCondition?: SkillFightCondition;
	priority?: number;
	probability?: number;
	canBeEquipped: boolean;
	canBeUsedNow: boolean;
	isRare: boolean;
	sellable: boolean;
}

export interface ItemFicheDTO {
	id: number;
	price: number;
	quantity: number;
	maxQuantity: number;
}
