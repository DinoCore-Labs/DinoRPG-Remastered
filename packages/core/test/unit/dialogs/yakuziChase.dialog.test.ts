import { describe, expect, it } from 'vitest';

import { yakuziForgesDialog, yakuziGorgesDialog } from '../../../src/models/dialogs/data/yakuziChase.dialog.js';

describe('MT Kabuki chase dialogue progression', () => {
	it('uses original locations and stage gates', () => {
		expect(yakuziForgesDialog.place).toBe(44);
		expect(yakuziGorgesDialog.place).toBe(49);
		expect(yakuziForgesDialog.id).toBe('yakuzi_forges');
		expect(yakuziGorgesDialog.id).toBe('yakuzi_gorges');
	});
	it('keeps all link targets and alternative escapes', () => {
		for (const dialog of [yakuziForgesDialog, yakuziGorgesDialog]) {
			for (const phase of Object.values(dialog.phases)) {
				for (const id of phase.next ?? []) expect(dialog.links[id]).toBeDefined();
			}
			for (const link of Object.values(dialog.links)) {
				expect(dialog.phases[link.target ?? link.id]).toBeDefined();
			}
		}
		expect(yakuziForgesDialog.phases.hello.next).toEqual(['block', 'burn']);
		expect(yakuziGorgesDialog.phases.hello.next).toEqual(['block', 'help']);
	});
	it('only changes scenario when the fight win phase is reached', () => {
		expect(yakuziForgesDialog.phases.ready.effects).toBeUndefined();
		expect(yakuziGorgesDialog.phases.combat.effects).toBeUndefined();
		expect(yakuziForgesDialog.phases.ready_win.effects).toContainEqual({
			type: 'scenario',
			scenario: 'kabuki',
			phase: 4
		});
		expect(yakuziGorgesDialog.phases.combat_win.effects).toContainEqual({
			type: 'scenario',
			scenario: 'kabuki',
			phase: 5
		});
		expect(yakuziForgesDialog.phases.ready.special?.[0]?.type).toBe('startFight');
		expect(yakuziGorgesDialog.phases.combat.special?.[0]?.type).toBe('startFight');
	});
});
