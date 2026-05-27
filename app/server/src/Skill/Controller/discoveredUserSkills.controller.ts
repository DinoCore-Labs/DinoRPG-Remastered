import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';

import { Prisma } from '../../../../prisma/index.js';

type SkillDiscoveryTx = Prisma.TransactionClient;

export async function unlockPacRewardTx(tx: SkillDiscoveryTx, userId: string) {
	const existingPac = await tx.userRewards.findUnique({
		where: {
			rewardId_userId: {
				rewardId: Reward.PAC,
				userId
			}
		}
	});

	if (existingPac) {
		return undefined;
	}

	await tx.userRewards.create({
		data: {
			userId,
			rewardId: Reward.PAC
		}
	});

	await tx.userScenario.upsert({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: 'pac'
			}
		},
		create: {
			userId,
			scenarioKey: 'pac',
			progression: 1,
			tracking: 1,
			state: {
				completed: true,
				rewardId: Reward.PAC
			}
		},
		update: {
			progression: 1,
			tracking: 1,
			state: {
				completed: true,
				rewardId: Reward.PAC
			}
		}
	});
	return Reward.PAC;
}

export async function discoverUserSkillsTx(
	tx: SkillDiscoveryTx,
	input: {
		userId: string;
		skillIds: number[];
	}
) {
	const uniqueSkillIds = [...new Set(input.skillIds)];
	if (uniqueSkillIds.length === 0) {
		return {
			discoveredSkills: [],
			rewardUnlocked: undefined
		};
	}
	const user = await tx.user.findUnique({
		where: { id: input.userId },
		select: {
			discoveredSkills: true
		}
	});
	if (!user) {
		return {
			discoveredSkills: [],
			rewardUnlocked: undefined
		};
	}
	const discoveredSkills = user.discoveredSkills ?? [];
	const newDiscoveredSkills = uniqueSkillIds.filter(skillId => !discoveredSkills.includes(skillId));

	if (newDiscoveredSkills.length === 0) {
		return {
			discoveredSkills: [],
			rewardUnlocked: undefined
		};
	}
	await tx.user.update({
		where: { id: input.userId },
		data: {
			discoveredSkills: {
				set: [...new Set([...discoveredSkills, ...newDiscoveredSkills])]
			}
		}
	});
	const rewardUnlocked = await unlockPacRewardTx(tx, input.userId);
	return {
		discoveredSkills: newDiscoveredSkills,
		rewardUnlocked
	};
}
