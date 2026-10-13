import type { MonsterHuntLootResult, MonsterHuntRewardResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import type { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';
import { getMonsterKeyById, monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { MonsterHuntReward } from '@dinorpg/core/models/monsterHunt/monsterHunt.js';
import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';

import { MoneyType, MonsterHuntStatus } from '../../../../prisma/index.js';
import { newNotif } from '../../Notification/Service/notification.service.js';
import { prisma } from '../../prisma.js';

export interface ActiveMonsterHuntMonster {
	monster: MonsterFiche;
	monsterKey: MonsterKey;
	lootDefinitionId: string;
	lootKey: string;
	nameKey: string;
	points: number;
	dropRateBps: number;
	spawnWeight: number;
	globalSpawn: boolean;
}

export interface ActiveMonsterHunt {
	id: string;
	name: string;
	slug: string;
	softCap: number;
	startAt: Date;
	endAt: Date;
	monsters: ActiveMonsterHuntMonster[];
}

function isSameUtcDay(left: Date, right: Date): boolean {
	return (
		left.getUTCFullYear() === right.getUTCFullYear() &&
		left.getUTCMonth() === right.getUTCMonth() &&
		left.getUTCDate() === right.getUTCDate()
	);
}

function getUtcDayStart(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseRewardTier(value: unknown): MonsterHuntReward[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter((reward): reward is MonsterHuntReward => {
		if (!reward || typeof reward !== 'object') {
			return false;
		}
		const candidate = reward as Partial<MonsterHuntReward>;
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

/**
 * Returns the Monster Hunt currently running.
 *
 * Monster Hunts are persisted editions, unlike fixed GameEvents.
 * Having ACTIVE status alone is intentionally not enough: the current
 * timestamp must also be inside the edition's start/end window.
 */
export async function getActiveMonsterHunt(now = new Date()): Promise<ActiveMonsterHunt | null> {
	const hunt = await prisma.monsterHunt.findFirst({
		where: {
			status: MonsterHuntStatus.ACTIVE,
			startAt: {
				lte: now
			},
			endAt: {
				gt: now
			}
		},
		orderBy: {
			startAt: 'desc'
		},
		include: {
			lootDefinitions: true
		}
	});
	if (!hunt) {
		return null;
	}
	const monsters: ActiveMonsterHuntMonster[] = [];
	for (const definition of hunt.lootDefinitions) {
		const monsterKey = definition.monsterKey as MonsterKey;
		const monster = monsterByKey[monsterKey];
		if (!monster) {
			// An invalid historical/configuration entry must not break
			// every random fight on the server.
			continue;
		}
		monsters.push({
			monster,
			monsterKey,
			lootDefinitionId: definition.id,
			lootKey: definition.lootKey,
			nameKey: definition.nameKey,
			points: definition.points,
			dropRateBps: definition.dropRateBps,
			spawnWeight: definition.spawnWeight,
			globalSpawn: definition.globalSpawn
		});
	}
	return {
		id: hunt.id,
		name: hunt.name,
		slug: hunt.slug,
		softCap: hunt.softCap,
		startAt: hunt.startAt,
		endAt: hunt.endAt,
		monsters
	};
}

/**
 * Returns today's number of defeated hunt monsters for soft-cap purposes.
 *
 * We deliberately don't create a participant just because a player starts
 * a fight. The participant will be created when Monster Hunt progression
 * is actually earned.
 */
export async function getMonsterHuntDailyKills(huntId: string, userId: string, now = new Date()): Promise<number> {
	const participant = await prisma.monsterHuntParticipant.findUnique({
		where: {
			huntId_userId: {
				huntId,
				userId
			}
		},
		select: {
			dailyKills: true,
			dailyResetAt: true
		}
	});
	if (!participant) {
		return 0;
	}
	if (!isSameUtcDay(participant.dailyResetAt, now)) {
		return 0;
	}
	return participant.dailyKills;
}

async function applyMonsterHuntReward(
	tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
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

async function claimMonsterHuntRewardTiers(
	tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
	huntId: string,
	participantId: string,
	userId: string,
	previousPoints: number,
	newPoints: number
): Promise<MonsterHuntRewardResult[]> {
	if (newPoints <= previousPoints) {
		return [];
	}
	const tiers = await tx.monsterHuntRewardTier.findMany({
		where: {
			huntId,
			points: {
				gt: previousPoints,
				lte: newPoints
			}
		},
		orderBy: {
			points: 'asc'
		}
	});
	const claimed: MonsterHuntRewardResult[] = [];
	for (const tier of tiers) {
		const rewards = parseRewardTier(tier.reward);
		/*
		 * An empty reward configuration must never be marked as claimed.
		 * This is important for the historical 2000/3000 tiers while
		 * their exact rewards are still being reconstructed.
		 */
		if (rewards.length === 0) {
			continue;
		}
		const alreadyClaimed = await tx.monsterHuntClaimedReward.findUnique({
			where: {
				participantId_rewardTierId: {
					participantId,
					rewardTierId: tier.id
				}
			}
		});
		if (alreadyClaimed) {
			continue;
		}
		for (const reward of rewards) {
			await applyMonsterHuntReward(tx, userId, reward);
		}
		await tx.monsterHuntClaimedReward.create({
			data: {
				participantId,
				rewardTierId: tier.id
			}
		});
		claimed.push({
			points: tier.points,
			rewards: rewards.map(reward => {
				switch (reward.type) {
					case 'ITEM':
						return {
							type: reward.type,
							value: reward.itemId,
							quantity: reward.quantity
						};

					case 'TREASURE_TICKET':
					case 'GOLD':
						return {
							type: reward.type,
							value: reward.quantity,
							quantity: reward.quantity
						};

					case 'EPIC':
						return {
							type: reward.type,
							value: reward.rewardId,
							quantity: 1
						};
				}
			})
		});
	}
	return claimed;
}

export async function rewardMonsterHuntFight(
	userId: string,
	defeatedMonsters: MonsterFiche[],
	random = Math.random,
	now = new Date()
): Promise<{
	loot: MonsterHuntLootResult[];
	rewards: MonsterHuntRewardResult[];
}> {
	if (defeatedMonsters.length === 0) {
		return {
			loot: [],
			rewards: []
		};
	}
	const hunt = await getActiveMonsterHunt(now);
	if (!hunt) {
		return {
			loot: [],
			rewards: []
		};
	}
	const huntMonsterByKey = new Map(hunt.monsters.map(monster => [monster.monsterKey, monster]));
	const defeatedHuntMonsters = defeatedMonsters
		.map(monster => {
			const monsterKey = getMonsterKeyById(monster.id);

			if (!monsterKey) {
				return null;
			}

			return huntMonsterByKey.get(monsterKey) ?? null;
		})
		.filter((monster): monster is ActiveMonsterHuntMonster => monster !== null);
	if (defeatedHuntMonsters.length === 0) {
		return {
			loot: [],
			rewards: []
		};
	}
	const dayStart = getUtcDayStart(now);
	const result = await prisma.$transaction(async tx => {
		const participant = await tx.monsterHuntParticipant.upsert({
			where: {
				huntId_userId: {
					huntId: hunt.id,
					userId
				}
			},
			create: {
				huntId: hunt.id,
				userId,
				dailyResetAt: now
			},
			update: {}
		});
		const previousPoints = participant.points;
		/*
		 * Reset lazy du compteur quotidien.
		 *
		 * Si le joueur n'a encore rien fait aujourd'hui,
		 * son ancien dailyKills est remis à zéro.
		 */
		await tx.monsterHuntParticipant.updateMany({
			where: {
				id: participant.id,
				dailyResetAt: {
					lt: dayStart
				}
			},
			data: {
				dailyKills: 0,
				dailyResetAt: now
			}
		});
		/*
		 * Tous les monstres Monster Hunt vaincus comptent,
		 * qu'ils donnent un objet ou non.
		 */
		await tx.monsterHuntParticipant.update({
			where: {
				id: participant.id
			},
			data: {
				kills: {
					increment: defeatedHuntMonsters.length
				},
				dailyKills: {
					increment: defeatedHuntMonsters.length
				}
			}
		});
		/*
		 * Agrégation des drops par lootDefinition.
		 *
		 * Exemple :
		 * 2 Marcangliers qui droppent
		 * => une entrée avec count = 2.
		 */
		const drops = new Map<
			string,
			{
				definition: ActiveMonsterHuntMonster;
				count: number;
			}
		>();
		for (const monster of defeatedHuntMonsters) {
			const roll = Math.floor(random() * 10_000);
			if (roll >= monster.dropRateBps) {
				continue;
			}
			const existing = drops.get(monster.lootDefinitionId);
			if (existing) {
				existing.count++;
			} else {
				drops.set(monster.lootDefinitionId, {
					definition: monster,
					count: 1
				});
			}
		}
		const lootResults: MonsterHuntLootResult[] = [];
		/*
		 * Applique les objets trouvés et les points correspondants.
		 */
		for (const { definition, count } of drops.values()) {
			const earnedPoints = definition.points * count;
			await tx.monsterHuntParticipantLoot.upsert({
				where: {
					participantId_lootDefinitionId: {
						participantId: participant.id,
						lootDefinitionId: definition.lootDefinitionId
					}
				},
				create: {
					participantId: participant.id,
					lootDefinitionId: definition.lootDefinitionId,
					count,
					pointsEarned: earnedPoints
				},
				update: {
					count: {
						increment: count
					},
					pointsEarned: {
						increment: earnedPoints
					}
				}
			});
			await tx.monsterHuntParticipant.update({
				where: {
					id: participant.id
				},
				data: {
					objects: {
						increment: count
					},
					points: {
						increment: earnedPoints
					}
				}
			});
			lootResults.push({
				lootKey: definition.lootKey,
				nameKey: definition.nameKey,
				points: definition.points,
				count
			});
		}
		/*
		 * Récupération du nouveau score après tous les drops.
		 */
		const updatedParticipant = await tx.monsterHuntParticipant.findUniqueOrThrow({
			where: {
				id: participant.id
			},
			select: {
				points: true
			}
		});
		/*
		 * Déclenche tous les paliers franchis pendant ce combat.
		 */
		const claimedRewards = await claimMonsterHuntRewardTiers(
			tx,
			hunt.id,
			participant.id,
			userId,
			previousPoints,
			updatedParticipant.points
		);
		return {
			loot: lootResults,
			rewards: claimedRewards
		};
	});
	/*
	 * La notification est créée après la transaction.
	 * Une erreur de notification ne remet donc pas en cause
	 * l'attribution réelle des récompenses.
	 */
	if (result.rewards.length > 0) {
		await newNotif(userId, NotificationType.NEW_REWARD, JSON.stringify(result.rewards));
	}
	return result;
}
