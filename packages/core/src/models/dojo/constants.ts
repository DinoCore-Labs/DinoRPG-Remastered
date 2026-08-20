export const DOJO_COST = 50000;
export const DOJO_FIGHT_FRIENDS_DINOZ_COST = 50;
export const DOJO_MAX_SERIES = 5;
export const DOJO_FIGHT_COST = 300;
export const DOJO_OPPONENT_IN_SERIE = 5;
export const DOJO_REPUTATION_WIN = 4;
export const DOJO_REPUTATION_CHALLENGE = 4;
export const DOJO_MAX_DAILY_CHALLENGE = 5;

//TOURNAMENT

export const MAX_TEAMS = 64;
export const POOL_COUNT = 16;
export const POOL_SIZE = 4;

export const POOL_WIN_COUNT = 2;
export const POOL_LOSS_COUNT = 2;
export const FINAL_BRACKET_SIZE = 32;

export const POOL_MATCH_HOURS_UTC: { hour: number; minute: number }[] = [
	{ hour: 12, minute: 0 },
	{ hour: 22, minute: 0 }
];

export const POOL_SCHEDULE_JOB_KEY_NOON = 'tournament-pool-schedule-noon';
export const POOL_SCHEDULE_JOB_KEY_EVENING = 'tournament-pool-schedule-evening';
