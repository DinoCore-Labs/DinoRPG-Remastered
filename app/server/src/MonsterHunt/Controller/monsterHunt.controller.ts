import type { MonsterHuntLootResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import type { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';
import { getMonsterKeyById, monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';

import { MonsterHuntStatus } from '../../../../prisma/index.js';
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

export async function rewardMonsterHuntFight(
	userId: string,
	defeatedMonsters: MonsterFiche[],
	random = Math.random,
	now = new Date()
): Promise<MonsterHuntLootResult[]> {
	if (defeatedMonsters.length === 0) {
		return [];
	}
	const hunt = await getActiveMonsterHunt(now);
	if (!hunt) {
		return [];
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
		return [];
	}
	const dayStart = getUtcDayStart(now);
	return prisma.$transaction(async tx => {
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
		/*
		 * Reset the daily counter once when the UTC day changes.
		 *
		 * updateMany makes the reset conditional, which prevents two
		 * concurrent fights from both blindly resetting the counter.
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
		 * Every defeated Monster Hunt monster counts as a kill,
		 * independently from whether its hunt object drops.
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
		if (drops.size === 0) {
			return [];
		}
		const results: MonsterHuntLootResult[] = [];
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
			results.push({
				lootKey: definition.lootKey,
				nameKey: definition.nameKey,
				points: definition.points,
				count
			});
		}
		return results;
	});
}
