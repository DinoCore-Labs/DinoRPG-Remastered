import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { getCompletedClanActionKeys } from '../../src/Clan/Service/completedClanActionKeys.service.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

type TestUser = Awaited<ReturnType<typeof createTestUser>>;
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

async function setupClan(user: TestUser) {
	const clan = await prisma.clan.create({ data: { name: 'Clan clinique', leaderId: user.id, langs: [] } });
	await prisma.clanMember.create({ data: { userId: user.id, clanId: clan.id } });
	await prisma.user.update({ where: { id: user.id }, data: { clanId: clan.id } });
	return clan;
}

function getClan(user: TestUser, clanId: number) {
	return server.inject({
		method: 'GET',
		url: `/api/admin/clan/${clanId}`,
		headers: { cookie: createAuthCookie(server, user) }
	});
}

function setProgress(user: TestUser, clanId: number, actionKey: string, progress: unknown) {
	return server.inject({
		method: 'PATCH',
		url: `/api/admin/clan/${clanId}/actions/${actionKey}`,
		headers: { cookie: createAuthCookie(server, user) },
		payload: { progress }
	});
}

describe('Admin Clan: gestion des actions collectives', () => {
	it('affiche toutes les actions même en absence de ligne Prisma', async () => {
		const admin = await createTestUser({ role: 'ADMIN', withTutorial: false });
		const clan = await setupClan(admin);
		const res = await getClan(admin, clan.id);
		expect(res.statusCode).toBe(200);
		expect(res.json().actions).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ actionKey: 'hopita', progress: 0, total: 600, completedAt: null }),
				expect.objectContaining({ actionKey: 'tour', progress: 0, total: 500 }),
				expect.objectContaining({ actionKey: 'pompe', progress: 0, total: 300 }),
				expect.objectContaining({ actionKey: 'labora', progress: 0, total: 300 })
			])
		);
	});

	it("termine et rouvre la clinique sans changer la progression d'autres clans", async () => {
		const admin = await createTestUser({ role: 'ADMIN', withTutorial: false });
		const otherLeader = await createTestUser({ withTutorial: false });
		const clan = await setupClan(admin);
		const otherClan = await setupClan(otherLeader);

		const completed = await setProgress(admin, clan.id, 'hopita', 600);
		expect(completed.statusCode).toBe(200);
		expect(completed.json()).toMatchObject({ progress: 600, total: 600 });
		expect(completed.json().completedAt).not.toBeNull();
		expect(await getCompletedClanActionKeys(prisma, admin.id)).toContain('hopita');
		expect(await prisma.clanActionProgress.count({ where: { clanId: otherClan.id } })).toBe(0);

		const reopened = await setProgress(admin, clan.id, 'hopita', 599);
		expect(reopened.statusCode).toBe(200);
		expect(reopened.json()).toMatchObject({ progress: 599, completedAt: null });
		expect(await getCompletedClanActionKeys(prisma, admin.id)).not.toContain('hopita');
		expect(
			(await getClan(admin, clan.id))
				.json()
				.actions.find((action: { actionKey: string }) => action.actionKey === 'hopita')
		).toMatchObject({ progress: 599, completedAt: null });
	});

	it('refuse valeurs négatives, décimales, trop élevées et actions inconnues', async () => {
		const admin = await createTestUser({ role: 'ADMIN', withTutorial: false });
		const clan = await setupClan(admin);
		for (const value of [-1, 1.5, 601, '600']) {
			expect((await setProgress(admin, clan.id, 'hopita', value)).statusCode).toBe(400);
		}
		expect((await setProgress(admin, clan.id, 'non-existante', 1)).statusCode).toBe(404);
		expect((await setProgress(admin, clan.id + 5000, 'hopita', 1)).statusCode).toBe(404);
		expect(await prisma.clanActionProgress.count()).toBe(0);
	});

	it('autorise seulement les administrateurs à changer la progression', async () => {
		const admin = await createTestUser({ role: 'ADMIN', withTutorial: false });
		const moderator = await createTestUser({ role: 'MODERATOR', withTutorial: false });
		const player = await createTestUser({ role: 'PLAYER', withTutorial: false });
		const clan = await setupClan(admin);
		expect((await getClan(moderator, clan.id)).statusCode).toBe(200);
		expect((await setProgress(moderator, clan.id, 'hopita', 5)).statusCode).toBe(403);
		expect((await setProgress(player, clan.id, 'hopita', 5)).statusCode).toBe(403);
		expect((await setProgress(admin, clan.id, 'hopita', 5)).statusCode).toBe(200);
	});
});
