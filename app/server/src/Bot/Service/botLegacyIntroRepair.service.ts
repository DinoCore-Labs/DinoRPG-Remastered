import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';

import { prisma } from '../../prisma.js';

export type BotLegacyIntroRepairStep =
	| {
			type: 'move';
			placeId: PlaceEnum;
	  }
	| {
			type: 'dialog';
			dialogId: string;
			preferredLinkIds: string[];
	  }
	| {
			type: 'repair_taurus';
	  };

const INTRO_STEPS: Record<
	number,
	{
		placeId: PlaceEnum;
		dialogId: string;
		preferredLinkIds: string[];
	}
> = {
	1: {
		placeId: PlaceEnum.PORT_DE_PRECHE,
		dialogId: 'intro_port',
		preferredLinkIds: ['poivrot', 'bao', 'guerre', 'boit', 'glop', 'raison', 'gloups', 'explo', 'fight', 'fin']
	},
	2: {
		placeId: PlaceEnum.ILE_WAIKIKI,
		dialogId: 'intro_waikiki',
		preferredLinkIds: ['pop', 'combat', 'papy', 'papy2']
	},
	3: {
		placeId: PlaceEnum.MARAIS_COLLANT,
		dialogId: 'intro_swamp',
		preferredLinkIds: ['baston', 'battle', 'fight', 'zenith', 'zenith2']
	},
	4: {
		placeId: PlaceEnum.CHUTES_MUTANTES,
		dialogId: 'intro_falls_bao',
		preferredLinkIds: ['shaman', 'gard', 'aura']
	},
	5: {
		placeId: PlaceEnum.CHUTES_MUTANTES,
		dialogId: 'intro_falls_taurus',
		preferredLinkIds: ['taurus', 'vade', 'demon', 'ouf', 'move']
	}
};

export async function getBotLegacyIntroRepairStep(
	userId: string,
	dinozId: number
): Promise<BotLegacyIntroRepairStep | null> {
	const [dinoz, intro, taurus] = await Promise.all([
		prisma.dinoz.findFirst({
			where: {
				id: dinozId,
				userId
			},
			select: {
				placeId: true,
				life: true,
				state: true,
				leaderId: true
			}
		}),
		prisma.userScenario.findUnique({
			where: {
				scenarioKey_userId: {
					userId,
					scenarioKey: 'intro'
				}
			},
			select: {
				progression: true
			}
		}),
		prisma.userRewards.findUnique({
			where: {
				rewardId_userId: {
					userId,
					rewardId: Reward.TAURUS
				}
			},
			select: {
				id: true
			}
		})
	]);

	if (!dinoz || dinoz.life <= 0 || dinoz.state !== null || dinoz.leaderId !== null) {
		return null;
	}

	if (taurus && (intro?.progression ?? 0) >= 6) {
		return null;
	}

	let progression = intro?.progression ?? 0;
	if (progression <= 0) {
		await prisma.userScenario.upsert({
			where: {
				scenarioKey_userId: {
					userId,
					scenarioKey: 'intro'
				}
			},
			create: {
				userId,
				scenarioKey: 'intro',
				progression: 1
			},
			update: {
				progression: 1
			}
		});
		progression = 1;
	}

	if (progression >= 6) {
		return taurus ? null : { type: 'repair_taurus' };
	}

	const step = INTRO_STEPS[progression];
	if (!step) return null;

	if (dinoz.placeId !== step.placeId) {
		return {
			type: 'move',
			placeId: step.placeId
		};
	}

	return {
		type: 'dialog',
		dialogId: step.dialogId,
		preferredLinkIds: step.preferredLinkIds
	};
}

export async function repairLegacyTaurusReward(userId: string): Promise<boolean> {
	return prisma.$transaction(async tx => {
		const created = await tx.userRewards.createMany({
			data: [
				{
					userId,
					rewardId: Reward.TAURUS
				}
			],
			skipDuplicates: true
		});

		if (created.count === 1) {
			await tx.userTracking.upsert({
				where: {
					stat_userId: {
						stat: StatTracking.TAURUS,
						userId
					}
				},
				create: {
					stat: StatTracking.TAURUS,
					quantity: 1,
					userId
				},
				update: {}
			});
		}

		return created.count === 1;
	});
}
