import { EpicReward } from './epicReward.js';

export enum Reward {
	BETA = 1,
	PERLE = 2
}

export const rewardList: Readonly<Record<Reward, EpicReward>> = {
	[Reward.BETA]: { id: Reward.BETA, name: 'beta', displayed: true },
	[Reward.PERLE]: { id: Reward.PERLE, name: 'perle', displayed: true }
};
