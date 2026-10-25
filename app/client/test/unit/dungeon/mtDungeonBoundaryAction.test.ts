import { MT_DUNGEON_MAPS } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { describe, expect, it } from 'vitest';

import { mtDungeonBoundaryAction } from '../../../src/components/dungeon/mtDungeonBoundaryAction.js';

const run = (mapId: string, kind: 'boundary-start' | 'boundary-exit' | null) =>
	({ mapId, pending: kind ? { kind } : null }) as Pick<MtDungeonSession, 'mapId' | 'pending'>;

describe('MT dungeon boundary routing for every archived dungeon', () => {
	for (const [id, maps] of Object.entries(MT_DUNGEON_MAPS)) {
		it(id + ' returns from its entry and exits its final map', () => {
			expect(mtDungeonBoundaryAction(run(id + '_0', 'boundary-start'))).toBe('surface-exit');
			expect(mtDungeonBoundaryAction(run(id + '_' + (maps.length - 1), 'boundary-exit'))).toBe('surface-exit');
			for (let stage = 0; stage < maps.length - 1; stage++)
				expect(mtDungeonBoundaryAction(run(id + '_' + stage, 'boundary-exit'))).toBe('forward');
			for (let stage = 1; stage < maps.length; stage++)
				expect(mtDungeonBoundaryAction(run(id + '_' + stage, 'boundary-start'))).toBe('backward');
		});
	}
	it('does not process absent or invalid boundaries', () => {
		expect(mtDungeonBoundaryAction(run('katak_0', null))).toBeNull();
		expect(mtDungeonBoundaryAction(run('madeup_0', 'boundary-start'))).toBeNull();
		expect(mtDungeonBoundaryAction(run('stepp_999', 'boundary-exit'))).toBeNull();
	});
});
