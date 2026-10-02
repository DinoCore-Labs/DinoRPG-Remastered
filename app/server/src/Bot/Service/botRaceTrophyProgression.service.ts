import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';

import { prisma } from '../../prisma.js';

export type BotRaceTrophyProgressionStep =
	| {
			type: 'move';
			placeId: PlaceEnum;
	  }
	| {
			type: 'dialog';
			dialogId: 'strange_hippo' | 'strange_pteroz' | 'strange_rocky';
			preferredLinkIds: string[];
	  };

type TrophyTarget = {
	rewardId: Reward;
	minLevel: number;
	placeId: PlaceEnum;
	dialogId: 'strange_hippo' | 'strange_pteroz' | 'strange_rocky';
};

const TROPHY_TARGETS: TrophyTarget[] = [
	{
		rewardId: Reward.HIPPO,
		minLevel: 8,
		placeId: PlaceEnum.ILE_WAIKIKI,
		dialogId: 'strange_hippo'
	},
	{
		rewardId: Reward.PTEROZ,
		minLevel: 8,
		placeId: PlaceEnum.PENTES_DE_BASALTE,
		dialogId: 'strange_pteroz'
	},
	{
		rewardId: Reward.ROCKY,
		minLevel: 13,
		placeId: PlaceEnum.FORCEBRUT,
		dialogId: 'strange_rocky'
	}
];

export async function getBotRaceTrophyProgressionStep(
	userId: string,
	dinozId: number
): Promise<BotRaceTrophyProgressionStep | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			placeId: true,
			level: true,
			life: true,
			state: true,
			user: {
				select: {
					rewards: {
						select: {
							rewardId: true
						}
					}
				}
			}
		}
	});

	if (!dinoz || dinoz.life <= 0 || dinoz.state !== null) {
		return null;
	}

	const rewardIds = new Set(dinoz.user.rewards.map(reward => reward.rewardId));
	const target = TROPHY_TARGETS.find(
		entry => dinoz.level >= entry.minLevel && !rewardIds.has(entry.rewardId)
	);

	if (!target) {
		return null;
	}

	if (dinoz.placeId !== target.placeId) {
		return {
			type: 'move',
			placeId: target.placeId
		};
	}

	return {
		type: 'dialog',
		dialogId: target.dialogId,
		preferredLinkIds: ['fight']
	};
}
