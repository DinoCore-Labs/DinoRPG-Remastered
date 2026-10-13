import { MonsterHuntPresetKey } from '@dinorpg/core/models/monsterHunt/monsterHunt.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { MonsterHuntStatus } from '../../../prisma/index.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
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

function isoMinutesFromNow(minutes: number): string {
	return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

describe('Monster Hunt Admin API permissions', () => {
	it('rejects a normal player', async () => {
		const user = await createTestUser({
			name: 'NormalPlayer'
		});
		const response = await server.inject({
			method: 'GET',
			url: '/api/admin/monster-hunts',
			headers: {
				cookie: createAuthCookie(server, user)
			}
		});
		expect(response.statusCode).toBe(403);
	});

	it('allows an admin to read the Monster Hunt overview', async () => {
		const admin = await createTestUser({
			name: 'HuntAdmin',
			role: 'ADMIN'
		});
		const response = await server.inject({
			method: 'GET',
			url: '/api/admin/monster-hunts',
			headers: {
				cookie: createAuthCookie(server, admin)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.presets).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: MonsterHuntPresetKey.DARK_WORLD_INVASION
				})
			])
		);
		expect(body.editions).toEqual([]);
	});
});

describe('Monster Hunt Admin lifecycle', () => {
	it('creates, starts and ends an edition from the Admin API', async () => {
		const admin = await createTestUser({
			name: 'LifecycleAdmin',
			role: 'ADMIN'
		});
		const cookie = createAuthCookie(server, admin);
		const creation = await server.inject({
			method: 'POST',
			url: '/api/admin/monster-hunts',
			headers: {
				cookie
			},
			payload: {
				presetKey: MonsterHuntPresetKey.DARK_WORLD_INVASION,
				startAt: isoMinutesFromNow(10),
				endAt: isoMinutesFromNow(120)
			}
		});
		expect(creation.statusCode).toBe(200);
		const creationBody = creation.json();
		expect(creationBody.id).toBeTruthy();
		let hunt = await prisma.monsterHunt.findUniqueOrThrow({
			where: {
				id: creationBody.id
			}
		});
		expect(hunt.status).toBe(MonsterHuntStatus.SCHEDULED);
		const start = await server.inject({
			method: 'POST',
			url: `/api/admin/monster-hunts/` + `${hunt.id}/start-now`,
			headers: {
				cookie
			}
		});
		expect(start.statusCode).toBe(200);
		hunt = await prisma.monsterHunt.findUniqueOrThrow({
			where: {
				id: hunt.id
			}
		});
		expect(hunt.status).toBe(MonsterHuntStatus.ACTIVE);
		expect(
			await prisma.news.count({
				where: {
					slug: `monster-hunt-${hunt.slug}-start`
				}
			})
		).toBe(1);
		const end = await server.inject({
			method: 'POST',
			url: `/api/admin/monster-hunts/` + `${hunt.id}/end-now`,
			headers: {
				cookie
			}
		});
		expect(end.statusCode).toBe(200);
		hunt = await prisma.monsterHunt.findUniqueOrThrow({
			where: {
				id: hunt.id
			}
		});
		/*
		 * end-now lets the regular lifecycle perform:
		 *
		 * ACTIVE
		 * → ENDED
		 * → ranking rewards
		 * → REWARDED
		 */
		expect(hunt.status).toBe(MonsterHuntStatus.REWARDED);
		expect(
			await prisma.news.count({
				where: {
					slug: `monster-hunt-${hunt.slug}-end`
				}
			})
		).toBe(1);
	});

	it('refuses to delete an edition once it has started', async () => {
		const admin = await createTestUser({
			name: 'DeleteAdmin',
			role: 'ADMIN'
		});
		const cookie = createAuthCookie(server, admin);
		const creation = await server.inject({
			method: 'POST',
			url: '/api/admin/monster-hunts',
			headers: {
				cookie
			},
			payload: {
				presetKey: MonsterHuntPresetKey.DARK_WORLD_INVASION,
				startAt: isoMinutesFromNow(10),
				endAt: isoMinutesFromNow(120)
			}
		});
		const { id } = creation.json();
		await server.inject({
			method: 'POST',
			url: `/api/admin/monster-hunts/${id}/start-now`,
			headers: {
				cookie
			}
		});
		const response = await server.inject({
			method: 'DELETE',
			url: `/api/admin/monster-hunts/${id}`,
			headers: {
				cookie
			}
		});
		expect(response.statusCode).toBe(400);
		expect(
			await prisma.monsterHunt.findUnique({
				where: {
					id
				}
			})
		).not.toBeNull();
	});

	it('allows deleting a scheduled edition before it starts', async () => {
		const admin = await createTestUser({
			name: 'DeleteScheduledAdmin',
			role: 'ADMIN'
		});
		const cookie = createAuthCookie(server, admin);
		const creation = await server.inject({
			method: 'POST',
			url: '/api/admin/monster-hunts',
			headers: {
				cookie
			},
			payload: {
				presetKey: MonsterHuntPresetKey.DARK_WORLD_INVASION,
				startAt: isoMinutesFromNow(30),
				endAt: isoMinutesFromNow(120)
			}
		});
		const { id } = creation.json();
		const deletion = await server.inject({
			method: 'DELETE',
			url: `/api/admin/monster-hunts/${id}`,
			headers: {
				cookie
			}
		});
		expect(deletion.statusCode).toBe(200);
		expect(
			await prisma.monsterHunt.findUnique({
				where: {
					id
				}
			})
		).toBeNull();
	});
});
