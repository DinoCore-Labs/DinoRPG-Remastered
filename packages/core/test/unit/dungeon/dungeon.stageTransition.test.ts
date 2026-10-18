import { describe, expect, it } from 'vitest';

import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	type MtDungeonSession,
	type MtSessionConfiguration,
	settleMtDungeonInteraction
} from '../../../src/models/dungeon/dungeon.session.js';
import {
	MtStageTransitionError,
	transitionMtDungeonStage
} from '../../../src/models/dungeon/dungeon.stageTransition.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

function config(id: string): MtSessionConfiguration {
	const map: DungeonStructure = {
		width: 3,
		height: 3,
		levels: [
			{
				table: Array.from({ length: 3 }, () => [true, true, true]),
				rooms: [{ id: 0, x: 0, y: 0, w: 3, h: 3, doors: [], item: null }]
			}
		],
		start: { x: 0, y: 0, l: 0 },
		exit: { x: 2, y: 2, l: 0 }
	};
	return { map, mapId: id };
}
function atBoundary(
	cfg: MtSessionConfiguration,
	kind: 'boundary-exit' | 'boundary-start',
	state?: MtDungeonSession
): MtDungeonSession {
	const position = kind === 'boundary-exit' ? cfg.map.exit : cfg.map.start;
	const before = { ...(state ?? createMtDungeonSession(cfg)), position: { ...position } };
	const dl = kind === 'boundary-exit' ? 1 : -1;
	const move = applyMtDungeonCommandBatch(cfg, before, [{ ...position, dx: 0, dy: 0, dl }]);
	if (!move.ok || move.pending?.kind !== kind) throw new Error(JSON.stringify(move));
	return move.session;
}
function issue(
	cfg: MtSessionConfiguration,
	pending: MtDungeonSession,
	next: MtSessionConfiguration,
	action: 'forward' | 'backward'
) {
	return transitionMtDungeonStage(cfg, next, pending, action, 3);
}

describe('MT stage transition (independent original map state)', () => {
	const a = config('stepp_0'),
		b = config('stepp_1'),
		c = config('stepp_2');
	it('does not permit ordinary settlement to bypass the staircase', () => {
		const pending = atBoundary(a, 'boundary-exit');
		expect(() => settleMtDungeonInteraction(a, pending, true)).toThrow('Boundary');
	});
	it('requires actual replayed pending boundary and rejects other direction', () => {
		expect(() => issue(a, createMtDungeonSession(a), b, 'forward')).toThrow(MtStageTransitionError);
		const pending = atBoundary(a, 'boundary-exit');
		expect(() => issue(a, pending, b, 'backward')).toThrow();
		expect(() => issue(a, pending, c, 'forward')).toThrow();
		expect(() => issue(a, pending, config('katak_1'), 'forward')).toThrow();
	});
	it('saves keys, flags and fog for the exited map, with monotonic revision', () => {
		const pending = atBoundary(a, 'boundary-exit', { ...createMtDungeonSession(a), keys: [true], flags: [3] });
		const next = issue(a, pending, b, 'forward');
		expect(next.mapId).toBe('stepp_1');
		expect(next.position).toEqual(b.map.start);
		expect(next.stageStates['stepp_0']?.keys).toEqual([true]);
		expect(next.stageStates['stepp_0']?.flags).toEqual([3]);
		expect(next.stageStates['stepp_0']?.fog).toEqual(pending.fog);
		expect(next.keys).toEqual([]);
		expect(next.flags).toEqual([]);
		expect(next.revision).toBe(pending.revision + 1);
		expect(next.pending).toBeNull();
		expect(next.locked).toBe(false);
		expect(pending.stageStates).toEqual({});
	});
	it('restores the previous map snapshot on return, without losing the second map', () => {
		const out = issue(
			a,
			atBoundary(a, 'boundary-exit', {
				...createMtDungeonSession(a),
				keys: [true],
				flags: [3]
			}),
			b,
			'forward'
		);
		const back = issue(b, atBoundary(b, 'boundary-start', { ...out, keys: [false, true], flags: [4] }), a, 'backward');
		expect(back.mapId).toBe('stepp_0');
		expect(back.position).toEqual(a.map.exit);
		expect(back.keys).toEqual([true]);
		expect(back.flags).toEqual([3]);
		expect(back.stageStates['stepp_1']?.keys).toEqual([false, true]);
		expect(back.stageStates['stepp_1']?.flags).toEqual([4]);
		expect(back.revision).toBeGreaterThan(out.revision);
	});
	it('rejects invalid destination and corrupted stored snapshots', () => {
		const pending = atBoundary(a, 'boundary-exit');
		const bad: MtSessionConfiguration = {
			...b,
			map: {
				...b.map,
				levels: [
					{
						...b.map.levels[0]!,
						table: [
							[false, true, true],
							[true, true, true],
							[true, true, true]
						]
					}
				]
			}
		};
		expect(() => issue(a, pending, bad, 'forward')).toThrow('invalid-destination');
		const corrupt: MtDungeonSession = { ...pending, stageStates: { stepp_1: { keys: [], flags: [1000], fog: null } } };
		expect(() => issue(a, corrupt, b, 'forward')).toThrow('invalid-snapshot');
	});
	it('never invents an exit from the dungeon or entry into a negative stage', () => {
		expect(() => transitionMtDungeonStage(c, config('stepp_3'), atBoundary(c, 'boundary-exit'), 'forward', 3)).toThrow(
			'world-boundary'
		);
	});
});
