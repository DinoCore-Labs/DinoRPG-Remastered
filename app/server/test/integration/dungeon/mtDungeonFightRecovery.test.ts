import { randomUUID } from 'node:crypto';

import { createMtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prismaMtDungeonRunRepository } from '../../../src/Dungeon/Repository/prismaMtDungeonRun.repository.js';
import { resolveMtDungeonFight } from '../../../src/Dungeon/Service/mtDungeonFight.service.js';
import { getMtDungeonArchive } from '../../../src/Dungeon/Service/mtDungeonRuntime.service.js';
import { prisma } from '../../../src/prisma.js';
import { cleanDatabase } from '../../helpers/database.js';
import { createTestDinoz } from '../../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../../helpers/factories/user.factory.js';

beforeEach(async () => cleanDatabase());

async function preparedFixture(status: 'PROCESSING' | 'REVIEW' | 'COMPLETED', result?: object) {
	const user = await createTestUser({ withTutorial: false });
	const dinoz = await createTestDinoz({ userId: user.id, canRename: false });
	const identity = { userId: user.id, leaderDinozId: dinoz.id };
	const config = getMtDungeonArchive().configuration('stepp_0');
	expect(await prismaMtDungeonRunRepository.createIfAbsent(identity, createMtDungeonSession(config))).toBe(true);
	const run = await prisma.mtDungeonRun.findFirstOrThrow({
		where: { userId: user.id, leaderDinozId: dinoz.id }
	});
	const token = randomUUID();
	await prisma.mtDungeonFightAttempt.create({
		data: {
			runId: run.id,
			token,
			mapId: run.mapId,
			revision: run.revision,
			scenarioIndex: 0,
			pendingJson: '{}',
			monsterKeys: ['worm'],
			fightSeed: token,
			status,
			...(result === undefined ? {} : { result })
		}
	});
	return { identity, token, run, dinoz };
}

describe('MT fight uncertain settlement cannot be replayed', () => {
	for (const status of ['PROCESSING', 'REVIEW'] as const) {
		it(`refuses ${status} without mutating Dinoz or run`, async () => {
			const f = await preparedFixture(status);
			const beforeDinoz = await prisma.dinoz.findUniqueOrThrow({ where: { id: f.dinoz.id } });
			const beforeRun = await prisma.mtDungeonRun.findUniqueOrThrow({ where: { id: f.run.id } });
			await expect(resolveMtDungeonFight(f.identity, f.token)).rejects.toMatchObject({
				code: status === 'REVIEW' ? 'review-required' : 'already-processing'
			});
			expect(await prisma.dinoz.findUniqueOrThrow({ where: { id: f.dinoz.id } })).toEqual(beforeDinoz);
			expect(await prisma.mtDungeonRun.findUniqueOrThrow({ where: { id: f.run.id } })).toEqual(beforeRun);
			expect((await prisma.mtDungeonFightAttempt.findUniqueOrThrow({ where: { token: f.token } })).status).toBe(status);
		});
	}

	it('returns a committed stored result without consuming another action', async () => {
		const stored = { result: true, dungeonReturn: { leaderDinozId: 1, mapId: 'stepp_0' } };
		const f = await preparedFixture('COMPLETED', stored);
		const beforeDinoz = await prisma.dinoz.findUniqueOrThrow({ where: { id: f.dinoz.id } });
		expect(await resolveMtDungeonFight(f.identity, f.token)).toEqual(stored);
		expect(await resolveMtDungeonFight(f.identity, f.token)).toEqual(stored);
		expect(await prisma.dinoz.findUniqueOrThrow({ where: { id: f.dinoz.id } })).toEqual(beforeDinoz);
		expect((await prisma.mtDungeonRun.findUniqueOrThrow({ where: { id: f.run.id } })).revision).toBe(f.run.revision);
	});

	it('fails closed for a completed attempt with missing stored result', async () => {
		const f = await preparedFixture('COMPLETED');
		await expect(resolveMtDungeonFight(f.identity, f.token)).rejects.toMatchObject({ code: 'review-required' });
	});
});
