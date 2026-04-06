import { Reward } from './rewardList.js';

export const rewardIdByKey = {
	perle: Reward.PERLE
} as const satisfies Record<string, number>;

export const rewardKeyById: Partial<Record<number, string>> = Object.fromEntries(
	Object.entries(rewardIdByKey).map(([key, id]) => [id, key])
);
