import { describe, expect, it } from 'vitest';

import { decodeMtDungeon } from '../../../src/models/dungeon/dungeon.codec.js';
import { MT_DUNGEON_MAPS_ENCODED } from '../../../src/models/dungeon/dungeon.mtData.js';
import { restoreMtDungeonProgress, snapshotMtDungeonProgress } from '../../../src/models/dungeon/dungeon.progress.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import { createMtDungeonSession, type MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';

/**
 * Contract regression suite using ALL 11 archived MT maps.
 * Only checks what can be proven without a database (the server's atomic gold
 * award and re-entry from a DB are separate integration concerns).
 */
const configs = Object.fromEntries(
	Object.entries(MT_DUNGEON_MAPS_ENCODED).map(([file, encoded]) => {
		const id = file.replace(/\.xml$/, '');
		return [id, { mapId: id, map: decodeMtDungeon(encoded).structure } satisfies MtSessionConfiguration];
	})
) as Record<string, MtSessionConfiguration>;

function dungeonId(mapId: string): string {
	return mapId.replace(/_[0-9]+$/, '');
}

describe('MT stage 41 — doors, keys, treasure and persisted state (all archived maps)', () => {
	it('covers exactly eleven real maps from the six MT dungeons', () => {
		expect(Object.keys(configs)).toHaveLength(11);
		expect(new Set(Object.keys(configs).map(dungeonId))).toEqual(
			new Set(['stepp', 'katak', 'mbegin', 'mquetz', 'mcuzco', 'labo'])
		);
	});

	for (const [mapId, config] of Object.entries(configs)) {
		it(`${mapId}: classifies doors/items and preserves discoveries after reopening`, () => {
			const { map } = config;
			const doors = map.levels.flatMap(level => level.rooms.flatMap(room => room.doors));
			const items = map.levels.flatMap(level => level.rooms.map(room => room.item).filter(item => item !== null));
			for (const door of doors) {
				expect(Number.isSafeInteger(door.x)).toBe(true);
				expect(Number.isSafeInteger(door.y)).toBe(true);
				if (door.key !== null) {
					expect(Number.isSafeInteger(door.key)).toBe(true);
					expect(door.key).toBeGreaterThanOrEqual(0);
				}
			}
			for (const item of items) {
				if (item!.kind === 'IKey' || item!.kind === 'IGold') {
					expect(Number.isSafeInteger(item!.value)).toBe(true);
					expect(item!.value).toBeGreaterThanOrEqual(0);
				}
			}
			const fresh = createMtDungeonSession(config);
			const key = items.find(item => item?.kind === 'IKey');
			const gold = map.levels.flatMap((level, l) =>
				level.rooms.filter(room => room.item?.kind === 'IGold').map(room => ({ room, l }))
			)[0];
			// Simulate a server-committed pickup, NOT an HTTP-supplied award.
			const progressed = {
				...fresh,
				keys: key ? Array.from({ length: key.value + 1 }, (_, i) => i === key.value) : [],
				flags: gold ? [getMtFlagIndex(map, gold.l, gold.room.item!.x, gold.room.item!.y)] : []
			};
			const snapshot = snapshotMtDungeonProgress(progressed);
			const restored = restoreMtDungeonProgress(createMtDungeonSession(config), snapshot, id => {
				if (id !== mapId) throw new Error('Unexpected map');
				return config;
			});
			expect(restored.keys).toEqual(progressed.keys);
			expect(restored.flags).toEqual(progressed.flags);
			expect(restored.position).toEqual(fresh.position);
			expect(restored.pending).toBeNull();
			// Persisted rewards/discoveries cannot be erased by mutating a copy.
			snapshot[mapId]!.keys.fill(false);
			snapshot[mapId]!.flags.length = 0;
			expect(restored.keys).toEqual(progressed.keys);
			expect(restored.flags).toEqual(progressed.flags);
		});
	}

	it('rejects mixing persisted state between distinct dungeons', () => {
		const first = configs['stepp_0']!;
		const other = configs['katak_0']!;
		expect(() =>
			restoreMtDungeonProgress(
				createMtDungeonSession(first),
				snapshotMtDungeonProgress(createMtDungeonSession(other)),
				id => configs[id]!
			)
		).toThrow();
	});
});
