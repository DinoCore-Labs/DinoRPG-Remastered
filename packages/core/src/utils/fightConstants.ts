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
