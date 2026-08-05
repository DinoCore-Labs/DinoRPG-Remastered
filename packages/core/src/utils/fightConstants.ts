/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/utils/fightConstants.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-09 through 2026-07-30.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export const TIME_BASE = 10;
export const TIME_FACTOR = 10;
// Start forced overtime before reaching the safety limit.
export const OVERTIME_START_TURN = 1200;
// Absolute safety limit for a fight.
export const MAX_FIGHT_TURNS = 2000;
// Initial unavoidable overtime damage.
export const OVERTIME_INITIAL_DAMAGE = 10;
// Duration of a cycle
export const CYCLE = 6 * TIME_FACTOR;
// Environement timeout
export const ENVIRONMENT_TIMEOUT = 10 * TIME_FACTOR;

export const ENERGY_RECOVERY_BASE_FACTOR = 0.5;
export const MAXIMUM_MAX_ENERGY = 200;
export const BASE_ENERGY_COST = 2;
export const BASE_ASSAULT_ENERGY_COST = 4;
export const MINIMUM_ENERGY_TO_ACT = 5;

export const ATTACK_GLOBAL_FACTOR = 0.9;
export const ASSAULT_POWER = 5;
export const VOID_ASSAULT_POWER = 1;

export const FIGHT_INFINITE = 1000000 * TIME_FACTOR;
