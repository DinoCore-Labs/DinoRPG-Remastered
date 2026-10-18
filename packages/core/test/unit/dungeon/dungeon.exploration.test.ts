import { describe, expect, it } from 'vitest';

import { decodeMtDungeon } from '../../../src/models/dungeon/dungeon.codec.js';
import {
	applyMtDungeonArrival,
	applyMtDungeonPickup,
	createMtDungeonFog,
	decideMtDungeonMove,
	getMtStairDirections,
	type MtExplorerState,
	revealMtDungeonFog
} from '../../../src/models/dungeon/dungeon.exploration.js';
import { getMtFlagIndex, isMtFogRevealed } from '../../../src/models/dungeon/dungeon.scene.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

function fixture(): DungeonStructure {
	const level = () => {
		const table = Array.from({ length: 6 }, () => Array<boolean>(6).fill(false));
		for (let x = 1; x <= 4; x++) for (let y = 1; y <= 4; y++) table[x]![y] = true;
		return table;
	};
	return {
		width: 6,
		height: 6,
		levels: [
			{
				table: level(),
				rooms: [
					{
						id: 0,
						x: 1,
						y: 1,
						w: 4,
						h: 4,
						doors: [
							{ x: 3, y: 1, up: null, key: 3 },
							{ x: 1, y: 3, up: null, key: null },
							{ x: 2, y: 2, up: true, key: null }
						],
						item: { x: 2, y: 1, kind: 'IKey', value: 3 }
					},
					{ id: 1, x: 3, y: 3, w: 1, h: 1, doors: [], item: { x: 3, y: 3, kind: 'IScenario', value: 0 } }
				]
			},
			{
				table: level(),
				rooms: [
					{
						id: 2,
						x: 1,
						y: 1,
						w: 4,
						h: 4,
						doors: [{ x: 2, y: 2, up: false, key: null }],
						item: { x: 3, y: 1, kind: 'IGold', value: 42 }
					}
				]
			}
		],
		start: { x: 1, y: 1, l: 0 },
		exit: { x: 4, y: 4, l: 1 }
	};
}

function state(position = { x: 1, y: 1, l: 0 }): MtExplorerState {
	return { position, keys: [], flags: new Set<number>(), fog: null, locked: false };
}

function command(input: Parameters<typeof decideMtDungeonMove>[0]) {
	const decision = decideMtDungeonMove(input);
	if (decision.kind !== 'command') throw new Error(`Expected command: ${decision.reason}`);
	return decision;
}

describe('Movement from original Motion Twin View.hx', () => {
	it('refuses walls and out-of-map destinations', () => {
		const map = fixture();
		expect(decideMtDungeonMove({ map, state: state(), direction: 'north' })).toEqual({
			kind: 'blocked',
			reason: 'solid-wall'
		});
		expect(decideMtDungeonMove({ map, state: state({ x: 0, y: 1, l: 0 }), direction: 'west' })).toEqual({
			kind: 'blocked',
			reason: 'outside-map'
		});
	});
	it('uses an original _x,_y,_l,_dx,_dy,_dl command and 10-command batching', () => {
		const map = fixture();
		const normal = command({ map, state: state({ x: 3, y: 2, l: 0 }), direction: 'east' });
		expect(normal.command).toEqual({ x: 3, y: 2, l: 0, dx: 1, dy: 0, dl: 0 });
		expect(normal.sendNow).toBe(false);
		const tenth = command({ map, state: state({ x: 3, y: 2, l: 0 }), direction: 'east', pendingCommands: 9 });
		expect(tenth.sendNow).toBe(true);
	});
	it('requests the server but does NOT move through a locked key door', () => {
		const map = fixture();
		const locked = command({ map, state: state({ x: 2, y: 1, l: 0 }), direction: 'east' });
		expect(locked.moved).toBe(false);
		expect(locked.position).toEqual({ x: 2, y: 1, l: 0 });
		expect(locked.command.dx).toBe(1);
		expect(locked.sendNow).toBe(true);
		expect(locked.events).toContainEqual({ kind: 'locked-door', x: 3, y: 1, requiredKey: 3 });
	});
	it('allows that same door with its original key index', () => {
		const map = fixture();
		const me = state({ x: 2, y: 1, l: 0 });
		me.keys = [false, false, false, true];
		const allowed = command({ map, state: me, direction: 'east' });
		expect(allowed.moved).toBe(true);
		expect(allowed.position).toEqual({ x: 3, y: 1, l: 0 });
		expect(allowed.events).toContainEqual({ kind: 'open-door', x: 3, y: 1, keyId: 3 });
	});
	it('signals a guardian and sends immediately on a monster door', () => {
		const map = fixture();
		const entering = command({ map, state: state({ x: 1, y: 2, l: 0 }), direction: 'south' });
		expect(entering.position).toEqual({ x: 1, y: 3, l: 0 });
		expect(entering.sendNow).toBe(true);
		expect(entering.events).toContainEqual({ kind: 'guardian', x: 1, y: 3 });
		const defeated = state({ x: 1, y: 2, l: 0 });
		defeated.flags = new Set([getMtFlagIndex(map, 0, 1, 3)]);
		expect(command({ map, state: defeated, direction: 'south' }).events).toEqual([]);
	});
	it('keeps locked movement blocked except the original interact command', () => {
		const map = fixture();
		const me = { ...state(), locked: true };
		expect(decideMtDungeonMove({ map, state: me, direction: 'east' })).toEqual({ kind: 'blocked', reason: 'busy' });
		const interact = command({ map, state: me, direction: 'interact' });
		expect(interact.command).toEqual({ x: 1, y: 1, l: 0, dx: 0, dy: 0, dl: 0 });
		expect(interact.moved).toBe(true);
		expect(decideMtDungeonMove({ map, state: state(), direction: 'interact' })).toEqual({
			kind: 'blocked',
			reason: 'nothing-to-interact'
		});
	});
	it('shows only the original stair directions at current tile', () => {
		const map = fixture();
		expect(getMtStairDirections(map, map.start)).toEqual(['up']);
		expect(getMtStairDirections(map, { x: 2, y: 2, l: 0 })).toEqual(['down']);
		expect(getMtStairDirections(map, { x: 2, y: 2, l: 1 })).toEqual(['up']);
		expect(getMtStairDirections(map, { x: 1, y: 2, l: 0 })).toEqual([]);
		expect(getMtStairDirections(map, { x: 2, y: 2, l: 0 }, true)).toEqual(['up']);
		expect(getMtStairDirections(map, map.start, true)).toEqual(['down']);
	});
	it('switches an interior stage only from a real staircase', () => {
		const map = fixture();
		const changed = command({ map, state: state({ x: 2, y: 2, l: 0 }), direction: 'down' });
		expect(changed.position).toEqual({ x: 2, y: 2, l: 1 });
		expect(changed.command.dl).toBe(1);
		expect(changed.events).toContainEqual({ kind: 'stair', up: true });
		expect(decideMtDungeonMove({ map, state: state({ x: 1, y: 2, l: 0 }), direction: 'down' })).toEqual({
			kind: 'blocked',
			reason: 'no-stairs'
		});
	});
	it('reverses the arrow-to-delta mapping in original tower dungeons', () => {
		const map = fixture();
		const ascending = command({ map, state: state({ x: 2, y: 2, l: 0 }), tower: true, direction: 'up' });
		expect(ascending.command.dl).toBe(1);
		expect(ascending.position.l).toBe(1);
		expect(decideMtDungeonMove({ map, state: state({ x: 2, y: 2, l: 0 }), tower: true, direction: 'down' })).toEqual({
			kind: 'blocked',
			reason: 'no-stairs'
		});
	});
	it('does NOT change stages at the outdoor entrance/exit', () => {
		const map = fixture();
		expect(command({ map, state: state(map.start), direction: 'up' }).position).toEqual(map.start);
		const exiting = command({ map, state: state(map.exit), direction: 'down' });
		expect(exiting.position).toEqual(map.exit);
		expect(exiting.events).toContainEqual({ kind: 'exit' });
	});
	it('blocks _sicons scenario obstacles without modifying map tables', () => {
		const map = fixture();
		const me = state({ x: 3, y: 2, l: 0 });
		expect(decideMtDungeonMove({ map, state: me, direction: 'south', scenarioIcons: [{ kind: 'DIBlock' }] })).toEqual({
			kind: 'blocked',
			reason: 'scenario-block'
		});
		expect(map.levels[0]!.table[3]![3]).toBe(true);
		expect(() => decideMtDungeonMove({ map, state: me, direction: 'south' })).toThrow('_sicons[0]');
	});
	it('sends for all original pickup kinds', () => {
		const map = fixture();
		const pickup = command({ map, state: state(), direction: 'east' });
		expect(pickup.sendNow).toBe(true);
		expect(pickup.events).toContainEqual({ kind: 'pickup', item: { x: 2, y: 1, kind: 'IKey', value: 3 } });
	});
	it('collects key/flag with exact original index, without mutating state', () => {
		const map = fixture();
		const old = state({ x: 2, y: 1, l: 0 });
		const updated = applyMtDungeonPickup(map, old);
		expect(updated.keys[3]).toBe(true);
		expect(updated.flags.has(getMtFlagIndex(map, 0, 2, 1))).toBe(true);
		expect(old.keys).toHaveLength(0);
		expect(old.flags.size).toBe(0);
	});
	it('opens a keyed door on arrival exactly like View.openDoor()', () => {
		const map = fixture();
		const me = state({ x: 3, y: 1, l: 0 });
		me.keys = [false, false, false, true];
		const next = applyMtDungeonArrival(map, me);
		expect(next.flags.has(getMtFlagIndex(map, 0, 3, 1))).toBe(true);
		expect(me.flags.size).toBe(0);
	});
	it('marks gold/scenario while leaving heals unconsumed (MT getItem)', () => {
		const map = fixture();
		const gold = applyMtDungeonPickup(map, state({ x: 3, y: 1, l: 1 }));
		expect(gold.flags.has(getMtFlagIndex(map, 1, 3, 1))).toBe(true);
		const scenario = applyMtDungeonPickup(map, state({ x: 3, y: 3, l: 0 }));
		expect(scenario.flags.has(getMtFlagIndex(map, 0, 3, 3))).toBe(true);
	});
	it('reveals 3x3 neighborhood using View.hx nonstandard ((pos+7)>>3)', () => {
		const map = fixture();
		const fog = createMtDungeonFog(map);
		const visible = revealMtDungeonFog(map, fog, { x: 2, y: 2, l: 0 });
		for (let x = 1; x <= 3; x++)
			for (let y = 1; y <= 3; y++) {
				expect(isMtFogRevealed(visible, map, 0, x, y)).toBe(true);
			}
		expect(isMtFogRevealed(visible, map, 1, 2, 2)).toBe(false);
		expect(fog.every(b => b === 0)).toBe(true);
	});
	it('is compatible with a real, unchanged stepp_3 Motion Twin map', () => {
		const stepp3 =
			'[[30x30x1 14R 10M 2S 2K]]hH4bj1PUyrsOsuur5LvNyTGGRm5OOjguttay5qYuIIHq1v3jUqWuJuDg4n30NqmJGoLhrHjktiQuzzlrdG1OCWc12zO0ndq0AqdYNvvsDBbCZcqKP2rrjbLqahdJqPoyffiyOAHWQziBQK3ya2kpqIKIKuuqu4ackYybBnJNKuYQQOhjGaRaaSWHd';
		const map = decodeMtDungeon(stepp3).structure;
		expect(getMtStairDirections(map, map.start)).toContain('up');
		expect(getMtStairDirections(map, map.exit)).toContain('down');
		expect(createMtDungeonFog(map).length).toBe((30 * 30 + 7) >> 3);
	});
});
