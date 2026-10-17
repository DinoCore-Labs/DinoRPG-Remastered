import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { describe, expect, it } from 'vitest';

import { getBotShopTargetQuantity } from '../../src/Bot/Service/botShop.service.js';

describe('bot shop role targets', () => {
	it('stocks more Irma potions for fighter-heavy rosters', () => {
		const balanced = getBotShopTargetQuantity(itemList[Item.POTION_IRMA].itemId, {
			fighter: 1,
			gatherer: 1,
			explorer: 1
		});
		const fighterHeavy = getBotShopTargetQuantity(itemList[Item.POTION_IRMA].itemId, {
			fighter: 3,
			gatherer: 0,
			explorer: 0
		});

		expect(fighterHeavy).toBeGreaterThan(balanced);
	});

	it('stocks more cheap healing for explorer and gatherer rosters', () => {
		const fighterOnly = getBotShopTargetQuantity(itemList[Item.CLOUD_BURGER].itemId, {
			fighter: 3,
			gatherer: 0,
			explorer: 0
		});
		const supportRoster = getBotShopTargetQuantity(itemList[Item.CLOUD_BURGER].itemId, {
			fighter: 1,
			gatherer: 1,
			explorer: 1
		});

		expect(supportRoster).toBeGreaterThan(fighterOnly);
	});

	it('buys fight rations only when fighter Dinoz exist', () => {
		expect(
			getBotShopTargetQuantity(itemList[Item.FIGHT_RATION].itemId, {
				fighter: 0,
				gatherer: 2,
				explorer: 1
			})
		).toBe(0);
		expect(
			getBotShopTargetQuantity(itemList[Item.FIGHT_RATION].itemId, {
				fighter: 2,
				gatherer: 1,
				explorer: 0
			})
		).toBe(4);
	});

	it('keeps expensive emergency healing limited', () => {
		expect(
			getBotShopTargetQuantity(itemList[Item.HOT_BREAD].itemId, {
				fighter: 1,
				gatherer: 3,
				explorer: 3
			})
		).toBe(1);
	});
});
