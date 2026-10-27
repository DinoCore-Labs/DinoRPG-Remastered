import { describe, expect, it } from 'vitest';

import type { MtDungeonDefinition } from '../../../src/models/dungeon/dungeon.definition.js';
import { createMtDungeonSession, type MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';
import { MtDungeonWorldExitError, planMtDungeonWorldExit } from '../../../src/models/dungeon/dungeon.worldExit.js';

const definition: MtDungeonDefinition = {
	id: 'stepp',
	name: 'Cavernes',
	gold: 150000,
	condition: null,
	monsters: ['worm'],
	tower: false,
	enter: { place: 'spylon', text: 'Entrée' },
	exit: { place: 'spylon', text: 'Sortie' },
	stages: Array.from({ length: 4 }, () => ({ skin: 'desert', scenarios: [] }))
};
function cfg(stage: number): MtSessionConfiguration {
	return {
		mapId: `stepp_${stage}`,
		map: {
			width: 5,
			height: 5,
			start: { x: 1, y: 1, l: 0 },
			exit: { x: 3, y: 3, l: 0 },
			levels: [
				{
					table: Array.from({ length: 5 }, () => Array<boolean>(5).fill(true)),
					rooms: [{ id: 0, x: 0, y: 0, w: 5, h: 5, doors: [], item: null }]
				}
			]
		}
	};
}
function boundary(stage: number, kind: 'boundary-start' | 'boundary-exit') {
	const configuration = cfg(stage);
	const fresh = createMtDungeonSession(configuration);
	const point = kind === 'boundary-start' ? configuration.map.start : configuration.map.exit;
	return {
		configuration,
		session: {
			...fresh,
			position: { ...point },
			locked: true,
			pending: { kind, from: { ...point }, to: { ...point }, flag: null, itemValue: null }
		}
	};
}

describe('MT world exit validation (step 20H)', () => {
	it('permits only the first-stage entrance to return to the original entry place', () => {
		const { configuration, session } = boundary(0, 'boundary-start');
		expect(planMtDungeonWorldExit(definition, configuration, session)).toEqual({
			kind: 'return',
			dungeonId: 'stepp',
			destinationPlaceKey: 'spylon'
		});
	});
	it('permits only the last-stage exit to complete at the canonical exit place', () => {
		const { configuration, session } = boundary(3, 'boundary-exit');
		const otherExit = { ...definition, exit: { place: 'mcuzco', text: 'Fin' } };
		expect(planMtDungeonWorldExit(otherExit, configuration, session)).toEqual({
			kind: 'complete',
			dungeonId: 'stepp',
			destinationPlaceKey: 'mcuzco'
		});
	});
	it('does not mistake an intermediate staircase for an outside exit', () => {
		for (const [stage, kind] of [
			[1, 'boundary-start'],
			[2, 'boundary-exit'],
			[0, 'boundary-exit'],
			[3, 'boundary-start']
		] as const) {
			const { configuration, session } = boundary(stage, kind);
			expect(() => planMtDungeonWorldExit(definition, configuration, session)).toThrow(MtDungeonWorldExitError);
		}
	});
	it('rejects forged boundary coordinates and a missing authoritative lock', () => {
		const { configuration, session } = boundary(3, 'boundary-exit');
		expect(() => planMtDungeonWorldExit(definition, configuration, { ...session, locked: false })).toThrow();
		expect(() =>
			planMtDungeonWorldExit(definition, configuration, {
				...session,
				pending: { ...session.pending!, from: configuration.map.start }
			})
		).toThrow();
		expect(() =>
			planMtDungeonWorldExit(definition, configuration, {
				...session,
				pending: { ...session.pending!, flag: 1 }
			})
		).toThrow();
	});
	it('rejects cross-dungeon and unrecognized stage identities', () => {
		const { configuration, session } = boundary(3, 'boundary-exit');
		expect(() => planMtDungeonWorldExit({ ...definition, id: 'katak' }, configuration, session)).toThrow();
		expect(() => planMtDungeonWorldExit(definition, { ...configuration, mapId: 'stepp_0' }, session)).toThrow();
	});
});
