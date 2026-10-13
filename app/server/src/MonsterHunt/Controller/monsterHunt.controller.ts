import type { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import type { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';

import { MonsterHuntStatus } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export interface ActiveMonsterHuntMonster {
	monster: MonsterFiche;
	monsterKey: MonsterKey;
	lootDefinitionId: string;
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
