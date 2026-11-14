import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
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

async function setupClan(userIds: string[]) {
	const clan = await prisma.clan.create({
		data: { name: 'ClinicBuilders', leaderId: userIds[0]!, langs: [] }
	});
	await prisma.clanMember.createMany({
		data: userIds.map(userId => ({ userId, clanId: clan.id }))
	});
	await prisma.user.updateMany({
		where: { id: { in: userIds } },
		data: { clanId: clan.id }
	});
	return clan;
}

async function setClinicProgression(userId: string, progression = 6) {
	await prisma.userScenario.upsert({
		where: { scenarioKey_userId: { userId, scenarioKey: 'clinik' } },
		create: { userId, scenarioKey: 'clinik', progression },
		update: { progression }
	});
}

type TestUser = Awaited<ReturnType<typeof createTestUser>>;

function contribute(user: TestUser, clanId: number, dinozId: number) {
	return server.inject({
		method: 'POST',
		url: `/api/clan/${clanId}/actions/hopita/contribute`,
		headers: { cookie: createAuthCookie(server, user) },
		payload: { dinozId }
	});
}

describe('MT clan action: clinique', () => {
	it('partage la progression entre deux joueurs sans consommer directement de potion', async () => {
		const alice = await createTestUser({ withTutorial: false });
		const bob = await createTestUser({ withTutorial: false });
		const clan = await setupClan([alice.id, bob.id]);
		await Promise.all([setClinicProgression(alice.id), setClinicProgression(bob.id)]);
		const first = await createTestDinoz({
			userId: alice.id,
			placeId: PlaceEnum.CLINIQUE,
			canRename: false,
			remaining: 0
		});
		const second = await createTestDinoz({
			userId: bob.id,
			placeId: PlaceEnum.CLINIQUE,
			canRename: false,
			remaining: 0
		});

		const [a, b] = await Promise.all([contribute(alice, clan.id, first.id), contribute(bob, clan.id, second.id)]);
		expect([a.statusCode, b.statusCode]).toEqual([200, 200]);
		expect([a.json().progress, b.json().progress].sort()).toEqual([1, 2]);
		expect(
			await prisma.clanActionProgress.findUnique({
				where: { clanId_actionKey: { clanId: clan.id, actionKey: 'hopita' } }
			})
		).toMatchObject({ progress: 2, completedAt: null });
		for (const id of [first.id, second.id]) {
			expect(await prisma.dinoz.findUniqueOrThrow({ where: { id } })).toMatchObject({
				fight: false,
				gather: true,
				remaining: 0
			});
		}

		const response = await server.inject({
			method: 'GET',
			url: `/api/clan/${clan.id}/actions`,
			headers: { cookie: createAuthCookie(server, alice) }
		});
		expect(response.statusCode).toBe(200);
		expect(response.json().actions.find((a: { actionKey: string }) => a.actionKey === 'hopita')).toMatchObject({
			progress: 2,
			total: 600,
			available: true,
			completed: false
		});
	});

	it('refuse un joueur hors clan, une quête verrouillée et un double emploi du tour', async () => {
		const alice = await createTestUser({ withTutorial: false });
		const outsider = await createTestUser({ withTutorial: false });
		const clan = await setupClan([alice.id]);
		const dinoz = await createTestDinoz({
			userId: alice.id,
			placeId: PlaceEnum.CLINIQUE,
			canRename: false
		});
		expect((await contribute(alice, clan.id, dinoz.id)).statusCode).toBe(403);
		await setClinicProgression(alice.id);
		expect((await contribute(outsider, clan.id, dinoz.id)).statusCode).toBe(403);
		expect((await contribute(alice, clan.id, dinoz.id)).statusCode).toBe(200);
		expect((await contribute(alice, clan.id, dinoz.id)).statusCode).toBe(409);
		expect(
			(
				await prisma.clanActionProgress.findUnique({
					where: { clanId_actionKey: { clanId: clan.id, actionKey: 'hopita' } }
				})
			)?.progress
		).toBe(1);
	});

	it('arrête la construction précisément à 600 actions, même avec deux contributeurs simultanés', async () => {
		const alice = await createTestUser({ withTutorial: false });
		const bob = await createTestUser({ withTutorial: false });
		const clan = await setupClan([alice.id, bob.id]);
		await Promise.all([setClinicProgression(alice.id), setClinicProgression(bob.id)]);
		await prisma.clanActionProgress.create({
			data: { clanId: clan.id, actionKey: 'hopita', progress: 599 }
		});
		const first = await createTestDinoz({
			userId: alice.id,
			placeId: PlaceEnum.CLINIQUE,
			canRename: false
		});
		const second = await createTestDinoz({
			userId: bob.id,
			placeId: PlaceEnum.CLINIQUE,
			canRename: false
		});
		const [a, b] = await Promise.all([contribute(alice, clan.id, first.id), contribute(bob, clan.id, second.id)]);
		expect([a.statusCode, b.statusCode].sort()).toEqual([200, 409]);
		const row = await prisma.clanActionProgress.findUniqueOrThrow({
			where: { clanId_actionKey: { clanId: clan.id, actionKey: 'hopita' } }
		});
		expect(row.progress).toBe(600);
		expect(row.completedAt).not.toBeNull();
		const states = await prisma.dinoz.findMany({
			where: { id: { in: [first.id, second.id] } },
			select: { fight: true }
		});
		expect(states.filter(state => !state.fight)).toHaveLength(1);
	});

	it('n’utilise pas le tour d’un Dinoz situé ailleurs', async () => {
		const alice = await createTestUser({ withTutorial: false });
		const clan = await setupClan([alice.id]);
		await setClinicProgression(alice.id);
		const dinoz = await createTestDinoz({
			userId: alice.id,
			placeId: PlaceEnum.DINOVILLE,
			canRename: false
		});
		expect((await contribute(alice, clan.id, dinoz.id)).statusCode).toBe(409);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } })).fight).toBe(true);
		expect(await prisma.clanActionProgress.count({ where: { clanId: clan.id } })).toBe(0);
	});
});
