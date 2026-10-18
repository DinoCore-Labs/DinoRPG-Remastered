import { describe, expect, it } from 'vitest';

import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	type MtDungeonSession,
	type MtSessionConfiguration,
	settleMtDungeonInteraction
} from '../../../src/models/dungeon/dungeon.session.js';
import type { DungeonCommand, DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

function fixture(): MtSessionConfiguration {
	const table = Array.from({ length: 8 }, (_, x) =>
		Array.from({ length: 8 }, (_, y) => x >= 1 && x <= 6 && y >= 1 && y <= 6)
	);
	const map: DungeonStructure = {
		width: 8,
		height: 8,
		levels: [
			{
				table,
				rooms: [
					{
						id: 0,
						x: 1,
						y: 1,
						w: 6,
						h: 6,
						doors: [
							{ x: 4, y: 2, up: null, key: 0 },
							{ x: 3, y: 3, up: null, key: null },
							{ x: 2, y: 4, up: true, key: null }
						],
						item: { x: 2, y: 1, kind: 'IKey', value: 0 }
					},
					{ id: 1, x: 5, y: 5, w: 1, h: 1, doors: [], item: { x: 5, y: 5, kind: 'IGold', value: 7 } },
					{ id: 2, x: 5, y: 4, w: 1, h: 1, doors: [], item: { x: 5, y: 4, kind: 'IScenario', value: 0 } },
					{ id: 3, x: 4, y: 4, w: 1, h: 1, doors: [], item: { x: 4, y: 4, kind: 'IHeal', value: 1 } }
				]
			},
			{
				table: table.map(column => [...column]),
				rooms: [{ id: 4, x: 1, y: 1, w: 6, h: 6, doors: [{ x: 2, y: 4, up: false, key: null }], item: null }]
			}
		],
		start: { x: 1, y: 1, l: 0 },
		exit: { x: 6, y: 6, l: 1 }
	};
	return { map, mapId: 'mt-test_0', scenarioIcons: [{ kind: 'DIIcon', icon: 'chest' }] };
}
const cmd = (x: number, y: number, l: number, dx = 0, dy = 0, dl = 0): DungeonCommand => ({ x, y, l, dx, dy, dl });
function at(config: MtSessionConfiguration, x: number, y: number, l = 0): MtDungeonSession {
	return { ...createMtDungeonSession(config), position: { x, y, l } };
}
function accepted(config: MtSessionConfiguration, state: MtDungeonSession, commands: DungeonCommand[]) {
	const result = applyMtDungeonCommandBatch(config, state, commands);
	if (!result.ok) throw new Error(`${result.reason} at ${result.commandIndex}`);
	return result;
}

describe('MT dungeon authoritative command replay (server adapter)', () => {
	it('starts at the exact original map.start; fog shape uses original formula', () => {
		const config = fixture();
		const session = createMtDungeonSession(config);
		expect(session.position).toEqual(config.map.start);
		expect(session.fog).toHaveLength((8 * 8 * 2 + 7) >> 3);
		expect(session.revision).toBe(0);
	});
	it('validates MT _x,_y,_l coordinates at every step, not just at batch start', () => {
		const config = fixture();
		const state = createMtDungeonSession(config);
		const result = accepted(config, state, [cmd(1, 1, 0, 0, 1), cmd(1, 2, 0, 1, 0)]);
		expect(result.session.position).toEqual({ x: 2, y: 2, l: 0 });
		expect(result.session.revision).toBe(2);
		const stale = applyMtDungeonCommandBatch(config, state, [cmd(1, 1, 0, 0, 1), cmd(1, 1, 0, 1, 0)]);
		expect(stale).toMatchObject({ ok: false, reason: 'stale-position', commandIndex: 1 });
		expect(state.position).toEqual({ x: 1, y: 1, l: 0 });
	});
	it('rejects impossible vectors, wrong level, walls and batches over ten', () => {
		const config = fixture(),
			state = at(config, 1, 2);
		expect(applyMtDungeonCommandBatch(config, state, [cmd(1, 2, 0, 1, 1)])).toMatchObject({
			ok: false,
			reason: 'invalid-command'
		});
		expect(applyMtDungeonCommandBatch(config, state, [cmd(1, 2, 1, 1, 0)])).toMatchObject({
			ok: false,
			reason: 'stale-position'
		});
		expect(applyMtDungeonCommandBatch(config, state, [cmd(1, 2, 0, -1, 0)])).toMatchObject({
			ok: false,
			reason: 'blocked'
		});
		expect(applyMtDungeonCommandBatch(config, state, Array(11).fill(cmd(1, 2, 0, 0, 1)))).toMatchObject({
			ok: false,
			reason: 'invalid-batch'
		});
	});
	it('collects the MT key but rejects commands after a mandatory item flush', () => {
		const config = fixture();
		const state = createMtDungeonSession(config);
		const result = accepted(config, state, [cmd(1, 1, 0, 1, 0)]);
		expect(result.session.keys[0]).toBe(true);
		expect(result.session.flags).toContain(getMtFlagIndex(config.map, 0, 2, 1));
		expect(applyMtDungeonCommandBatch(config, state, [cmd(1, 1, 0, 1, 0), cmd(2, 1, 0, 0, 1)])).toMatchObject({
			ok: false,
			reason: 'invalid-batch'
		});
	});
	it('cannot move through a key door without its key, nor manufacture the key', () => {
		const config = fixture();
		const before = at(config, 3, 2);
		const rejected = accepted(config, before, [cmd(3, 2, 0, 1, 0)]);
		expect(rejected.session.position).toEqual(before.position);
		expect(rejected.session.flags).toEqual([]);
		expect(rejected.session.keys).toEqual([]);
		const after = accepted(config, { ...before, keys: [true] }, [cmd(3, 2, 0, 1, 0)]);
		expect(after.session.position).toEqual({ x: 4, y: 2, l: 0 });
		expect(after.session.flags).toContain(getMtFlagIndex(config.map, 0, 4, 2));
	});
	it('suspends upon a guardian without opening its flag or advancing position', () => {
		const config = fixture(),
			before = at(config, 2, 3);
		const result = accepted(config, before, [cmd(2, 3, 0, 1, 0)]);
		expect(result.pending).toMatchObject({ kind: 'guardian', from: before.position, to: { x: 3, y: 3, l: 0 } });
		expect(result.session.position).toEqual(before.position);
		expect(result.session.flags).toEqual([]);
		expect(applyMtDungeonCommandBatch(config, result.session, [cmd(2, 3, 0, 1, 0)])).toMatchObject({
			ok: false,
			reason: 'pending-interaction'
		});
		const lost = settleMtDungeonInteraction(config, result.session, false);
		expect(lost.position).toEqual(before.position);
		expect(lost.flags).toEqual([]);
		const won = settleMtDungeonInteraction(config, result.session, true);
		expect(won.position).toEqual({ x: 3, y: 3, l: 0 });
		expect(won.flags).toContain(getMtFlagIndex(config.map, 0, 3, 3));
		expect(won.pending).toBeNull();
		expect(() => settleMtDungeonInteraction(config, won, true)).toThrow();
	});
	it('does not award gold or mark a treasure until a trusted service resolves it', () => {
		const config = fixture(),
			before = at(config, 4, 5);
		const result = accepted(config, before, [cmd(4, 5, 0, 1, 0)]);
		expect(result.pending?.kind).toBe('gold');
		expect(result.pending?.itemValue).toBe(7);
		expect(result.session.flags).toEqual([]);
		expect(settleMtDungeonInteraction(config, result.session, true).flags).toContain(
			getMtFlagIndex(config.map, 0, 5, 5)
		);
	});
	it('preserves the original IHeal rule: do not set a permanent flag', () => {
		const config = fixture();
		const result = accepted(config, at(config, 3, 4), [cmd(3, 4, 0, 1, 0)]);
		expect(result.pending?.kind).toBe('heal');
		expect(settleMtDungeonInteraction(config, result.session, true).flags).toEqual([]);
	});
	it('requires original scenario icons to be present and resolves scenario via server', () => {
		const config = fixture();
		const result = accepted(config, at(config, 5, 3), [cmd(5, 3, 0, 0, 1)]);
		expect(result.pending?.kind).toBe('scenario');
		const blocked = { ...config, scenarioIcons: [{ kind: 'DIBlock' as const }] };
		expect(applyMtDungeonCommandBatch(blocked, at(config, 5, 3), [cmd(5, 3, 0, 0, 1)])).toMatchObject({
			ok: false,
			reason: 'scenario-blocked'
		});
	});
	it('handles MT interior stair deltas and refuses stale floor after the transition', () => {
		const config = fixture(),
			before = at(config, 2, 4);
		const result = accepted(config, before, [cmd(2, 4, 0, 0, 0, 1)]);
		expect(result.session.position).toEqual({ x: 2, y: 4, l: 1 });
		expect(applyMtDungeonCommandBatch(config, result.session, [cmd(2, 4, 0, 1, 0)])).toMatchObject({
			ok: false,
			reason: 'stale-position'
		});
	});
	it('exterior start and exit stairs require a dedicated overworld service', () => {
		const config = fixture();
		const fromStart = accepted(config, createMtDungeonSession(config), [cmd(1, 1, 0, 0, 0, -1)]);
		expect(fromStart.pending?.kind).toBe('boundary-start');
		expect(fromStart.session.position).toEqual(config.map.start);
		const fromExit = accepted(config, at(config, 6, 6, 1), [cmd(6, 6, 1, 0, 0, 1)]);
		expect(fromExit.pending?.kind).toBe('boundary-exit');
	});
	it('keeps original snapshots intact (failure atomicity and successful immutable transition)', () => {
		const config = fixture(),
			before = at(config, 2, 3);
		const initial = JSON.stringify(before);
		accepted(config, before, [cmd(2, 3, 0, 1, 0)]);
		expect(JSON.stringify(before)).toBe(initial);
		const bad = applyMtDungeonCommandBatch(config, before, [cmd(2, 3, 0, 0, 1), cmd(2, 3, 0, 1, 0)]);
		expect(bad.ok).toBe(false);
		expect(JSON.stringify(before)).toBe(initial);
	});
	it('rejects incorrectly bound mapId and corrupted fog bytes', () => {
		const config = fixture();
		const state = createMtDungeonSession(config);
		expect(applyMtDungeonCommandBatch(config, { ...state, mapId: 'other' }, [cmd(1, 1, 0, 1, 0)])).toMatchObject({
			ok: false,
			reason: 'invalid-state'
		});
		expect(applyMtDungeonCommandBatch(config, { ...state, fog: [0, 255, 999] }, [cmd(1, 1, 0, 1, 0)])).toMatchObject({
			ok: false,
			reason: 'invalid-state'
		});
	});
});
