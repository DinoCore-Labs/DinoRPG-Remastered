/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/dinoz/DinozRace.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-02-09.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { RaceEnum } from '../enums/Race.js';

export interface DinozRace {
	raceId: RaceEnum;
	isDemon: boolean;
	name: string;
	nbrFire: number;
	nbrWood: number;
	nbrWater: number;
	nbrLightning: number;
	nbrAir: number;
	// Chances are in x out of 20
	// e.g. 5 means 5 chances of out 20 to get that element, i.e 25 %
	upChance: UpChance;
	price: number;
	swfLetter: string;
	skillId?: number[];
}

export interface UpChance {
	fire: number;
	wood: number;
	water: number;
	lightning: number;
	air: number;
}
