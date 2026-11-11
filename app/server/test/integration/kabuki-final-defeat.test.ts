import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, type FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Boss } from '@dinorpg/core/models/monster/bossList.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

// Preserve the real fight engine and real reward settlement. Only force the
// final result to a defeat when explicitly requested by a test. This is an
// integration test of the scenario's loss/retry path, NOT a proof that the
// unmodified combat simulator produces a loss for a particular seed.
const lossControl = vi.hoisted(() => ({ enabled: false, interceptions: 0 }));
vi.mock('../../src/Fight/Service/fight.service.js', async importOriginal => {
	const original = await importOriginal<typeof import('../../src/Fight/Service/fight.service.js')>();
	return {
		...original,
		calculateFightVsMonsters: (...args: Parameters<typeof original.calculateFightVsMonsters>) => {
			const process = original.calculateFightVsMonsters(...args);
			if (
				lossControl.enabled &&
				args[2] === PlaceEnum.ITOTEM &&
				args[3]?.some(monster => monster.id === Boss.PR_IGOR)
			) {
				lossControl.interceptions += 1;
				return { ...process, outcome: FightOutcome.DefenderWin };
			}
			return process;
		}
	};
});

let server: FastifyInstance;

beforeAll(async () => {
	server = await buildServer({ startBackgroundJobs: false });
	await server.ready();
});

beforeEach(async () => {
	lossControl.enabled = false;
	lossControl.interceptions = 0;
	await cleanDatabase();
});

afterEach(() => {
	lossControl.enabled = false;
});

afterAll(async () => {
	await server.close();
});

async function makeGroup(userId: string) {
	const attributes = {
		userId,
		placeId: PlaceEnum.MINES_DE_CORAIL,
		canRename: false,
		level: 20,
		maxLife: 100_000,
		life: 100_000,
		nbrUpFire: 1000,
		nbrUpWood: 1000,
		nbrUpWater: 1000,
		nbrUpLightning: 1000,
		nbrUpAir: 1000,
		fight: true
	};
	const leader = await createTestDinoz({ ...attributes, name: 'TotemLeader' });
	const follower = await createTestDinoz({ ...attributes, name: 'TotemFollower' });
	await prisma.dinoz.update({ where: { id: follower.id }, data: { leaderId: leader.id } });
	return [leader.id, follower.id];
}

async function progress(userId: string) {
	const row = await prisma.userScenario.findUnique({
		where: { scenarioKey_userId: { userId, scenarioKey: 'kabuki' } }
	});
	return row?.progression ?? 0;
}

async function auraCount(userId: string) {
	return prisma.userRewards.count({ where: { userId, rewardId: Reward.KAURA } });
}

async function startAtFinale(userId: string) {
	await prisma.userScenario.upsert({
		where: { scenarioKey_userId: { userId, scenarioKey: 'kabuki' } },
		create: { userId, scenarioKey: 'kabuki', progression: 20, tracking: 0 },
		update: { progression: 20 }
	});
}

async function moveToTotem(user: Awaited<ReturnType<typeof createTestUser>>, leaderId: number) {
	const response = await server.inject({
		method: 'PUT',
		url: '/api/dinoz/move',
		headers: { cookie: createAuthCookie(server, user) },
		payload: { dinozId: leaderId, placeId: PlaceEnum.ITOTEM }
	});
	expect(response.statusCode, response.body).toBe(200);
	return response.json() as FightResult;
}

async function expectGroupInMines(ids: number[], actionAvailable: boolean) {
	const party = await prisma.dinoz.findMany({ where: { id: { in: ids } } });
	expect(party).toHaveLength(ids.length);
	expect(party.every(d => d.placeId === PlaceEnum.MINES_DE_CORAIL)).toBe(true);
	expect(party.every(d => d.fight === actionAvailable)).toBe(true);
}

describe('Kabuki: Totem Island final defeat and retry (database-backed)', () => {
	it('does not grant the Aura or advance phase 20 after a deterministic defeat', async () => {
		const user = await createTestUser({ withTutorial: false });
		const ids = await makeGroup(user.id);
		await startAtFinale(user.id);
		lossControl.enabled = true;

		const result = await moveToTotem(user, ids[0]);
		expect(lossControl.interceptions).toBe(1);
		expect(result.source).toBe('scenario');
		expect(result.scenario).toMatchObject({
			key: 'kabuki',
			fightKey: 'kabuki_igor_totem',
			progressed: false,
			progression: 20
		});
		expect(result.result).toBe(false);
		expect(result.history.length).toBeGreaterThan(0);
		expect(result.endText).toBeUndefined();
		expect(await progress(user.id)).toBe(20);
		expect(await auraCount(user.id)).toBe(0);
		await expectGroupInMines(ids, false);
	});

	it('allows a retry after restoring Irma actions, then awards the Aura exactly once', async () => {
		const user = await createTestUser({ withTutorial: false });
		const ids = await makeGroup(user.id);
		await startAtFinale(user.id);
		lossControl.enabled = true;
		const defeat = await moveToTotem(user, ids[0]);
		expect(lossControl.interceptions).toBe(1);
		expect(defeat.result).toBe(false);
		expect(await progress(user.id)).toBe(20);

		// Equivalent to restoring one action with Potion d'Irma.
		// Potion consumption itself is covered by the inventory tests.
		await prisma.dinoz.updateMany({
			where: { id: { in: ids } },
			data: { fight: true }
		});
		lossControl.enabled = false;
		const victory = await moveToTotem(user, ids[0]);
		expect(victory.result).toBe(true);
		expect(victory.scenario).toMatchObject({
			key: 'kabuki',
			fightKey: 'kabuki_igor_totem',
			progressed: true,
			progression: 21
		});
		expect(await progress(user.id)).toBe(21);
		expect(await auraCount(user.id)).toBe(1);
		const party = await prisma.dinoz.findMany({ where: { id: { in: ids } } });
		expect(party.every(d => d.placeId === PlaceEnum.ITOTEM)).toBe(true);
		expect(party.every(d => d.fight === false)).toBe(true);
	});
});
