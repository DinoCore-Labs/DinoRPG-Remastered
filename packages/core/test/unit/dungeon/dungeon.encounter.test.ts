import { describe, expect, it } from 'vitest';

import type { MtDungeonDefinition } from '../../../src/models/dungeon/dungeon.definition.js';
import {
	describeMtDungeonPendingEncounter,
	MtDungeonEncounterError
} from '../../../src/models/dungeon/dungeon.encounter.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import type { MtDungeonSession, MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';
import { applyMtDungeonCommandBatch, createMtDungeonSession } from '../../../src/models/dungeon/dungeon.session.js';

const definition: MtDungeonDefinition = {
	id: 'katak',
	name: 'Nom français',
	gold: 1500,
	condition: null,
	monsters: ['worm'],
	tower: false,
	enter: { place: 'skull', text: 'Entrée' },
	exit: { place: 'skull', text: 'Sortie' },
	stages: [
		{
			skin: 'sewer',
			scenarios: [
				{
					index: 0,
					text: 'Bataille originale',
					icon: null,
					messageIcon: null,
					reload: false,
					kind: { type: 'monsters', keys: ['mimic', 'gropi'] }
				},
				{
					index: 1,
					text: 'Un trésor',
					icon: 'chest',
					messageIcon: 'chest',
					reload: false,
					kind: { type: 'object', key: 'secret-object', count: 42 }
				}
			]
		}
	]
};
const translated: MtDungeonDefinition = {
	...definition,
	name: 'English name',
	stages: [
		{
			...definition.stages[0]!,
			scenarios: [
				{ ...definition.stages[0]!.scenarios[0]!, text: 'Original battle' },
				{ ...definition.stages[0]!.scenarios[1]!, text: 'A treasure' }
			]
		}
	]
};
function config(): MtSessionConfiguration {
	const table = Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => true));
	return {
		mapId: 'katak_0',
		scenarioIcons: [
			{ kind: 'DIMonster', monster: 'mimic' },
			{ kind: 'DIIcon', icon: 'chest' }
		],
		map: {
			width: 6,
			height: 6,
			start: { x: 1, y: 1, l: 0 },
			exit: { x: 5, y: 5, l: 0 },
			levels: [
				{
					table,
					rooms: [
						{ id: 0, x: 0, y: 0, w: 6, h: 6, doors: [{ x: 2, y: 1, up: null, key: null }], item: null },
						{ id: 1, x: 1, y: 2, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 1, y: 2, value: 0 } },
						{ id: 2, x: 2, y: 2, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 2, y: 2, value: 1 } },
						{ id: 3, x: 3, y: 2, w: 1, h: 1, doors: [], item: { kind: 'IGold', x: 3, y: 2, value: 9 } },
						{ id: 4, x: 3, y: 3, w: 1, h: 1, doors: [], item: { kind: 'IHeal', x: 3, y: 3, value: 4 } }
					]
				}
			]
		}
	};
}
function step(cfg: MtSessionConfiguration, x: number, y: number, dx: number, dy: number): MtDungeonSession {
	const state = { ...createMtDungeonSession(cfg), position: { x, y, l: 0 } };
	const result = applyMtDungeonCommandBatch(cfg, state, [{ x, y, l: 0, dx, dy, dl: 0 }]);
	if (!result.ok) throw new Error(result.reason);
	return result.session;
}
function view(session: MtDungeonSession, cfg = config(), local = translated) {
	return describeMtDungeonPendingEncounter({
		configuration: cfg,
		session,
		definition,
		localized: local,
		languageUsed: 'en'
	});
}

describe('MT stage-9 encounters are read-only and anchored to original pending events', () => {
	it('returns null for no pending without revealing any scenarios', () => {
		expect(view(createMtDungeonSession(config()))).toBeNull();
	});
	it('identifies a guardian but refuses to invent its monster selection', () => {
		const cfg = config();
		const state = step(cfg, 1, 1, 1, 0);
		expect(view(state)).toEqual({
			kind: 'guardian',
			status: 'original-selection-unavailable',
			mapId: 'katak_0',
			revision: 1
		});
		expect(state.flags).toEqual([]);
	});
	it('exposes only the original scenario monster keys after the encounter is triggered', () => {
		const state = step(config(), 1, 1, 0, 1);
		const result = view(state);
		expect(result).toEqual({
			kind: 'scenario-combat',
			status: 'awaiting-combat-integration',
			mapId: 'katak_0',
			revision: 1,
			monsterKeys: ['mimic', 'gropi'],
			text: 'Original battle',
			messageIcon: null,
			languageUsed: 'en'
		});
		expect(state.flags).toEqual([]);
	});
	it('never includes secret object ids, counts or prices when describing treasure', () => {
		const result = view(step(config(), 1, 2, 1, 0));
		expect(result).toEqual({
			kind: 'scenario',
			status: 'awaiting-scenario-integration',
			mapId: 'katak_0',
			revision: 1,
			text: 'A treasure',
			messageIcon: 'chest',
			languageUsed: 'en'
		});
		expect(JSON.stringify(result)).not.toContain('secret-object');
		expect(JSON.stringify(result)).not.toContain('42');
	});
	it('keeps gold/heal rewards disabled and private', () => {
		expect(view(step(config(), 2, 2, 1, 0))).toEqual({
			kind: 'gold',
			status: 'awaiting-gameplay-integration',
			mapId: 'katak_0',
			revision: 1
		});
		expect(view(step(config(), 2, 3, 1, 0))).toEqual({
			kind: 'heal',
			status: 'awaiting-gameplay-integration',
			mapId: 'katak_0',
			revision: 1
		});
	});
	it('fails closed for a forged scenario index, moved position or consumed flag', () => {
		const cfg = config();
		const state = step(cfg, 1, 1, 0, 1);
		const index = getMtFlagIndex(cfg.map, 0, 1, 2);
		expect(() => view({ ...state, pending: { ...state.pending!, itemValue: 1 } })).toThrow(MtDungeonEncounterError);
		expect(() => view({ ...state, flags: [index] })).toThrow(MtDungeonEncounterError);
		expect(() => view({ ...state, position: { x: 5, y: 5, l: 0 } })).toThrow(MtDungeonEncounterError);
	});
	it('rejects a forged guardian door and localized metadata that changes gameplay', () => {
		const cfg = config();
		const guardian = step(cfg, 1, 1, 1, 0);
		expect(() => view({ ...guardian, pending: { ...guardian.pending!, to: { x: 3, y: 1, l: 0 } } })).toThrow(
			MtDungeonEncounterError
		);
		const scenario = step(cfg, 1, 1, 0, 1);
		const forged: MtDungeonDefinition = {
			...translated,
			stages: [
				{
					...translated.stages[0]!,
					scenarios: [
						{ ...translated.stages[0]!.scenarios[0]!, kind: { type: 'none' } },
						translated.stages[0]!.scenarios[1]!
					]
				}
			]
		};
		expect(() => view(scenario, cfg, forged)).toThrow(MtDungeonEncounterError);
	});
});
