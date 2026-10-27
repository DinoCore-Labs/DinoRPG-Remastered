import { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { createMtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prismaMtDungeonRunRepository } from '../../../src/Dungeon/Repository/prismaMtDungeonRun.repository.js';
import { getMtDungeonArchive } from '../../../src/Dungeon/Service/mtDungeonRuntime.service.js';
import { resolveMtDungeonScenarioReward } from '../../../src/Dungeon/Service/mtDungeonScenarioReward.service.js';
import { prisma } from '../../../src/prisma.js';
import { cleanDatabase } from '../../helpers/database.js';
import { createTestDinoz } from '../../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../../helpers/factories/user.factory.js';

beforeEach(cleanDatabase);

/** The pending event is seeded by trusted test code, never via HTTP. */
async function prepareOriginalChest() {
	const user = await createTestUser({ withTutorial: false });
	const dinoz = await createTestDinoz({ userId: user.id, canRename: false });
	const identity = { userId: user.id, leaderDinozId: dinoz.id };
	const cfg = getMtDungeonArchive().configuration('stepp_0');
	const def = getMtDungeonArchive().definition('stepp');
	const chestScenario = def.stages[0]!.scenarios.find(s => s.kind.type === 'object' && s.kind.key === 'hotpan');
	if (!chestScenario || chestScenario.kind.type !== 'object') throw new Error('Original hotpan chest not found');
	const point = cfg.map.levels.flatMap((level, l) =>
		level.rooms
			.filter(room => room.item?.kind === 'IScenario' && room.item.value === chestScenario.index)
			.map(room => ({ x: room.item!.x, y: room.item!.y, l }))
	)[0];
	if (!point) throw new Error('Original hotpan scenario tile not found');
	const from = [
		{ x: point.x - 1, y: point.y, l: point.l },
		{ x: point.x + 1, y: point.y, l: point.l },
		{ x: point.x, y: point.y - 1, l: point.l },
		{ x: point.x, y: point.y + 1, l: point.l }
	].find(p => cfg.map.levels[p.l]?.table[p.x]?.[p.y]);
	if (!from) throw new Error('No accessible neighbor for original MT chest');
	const starting = createMtDungeonSession(cfg);
	expect(await prismaMtDungeonRunRepository.createIfAbsent(identity, starting)).toBe(true);
	const pending = {
		...starting,
		revision: 1,
		position: from,
		locked: true,
		pending: {
			kind: 'scenario' as const,
			from,
			to: point,
			flag: getMtFlagIndex(cfg.map, point.l, point.x, point.y),
			itemValue: chestScenario.index
		}
	};
	expect(await prismaMtDungeonRunRepository.compareAndSwap(identity, 0, pending)).toBe(true);
	const item = Object.values(itemList).find(value => value.display === 'hotpan');
	if (!item) throw new Error('No Remastered hotpan item mapping');
	return { identity, cfg, point, item, count: chestScenario.kind.count };
}

describe('MT original chest settlement (PostgreSQL)', () => {
	it('commits original reward, pending flag and revision once; rejects a replay', async () => {
		const { identity, cfg, point, item, count } = await prepareOriginalChest();
		const result = await resolveMtDungeonScenarioReward(identity, 1, 'fr');
		expect(result.reward).toEqual({ type: 'item', itemId: item.itemId, quantity: count });
		expect(
			await prisma.userItems.findUnique({
				where: { itemId_userId: { itemId: item.itemId, userId: identity.userId } }
			})
		).toMatchObject({ quantity: count });
		const reloaded = await prismaMtDungeonRunRepository.load(identity);
		expect(reloaded?.revision).toBe(2);
		expect(reloaded?.pending).toBeNull();
		expect(reloaded?.flags).toContain(getMtFlagIndex(cfg.map, point.l, point.x, point.y));
		await expect(resolveMtDungeonScenarioReward(identity, 1, 'fr')).rejects.toMatchObject({ code: 'stale-revision' });
		expect(
			await prisma.userItems.findUnique({
				where: { itemId_userId: { itemId: item.itemId, userId: identity.userId } }
			})
		).toMatchObject({ quantity: count });
	});

	it('rolls back flag and session when inventory is already full', async () => {
		const { identity, item } = await prepareOriginalChest();
		await prisma.userItems.create({
			data: {
				userId: identity.userId,
				itemId: item.itemId,
				quantity: item.maxQuantity
			}
		});
		await expect(resolveMtDungeonScenarioReward(identity, 1, 'fr')).rejects.toMatchObject({ code: 'inventory-full' });
		const reloaded = await prismaMtDungeonRunRepository.load(identity);
		expect(reloaded?.revision).toBe(1);
		expect(reloaded?.pending?.kind).toBe('scenario');
		expect(
			await prisma.userItems.findUnique({
				where: { itemId_userId: { itemId: item.itemId, userId: identity.userId } }
			})
		).toMatchObject({ quantity: item.maxQuantity });
	});
});
