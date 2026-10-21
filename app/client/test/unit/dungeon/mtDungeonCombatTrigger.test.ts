import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { describe, expect, it } from 'vitest';

import { mtDungeonCombatTrigger } from '../../../src/components/dungeon/mtDungeonCombatTrigger.js';

const pending = (kind: NonNullable<MtDungeonSession['pending']>['kind']): NonNullable<MtDungeonSession['pending']> => ({
	kind,
	from: { x: 1, y: 1, l: 0 },
	to: { x: 2, y: 1, l: 0 },
	flag: 4,
	itemValue: null
});

describe('Dungeon collision starts the appropriate combat', () => {
	it('starts an MT door-guardian fight without waiting for a test button', () => {
		expect(mtDungeonCombatTrigger(pending('guardian'), null)).toBe('guardian');
	});
	it('starts only a ready canonical monster scenario', () => {
		expect(mtDungeonCombatTrigger(pending('scenario'), { kind: 'scenario-combat', status: 'ready-for-combat' })).toBe(
			'scenario'
		);
		expect(mtDungeonCombatTrigger(pending('scenario'), { kind: 'scenario', status: 'ready' })).toBeNull();
	});
	it('never starts a fight for healing, money, exits or missing pending encounters', () => {
		expect(mtDungeonCombatTrigger(null, null)).toBeNull();
		expect(mtDungeonCombatTrigger(pending('gold'), null)).toBeNull();
		expect(mtDungeonCombatTrigger(pending('heal'), null)).toBeNull();
		expect(mtDungeonCombatTrigger(pending('boundary-exit'), null)).toBeNull();
	});
});
