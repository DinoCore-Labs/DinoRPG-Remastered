import { describe, expect, it } from 'vitest';

import { isActiveMtHealZone } from '../../../src/models/dungeon/dungeon.healZone.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	settleMtDungeonInteraction
} from '../../../src/models/dungeon/dungeon.session.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

const map = (): DungeonStructure => ({
	width: 5,
	height: 5,
	levels: [
		{
			table: Array.from({ length: 5 }, (_, x) => Array.from({ length: 5 }, (_, y) => x > 0 && x < 4 && y > 0 && y < 4)),
			rooms: [{ id: 0, x: 1, y: 1, w: 3, h: 3, doors: [], item: { kind: 'IHeal', x: 2, y: 1, value: 0 } }]
		}
	],
	start: { x: 1, y: 1, l: 0 },
	exit: { x: 3, y: 3, l: 0 }
});
const cfg = () => ({ map: map(), mapId: 'stepp_0', scenarioIcons: [] });
const accepted = (cfg: ReturnType<typeof makeCfg>, state: ReturnType<typeof createMtDungeonSession>, dx: number) => {
	const { x, y, l } = state.position;
	const result = applyMtDungeonCommandBatch(cfg, state, [{ x, y, l, dx, dy: 0, dl: 0 }]);
	if (!result.ok) throw new Error(result.reason);
	return result.session;
};
function makeCfg() {
	return cfg();
}

describe('IHeal: no automatic HP restoration, flag on departure', () => {
	it('allows walking onto the zone without a pending interaction or consumed flag', () => {
		const c = cfg(),
			flag = getMtFlagIndex(c.map, 0, 2, 1);
		const start = createMtDungeonSession(c);
		const standing = accepted(c, start, 1);
		expect(standing.position).toEqual({ x: 2, y: 1, l: 0 });
		expect(standing.pending).toBeNull();
		expect(standing.locked).toBe(false);
		expect(standing.flags).not.toContain(flag);
		expect(isActiveMtHealZone(c.map, standing.position, standing.flags)).toBe(true);
		const departed = accepted(c, standing, -1);
		expect(departed.flags).toContain(flag);
		const revisited = accepted(c, departed, 1);
		expect(revisited.pending).toBeNull();
		expect(isActiveMtHealZone(c.map, revisited.position, revisited.flags)).toBe(false);
	});
	it('consumes only if departure through a guardian is actually settled', () => {
		const c = cfg();
		c.map.levels[0]!.rooms[0]!.doors.push({ x: 3, y: 1, up: null, key: null });
		const standing = accepted(c, createMtDungeonSession(c), 1);
		const attempt = applyMtDungeonCommandBatch(c, standing, [{ x: 2, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }]);
		expect(attempt.ok).toBe(true);
		if (!attempt.ok) return;
		expect(attempt.pending?.kind).toBe('guardian');
		const healFlag = getMtFlagIndex(c.map, 0, 2, 1);
		expect(attempt.session.flags).not.toContain(healFlag);
		expect(settleMtDungeonInteraction(c, attempt.session, false).flags).not.toContain(healFlag);
		const settled = settleMtDungeonInteraction(c, attempt.session, true);
		expect(settled.position).toEqual({ x: 3, y: 1, l: 0 });
		expect(settled.flags).toContain(healFlag);
	});
	it('never consumes when a move is rejected by topology', () => {
		const c = cfg(),
			standing = accepted(c, createMtDungeonSession(c), 1);
		const result = applyMtDungeonCommandBatch(c, standing, [{ x: 2, y: 1, l: 0, dx: 0, dy: -1, dl: 0 }]);
		expect(result.ok).toBe(false);
		expect(result.session.flags).not.toContain(getMtFlagIndex(c.map, 0, 2, 1));
	});
});
