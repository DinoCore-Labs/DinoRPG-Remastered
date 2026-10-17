import { Item } from '@dinorpg/core/models/items/itemList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { describe, expect, it } from 'vitest';

import { BotDinozRole } from '../../../prisma/index.js';
import { getBotEquipmentScore } from '../../src/Bot/Service/botEquipment.service.js';

describe('bot equipment scoring', () => {
	it('strongly values permanent combat bonuses for fighter Dinoz', () => {
		expect(getBotEquipmentScore(itemList[Item.GOLDEN_NAPODINO], BotDinozRole.FIGHTER)).toBeGreaterThan(
			getBotEquipmentScore(itemList[Item.CLOUD_BURGER], BotDinozRole.FIGHTER)
		);
	});

	it('keeps gatherer backpack slots away from ordinary combat consumables', () => {
		expect(getBotEquipmentScore(itemList[Item.FIGHT_RATION], BotDinozRole.GATHERER)).toBeLessThan(35);
		expect(getBotEquipmentScore(itemList[Item.GOLDEN_NAPODINO], BotDinozRole.GATHERER)).toBeLessThan(35);
	});

	it('values emergency healing more for explorer Dinoz than gatherer Dinoz', () => {
		expect(getBotEquipmentScore(itemList[Item.CLOUD_BURGER], BotDinozRole.EXPLORER)).toBeGreaterThan(
			getBotEquipmentScore(itemList[Item.CLOUD_BURGER], BotDinozRole.GATHERER)
		);
	});

	it('never auto-equips magical items', () => {
		expect(getBotEquipmentScore(itemList[Item.TEMPORAL_REDUCTION], BotDinozRole.FIGHTER)).toBe(
			Number.NEGATIVE_INFINITY
		);
	});

	it('raises survival equipment value after bad combat experience', () => {
		const safeScore = getBotEquipmentScore(
			itemList[Item.CLOUD_BURGER],
			BotDinozRole.EXPLORER,
			20
		);
		const dangerousScore = getBotEquipmentScore(
			itemList[Item.CLOUD_BURGER],
			BotDinozRole.EXPLORER,
			-60
		);

		expect(dangerousScore).toBeGreaterThan(safeScore);
	});

	it('allows a gatherer to sacrifice a slot for emergency healing only in dangerous zones', () => {
		expect(
			getBotEquipmentScore(itemList[Item.CLOUD_BURGER], BotDinozRole.GATHERER, 0)
		).toBeLessThan(35);
		expect(
			getBotEquipmentScore(itemList[Item.CLOUD_BURGER], BotDinozRole.GATHERER, -60)
		).toBeGreaterThanOrEqual(35);
	});


	it('never auto-equips cursed items', () => {
		const cursedItem = Object.values(itemList).find(item => item.itemType === 'cursed' && item.canBeEquipped);
		if (!cursedItem) return;

		expect(getBotEquipmentScore(cursedItem, BotDinozRole.FIGHTER)).toBe(Number.NEGATIVE_INFINITY);
	});

});
