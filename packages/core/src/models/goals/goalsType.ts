/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/goals/GoalsType.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-01-20.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { StatTracking } from '../enums/StatsTracking.js';

declare const Languages: readonly ['EN', 'FR', 'DE', 'ES'];
type Language = (typeof Languages)[number];
export interface Goal {
	id: StatTracking;
	name: Record<Language, string>;
	description?: Record<Language, string>;
	rare: number;
	hidden?: boolean;
	unlocks: Unlock[];
}
export interface Unlock {
	count: number;
	points: number;
	icon?: string;
	title?: Record<Language, string>;
	description?: Record<Language, string>;
	prefix?: boolean;
	suffix?: boolean;
}
