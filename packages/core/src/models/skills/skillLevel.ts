/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/dinoz/SkillLevel.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-02-09.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Skill, skillList } from './skillList.js';

const getSkillLevel = (skill: Skill) => {
	let level = skill === Skill.LIMITE_BRISEE ? 10 : 1;

	const prerequisites = skillList[skill].unlockedFrom;
	if (prerequisites) {
		for (const prerequisite of prerequisites) {
			level += getSkillLevel(prerequisite);
		}
	}

	return level;
};

export const SkillLevel = Object.values(skillList).reduce(
	(acc, skill) => {
		acc[skill.id] = getSkillLevel(skill.id);
		return acc;
	},
	{} as Record<Skill, number>
);
