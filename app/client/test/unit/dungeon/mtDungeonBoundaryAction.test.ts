import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { describe, expect, it } from 'vitest';

import { mtDungeonBoundaryAction } from '../../../src/components/dungeon/mtDungeonBoundaryAction.js';

function boundary(mapId: string, kind: 'boundary-start' | 'boundary-exit' | null) {
	return {
		mapId,
		pending: kind ? { kind } : null
	} as Pick<MtDungeonSession, 'mapId' | 'pending'>;
}

describe('automatic original Magnetic Caverns boundary navigation', () => {
	it('returns to the surface immediately from the first entrance', () => {
		expect(mtDungeonBoundaryAction(boundary('stepp_0', 'boundary-start'))).toBe('surface-exit');
	});
	it('completes the dungeon on the last exit', () => {
		expect(mtDungeonBoundaryAction(boundary('stepp_3', 'boundary-exit'))).toBe('surface-exit');
	});
	it('moves through intermediate stage doors automatically', () => {
		for (const mapId of ['stepp_0', 'stepp_1', 'stepp_2'])
			expect(mtDungeonBoundaryAction(boundary(mapId, 'boundary-exit'))).toBe('forward');
		for (const mapId of ['stepp_1', 'stepp_2', 'stepp_3'])
			expect(mtDungeonBoundaryAction(boundary(mapId, 'boundary-start'))).toBe('backward');
	});
	it('does not consume other interactions or unknown dungeon sessions', () => {
		expect(mtDungeonBoundaryAction(boundary('stepp_0', null))).toBeNull();
		expect(mtDungeonBoundaryAction(boundary('katak_0', 'boundary-exit'))).toBeNull();
		expect(mtDungeonBoundaryAction(boundary('stepp_4', 'boundary-exit'))).toBeNull();
	});
});
