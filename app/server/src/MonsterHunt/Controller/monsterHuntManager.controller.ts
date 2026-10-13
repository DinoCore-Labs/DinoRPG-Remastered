import type { MonsterHuntEditionConfig, MonsterHuntReward } from '@dinorpg/core/models/monsterHunt/monsterHunt.js';
import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';

import { MoneyType, MonsterHuntStatus, Prisma } from '../../../../prisma/index.js';
import { newNotif } from '../../Notification/Service/notification.service.js';
import { prisma } from '../../prisma.js';

export const MONSTER_HUNT_LIFECYCLE_JOB_KEY = 'monster-hunt-lifecycle';

const MONSTER_HUNT_IDLE_CHECK_MS = 24 * 60 * 60 * 1000;

type MonsterHuntTransaction = Prisma.TransactionClient;

export type CreateMonsterHuntEditionInput = {
	config: MonsterHuntEditionConfig;
	startAt: Date;
	endAt: Date;
};

function rewardsToJson(rewards: readonly MonsterHuntReward[]): Prisma.InputJsonValue {
	return rewards.map(reward => ({
		...reward
	})) as Prisma.InputJsonValue;
}

function parseRankingRewards(value: unknown): MonsterHuntReward[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((reward): reward is MonsterHuntReward => {
		if (!reward || typeof reward !== 'object') {
			return false;
		}

		const candidate = reward as Record<string, unknown>;

		switch (candidate.type) {
			case 'ITEM':
				return typeof candidate.itemId === 'number' && typeof candidate.quantity === 'number' && candidate.quantity > 0;

			case 'TREASURE_TICKET':
			case 'GOLD':
				return typeof candidate.quantity === 'number' && candidate.quantity > 0;

			case 'EPIC':
				return typeof candidate.rewardId === 'number';

			default:
				return false;
		}
	});
}

async function applyMonsterHuntFinalReward(
	tx: MonsterHuntTransaction,
	userId: string,
	reward: MonsterHuntReward
): Promise<void> {
	switch (reward.type) {
		case 'ITEM':
			await tx.userItems.upsert({
				where: {
					itemId_userId: {
						itemId: reward.itemId,
						userId
					}
				},
				create: {
					userId,
					itemId: reward.itemId,
					quantity: reward.quantity
				},
				update: {
					quantity: {
						increment: reward.quantity
					}
				}
			});
			return;

		case 'TREASURE_TICKET':
			await tx.userWallet.upsert({
				where: {
					userId_type: {
						userId,
						type: MoneyType.TREASURE_TICKET
					}
				},
				create: {
					userId,
					type: MoneyType.TREASURE_TICKET,
					amount: reward.quantity
				},
				update: {
					amount: {
						increment: reward.quantity
					}
				}
			});
			return;

		case 'GOLD':
			await tx.userWallet.upsert({
				where: {
					userId_type: {
						userId,
						type: MoneyType.GOLD
					}
				},
				create: {
					userId,
					type: MoneyType.GOLD,
					amount: reward.quantity
				},
				update: {
					amount: {
						increment: reward.quantity
					}
				}
			});
			return;

		case 'EPIC':
			await tx.userRewards.upsert({
				where: {
					rewardId_userId: {
						rewardId: reward.rewardId,
						userId
					}
				},
				create: {
					userId,
					rewardId: reward.rewardId
				},
				update: {}
			});
			return;
	}
}

export class MonsterHuntManager {
	/**
	 * Creates a complete persisted Monster Hunt edition
	 * from one of the reusable edition presets.
	 *
	 * This creates:
	 * - the edition
	 * - its hunt monsters / loot definitions
	 * - its individual reward tiers
	 *
	 * Ranking rewards will be added later.
	 */
	static async createEdition(input: CreateMonsterHuntEditionInput, prismaClient = prisma) {
		const { config, startAt, endAt } = input;

		if (endAt <= startAt) {
			throw new Error('Monster Hunt endAt must be after startAt.');
		}

		const now = new Date();

		if (endAt <= now) {
			throw new Error('Cannot create a Monster Hunt edition that has already ended.');
		}

		/*
		 * Do not allow two scheduled/active hunts whose
		 * periods overlap.
		 *
		 * Intervals are considered:
		 *
		 * [startAt, endAt[
		 *
		 * Therefore:
		 *
		 * Hunt A: 12:00 -> 18:00
		 * Hunt B: 18:00 -> 20:00
		 *
		 * is allowed.
		 */
		const overlappingHunt = await prismaClient.monsterHunt.findFirst({
			where: {
				status: {
					in: [MonsterHuntStatus.SCHEDULED, MonsterHuntStatus.ACTIVE]
				},

				startAt: {
					lt: endAt
				},

				endAt: {
					gt: startAt
				}
			},

			select: {
				id: true,
				name: true,
				startAt: true,
				endAt: true
			}
		});

		if (overlappingHunt) {
			throw new Error(`Monster Hunt "${overlappingHunt.name}" (${overlappingHunt.id}) overlaps the requested period.`);
		}

		/*
		 * Editions are persisted independently from the preset.
		 *
		 * Example:
		 *
		 * dark-world-invasion-2026-10-31
		 */
		const editionSlug = [
			config.slug,
			startAt.getUTCFullYear(),
			String(startAt.getUTCMonth() + 1).padStart(2, '0'),
			String(startAt.getUTCDate()).padStart(2, '0')
		].join('-');

		const existingSlug = await prismaClient.monsterHunt.findUnique({
			where: {
				slug: editionSlug
			},

			select: {
				id: true
			}
		});

		if (existingSlug) {
			throw new Error(`Monster Hunt slug "${editionSlug}" already exists.`);
		}

		/*
		 * If the hunt starts immediately, there is no reason
		 * to create it as SCHEDULED first.
		 */
		const status = startAt <= now ? MonsterHuntStatus.ACTIVE : MonsterHuntStatus.SCHEDULED;

		const hunt = await prismaClient.monsterHunt.create({
			data: {
				name: config.name,
				slug: editionSlug,

				status,

				startAt,
				endAt,

				softCap: config.softCap,

				lootDefinitions: {
					create: config.monsters.map(monster => ({
						lootKey: monster.lootKey,

						monsterKey: monster.monsterKey,

						nameKey: monster.nameKey,

						icon: monster.icon,

						points: monster.points,

						rarity: monster.rarity,

						dropRateBps: monster.dropRateBps,

						spawnWeight: monster.spawnWeight,

						globalSpawn: monster.globalSpawn
					}))
				},

				rewardTiers: {
					create: config.rewardTiers.map(tier => ({
						points: tier.points,

						reward: rewardsToJson(tier.rewards)
					}))
				},
				rankingRewards: {
					create: config.rankingRewards.map(reward => ({
						rankStart: reward.rankStart,
						rankEnd: reward.rankEnd,

						reward: rewardsToJson(reward.rewards)
					}))
				}
			},

			include: {
				lootDefinitions: true,
				rewardTiers: true,
				rankingRewards: true
			}
		});

		/*
		 * Creating an edition may introduce a lifecycle
		 * transition earlier than the scheduler's current
		 * nextRunAt.
		 */
		await MonsterHuntManager.rescheduleLifecycleJob(prismaClient);

		return hunt;
	}

	/**
	 * Activates all scheduled editions whose start date
	 * has been reached but whose end date has not.
	 */
	static async activateDueEditions(now = new Date(), prismaClient = prisma): Promise<number> {
		const result = await prismaClient.monsterHunt.updateMany({
			where: {
				status: MonsterHuntStatus.SCHEDULED,

				startAt: {
					lte: now
				},

				endAt: {
					gt: now
				}
			},

			data: {
				status: MonsterHuntStatus.ACTIVE
			}
		});

		return result.count;
	}

	/**
	 * Ends all editions whose end date has been reached.
	 *
	 * SCHEDULED is included intentionally so an edition
	 * which entirely elapsed while the server was offline
	 * becomes ENDED directly after restart.
	 */
	static async endDueEditions(now = new Date(), prismaClient = prisma): Promise<number> {
		const result = await prismaClient.monsterHunt.updateMany({
			where: {
				status: {
					in: [MonsterHuntStatus.SCHEDULED, MonsterHuntStatus.ACTIVE]
				},

				endAt: {
					lte: now
				}
			},

			data: {
				status: MonsterHuntStatus.ENDED
			}
		});

		return result.count;
	}

	/**
	 * Repairs persisted lifecycle state against the current
	 * time.
	 *
	 * Ended editions are processed first so an edition that
	 * fully elapsed during downtime never briefly becomes
	 * ACTIVE during recovery.
	 */
	static async syncStatuses(
		now = new Date(),
		prismaClient = prisma
	): Promise<{
		activated: number;
		ended: number;
	}> {
		const ended = await MonsterHuntManager.endDueEditions(now, prismaClient);

		const activated = await MonsterHuntManager.activateDueEditions(now, prismaClient);

		return {
			activated,
			ended
		};
	}

	/**
	 * Finds the next lifecycle transition that should wake
	 * the scheduler:
	 *
	 * - next scheduled hunt start
	 * - next active hunt end
	 */
	static async getNextLifecycleDate(now = new Date(), prismaClient = prisma): Promise<Date | null> {
		const nextScheduled = await prismaClient.monsterHunt.findFirst({
			where: {
				status: MonsterHuntStatus.SCHEDULED,

				startAt: {
					gt: now
				}
			},

			orderBy: {
				startAt: 'asc'
			},

			select: {
				startAt: true
			}
		});

		const nextActiveEnd = await prismaClient.monsterHunt.findFirst({
			where: {
				status: MonsterHuntStatus.ACTIVE,

				endAt: {
					gt: now
				}
			},

			orderBy: {
				endAt: 'asc'
			},

			select: {
				endAt: true
			}
		});

		const candidates = [nextScheduled?.startAt, nextActiveEnd?.endAt].filter(
			(date): date is Date => date !== undefined
		);

		if (candidates.length === 0) {
			return null;
		}

		return new Date(Math.min(...candidates.map(date => date.getTime())));
	}

	/**
	 * Reprograms the lifecycle job against the earliest
	 * known Monster Hunt transition.
	 *
	 * If there is no scheduled/active edition, the job gets
	 * a daily fallback wake-up.
	 */
	static async rescheduleLifecycleJob(prismaClient = prisma): Promise<void> {
		const now = new Date();

		const nextRunAt =
			(await MonsterHuntManager.getNextLifecycleDate(now, prismaClient)) ??
			new Date(now.getTime() + MONSTER_HUNT_IDLE_CHECK_MS);

		await prismaClient.jobDefinition.updateMany({
			where: {
				key: MONSTER_HUNT_LIFECYCLE_JOB_KEY
			},

			data: {
				nextRunAt
			}
		});
	}

	static async distributeRankingRewards(
		huntId: string,
		prismaClient = prisma
	): Promise<{
		rewardedPlayers: number;
		alreadyRewardedPlayers: number;
	}> {
		const hunt = await prismaClient.monsterHunt.findUnique({
			where: {
				id: huntId
			},

			select: {
				id: true,
				name: true,
				status: true,

				rankingRewards: {
					orderBy: {
						rankStart: 'asc'
					}
				}
			}
		});

		if (!hunt) {
			throw new Error(`Monster Hunt "${huntId}" does not exist.`);
		}

		if (hunt.status !== MonsterHuntStatus.ENDED && hunt.status !== MonsterHuntStatus.REWARDED) {
			throw new Error(`Monster Hunt "${huntId}" must be ENDED before ranking rewards can be distributed.`);
		}

		if (hunt.status === MonsterHuntStatus.REWARDED) {
			return {
				rewardedPlayers: 0,
				alreadyRewardedPlayers: 0
			};
		}

		const participants = await prismaClient.monsterHuntParticipant.findMany({
			where: {
				huntId
			},

			orderBy: [
				{
					points: 'desc'
				},
				{
					objects: 'desc'
				},
				{
					createdAt: 'asc'
				}
			],

			select: {
				id: true,
				userId: true
			}
		});

		let rewardedPlayers = 0;
		let alreadyRewardedPlayers = 0;

		const notificationPayloads: Array<{
			userId: string;
			rank: number;
			rewards: MonsterHuntReward[];
		}> = [];

		for (let index = 0; index < participants.length; index++) {
			const participant = participants[index];
			const rank = index + 1;

			const rankingReward = hunt.rankingRewards.find(reward => rank >= reward.rankStart && rank <= reward.rankEnd);

			if (!rankingReward) {
				continue;
			}

			const rewards = parseRankingRewards(rankingReward.reward);

			if (rewards.length === 0) {
				throw new Error(`Monster Hunt ranking reward "${rankingReward.id}" has no valid rewards.`);
			}

			const result = await prismaClient.$transaction(async tx => {
				const existing = await tx.monsterHuntRankingRewardClaim.findUnique({
					where: {
						participantId_rankingRewardId: {
							participantId: participant.id,

							rankingRewardId: rankingReward.id
						}
					}
				});

				if (existing) {
					return false;
				}

				/*
				 * Claim and rewards live in the same transaction.
				 *
				 * If any reward fails, everything rolls back.
				 */
				await tx.monsterHuntRankingRewardClaim.create({
					data: {
						huntId,

						participantId: participant.id,

						rankingRewardId: rankingReward.id,

						rank
					}
				});

				for (const reward of rewards) {
					await applyMonsterHuntFinalReward(tx, participant.userId, reward);
				}

				return true;
			});

			if (!result) {
				alreadyRewardedPlayers++;
				continue;
			}

			rewardedPlayers++;

			notificationPayloads.push({
				userId: participant.userId,
				rank,
				rewards
			});
		}

		/*
		 * Before switching to REWARDED, verify that every
		 * participant eligible for a ranking reward has a claim.
		 */
		const eligibleParticipants = participants.filter((_, index) => {
			const rank = index + 1;

			return hunt.rankingRewards.some(reward => rank >= reward.rankStart && rank <= reward.rankEnd);
		});

		const claimCount = await prismaClient.monsterHuntRankingRewardClaim.count({
			where: {
				huntId
			}
		});

		if (claimCount !== eligibleParticipants.length) {
			throw new Error(
				`Monster Hunt "${huntId}" ranking reward distribution is incomplete: ${claimCount}/${eligibleParticipants.length} claims.`
			);
		}

		await prismaClient.monsterHunt.update({
			where: {
				id: huntId
			},
			data: {
				status: MonsterHuntStatus.REWARDED
			}
		});

		/*
		 * Notifications happen only after all database rewards
		 * have been safely committed.
		 *
		 * A notification failure must not revert or duplicate
		 * the actual ranking rewards.
		 */
		await Promise.allSettled(
			notificationPayloads.map(({ userId, rank, rewards }) =>
				newNotif(
					userId,
					NotificationType.NEW_REWARD,
					JSON.stringify({
						source: 'monsterHuntRanking',

						huntId,
						rank,
						rewards
					})
				)
			)
		);

		return {
			rewardedPlayers,
			alreadyRewardedPlayers
		};
	}

	/**
	 * Scheduler handler.
	 *
	 * Synchronises lifecycle state, then returns the exact
	 * date of the next transition so the generic scheduler
	 * can update JobDefinition.nextRunAt.
	 */
	static async lifecycleJob(prismaClient = prisma): Promise<{
		nextRunAt: Date;
	}> {
		const now = new Date();

		await MonsterHuntManager.syncStatuses(now, prismaClient);

		/*
		 * Any ENDED edition may represent:
		 *
		 * - a hunt which just ended;
		 * - a hunt whose reward distribution was interrupted;
		 * - a hunt that ended while the server was offline.
		 *
		 * distributeRankingRewards() is idempotent, so all three
		 * cases are safe to retry.
		 */
		const endedHunts = await prismaClient.monsterHunt.findMany({
			where: {
				status: MonsterHuntStatus.ENDED
			},

			orderBy: {
				endAt: 'asc'
			},

			select: {
				id: true
			}
		});

		for (const hunt of endedHunts) {
			await MonsterHuntManager.distributeRankingRewards(hunt.id, prismaClient);
		}

		const nextLifecycleDate = await MonsterHuntManager.getNextLifecycleDate(now, prismaClient);

		return {
			nextRunAt: nextLifecycleDate ?? new Date(now.getTime() + MONSTER_HUNT_IDLE_CHECK_MS)
		};
	}
	/**
	 * Job handlers exposed to the generic application
	 * scheduler.
	 */
	static readonly HANDLERS = {
		[MONSTER_HUNT_LIFECYCLE_JOB_KEY]: async () => MonsterHuntManager.lifecycleJob()
	};
}
