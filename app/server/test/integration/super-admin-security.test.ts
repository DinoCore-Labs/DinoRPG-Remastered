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

describe('SUPER_ADMIN protection', () => {
	it('blocks ADMIN from changing SUPER_ADMIN profile, wallet, password, or sanctions', async () => {
		const owner = await createTestUser({ role: 'SUPER_ADMIN', name: 'Owner' });
		const admin = await createTestUser({ role: 'ADMIN', name: 'Administrator' });
		const cookie = createAuthCookie(server, admin);
		const actions: Array<{ method: 'PATCH' | 'POST'; url: string; payload: Record<string, unknown> }> = [
			{
				method: 'PATCH',
				url: `/api/admin/user/${owner.id}/profile`,
				payload: { role: 'PLAYER', description: null, removeAvatar: false }
			},
			{
				method: 'POST',
				url: `/api/admin/user/${owner.id}/wallets/update`,
				payload: { type: 'GOLD', amount: 100, operation: 'add' }
			},
			{
				method: 'PATCH',
				url: `/api/admin/user/${owner.id}/password`,
				payload: { newPassword: 'secret1234', confirmPassword: 'secret1234' }
			},
			{
				method: 'PATCH',
				url: `/api/admin/user/${owner.id}/sanction`,
				payload: { banReason: 'test' }
			},
			{
				method: 'PATCH',
				url: `/api/admin/user/${owner.id}/items`,
				payload: { id: 1, quantity: 1, operation: 'add' }
			}
		];
		for (const action of actions) {
			const response = await server.inject({ ...action, headers: { cookie } });
			expect(response.statusCode).toBe(403);
			expect(response.json()).toMatchObject({ code: 'admin.superAdminProtected' });
		}
		expect((await prisma.user.findUniqueOrThrow({ where: { id: owner.id } })).role).toBe('SUPER_ADMIN');
	});

	it('blocks MODERATOR from modifying SUPER_ADMIN and its Dinoz', async () => {
		const owner = await createTestUser({ role: 'SUPER_ADMIN', name: 'Owner' });
		const moderator = await createTestUser({ role: 'MODERATOR', name: 'Moderator' });
		const dinoz = await createTestDinoz({ userId: owner.id });
		const cookie = createAuthCookie(server, moderator);
		const account = await server.inject({
			method: 'PATCH',
			url: `/api/admin/user/${owner.id}/profile`,
			headers: { cookie },
			payload: { role: 'SUPER_ADMIN', description: null, removeAvatar: false }
		});
		const dinozEdit = await server.inject({
			method: 'PATCH',
			url: `/api/admin/user/${owner.id}/dinoz/${dinoz.id}/profile`,
			headers: { cookie },
			payload: { name: 'Changed', raceId: dinoz.raceId, canRename: true, display: dinoz.display }
		});
		expect(account.statusCode).toBe(403);
		expect(dinozEdit.statusCode).toBe(403);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } })).name).toBe(dinoz.name);
	});

	it('blocks ADMIN from modifying the SUPER_ADMIN Dinoz', async () => {
		const owner = await createTestUser({ role: 'SUPER_ADMIN', name: 'Owner' });
		const admin = await createTestUser({ role: 'ADMIN', name: 'Administrator' });
		const dinoz = await createTestDinoz({ userId: owner.id });
		const response = await server.inject({
			method: 'PATCH',
			url: `/api/admin/user/${owner.id}/dinoz/${dinoz.id}/place`,
			headers: { cookie: createAuthCookie(server, admin) },
			payload: { placeId: 1 }
		});
		expect(response.statusCode).toBe(403);
	});

	it('refuses to assign or remove SUPER_ADMIN using the admin API', async () => {
		const owner = await createTestUser({ role: 'SUPER_ADMIN', name: 'Owner' });
		const admin = await createTestUser({ role: 'ADMIN', name: 'Administrator' });
		for (const [actor, target, role] of [
			[admin, admin, 'SUPER_ADMIN'],
			[owner, admin, 'SUPER_ADMIN'],
			[owner, owner, 'PLAYER']
		] as const) {
			const response = await server.inject({
				method: 'PATCH',
			url: `/api/admin/user/${target.id}/profile`,
				headers: { cookie: createAuthCookie(server, actor) },
				payload: { role, description: null, removeAvatar: false }
			});
			expect(response.statusCode).toBe(403);
		}
	});

	it('allows SUPER_ADMIN to edit its own profile and ADMIN to edit ordinary accounts', async () => {
		const owner = await createTestUser({ role: 'SUPER_ADMIN', name: 'Owner' });
		const admin = await createTestUser({ role: 'ADMIN', name: 'Administrator' });
		const ordinary = await createTestUser({ name: 'Player' });
		for (const [actor, target, role] of [
			[owner, owner, 'SUPER_ADMIN'],
			[admin, ordinary, 'PLAYER']
		] as const) {
			const response = await server.inject({
				method: 'PATCH',
			url: `/api/admin/user/${target.id}/profile`,
				headers: { cookie: createAuthCookie(server, actor) },
				payload: { role, description: 'Updated', removeAvatar: false }
			});
			expect(response.statusCode).toBe(204);
		}
	});

	it('enforces a single SUPER_ADMIN with a database unique index', async () => {
		await createTestUser({ role: 'SUPER_ADMIN', name: 'Owner' });
		const admin = await createTestUser({ role: 'ADMIN', name: 'Administrator' });
		await expect(prisma.user.update({ where: { id: admin.id }, data: { role: 'SUPER_ADMIN' } })).rejects.toThrow();
		expect(await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })).toBe(1);
	});
});
