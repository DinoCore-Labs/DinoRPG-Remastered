import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { DARK_WORLD_INVASION_MONSTER_HUNT } from '@dinorpg/core/models/monsterHunt/monsterHuntEditions.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MonsterHuntStatus } from '../../../prisma/index.js';
import { generateMonsterList } from '../../src/Fight/Service/fight.service.js';
import {
	getActiveMonsterHunt,
	rewardMonsterHuntFight
} from '../../src/MonsterHunt/Controller/monsterHunt.controller.js';
import { MonsterHuntManager } from '../../src/MonsterHunt/Controller/monsterHuntManager.controller.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

beforeAll(async () => {
	server = await buildServer({
		startBackgroundJobs: false
	});
	await server.ready();
});

beforeEach(async () => {
	await cleanDatabase();
});

afterAll(async () => {
	await server.close();
});

function minutesFromNow(minutes: number): Date {
	return new Date(Date.now() + minutes * 60 * 1000);
}

async function createActiveHunt() {
	return MonsterHuntManager.createEdition({
		config: DARK_WORLD_INVASION_MONSTER_HUNT,
		startAt: minutesFromNow(-1),
		endAt: minutesFromNow(60)
	});
}

async function createScheduledHunt() {
	return MonsterHuntManager.createEdition({
		config: DARK_WORLD_INVASION_MONSTER_HUNT,
		startAt: minutesFromNow(10),
		endAt: minutesFromNow(60)
	});
}

describe('Monster Hunt lifecycle', () => {
	it('creates a future edition as SCHEDULED', async () => {
		const hunt = await createScheduledHunt();
		expect(hunt.status).toBe(MonsterHuntStatus.SCHEDULED);
		expect(
			await prisma.monsterHuntLootDefinition.count({
				where: {
					huntId: hunt.id
				}
			})
		).toBe(DARK_WORLD_INVASION_MONSTER_HUNT.monsters.length);
		expect(
			await prisma.monsterHuntRewardTier.count({
				where: {
					huntId: hunt.id
				}
			})
		).toBe(DARK_WORLD_INVASION_MONSTER_HUNT.rewardTiers.length);
		expect(
			await prisma.monsterHuntRankingReward.count({
				where: {
					huntId: hunt.id
				}
			})
		).toBe(DARK_WORLD_INVASION_MONSTER_HUNT.rankingRewards.length);
	});

	it('activates a scheduled hunt when startAt is reached', async () => {
		const hunt = await createScheduledHunt();
		const transitionDate = new Date(hunt.startAt.getTime() + 1);
		const result = await MonsterHuntManager.syncStatuses(transitionDate);
		expect(result.activated).toBe(1);
		expect(result.ended).toBe(0);
		const updated = await prisma.monsterHunt.findUniqueOrThrow({
			where: {
				id: hunt.id
			}
		});
		expect(updated.status).toBe(MonsterHuntStatus.ACTIVE);
	});

	it('ends an active hunt when endAt is reached', async () => {
		const hunt = await createActiveHunt();
		const transitionDate = new Date(hunt.endAt.getTime() + 1);
		const result = await MonsterHuntManager.syncStatuses(transitionDate);
		expect(result.ended).toBe(1);
		const updated = await prisma.monsterHunt.findUniqueOrThrow({
			where: {
				id: hunt.id
			}
		});
		expect(updated.status).toBe(MonsterHuntStatus.ENDED);
	});

	it('ends an expired scheduled hunt without activating it', async () => {
		const hunt = await createScheduledHunt();
		const afterEnd = new Date(hunt.endAt.getTime() + 1);
		const result = await MonsterHuntManager.syncStatuses(afterEnd);
		expect(result.ended).toBe(1);
		expect(result.activated).toBe(0);
		const updated = await prisma.monsterHunt.findUniqueOrThrow({
			where: {
				id: hunt.id
			}
		});
		expect(updated.status).toBe(MonsterHuntStatus.ENDED);
	});

	it('rejects overlapping editions', async () => {
		await createScheduledHunt();
		await expect(
			MonsterHuntManager.createEdition({
				config: DARK_WORLD_INVASION_MONSTER_HUNT,
				startAt: minutesFromNow(20),
				endAt: minutesFromNow(80)
			})
		).rejects.toThrow(/overlap/i);
	});
});

describe('Monster Hunt activation', () => {
	it('returns the currently active hunt with its configured monsters', async () => {
		const hunt = await createActiveHunt();
		const active = await getActiveMonsterHunt();
		expect(active).not.toBeNull();
		expect(active?.id).toBe(hunt.id);
		expect(active?.monsters.map(monster => monster.monsterKey)).toEqual(
			expect.arrayContaining(['marca2', 'megou2', 'megaw2', 'pirao3', 'garou2', 'amanp3', 'mimic3'])
		);
	});

	it('does not expose an ended hunt as active', async () => {
		const hunt = await createActiveHunt();
		await prisma.monsterHunt.update({
			where: {
				id: hunt.id
			},
			data: {
				status: MonsterHuntStatus.ENDED
			}
		});
		expect(await getActiveMonsterHunt()).toBeNull();
	});

	it('can inject a global Monster Hunt monster into a normal Dinoland encounter', async () => {
		await createActiveHunt();
		/*
		 * weightedRandom() uses Math.random().
		 *
		 * A value close to 1 selects the last weighted
		 * candidate, which is the last configured Hunt
		 * monster (mimic3).
		 */
		const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999999);
		try {
			const monsters = await generateMonsterList(
				[
					{
						id: 999_001,
						level: 35,
						placeId: PlaceEnum.DINOVILLE
					}
				],
				PlaceEnum.DINOVILLE
			);
			expect(monsters.some(monster => monster.id === monsterByKey.mimic3.id)).toBe(true);
		} finally {
			randomSpy.mockRestore();
		}
	});
});

describe('Monster Hunt loot and personal rewards', () => {
	it('awards hunt objects, points and the 500-point milestone', async () => {
		await createActiveHunt();
		const user = await createTestUser({
			name: 'MonsterHunter'
		});
		/*
		 * mimic3:
		 * 100 points per successful hunt object.
		 *
		 * Five forced drops therefore reach exactly 500.
		 */
		const defeatedMonsters = Array.from({ length: 5 }, () => monsterByKey.mimic3);
		const result = await rewardMonsterHuntFight(
			user.id,
			defeatedMonsters,
			/*
			 * roll = 0
			 * => every configured drop succeeds.
			 */
			() => 0
		);
		expect(result.loot).toEqual([
			expect.objectContaining({
				lootKey: 'cursed_mimic_fragment',
				points: 100,
				count: 5
			})
		]);
		expect(result.rewards).toEqual([
			expect.objectContaining({
				points: 500
			})
		]);
		const participant = await prisma.monsterHuntParticipant.findFirstOrThrow({
			where: {
				userId: user.id
			}
		});
		expect(participant.points).toBe(500);
		expect(participant.objects).toBe(5);
		expect(participant.kills).toBe(5);
		const loot = await prisma.monsterHuntParticipantLoot.findFirstOrThrow({
			where: {
				participantId: participant.id
			}
		});
		expect(loot.count).toBe(5);
		expect(loot.pointsEarned).toBe(500);
		const irma = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: Item.POTION_IRMA
				}
			}
		});
		expect(irma.quantity).toBe(5);
		expect(
			await prisma.monsterHuntClaimedReward.count({
				where: {
					participantId: participant.id
				}
			})
		).toBe(1);
	});

	it('does not award points when the hunt object drop fails', async () => {
		await createActiveHunt();
		const user = await createTestUser({
			name: 'UnluckyHunter'
		});
		const result = await rewardMonsterHuntFight(
			user.id,
			[monsterByKey.mimic3],
			/*
			 * 9999 is above mimic3's configured
			 * drop threshold.
			 */
			() => 0.999999
		);
		expect(result.loot).toEqual([]);
		expect(result.rewards).toEqual([]);
		const participant = await prisma.monsterHuntParticipant.findFirstOrThrow({
			where: {
				userId: user.id
			}
		});
		expect(participant.points).toBe(0);
		expect(participant.objects).toBe(0);
		expect(participant.kills).toBe(1);
	});
});

describe('Monster Hunt ranking', () => {
	it('returns players ordered by points then deterministic tie-breakers', async () => {
		const hunt = await createActiveHunt();
		const alice = await createTestUser({
			name: 'Alice'
		});
		const bob = await createTestUser({
			name: 'Bob'
		});
		const claire = await createTestUser({
			name: 'Claire'
		});
		await prisma.monsterHuntParticipant.createMany({
			data: [
				{
					huntId: hunt.id,
					userId: alice.id,
					points: 5000,
					objects: 80
				},
				{
					huntId: hunt.id,
					userId: bob.id,
					points: 5000,
					objects: 100
				},
				{
					huntId: hunt.id,
					userId: claire.id,
					points: 4500,
					objects: 200
				}
			]
		});
		const response = await server.inject({
			method: 'GET',
			url: `/api/ranking/monster-hunt/` + `${hunt.id}/1`
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.ranking).toHaveLength(3);
		expect(
			body.ranking.map((entry: any) => ({
				position: entry.position,
				name: entry.user.name,
				points: entry.points,
				objects: entry.objects
			}))
		).toEqual([
			{
				position: 1,
				name: 'Bob',
				points: 5000,
				objects: 100
			},
			{
				position: 2,
				name: 'Alice',
				points: 5000,
				objects: 80
			},
			{
				position: 3,
				name: 'Claire',
				points: 4500,
				objects: 200
			}
		]);
	});
});

describe('Monster Hunt final ranking rewards', () => {
	it('distributes final rewards once and switches ENDED to REWARDED', async () => {
		const hunt = await createActiveHunt();
		const winner = await createTestUser({
			name: 'Winner'
		});
		const second = await createTestUser({
			name: 'Second'
		});
		const third = await createTestUser({
			name: 'Third'
		});
		await prisma.monsterHuntParticipant.createMany({
			data: [
				{
					huntId: hunt.id,
					userId: winner.id,
					points: 10_000,
					objects: 300
				},
				{
					huntId: hunt.id,
					userId: second.id,
					points: 9000,
					objects: 250
				},
				{
					huntId: hunt.id,
					userId: third.id,
					points: 8000,
					objects: 200
				}
			]
		});
		await prisma.monsterHunt.update({
			where: {
				id: hunt.id
			},
			data: {
				status: MonsterHuntStatus.ENDED
			}
		});
		const result = await MonsterHuntManager.distributeRankingRewards(hunt.id);
		expect(result).toEqual({
			rewardedPlayers: 3,
			alreadyRewardedPlayers: 0
		});
		const updatedHunt = await prisma.monsterHunt.findUniqueOrThrow({
			where: {
				id: hunt.id
			}
		});
		expect(updatedHunt.status).toBe(MonsterHuntStatus.REWARDED);
		const winnerMahamuti = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: winner.id,
					itemId: Item.MAHAMUTI_EGG
				}
			}
		});
		expect(winnerMahamuti.quantity).toBe(1);
		const winnerToufufu = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: winner.id,
					itemId: Item.TOUFUFU_BABY
				}
			}
		});
		expect(winnerToufufu.quantity).toBe(1);
		const winnerEpic = await prisma.userRewards.findUnique({
			where: {
				rewardId_userId: {
					userId: winner.id,
					rewardId: Reward.HUNT1
				}
			}
		});
		expect(winnerEpic).not.toBeNull();
		for (const user of [second, third]) {
			const toufufu = await prisma.userItems.findUniqueOrThrow({
				where: {
					itemId_userId: {
						userId: user.id,
						itemId: Item.TOUFUFU_BABY
					}
				}
			});
			expect(toufufu.quantity).toBe(1);
		}
		expect(
			await prisma.monsterHuntRankingRewardClaim.count({
				where: {
					huntId: hunt.id
				}
			})
		).toBe(3);
		/*
		 * Second call:
		 * the edition is already REWARDED.
		 */
		const secondRun = await MonsterHuntManager.distributeRankingRewards(hunt.id);
		expect(secondRun).toEqual({
			rewardedPlayers: 0,
			alreadyRewardedPlayers: 0
		});
		const winnerMahamutiAfter = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: winner.id,
					itemId: Item.MAHAMUTI_EGG
				}
			}
		});
		expect(winnerMahamutiAfter.quantity).toBe(1);
	});
});

describe('Monster Hunt lifecycle news', () => {
	it('publishes the start news only once', async () => {
		const hunt = await createActiveHunt();
		const first = await MonsterHuntManager.ensureStartNews(hunt.id);
		const second = await MonsterHuntManager.ensureStartNews(hunt.id);
		expect(first).toBe(true);
		expect(second).toBe(false);
		const slug = `monster-hunt-${hunt.slug}-start`;
		const news = await prisma.news.findUniqueOrThrow({
			where: {
				slug
			},
			include: {
				translations: true
			}
		});
		expect(news.type).toBe('monster_hunt_start');
		const fr = news.translations.find(translation => translation.lang === 'FR');
		expect(fr).toBeDefined();
		const content = fr!.content;
		const [, rawParams] = content.split(/\|(.+)/);
		const params = JSON.parse(rawParams);
		expect(params.rankingUrl).toBe(`/ranking/monster-hunt/1?huntId=${hunt.id}`);
		expect(params.endDate).toBe(hunt.endAt.toISOString());
		expect(
			await prisma.news.count({
				where: {
					slug
				}
			})
		).toBe(1);
	});

	it('publishes one final news containing the Top 3 and ranking link', async () => {
		const hunt = await createActiveHunt();
		const first = await createTestUser({
			name: 'HunterOne'
		});
		const second = await createTestUser({
			name: 'HunterTwo'
		});
		const third = await createTestUser({
			name: 'HunterThree'
		});
		await prisma.monsterHuntParticipant.createMany({
			data: [
				{
					huntId: hunt.id,
					userId: first.id,
					points: 15_000,
					objects: 500
				},
				{
					huntId: hunt.id,
					userId: second.id,
					points: 12_000,
					objects: 400
				},
				{
					huntId: hunt.id,
					userId: third.id,
					points: 10_000,
					objects: 300
				}
			]
		});
		await prisma.monsterHunt.update({
			where: {
				id: hunt.id
			},
			data: {
				status: MonsterHuntStatus.ENDED
			}
		});
		await MonsterHuntManager.distributeRankingRewards(hunt.id);
		const firstPublication = await MonsterHuntManager.ensureEndNews(hunt.id);
		const secondPublication = await MonsterHuntManager.ensureEndNews(hunt.id);
		expect(firstPublication).toBe(true);
		expect(secondPublication).toBe(false);
		const slug = `monster-hunt-${hunt.slug}-end`;
		const news = await prisma.news.findUniqueOrThrow({
			where: {
				slug
			},
			include: {
				translations: true
			}
		});
		expect(news.type).toBe('monster_hunt_end');
		const fr = news.translations.find(translation => translation.lang === 'FR');
		expect(fr).toBeDefined();
		const [, rawParams] = fr!.content.split(/\|(.+)/);
		const params = JSON.parse(rawParams);
		expect(params.rankingUrl).toBe(`/ranking/monster-hunt/1?huntId=${hunt.id}`);
		expect(params.topPlayers).toContain('HunterOne');
		expect(params.topPlayers).toContain('HunterTwo');
		expect(params.topPlayers).toContain('HunterThree');
		expect(
			await prisma.news.count({
				where: {
					slug
				}
			})
		).toBe(1);
	});
});
