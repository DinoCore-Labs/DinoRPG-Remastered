import { describe, expect, it } from 'vitest';

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

describe('IHeal server-owned arrival', () => {
	it('stops movement at a genuine zone, then persists its consumed flag on trusted settlement', () => {
		const c = cfg();
		const run = createMtDungeonSession(c);
		const start = applyMtDungeonCommandBatch(c, run, [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }]);
		expect(start.ok).toBe(true);
		if (!start.ok) return;
		expect(start.pending?.kind).toBe('heal');
		expect(start.session.position).toEqual({ x: 1, y: 1, l: 0 });
		const arrived = settleMtDungeonInteraction(c, start.session, true);
		const flag = getMtFlagIndex(c.map, 0, 2, 1);
		expect(arrived.flags).toContain(flag);
		expect(arrived.position).toEqual({ x: 2, y: 1, l: 0 });
		expect(arrived.pending).toBeNull();
		const leave = applyMtDungeonCommandBatch(c, arrived, [{ x: 2, y: 1, l: 0, dx: -1, dy: 0, dl: 0 }]);
		expect(leave.ok).toBe(true);
		if (!leave.ok) return;
		const returnToUsedZone = applyMtDungeonCommandBatch(c, leave.session, [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }]);
		expect(returnToUsedZone.ok).toBe(true);
		if (!returnToUsedZone.ok) return;
		expect(returnToUsedZone.pending).toBeNull();
		expect(returnToUsedZone.session.position).toEqual({ x: 2, y: 1, l: 0 });
	});
	it('does not consume a zone when settlement fails', () => {
		const c = cfg();
		const start = applyMtDungeonCommandBatch(c, createMtDungeonSession(c), [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }]);
		if (!start.ok) throw new Error('Expected legal move');
		const denied = settleMtDungeonInteraction(c, start.session, false);
		expect(denied.flags).not.toContain(getMtFlagIndex(c.map, 0, 2, 1));
		expect(denied.position).toEqual({ x: 1, y: 1, l: 0 });
	});
});
