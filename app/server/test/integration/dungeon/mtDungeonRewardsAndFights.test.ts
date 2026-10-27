import { randomUUID } from 'node:crypto';

import { createMtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prismaMtDungeonRunRepository } from '../../../src/Dungeon/Repository/prismaMtDungeonRun.repository.js';
import { prepareMtDungeonFight, resolveMtDungeonFight } from '../../../src/Dungeon/Service/mtDungeonFight.service.js';
import { getMtDungeonArchive } from '../../../src/Dungeon/Service/mtDungeonRuntime.service.js';
import { resolveMtDungeonScenarioReward } from '../../../src/Dungeon/Service/mtDungeonScenarioReward.service.js';
import { prisma } from '../../../src/prisma.js';
import { cleanDatabase } from '../../helpers/database.js';
import { createTestDinoz } from '../../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function fixture() {
	const user = await createTestUser({ withTutorial: false });
	const dinoz = await createTestDinoz({ userId: user.id, canRename: false });
	const identity = { userId: user.id, leaderDinozId: dinoz.id };
	const config = getMtDungeonArchive().configuration('stepp_0');
	const created = await prismaMtDungeonRunRepository.createIfAbsent(identity, createMtDungeonSession(config));
	expect(created).toBe(true);
	const run = await prisma.mtDungeonRun.findFirstOrThrow({
		where: { userId: user.id, leaderDinozId: dinoz.id }
	});
	return { user, dinoz, identity, run };
}

describe('MT fights and scenarios: persistent replay guards', () => {
	it('does not prepare a scenario fight without a server-issued pending encounter', async () => {
		const { identity } = await fixture();
		await expect(prepareMtDungeonFight(identity, 0)).rejects.toMatchObject({ code: 'not-ready' });
		expect(await prisma.mtDungeonFightAttempt.count()).toBe(0);
	});

	it('refuses a stale scenario revision without awarding inventory or collection rewards', async () => {
		const { identity } = await fixture();
		const itemsBefore = await prisma.userItems.findMany({ where: { userId: identity.userId } });
		const rewardsBefore = await prisma.userRewards.findMany({ where: { userId: identity.userId } });
		await expect(resolveMtDungeonScenarioReward(identity, 10, 'fr')).rejects.toMatchObject({
			code: 'stale-revision'
		});
		expect(await prisma.userItems.findMany({ where: { userId: identity.userId } })).toEqual(itemsBefore);
		expect(await prisma.userRewards.findMany({ where: { userId: identity.userId } })).toEqual(rewardsBefore);
		expect((await prismaMtDungeonRunRepository.load(identity))?.revision).toBe(0);
	});

	it('never exposes another player’s prepared combat token', async () => {
		const { run } = await fixture();
		const foreign = await createTestUser({ withTutorial: false });
		const otherDinoz = await createTestDinoz({ userId: foreign.id, canRename: false });
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
				status: 'PREPARED'
			}
		});
		await expect(
			resolveMtDungeonFight({ userId: foreign.id, leaderDinozId: otherDinoz.id }, token)
		).rejects.toMatchObject({ code: 'not-found' });
		expect((await prisma.mtDungeonFightAttempt.findUniqueOrThrow({ where: { token } })).status).toBe('PREPARED');
	});

	it('enforces a unique combat attempt per run revision at PostgreSQL level', async () => {
		const { run } = await fixture();
		const firstToken = randomUUID();
		const common = {
			runId: run.id,
			mapId: run.mapId,
			revision: run.revision,
			scenarioIndex: 0,
			pendingJson: '{}',
			monsterKeys: ['worm'],
			status: 'PREPARED'
		};
		await prisma.mtDungeonFightAttempt.create({
			data: { ...common, token: firstToken, fightSeed: firstToken }
		});
		const secondToken = randomUUID();
		await expect(
			prisma.mtDungeonFightAttempt.create({
				data: { ...common, token: secondToken, fightSeed: secondToken }
			})
		).rejects.toMatchObject({ code: 'P2002' });
		expect(await prisma.mtDungeonFightAttempt.count({ where: { runId: run.id } })).toBe(1);
	});

	it('blocks a completed combat attempt from being duplicated by the database uniqueness constraint', async () => {
		const { run } = await fixture();
		const token = randomUUID();
		await prisma.mtDungeonFightAttempt.create({
			data: {
				runId: run.id,
				token,
				fightSeed: token,
				mapId: run.mapId,
				revision: run.revision,
				scenarioIndex: 0,
				pendingJson: '{}',
				monsterKeys: ['worm'],
				status: 'COMPLETED',
				result: {}
			}
		});
		await expect(
			prisma.mtDungeonFightAttempt.create({
				data: {
					runId: run.id,
					token: randomUUID(),
					fightSeed: 'another',
					mapId: run.mapId,
					revision: run.revision,
					scenarioIndex: 0,
					pendingJson: '{}',
					monsterKeys: ['worm'],
					status: 'PREPARED'
				}
			})
		).rejects.toMatchObject({ code: 'P2002' });
		expect(await prisma.mtDungeonFightAttempt.count({ where: { runId: run.id } })).toBe(1);
	});
});
