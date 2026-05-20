export const gameLogRetentions = ['TEMPORARY', 'AUDIT'] as const;

export type GameLogRetention = (typeof gameLogRetentions)[number];

export const gameLogTypes = [
	'PlayerCreated',
	'PlayerConnected',
	'PlayerReset',
	'PlayerDeleted',
	'PlayerBanned',
	'PlayerUnbanned',

	'CreateDinoz',
	'Move',
	'LevelUp',
	'XPEarned',
	'HPLost',
	'Death',
	'Revive',
	'Fight',
	'FightWon',
	'FightLost',
	'ItemUsed',
	'ItemBought',
	'ItemFound',
	'IngredientSold',
	'GoldWon',
	'GoldLost',
	'MissionFinished',
	'MissionCanceled',
	'Gather',
	'GridFinished',

	'OfferNew',
	'OfferBid',
	'OfferCancelled',
	'OfferExpired',
	'OfferWon',

	'AdminUpdateDinoz',
	'AdminAddStatus',
	'AdminRemoveStatus',
	'AdminAddSkill',
	'AdminRemoveSkill',
	'AdminAddUnlockableSkill',
	'AdminRemoveUnlockableSkill',
	'AdminAddMoney',
	'AdminRemoveMoney',
	'AdminAddReward',
	'AdminRemoveReward',
	'AdminAddItem',
	'AdminRemoveItem',
	'AdminAddIngredient',
	'AdminRemoveIngredient',
	'AdminUpdateMission',
	'AdminUpdateScenario',
	'AdminUpdateUser',
	'AdminUpdateSecret'
] as const;

export type GameLogType = (typeof gameLogTypes)[number];

export const adminGameLogTypes = gameLogTypes.filter(type => type.startsWith('Admin')) as GameLogType[];

export interface AdminGameLog {
	id: string;
	type: GameLogType;
	retention: GameLogRetention;
	values: string[];
	metadata: unknown | null;
	userId: string | null;
	dinozId: number | null;
	actorUserId: string | null;
	userNameSnapshot: string | null;
	dinozNameSnapshot: string | null;
	actorNameSnapshot: string | null;
	createdAt: string;
}

export interface AdminGameLogListQuery {
	type?: GameLogType;
	retention?: GameLogRetention;
	userId?: string;
	dinozId?: number;
	actorUserId?: string;
	from?: string;
	to?: string;
	take?: number;
	skip?: number;
}

export interface AdminGameLogListResponse {
	total: number;
	logs: AdminGameLog[];
}

export interface AdminGameLogSummaryEntry {
	type: GameLogType;
	total: number;
}

export interface AdminGameLogHourlyEntry {
	bucketAt: string;
	hour: number;
	total: number;
}

export interface AdminGameLogDailyEntry {
	day: string;
	total: number;
}
