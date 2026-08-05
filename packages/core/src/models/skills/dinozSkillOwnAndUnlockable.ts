/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/dinoz/DinozSkillOwnAndUnlockable.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-02-17.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { ElementType } from '../enums/ElementType.js';
import { SkillType } from '../enums/SkillType.js';

export interface DinozSkillOwnAndUnlockable {
	learnableSkills: { skillId: number; type: SkillType; element: ElementType[] }[];
	unlockableSkills: { skillId: number; element: ElementType[] }[];
	element: number;
	name: string;
	display: string;
	level: number;
	canRelaunch: boolean;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	upChance: {
		fire: number;
		wood: number;
		water: number;
		lightning: number;
		air: number;
	};
}
