import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { DinozState } from '../../../prisma/index.js';
import { equipItem } from '../../src/Inventory/Service/equipItem.service.js';
import { useItemUnlocked } from '../../src/Inventory/Service/useItem.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(() => cleanDatabase());

type UserRequest = Parameters<typeof useItemUnlocked>[0];
type EquipRequest = Parameters<typeof equipItem>[0];

function useRequest(userId: string, dinozId: number, itemId: number): UserRequest {
	return {
		user: { id: userId },
		params: { dinozId: String(dinozId), itemId: String(itemId) }
	} as unknown as UserRequest;
}
function equipRequest(userId: string, dinozId: number, itemId: number, equip: boolean): EquipRequest {
	return {
		user: { id: userId },
		params: { dinozId: String(dinozId) },
		body: { itemId, equip }
	} as unknown as EquipRequest;
}

const healingItemId = itemList[Item.MEAT_PIE].itemId;
const equipmentItemId = itemList[Item.FEAR_FACTOR].itemId;

async function inventoryCount(userId: string, itemId: number) {
	return (await prisma.userItems.findUnique({ where: { itemId_userId: { itemId, userId } } }))?.quantity ?? 0;
}

describe('Clinic step 7 — inventory guards', () => {
	it.each([DinozState.clinic])(
		'refuses using a healing item on a clinic patient before item consumption',
		async state => {
			const user = await createTestUser({ withTutorial: false });
			const dinoz = await createTestDinoz({ userId: user.id, life: 45, maxLife: 100 });
			await prisma.userItems.create({ data: { userId: user.id, itemId: healingItemId, quantity: 2 } });
			await prisma.dinoz.update({ where: { id: dinoz.id }, data: { state } });

			await expect(
				useItemUnlocked(useRequest(user.id, dinoz.id, healingItemId), {} as Parameters<typeof useItemUnlocked>[1])
			).rejects.toThrow('clinic.treatmentInProgress');
			expect(await inventoryCount(user.id, healingItemId)).toBe(2);
			expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } })).life).toBe(45);
		}
	);

	it.each([true, false])('refuses equipment mutation on a clinic patient (equip=%s)', async equip => {
		const user = await createTestUser({ withTutorial: false });
		const dinoz = await createTestDinoz({ userId: user.id });
		await prisma.userItems.create({ data: { userId: user.id, itemId: equipmentItemId, quantity: 1 } });
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { state: DinozState.clinic } });

		await expect(equipItem(equipRequest(user.id, dinoz.id, equipmentItemId, equip))).rejects.toThrow(
			'clinic.treatmentInProgress'
		);
		expect(await inventoryCount(user.id, equipmentItemId)).toBe(1);
		expect(await prisma.dinozItems.count({ where: { dinozId: dinoz.id } })).toBe(0);
	});

	it('does not leak clinic state for a Dinoz owned by another user', async () => {
		const user = await createTestUser({ withTutorial: false });
		const other = await createTestUser({ withTutorial: false });
		const dinoz = await createTestDinoz({ userId: other.id });
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { state: DinozState.clinic } });

		await expect(equipItem(equipRequest(user.id, dinoz.id, equipmentItemId, true))).rejects.toThrow('belong');
		await expect(
			useItemUnlocked(useRequest(user.id, dinoz.id, healingItemId), {} as Parameters<typeof useItemUnlocked>[1])
		).rejects.toThrow('belong');
	});
});
