import { StatTracking } from '../enums/StatsTracking.js';
import { Reward } from './rewardList.js';

export const rewardIdByKey: Record<string, Reward> = {
	perle: Reward.PERLE
};

export const rewardKeyById: Partial<Record<number, string>> = Object.fromEntries(
	Object.entries(rewardIdByKey).map(([key, id]) => [id, key])
);

export const statTrackingByCollectionKey: Partial<Record<string, StatTracking>> = {
	perle: StatTracking.PERLE
};
