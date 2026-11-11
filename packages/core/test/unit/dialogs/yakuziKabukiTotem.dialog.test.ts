import { describe, expect, it } from 'vitest';

import {
	yakuziTotemEggsDialog,
	yakuziTotemRewardDialog,
	yakuziTotemWaitDialog
} from '../../../src/models/dialogs/data/yakuziKabukiTotem.dialog.js';
import { Item } from '../../../src/models/items/itemList.js';

describe('Kabuki MT — Yakuzi Totem epilogue', () => {
	it('offers the first egg only when the player accepts, then advances to stage 22', () => {
		expect(yakuziTotemRewardDialog.phases.no.effects).toBeUndefined();
		expect(yakuziTotemRewardDialog.phases.yes.effects).toEqual([
			{ type: 'giveItem', itemId: Item.KABUKI_EGG, count: 1 },
			{ type: 'scenario', scenario: 'kabuki', phase: 22 }
		]);
	});
	it('moves to stage 23 after the original waiting dialogue', () => {
		expect(yakuziTotemWaitDialog.phases.noegg.effects).toEqual([{ type: 'scenario', scenario: 'kabuki', phase: 23 }]);
	});
	it('charges 50000 gold, awards an egg, and increments kabegg purchases', () => {
		expect(yakuziTotemEggsDialog.phases.buy.special).toEqual([{ type: 'useGold', amount: 50000 }]);
		expect(yakuziTotemEggsDialog.phases.buy.effects).toEqual([
			{ type: 'giveItem', itemId: Item.KABUKI_EGG, count: 1 },
			{ type: 'scenarioDelta', scenario: 'kabegg', delta: 1 },
			{ type: 'scenario', scenario: 'kabuki', phase: 22 }
		]);
		expect(yakuziTotemEggsDialog.links.egg.cond).toBeDefined();
		expect(yakuziTotemEggsDialog.links.maxegg.cond).toBeDefined();
	});
	it('never advances the Kabuki quest from 19 or 20', () => {
		const dialogs = [yakuziTotemRewardDialog, yakuziTotemWaitDialog, yakuziTotemEggsDialog];
		expect(dialogs.every(d => d.place !== undefined)).toBe(true);
		for (const d of dialogs) {
			for (const phase of Object.values(d.phases)) {
				expect(phase.effects?.some(e => e.type === 'scenario' && e.scenario === 'kabuki' && e.phase < 21)).not.toBe(
					true
				);
			}
		}
	});
});
