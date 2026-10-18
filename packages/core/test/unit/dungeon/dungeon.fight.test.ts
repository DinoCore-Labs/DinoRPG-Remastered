import { describe, expect, it } from 'vitest';

import type { MtDungeonDefinition } from '../../../src/models/dungeon/dungeon.definition.js';
import { describeMtDungeonPendingEncounter } from '../../../src/models/dungeon/dungeon.encounter.js';
import { assertMtScenarioFightBinding, mtScenarioFightIntent } from '../../../src/models/dungeon/dungeon.fight.js';
import type { MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	settleMtDungeonInteraction
} from '../../../src/models/dungeon/dungeon.session.js';

const definition: MtDungeonDefinition = {
	id: 'mquetz',
	name: 'MT',
	gold: 100,
	condition: null,
	monsters: ['singmu'],
	tower: false,
	enter: { place: 'mforst', text: '' },
	exit: { place: 'mcuzco', text: '' },
	stages: [
		{
			skin: 'tomb',
			scenarios: [
				{
					index: 0,
					text: 'Combat',
					icon: null,
					messageIcon: null,
					reload: false,
					kind: { type: 'monsters', keys: ['singmu', 'singmu'] }
				}
			]
		}
	]
};
function config(): MtSessionConfiguration {
	return {
		mapId: 'mquetz_0',
		scenarioIcons: [{ kind: 'DIMonster', monster: 'singmu' }],
		map: {
			width: 4,
			height: 4,
			start: { x: 1, y: 1, l: 0 },
			exit: { x: 3, y: 3, l: 0 },
			levels: [
				{
					table: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => true)),
					rooms: [
						{ id: 0, x: 0, y: 0, w: 4, h: 4, doors: [], item: null },
						{ id: 1, x: 1, y: 2, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 1, y: 2, value: 0 } }
					]
				}
			]
		}
	};
}
function encounter() {
	const cfg = config();
	const original = createMtDungeonSession(cfg);
	const command = applyMtDungeonCommandBatch(cfg, original, [{ x: 1, y: 1, l: 0, dx: 0, dy: 1, dl: 0 }]);
	if (!command.ok) throw new Error('Fixture did not trigger MT scenario');
	const session = command.session;
	const view = describeMtDungeonPendingEncounter({
		configuration: cfg,
		session,
		definition,
		localized: definition,
		languageUsed: 'fr'
	});
	return { cfg, session, view };
}

describe('MT stage 10 — trusted scenario fight binding', () => {
	it('takes the exact monster sequence from MT scenario, not user input', () => {
		const { session, view } = encounter();
		const intent = mtScenarioFightIntent(session, view);
		expect(intent).toMatchObject({
			mapId: 'mquetz_0',
			revision: 1,
			scenarioIndex: 0,
			monsterKeys: ['singmu', 'singmu']
		});
		expect(() => assertMtScenarioFightBinding(session, intent)).not.toThrow();
	});
	it('rejects idle/guardian/non-combat events', () => {
		expect(() => mtScenarioFightIntent(createMtDungeonSession(config()), null)).toThrow('not-a-scenario-fight');
		const { session } = encounter();
		expect(() =>
			mtScenarioFightIntent(session, {
				kind: 'guardian',
				status: 'original-selection-unavailable',
				mapId: 'mquetz_0',
				revision: session.revision
			})
		).toThrow('not-a-scenario-fight');
	});
	it('rejects a stale revision, map mismatch or mutated pending command', () => {
		const { session, view } = encounter();
		const intent = mtScenarioFightIntent(session, view);
		expect(() => assertMtScenarioFightBinding({ ...session, revision: 2 }, intent)).toThrow('invalid-pending');
		expect(() => assertMtScenarioFightBinding({ ...session, mapId: 'mquetz_1' }, intent)).toThrow('invalid-pending');
		expect(() =>
			assertMtScenarioFightBinding({ ...session, pending: { ...session.pending!, itemValue: 1 } }, intent)
		).toThrow('invalid-pending');
		expect(() => assertMtScenarioFightBinding({ ...session, locked: false }, intent)).toThrow('invalid-pending');
	});
	it('settles a trusted victory once, never grants the flag on defeat', () => {
		const { session, cfg } = encounter();
		const lost = settleMtDungeonInteraction(cfg, session, false);
		expect(lost.position).toEqual({ x: 1, y: 1, l: 0 });
		expect(lost.flags).toEqual([]);
		const won = settleMtDungeonInteraction(cfg, session, true);
		expect(won.position).toEqual({ x: 1, y: 2, l: 0 });
		expect(won.flags).toHaveLength(1);
		expect(won.pending).toBeNull();
		expect(() => settleMtDungeonInteraction(cfg, won, true)).toThrow();
	});
});
