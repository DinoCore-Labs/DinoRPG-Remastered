import { randomUUID } from 'node:crypto';

import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { assertNoMtDungeonHealing } from '../../../src/Dungeon/mtDungeonHealingGuard.js';
import {
	detachDeadMtDungeonFollowers,
	mtDungeonLeaderIsDead
} from '../../../src/Dungeon/Service/mtDungeonCasualties.service.js';
import { isWipedMtDungeonParty } from '../../../src/Dungeon/Service/mtDungeonDefeat.service.js';
import { useMtDungeonIrma } from '../../../src/Dungeon/Service/mtDungeonIrma.service.js';
import { prisma } from '../../../src/prisma.js';
import { cleanDatabase } from '../../helpers/database.js';
import { createTestDinoz } from '../../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function party() {
	const user = await createTestUser({ withTutorial: false });
	const leader = await createTestDinoz({ userId: user.id, name: 'DungeonLeader', canRename: false });
	const follower = await createTestDinoz({ userId: user.id, name: 'DungeonFollower', canRename: false });
	await prisma.dinoz.update({ where: { id: follower.id }, data: { leaderId: leader.id } });
	const identity = { userId: user.id, leaderDinozId: leader.id };
	return { user, leader, follower, identity };
}

async function createDungeonRun(identity: { userId: string; leaderDinozId: number }) {
	// A minimal persisted run is sufficient for these action/HP guards.
	await prisma.mtDungeonRun.create({
		data: {
			id: randomUUID(),
			userId: identity.userId,
			leaderDinozId: identity.leaderDinozId,
			mapId: 'stepp_0',
			revision: 0,
			x: 0,
			y: 0,
			l: 0,
			keys: [],
			flags: [],
			fog: null,
			locked: false,
			stageStates: {}
		}
	});
}

describe('MT dungeon — PostgreSQL party, Irma and healing integration', () => {
	it('detaches only defeated followers; an unaffected companion remains with its leader', async () => {
		const { user, leader, follower, identity } = await party();
		const survivor = await createTestDinoz({ userId: user.id, name: 'Survivor', canRename: false });
		await prisma.dinoz.update({ where: { id: survivor.id }, data: { leaderId: leader.id } });
		await prisma.dinoz.update({ where: { id: follower.id }, data: { life: 0 } });
		const detached = await prisma.$transaction(tx => detachDeadMtDungeonFollowers(tx, identity));
		expect(detached).toEqual([follower.id]);
		const after = await prisma.dinoz.findMany({ where: { id: { in: [follower.id, survivor.id] } } });
		expect(after.find(d => d.id === follower.id)?.leaderId).toBeNull();
		expect(after.find(d => d.id === follower.id)?.life).toBe(0);
		expect(after.find(d => d.id === survivor.id)?.leaderId).toBe(leader.id);
		expect(await prisma.$transaction(tx => detachDeadMtDungeonFollowers(tx, identity))).toEqual([]);
	});

	it('does not detach a defeated leader or mistake surviving followers for a total wipe', async () => {
		const { leader, follower, identity } = await party();
		await prisma.dinoz.update({ where: { id: leader.id }, data: { life: 0 } });
		expect(await prisma.$transaction(tx => mtDungeonLeaderIsDead(tx, identity))).toBe(true);
		expect(await prisma.$transaction(tx => detachDeadMtDungeonFollowers(tx, identity))).toEqual([]);
		expect(await prisma.$transaction(tx => isWipedMtDungeonParty(tx, identity))).toBe(false);
		await prisma.dinoz.update({ where: { id: follower.id }, data: { life: 0 } });
		expect(await prisma.$transaction(tx => isWipedMtDungeonParty(tx, identity))).toBe(true);
	});

	it('spends one Irma per exhausted living member, and never repeats a restored action', async () => {
		const { user, leader, follower, identity } = await party();
		await createDungeonRun(identity);
		await prisma.dinoz.updateMany({
			where: { id: { in: [leader.id, follower.id] } },
			data: { fight: false }
		});
		const irmaId = itemList[Item.POTION_IRMA].itemId;
		await prisma.userItems.upsert({
			where: { itemId_userId: { itemId: irmaId, userId: user.id } },
			create: { itemId: irmaId, userId: user.id, quantity: 3 },
			update: { quantity: 3 }
		});
		const result = await useMtDungeonIrma(identity, 0);
		expect(result).toEqual({ used: 2, stock: 1 });
		const restored = await prisma.dinoz.findMany({ where: { id: { in: [leader.id, follower.id] } } });
		expect(restored.every(d => d.fight)).toBe(true);
		expect(
			(
				await prisma.userItems.findUniqueOrThrow({
					where: { itemId_userId: { itemId: irmaId, userId: user.id } }
				})
			).quantity
		).toBe(1);
		await expect(useMtDungeonIrma(identity, 0)).rejects.toMatchObject({ code: 'actions-ready' });
	});

	it('rejects insufficient Irma stock without changing the Dinoz actions or inventory', async () => {
		const { user, leader, follower, identity } = await party();
		await createDungeonRun(identity);
		await prisma.dinoz.updateMany({ where: { id: { in: [leader.id, follower.id] } }, data: { fight: false } });
		const irmaId = itemList[Item.POTION_IRMA].itemId;
		await prisma.userItems.upsert({
			where: { itemId_userId: { itemId: irmaId, userId: user.id } },
			create: { itemId: irmaId, userId: user.id, quantity: 1 },
			update: { quantity: 1 }
		});
		await expect(useMtDungeonIrma(identity, 0)).rejects.toMatchObject({ code: 'not-enough-irma' });
		expect(
			(await prisma.dinoz.findMany({ where: { id: { in: [leader.id, follower.id] } } })).every(d => !d.fight)
		).toBe(true);
		expect(
			(await prisma.userItems.findUniqueOrThrow({ where: { itemId_userId: { itemId: irmaId, userId: user.id } } }))
				.quantity
		).toBe(1);
	});

	it('blocks healing in a dungeon when not standing on an active healing tile', async () => {
		const { user, follower, identity } = await party();
		await createDungeonRun(identity);
		await expect(assertNoMtDungeonHealing(user.id, follower.id, prisma, true)).rejects.toMatchObject({
			statusCode: 403
		});
	});
});
