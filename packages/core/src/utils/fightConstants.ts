export const TIME_BASE = 10;
export const TIME_FACTOR = 10;
// Overtime set to 5000 times the base time increment.
export const OVERTIME_THRESHOLD = 5000 * TIME_BASE * TIME_FACTOR;
// Duration of a cycle
export const CYCLE = 6 * TIME_FACTOR;
// Environement timeout
export const ENVIRONMENT_TIMEOUT = 10 * TIME_FACTOR;

export const ENERGY_RECOVERY_BASE_FACTOR = 0.5;
export const DEFAULT_MAX_ENERGY = 100;
export const MAXIMUM_MAX_ENERGY = 200;
export const BASE_ENERGY_COST = 2;
export const BASE_ASSAULT_ENERGY_COST = 4;
export const MINIMUM_ENERGY_TO_ACT = 5;

export const ATTACK_GLOBAL_FACTOR = 0.9;
export const ASSAULT_POWER = 5;
export const VOID_ASSAULT_POWER = 1;

export const FIGHT_INFINITE = 1000000 * TIME_FACTOR;
