import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dischargeDinozScale } from '../../src/Inventory/Controller/dischargeDinozScale.controller.js';
import { rechargeScalesJob } from '../../src/jobs/handlers/rechargeScales.js';
import { prisma } from '../../src/prisma.js';
import { checkDeaths } from '../../src/utils/fight/fightMethods.js';

describe('Magic Scale (Balance) mechanics and cooldown', () => {
	const createMockFighter = (overrides: any = {}) => ({
		id: 1,
		dinozId: 101,
		type: FighterType.DINOZ,
		attacker: true,
		hp: 0,
		escaped: false,
		items: [],
		itemsUsed: [],
		skills: [],
		status: [],
		name: 'Attacker Dinoz',
		...overrides
	});

	const createMockOpponent = (overrides: any = {}) => ({
		id: 2,
		dinozId: 102,
		type: FighterType.DINOZ,
		attacker: false,
		hp: 100,
		escaped: false,
		items: [],
		itemsUsed: [],
		skills: [],
		status: [],
		name: 'Defender Dinoz',
		...overrides
	});

	const createMockFight = (attacker: any, defender: any) => ({
		fighters: [attacker, defender],
		deads: [],
		steps: [],
		rules: {
			enableStats: false
		},
		rng: {
			next: () => 0
		} as any
	});

	it('triggers Scale when fighter dies: kills opponent, adds to itemsUsed and removes from items', () => {
		const attacker = createMockFighter({
			hp: 0,
			items: [{ itemId: Item.SCALE }],
			itemsUsed: []
		});
		const defender = createMockOpponent({
			hp: 100
		});
		const fightData = createMockFight(attacker, defender) as any;

		checkDeaths(fightData);

		// Defender should be killed
		expect(defender.hp).toBe(0);

		// Item.SCALE should be consumed from active fighter items
		expect(attacker.items.some((i: any) => i.itemId === Item.SCALE)).toBe(false);

		// Item.SCALE should be recorded in itemsUsed
		expect(attacker.itemsUsed).toContain(Item.SCALE);

		// itemUse step should be recorded
		const itemUseStep = fightData.steps.find((s: any) => s.action === 'itemUse' && s.itemId === Item.SCALE);
		expect(itemUseStep).toBeDefined();
	});

	it('does NOT trigger Scale if equipped item is SCALE_DISCHARGED', () => {
		const attacker = createMockFighter({
			hp: 0,
			items: [{ itemId: Item.SCALE_DISCHARGED }],
			itemsUsed: []
		});
		const defender = createMockOpponent({
			hp: 100
		});
		const fightData = createMockFight(attacker, defender) as any;

		checkDeaths(fightData);

		// Defender should still be alive
		expect(defender.hp).toBe(100);

		// Item.SCALE should NOT be in itemsUsed
		expect(attacker.itemsUsed).not.toContain(Item.SCALE);
		expect(attacker.itemsUsed).not.toContain(Item.SCALE_DISCHARGED);

		// No itemUse step recorded for Scale
		const itemUseStep = fightData.steps.find((s: any) => s.action === 'itemUse');
		expect(itemUseStep).toBeUndefined();
	});

	it('dischargeDinozScale mutates Item.SCALE to Item.SCALE_DISCHARGED on the Dinoz', async () => {
		const findFirstSpy = vi.spyOn(prisma.dinozItems, 'findFirst').mockResolvedValueOnce({
			id: 42
		} as any);
		const updateSpy = vi.spyOn(prisma.dinozItems, 'update').mockResolvedValueOnce({} as any);

		await dischargeDinozScale(101);

		expect(findFirstSpy).toHaveBeenCalledWith({
			where: {
				itemId: Item.SCALE,
				dinozId: 101
			},
			select: {
				id: true
			}
		});

		expect(updateSpy).toHaveBeenCalledWith({
			where: { id: 42 },
			data: { itemId: Item.SCALE_DISCHARGED }
		});

		findFirstSpy.mockRestore();
		updateSpy.mockRestore();
	});

	it('rechargeScalesJob recharges all discharged scales to Item.SCALE at midnight', async () => {
		const updateManyDinozSpy = vi.spyOn(prisma.dinozItems, 'updateMany').mockResolvedValueOnce({
			count: 3
		} as any);
		const updateManyUserSpy = vi.spyOn(prisma.userItems, 'updateMany').mockResolvedValueOnce({
			count: 1
		} as any);

		const result = await rechargeScalesJob();

		expect(updateManyDinozSpy).toHaveBeenCalledWith({
			where: { itemId: Item.SCALE_DISCHARGED },
			data: { itemId: Item.SCALE }
		});
		expect(updateManyUserSpy).toHaveBeenCalledWith({
			where: { itemId: Item.SCALE_DISCHARGED },
			data: { itemId: Item.SCALE }
		});

		expect(result).toEqual({
			rechargedEquipped: 3,
			rechargedInventory: 1
		});

		updateManyDinozSpy.mockRestore();
		updateManyUserSpy.mockRestore();
	});
});
