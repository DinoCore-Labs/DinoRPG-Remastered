import { describe, expect, it } from 'vitest';

import {
	igorKabukiAuraDialog,
	igorKabukiBetrayalDialog
} from '../../../src/models/dialogs/data/igorKabukiEpilogue.dialog.js';
import { Boss, bossList } from '../../../src/models/monster/bossList.js';

describe('MT Kabuki — Igor betrayal', () => {
	it('waits before delivering the empty Aura box', () => {
		expect(igorKabukiAuraDialog.cond).toBeDefined();
		expect(igorKabukiAuraDialog.phases.ok.effects).toEqual([{ type: 'scenario', scenario: 'kabuki', phase: 18 }]);
	});

	it('does not advance the quest before the Coral Mines encounter is won', () => {
		expect(igorKabukiBetrayalDialog.phases.attack.effects).toBeUndefined();
		expect(igorKabukiBetrayalDialog.phases.attack_win.effects).toEqual([
			{ type: 'scenario', scenario: 'kabuki', phase: 19 }
		]);
	});

	it('includes the original Professor Igor and three named companions', () => {
		expect(igorKabukiBetrayalDialog.phases.attack.special).toEqual([
			{
				type: 'startFight',
				fightId: [
					bossList[Boss.PR_IGOR],
					bossList[Boss.IGOR_BARBARA],
					bossList[Boss.IGOR_CHOUPETTE],
					bossList[Boss.IGOR_POUPOULE]
				]
			}
		]);
		expect([bossList[Boss.IGOR_BARBARA].hp, bossList[Boss.IGOR_CHOUPETTE].hp, bossList[Boss.IGOR_POUPOULE].hp]).toEqual(
			[100, 100, 100]
		);
	});
});
