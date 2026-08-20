/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/enums/Parser.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-01-20 through 2026-04-01.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export enum RewardEnum {
	STATUS = 'status',
	CHANGE_ELEMENT = 'changeelem',
	MAXEXPERIENCE = 'maxExp',
	SKILL = 'skill',
	EXPERIENCE = 'xp',
	GOLD = 'gold',
	ITEM = 'item',
	MAX_ITEM = 'max_item',
	EPIC = 'epic',
	SCENARIO = 'scenario',
	TELEPORT = 'teleport',
	REDIRECT = 'redirect'
}

export enum Operator {
	AND = 'AND',
	OR = 'OR',
	NOT = 'NOT'
}

export enum MathOperator {
	ADD = '+',
	EQUAL = '=',
	MULTIPLY = 'x',
	ADD_ASSAULT = '_'
}
