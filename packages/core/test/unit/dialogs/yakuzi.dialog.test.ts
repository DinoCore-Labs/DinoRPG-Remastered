import { describe, expect, it } from 'vitest';

import {
	yakuziPortDebtDialog,
	yakuziPortIntroDialog,
	yakuziPortSecondBetDialog
} from '../../../src/models/dialogs/data/yakuzi.dialog.js';

const dialogs = [yakuziPortIntroDialog, yakuziPortDebtDialog, yakuziPortSecondBetDialog];

describe('Original MT Yakuzi port quest', () => {
	it('registers the three original port encounters', () => {
		expect(dialogs.map(dialog => dialog.place)).toEqual([1, 1, 1]);
		expect(dialogs.map(dialog => dialog.id)).toEqual([
			'yakuzi_port_intro',
			'yakuzi_port_debt',
			'yakuzi_port_second_bet'
		]);
		for (const dialog of dialogs) {
			for (const phase of Object.values(dialog.phases)) {
				for (const linkId of phase.next ?? []) {
					expect(dialog.links[linkId], `${dialog.id}:${phase.id}:${linkId}`).toBeDefined();
				}
			}
			for (const link of Object.values(dialog.links)) {
				expect(dialog.phases[link.target ?? link.id], `${dialog.id}:${link.id}`).toBeDefined();
			}
		}
	});
	it('records the fake coin toss debt but charges gold only on payment', () => {
		expect(yakuziPortIntroDialog.phases.end.effects).toContainEqual({ type: 'scenario', scenario: 'kabuki', phase: 1 });
		expect(yakuziPortIntroDialog.phases.pile.special).toBeUndefined();
		expect(yakuziPortIntroDialog.phases.face.special).toBeUndefined();
		expect(yakuziPortDebtDialog.phases.yes.special).toContainEqual({ type: 'useGold', amount: 10000 });
		expect(yakuziPortDebtDialog.phases.yes.effects).toContainEqual({ type: 'scenario', scenario: 'kabuki', phase: 2 });
	});
	it('requires a 48h wait, preserves choice branches and ends at stage 3', () => {
		expect(yakuziPortSecondBetDialog.phases.welcome.next).toEqual(['give', 'nop', 'lock']);
		expect(yakuziPortSecondBetDialog.phases.reend.effects).toContainEqual({
			type: 'scenario',
			scenario: 'kabuki',
			phase: 3
		});
		expect(yakuziPortSecondBetDialog.phases.reend.special).toBeUndefined();
	});
});
