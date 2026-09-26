import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { PAC_SCENARIO_KEY, PAC_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/pacScenario.js';

import { Prisma } from '../../../../prisma/index.js';

type SkillDiscoveryTx = Prisma.TransactionClient;

async function lockUserSkillDiscoveryTx(tx: SkillDiscoveryTx, userId: string): Promise<void> {
	const lockKey = `skill-discovery:${userId}`;
	await tx.$executeRaw`
		SELECT pg_advisory_xact_lock(
			hashtextextended(
				${lockKey},
				0::bigint
			)
		)
	`;
}

/**
 * Débloque PAC une seule fois.
 *
 * La contrainte unique userId/rewardId constitue
 * la protection finale contre les doubles récompenses.
 */
export async function unlockPacRewardTx(tx: SkillDiscoveryTx, userId: string) {
	const created = await tx.userRewards.createMany({
		data: [
			{
				userId,
				rewardId: Reward.PAC
			}
		],
		skipDuplicates: true
	});
	if (created.count !== 1) {
		return undefined;
	}
	await tx.userTracking.upsert({
		where: {
			stat_userId: {
				stat: StatTracking.PAC,
				userId
			}
		},
		update: {
			quantity: {
				increment: 1
			}
		},
		create: {
			stat: StatTracking.PAC,
			quantity: 1,
			userId
		}
	});
	await tx.userScenario.upsert({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: PAC_SCENARIO_KEY
			}
		},
		create: {
			userId,
			scenarioKey: PAC_SCENARIO_KEY,
			progression: PAC_SCENARIO_STEPS.COMPLETED,
			tracking: 1,
			state: {
				completed: true,
				rewardId: Reward.PAC
			}
		},
		update: {
			progression: PAC_SCENARIO_STEPS.COMPLETED,
			tracking: 1,
			state: {
				completed: true,
				rewardId: Reward.PAC
			}
		}
	});
	return Reward.PAC;
}

/**
 * Ajoute les compétences nouvellement découvertes
 * par le joueur.
 *
 * Le lock transactionnel évite le scénario :
 *
 * tx A lit [1]
 * tx B lit [1]
 *
 * tx A écrit [1, 2]
 * tx B écrit [1, 3]
 *
 * => compétence 2 perdue.
 */
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
	await lockUserSkillDiscoveryTx(tx, input.userId);
	const user = await tx.user.findUnique({
		where: {
			id: input.userId
		},
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
	const nextDiscoveredSkills = [...new Set([...discoveredSkills, ...newDiscoveredSkills])];
	await tx.user.update({
		where: {
			id: input.userId
		},
		data: {
			discoveredSkills: {
				set: nextDiscoveredSkills
			}
		}
	});
	const rewardUnlocked = await unlockPacRewardTx(tx, input.userId);
	return {
		discoveredSkills: newDiscoveredSkills,
		rewardUnlocked
	};
}
