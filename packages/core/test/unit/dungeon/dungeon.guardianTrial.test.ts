import { describe, expect, it } from 'vitest';

import type { MtDungeonDefinition } from '../../../src/models/dungeon/dungeon.definition.js';
import {
	assertMtGuardianTrialBinding,
	createMtGuardianTrialIntent,
	MT_GUARDIAN_TRIAL_INDEX
} from '../../../src/models/dungeon/dungeon.guardianTrial.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import type { MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';
import { createMtDungeonSession } from '../../../src/models/dungeon/dungeon.session.js';

// No server/DB: synthetic adjacent doorway with the original MT validator.
const map = {
	width: 4,
	height: 4,
	start: { x: 0, y: 0, l: 0 },
	exit: { x: 3, y: 3, l: 0 },
	levels: [
		{
			table: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => true)),
			rooms: [{ id: 0, x: 0, y: 0, w: 4, h: 4, item: null, doors: [{ x: 1, y: 0, up: null, key: null }] }]
		}
	]
} as MtSessionConfiguration['map'];
const cfg: MtSessionConfiguration = { map, mapId: 'stepp_0' };
const definition = {
	id: 'stepp',
	monsters: ['worm2', 'worm', 'scorp'],
	stages: [{ skin: 'desert', scenarios: [] }]
} as MtDungeonDefinition;
function pending() {
	const s = createMtDungeonSession(cfg);
	s.pending = {
		kind: 'guardian',
		from: { x: 0, y: 0, l: 0 },
		to: { x: 1, y: 0, l: 0 },
		flag: getMtFlagIndex(map, 0, 1, 0),
		itemValue: null
	};
	s.locked = true;
	return s;
}
describe('MT guardian development battle intent', () => {
	it('binds the true pending door and only canonical roster', () => {
		const s = pending();
		const a = createMtGuardianTrialIntent({ session: s, configuration: cfg, definition });
		expect(a.scenarioIndex).toBe(MT_GUARDIAN_TRIAL_INDEX);
		expect(definition.monsters).toContain(a.monsterKeys[0]);
		expect(a.visualSeed).toBe(4);
		expect(() => assertMtGuardianTrialBinding(s, a)).not.toThrow();
	});
	it('rejects forged, missing or stale guardians', () => {
		const s = pending();
		const a = createMtGuardianTrialIntent({ session: s, configuration: cfg, definition });
		s.revision++;
		expect(() => assertMtGuardianTrialBinding(s, a)).toThrow();
		s.pending = null;
		s.locked = false;
		expect(() => createMtGuardianTrialIntent({ session: s, configuration: cfg, definition })).toThrow();
	});
});
