import { MtSceneFeature } from '@dinorpg/core/src/models/dungeon/dungeon.scene.js';
import { MtDungeonSession } from '@dinorpg/core/src/models/dungeon/dungeon.session.js';
import { describe, expect, it } from 'vitest';

import { shouldShowMtDungeonHealNotice } from '../../../src/components/dungeon/mtDungeonHealNotice.js';

type Run = Pick<MtDungeonSession, 'mapId' | 'position' | 'pending'>;

const previous: Run = {
	mapId: 'stepp_0',
	position: { x: 0, y: 0, l: 0 },
	pending: null
};

const current: Run = {
	...previous,
	position: { x: 1, y: 0, l: 0 }
};

const activeHeal: MtSceneFeature = {
	kind: 'heal',
	x: 1,
	y: 0,
	consumed: false
};

describe('MT dungeon healing zone notice', () => {
	it('appears when entering an active healing zone', () => {
		expect(shouldShowMtDungeonHealNotice(previous, current, [activeHeal])).toBe(true);
	});

	it('does not appear on an already consumed zone', () => {
		expect(shouldShowMtDungeonHealNotice(previous, current, [{ ...activeHeal, consumed: true }])).toBe(false);
	});

	it('does not repeat without movement', () => {
		expect(shouldShowMtDungeonHealNotice(current, current, [activeHeal])).toBe(false);
	});

	it('does not appear on a normal tile', () => {
		expect(shouldShowMtDungeonHealNotice(previous, current, [])).toBe(false);
	});

	it('does not appear during a pending interaction', () => {
		const pending: Run = {
			...current,
			pending: {
				kind: 'guardian',
				from: previous.position,
				to: current.position,
				flag: 1,
				itemValue: null
			}
		};
		expect(shouldShowMtDungeonHealNotice(previous, pending, [activeHeal])).toBe(false);
	});
});
