import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

beforeAll(async () => {
	server = await buildServer({ startBackgroundJobs: false });
	await server.ready();
});

beforeEach(async () => {
	await cleanDatabase();
});

afterAll(async () => {
	await server.close();
});

async function setProgression(userId: string, progression: number) {
	return prisma.userScenario.upsert({
		where: { scenarioKey_userId: { userId, scenarioKey: 'kabuki' } },
		create: { userId, scenarioKey: 'kabuki', progression, tracking: 0 },
		update: { progression }
	});
}

async function getProgression(userId: string) {
	const scenario = await prisma.userScenario.findUniqueOrThrow({
		where: { scenarioKey_userId: { userId, scenarioKey: 'kabuki' } }
	});
	return scenario.progression;
}

async function auraCount(userId: string) {
	return prisma.userRewards.count({ where: { userId, rewardId: Reward.KAURA } });
}

async function createGroup(userId: string) {
	const props = {
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
	const leader = await createTestDinoz({ ...props, name: 'KabukiLeader' });
	const follower = await createTestDinoz({ ...props, name: 'KabukiFollower' });
	await prisma.dinoz.update({ where: { id: follower.id }, data: { leaderId: leader.id } });
	return { leader, follower };
}

async function move(user: Awaited<ReturnType<typeof createTestUser>>, dinozId: number, placeId: PlaceEnum) {
	return server.inject({
		method: 'PUT',
		url: '/api/dinoz/move',
		headers: { cookie: createAuthCookie(server, user) },
		payload: { dinozId, placeId }
	});
}

async function restoreIrmaActions(ids: number[]) {
	// The first, deliberately unsuccessful, movement consumes one action for each member.
	// This is the same flag restored by using the Potion d'Irma in normal gameplay.
	await prisma.dinoz.updateMany({ where: { id: { in: ids } }, data: { fight: true } });
}

function parseFight(response: Awaited<ReturnType<FastifyInstance['inject']>>): FightResult {
	expect(response.statusCode, response.body).toBe(200);
	return response.json() as FightResult;
}

describe('Kabuki scenario: integration, Coral Mines to Totem Island', () => {
	it('ITLOST moves 19 -> 20, consumes actions, does not teleport or award the Aura', async () => {
		const user = await createTestUser({ withTutorial: false });
		const { leader, follower } = await createGroup(user.id);
		await setProgression(user.id, 19);

		const response = parseFight(await move(user, leader.id, PlaceEnum.ITLOST));
		expect(response.movementEvent?.key).toBe('kabuki_lost_island');
		expect(response.scenario?.progression).toBe(20);
		expect(response.scenario?.progressed).toBe(true);
		expect(response.result).toBe(false);
		expect(response.history).toEqual([]);
		expect(await getProgression(user.id)).toBe(20);
		expect(await auraCount(user.id)).toBe(0);
		const party = await prisma.dinoz.findMany({ where: { id: { in: [leader.id, follower.id] } } });
		expect(party).toHaveLength(2);
		expect(party.every(dinoz => dinoz.placeId === PlaceEnum.MINES_DE_CORAIL)).toBe(true);
		expect(party.every(dinoz => dinoz.fight === false)).toBe(true);
	});

	it('replays lost-route action then resolves the final battle with the entire group', async () => {
		const user = await createTestUser({ withTutorial: false });
		const { leader, follower } = await createGroup(user.id);
		await setProgression(user.id, 19);

		parseFight(await move(user, leader.id, PlaceEnum.ITLOST));
		await restoreIrmaActions([leader.id, follower.id]);
		const result = parseFight(await move(user, leader.id, PlaceEnum.ITOTEM));

		expect(result.source).toBe('scenario');
		expect(result.scenario?.fightKey).toBe('kabuki_igor_totem');
		expect(result.result).toBe(true);
		expect(result.scenario?.progressed).toBe(true);
		expect(result.scenario?.progression).toBe(21);
		expect(result.history.length).toBeGreaterThan(0);
		expect(result.fighters.some(f => f.id === leader.id && f.attacker)).toBe(true);
		expect(result.fighters.some(f => f.id === follower.id && f.attacker)).toBe(true);
		for (const name of ['yakuzi', 'Ninjutsu', 'Kage', 'Barbara', 'Choupette', 'Poupoule']) {
			expect(
				result.fighters.some(f => f.name === name),
				`Missing fighter ${name}`
			).toBe(true);
		}
		const knownIds = new Set(result.fighters.map(f => f.id));
		for (const step of result.history) {
			if (step.action === 'arrive') expect(knownIds.has(step.fid), `Missing arrival fighter ${step.fid}`).toBe(true);
		}
		expect(await getProgression(user.id)).toBe(21);
		expect(await auraCount(user.id)).toBe(1);
		const party = await prisma.dinoz.findMany({ where: { id: { in: [leader.id, follower.id] } } });
		expect(party.every(d => d.placeId === PlaceEnum.ITOTEM)).toBe(true);
		expect(party.every(d => d.fight === false)).toBe(true);
	});

	it('never produces a second Aura for an already completed scenario', async () => {
		const user = await createTestUser({ withTutorial: false });
		const { leader } = await createGroup(user.id);
		await setProgression(user.id, 21);
		await prisma.userRewards.create({ data: { userId: user.id, rewardId: Reward.KAURA } });
		// The final scripted encounter is only enabled at progression 20.
		const { processKabukiScenarioMoveFight } =
			await import('../../src/Scenario/Controller/kabukiScenario.controller.js');
		const userForFight = {
			id: user.id,
			cooker: false,
			teacher: false,
			items: []
		};
		const result = await processKabukiScenarioMoveFight({
			user: userForFight,
			team: [],
			dinozId: leader.id,
			fromPlace: PlaceEnum.MINES_DE_CORAIL,
			triggerPlace: PlaceEnum.ITOTEM,
			toPlace: PlaceEnum.ITOTEM
		});
		expect(result).toBe(false);
		expect(await auraCount(user.id)).toBe(1);
		expect(await getProgression(user.id)).toBe(21);
	});
});
