import { randomUUID } from 'node:crypto';

import { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { createMtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prismaMtDungeonRunRepository } from '../../../src/Dungeon/Repository/prismaMtDungeonRun.repository.js';
import { prepareMtDungeonFight, resolveMtDungeonFight } from '../../../src/Dungeon/Service/mtDungeonFight.service.js';
import { getMtDungeonArchive } from '../../../src/Dungeon/Service/mtDungeonRuntime.service.js';
import { prisma } from '../../../src/prisma.js';
import { cleanDatabase } from '../../helpers/database.js';
import { createTestDinoz } from '../../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../../helpers/factories/user.factory.js';

beforeEach(async () => cleanDatabase());

async function seededCombat() {
	const archive = getMtDungeonArchive();
	// Only choose an actual original IScenario backed by DSKMonsters.
	const candidatesByMap = ['stepp', 'katak', 'mbegin', 'mquetz', 'mcuzco', 'labo'].flatMap(dungeonId => {
		const def = archive.definition(dungeonId);
		return def.stages.map((stage, index) => ({ def, stage, cfg: archive.configuration(`${dungeonId}_${index}`) }));
	});
	const match = candidatesByMap
		.map(({ stage, cfg }) => ({
			cfg,
			selected: cfg.map.levels.flatMap((level, l) =>
				level.rooms.flatMap(room => {
					const item = room.item;
					if (item?.kind !== 'IScenario') return [];
					const scenario = stage.scenarios[item.value];
					if (scenario?.kind.type !== 'monsters') return [];
					if (
						!scenario.kind.keys.length ||
						scenario.kind.keys.some(key => key === 'any' || !Object.hasOwn(monsterByKey, key))
					)
						return [];
					return [{ item, l }];
				})
			)[0]
		}))
		.find(entry => entry.selected !== undefined);
	if (!match?.selected) throw new Error('No supported original MT monster scenario available');
	const { cfg, selected } = match;
	const { item, l } = selected;
	const candidates = [
		{ x: item.x - 1, y: item.y, l },
		{ x: item.x + 1, y: item.y, l },
		{ x: item.x, y: item.y - 1, l },
		{ x: item.x, y: item.y + 1, l }
	];
	const from = candidates.find(p => cfg.map.levels[p.l]!.table[p.x]?.[p.y]);
	if (!from) throw new Error('Original MT monster scenario has no adjacent traversable cell');
	const user = await createTestUser({ withTutorial: false });
	const dinoz = await createTestDinoz({ userId: user.id, canRename: false });
	const identity = { userId: user.id, leaderDinozId: dinoz.id };
	const session = createMtDungeonSession(cfg);
	session.position = from;
	session.pending = {
		kind: 'scenario',
		from,
		to: { x: item.x, y: item.y, l },
		flag: getMtFlagIndex(cfg.map, l, item.x, item.y),
		itemValue: item.value
	};
	session.locked = true;
	if (!(await prismaMtDungeonRunRepository.createIfAbsent(identity, session)))
		throw new Error('Unable to create test run');
	const run = await prisma.mtDungeonRun.findFirstOrThrow({ where: identity });
	return { identity, session, run, cfg };
}

describe('MT dungeon original scenario combat lifecycle', () => {
	it('prepares the original encounter once and reuses its token', async () => {
		const { identity, session, run } = await seededCombat();
		const first = await prepareMtDungeonFight(identity, session.revision);
		const second = await prepareMtDungeonFight(identity, session.revision);
		expect(first.token).toBe(second.token);
		expect(first.status).toBe('PREPARED');
		expect(first.monsterKeys.length).toBeGreaterThan(0);
		expect(await prisma.mtDungeonFightAttempt.count({ where: { runId: run.id } })).toBe(1);
	});

	it('rejects an obsolete revision without a second attempt', async () => {
		const { identity, session, run } = await seededCombat();
		await prepareMtDungeonFight(identity, session.revision);
		await expect(prepareMtDungeonFight(identity, session.revision + 1)).rejects.toMatchObject({
			code: 'stale-revision'
		});
		expect(await prisma.mtDungeonFightAttempt.count({ where: { runId: run.id } })).toBe(1);
	});

	it.each(['PROCESSING', 'REVIEW'] as const)('refuses resolution and preparation in %s state', async status => {
		const { identity, session } = await seededCombat();
		const prepared = await prepareMtDungeonFight(identity, session.revision);
		await prisma.mtDungeonFightAttempt.update({ where: { token: prepared.token }, data: { status } });
		await expect(resolveMtDungeonFight(identity, prepared.token)).rejects.toMatchObject({
			code: status === 'REVIEW' ? 'review-required' : 'already-processing'
		});
		await expect(prepareMtDungeonFight(identity, session.revision)).rejects.toMatchObject({
			code: status === 'REVIEW' ? 'review-required' : 'already-processing'
		});
		expect((await prismaMtDungeonRunRepository.load(identity))?.revision).toBe(session.revision);
	});

	it('replays a stored completed result without rerunning combat', async () => {
		const { identity, session } = await seededCombat();
		const prepared = await prepareMtDungeonFight(identity, session.revision);
		// Persisted result is deliberately minimal: only the COMPLETED early-return contract is under test.
		const result = {
			result: true,
			dungeonReturn: { leaderDinozId: identity.leaderDinozId, mapId: session.mapId },
			testMarker: randomUUID()
		};
		await prisma.mtDungeonFightAttempt.update({
			where: { token: prepared.token },
			data: { status: 'COMPLETED', result }
		});
		expect(await resolveMtDungeonFight(identity, prepared.token)).toEqual(result);
		expect(await resolveMtDungeonFight(identity, prepared.token)).toEqual(result);
		expect((await prismaMtDungeonRunRepository.load(identity))?.revision).toBe(session.revision);
	});
});
