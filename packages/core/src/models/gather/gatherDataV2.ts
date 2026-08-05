/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/gather/gatherData.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-04-01.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Action } from '../dinoz/dinozActions.js';
import { GatherType } from '../enums/GatherType.js';
import { ItemFiche } from '../items/itemFiche.js';
import { GatherFound } from './gatherFound.js';

export interface GatherDataV2 {
	id: string;
	action: Action;
	type: GatherType;
	size: number;
	minimumClick: number;
	apparence: string;
	label: string;
	skill?: string;
	object?: string;
	condition?: string;
	found: GatherFound[];
	cost?: ItemFiche;
}
