import { describe, expect, it } from 'vitest';

import type {
	MtDungeonDefinition,
	MtDungeonScenarioDefinition
} from '../../../src/models/dungeon/dungeon.definition.js';
import { mtScenarioRewardIntent } from '../../../src/models/dungeon/dungeon.scenarioReward.js';
import type { MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	settleMtDungeonInteraction
} from '../../../src/models/dungeon/dungeon.session.js';

function scenario(kind: MtDungeonScenarioDefinition['kind']): MtDungeonScenarioDefinition {
	return { index: 0, kind, icon: 'chest', messageIcon: 'chest', reload: false, text: 'Coffre original' };
}
function definition(kind: MtDungeonScenarioDefinition['kind']): MtDungeonDefinition {
	return {
		id: 'stepp',
		name: 'MT',
		gold: 150000,
		condition: null,
		monsters: ['worm'],
		tower: false,
		enter: { place: 'spylon', text: '' },
		exit: { place: 'spylon', text: '' },
		stages: [{ skin: 'desert', scenarios: [scenario(kind)] }]
	};
}
function config(): MtSessionConfiguration {
	return {
		mapId: 'stepp_0',
		scenarioIcons: [{ kind: 'DIIcon', icon: 'chest' }],
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
function pending(kind: MtDungeonScenarioDefinition['kind']) {
	const cfg = config();
	const base = createMtDungeonSession(cfg);
	const cmd = applyMtDungeonCommandBatch(cfg, base, [{ x: 1, y: 1, l: 0, dx: 0, dy: 1, dl: 0 }]);
	if (!cmd.ok || !cmd.session.pending) throw new Error('Test fixture failed to trigger MT scenario.');
	const original = definition(kind);
	const localized: MtDungeonDefinition = {
		...original,
		stages: [{ ...original.stages[0]!, scenarios: [{ ...scenario(kind), text: 'Translated MT text' }] }]
	};
	return { cfg, session: cmd.session, original, localized };
}
function intent(kind: MtDungeonScenarioDefinition['kind']) {
	const { cfg, session, original, localized } = pending(kind);
	return mtScenarioRewardIntent({ configuration: cfg, session, definition: original, localized, languageUsed: 'en' });
}

describe('MT stage 11 — canonical scenario reward intent', () => {
	it('reads exact MT object key and quantity without trusting clients', () => {
		expect(intent({ type: 'object', key: 'irma', count: 10 })).toMatchObject({
			mapId: 'stepp_0',
			revision: 1,
			scenarioIndex: 0,
			effect: { type: 'object', key: 'irma', count: 10 },
			text: 'Translated MT text',
			languageUsed: 'en'
		});
	});
	it('represents collection and text-only scenarios separately', () => {
		expect(intent({ type: 'collection', key: 'demon' }).effect).toEqual({ type: 'collection', key: 'demon' });
		expect(intent({ type: 'none' }).effect).toEqual({ type: 'none' });
	});
	it('never authorizes fights and blocked scenarios via reward resolution', () => {
		expect(() => intent({ type: 'monsters', keys: ['singmu'] })).toThrow();
		expect(() => intent({ type: 'block', scenarioIndexes: [1] })).toThrow();
	});
	it('rejects a consumed or inconsistent pending target', () => {
		const { cfg, session, original, localized } = pending({ type: 'object', key: 'hotpan', count: 6 });
		const check = (s: typeof session) =>
			mtScenarioRewardIntent({
				configuration: cfg,
				session: s,
				definition: original,
				localized,
				languageUsed: 'fr'
			});
		expect(() => check({ ...session, pending: { ...session.pending!, itemValue: 25 } })).toThrow();
		expect(() => check({ ...session, pending: { ...session.pending!, to: { x: 0, y: 0, l: 0 } } })).toThrow();
		expect(() => check({ ...session, locked: false })).toThrow();
		const settled = settleMtDungeonInteraction(cfg, session, true);
		expect(() => check(settled)).toThrow();
	});
	it('rejects reward changes in a translated file', () => {
		const { cfg, session, original, localized } = pending({ type: 'object', key: 'irma', count: 10 });
		localized.stages[0]!.scenarios[0]!.kind = { type: 'object', key: 'irma', count: 100 };
		expect(() =>
			mtScenarioRewardIntent({ configuration: cfg, session, definition: original, localized, languageUsed: 'en' })
		).toThrow();
	});
});
