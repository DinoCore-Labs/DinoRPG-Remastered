import { describe, expect, it } from 'vitest';

import { fromMtOriginalCommand, toMtOriginalCommand } from '../../../src/models/dungeon/dungeon.protocol.js';

describe('Original MT DungeonData.hx command field names', () => {
	it('keeps exact _x/_y/_l/_dx/_dy/_dl spellings and round-trips them', () => {
		const command = { x: 12, y: 3, l: 2, dx: -1, dy: 0, dl: 0 };
		const wire = toMtOriginalCommand(command);
		expect(wire).toEqual({ _x: 12, _y: 3, _l: 2, _dx: -1, _dy: 0, _dl: 0 });
		expect(fromMtOriginalCommand(wire)).toEqual(command);
	});
	it('rejects extra, missing or noninteger fields instead of trusting the client', () => {
		const wire = toMtOriginalCommand({ x: 0, y: 0, l: 0, dx: 1, dy: 0, dl: 0 });
		expect(() => fromMtOriginalCommand({ ...wire, forged: true })).toThrow();
		expect(() => fromMtOriginalCommand({ ...wire, _dx: 1.5 })).toThrow();
		expect(() => fromMtOriginalCommand({ ...wire, _dl: undefined })).toThrow();
	});
});
