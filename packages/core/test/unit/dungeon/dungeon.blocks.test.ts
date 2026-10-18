import { describe, expect, it } from 'vitest';

import {
	compileMtDungeonBlockRules,
	effectiveMtDungeonScenarioIcons,
	isMtDungeonBlockUnlocked,
	MtDungeonBlockError,
	mtDungeonBlockStates
} from '../../../src/models/dungeon/dungeon.blocks.js';
import type {
	MtDungeonDefinition,
	MtDungeonScenarioDefinition
} from '../../../src/models/dungeon/dungeon.definition.js';
import { mtScenarioRewardIntent } from '../../../src/models/dungeon/dungeon.scenarioReward.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import type { MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	settleMtDungeonInteraction
} from '../../../src/models/dungeon/dungeon.session.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

/** Synthetic isolated topology; original 11 MT maps remain untouched. */
function sample(): { cfg: MtSessionConfiguration; original: MtDungeonDefinition } {
	const scenarios: MtDungeonScenarioDefinition[] = [
		{
			index: 0,
			text: 'Guardian A',
			kind: { type: 'monsters', keys: ['singmu'] },
			icon: null,
			messageIcon: null,
			reload: false
		},
		{
			index: 1,
			text: 'Guardian B',
			kind: { type: 'monsters', keys: ['singmu'] },
			icon: null,
			messageIcon: null,
			reload: false
		},
		{
			index: 2,
			text: 'Guardian C',
			kind: { type: 'monsters', keys: ['singmu'] },
			icon: null,
			messageIcon: null,
			reload: false
		},
		{
			index: 3,
			text: 'A passage opens',
			kind: { type: 'block', scenarioIndexes: [0, 1, 2] },
			icon: null,
			messageIcon: null,
			reload: false
		}
	];
	const map: DungeonStructure = {
		width: 8,
		height: 7,
		start: { x: 1, y: 1, l: 0 },
		exit: { x: 7, y: 6, l: 0 },
		levels: [
			{
				table: Array.from({ length: 8 }, () => Array.from({ length: 7 }, () => true)),
				rooms: [
					{ id: 0, x: 0, y: 0, w: 8, h: 7, doors: [], item: null },
					{ id: 1, x: 3, y: 3, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 3, y: 3, value: 0 } },
					{ id: 2, x: 4, y: 3, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 4, y: 3, value: 1 } },
					{ id: 3, x: 5, y: 3, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 5, y: 3, value: 2 } },
					{ id: 4, x: 2, y: 1, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 2, y: 1, value: 3 } }
				]
			}
		]
	};
	const original: MtDungeonDefinition = {
		id: 'mquetz',
		name: 'Temple',
		gold: 40000,
		condition: null,
		monsters: ['singmu'],
		tower: false,
		enter: { place: 'mforst', text: '' },
		exit: { place: 'mcuzco', text: '' },
		stages: [{ skin: 'tomb', scenarios }]
	};
	const scenarioIcons = [
		{ kind: 'DIMonster', monster: 'singmu' } as const,
		{ kind: 'DIMonster', monster: 'singmu' } as const,
		{ kind: 'DIMonster', monster: 'singmu' } as const,
		{ kind: 'DIBlock' } as const
	];
	const cfg: MtSessionConfiguration = {
		mapId: 'mquetz_0',
		map,
		scenarioIcons,
		blockRules: compileMtDungeonBlockRules(map, scenarios)
	};
	return { cfg, original };
}

const east = [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }];

describe('Stage 12 — MT DSKBlock original prerequisites', () => {
	it('maps referenced scenario indexes to actual MT flag coordinates', () => {
		const { cfg } = sample();
		expect(cfg.blockRules).toEqual([
			{
				scenarioIndex: 3,
				requiredFlags: [
					getMtFlagIndex(cfg.map, 0, 3, 3),
					getMtFlagIndex(cfg.map, 0, 4, 3),
					getMtFlagIndex(cfg.map, 0, 5, 3)
				]
			}
		]);
		expect(mtDungeonBlockStates(cfg.blockRules, [])).toEqual([{ scenarioIndex: 3, unlocked: false }]);
	});
	it('refuses passage with zero, one or two completed guardian scenarios', () => {
		const { cfg } = sample();
		const flags = cfg.blockRules![0]!.requiredFlags;
		for (const done of [[], [flags[0]!], [flags[0]!, flags[1]!]]) {
			const s = { ...createMtDungeonSession(cfg), flags: [...done] };
			const r = applyMtDungeonCommandBatch(cfg, s, east);
			expect(r.ok).toBe(false);
			if (!r.ok) expect(r.reason).toBe('scenario-blocked');
			expect(s.flags).toEqual(done);
			expect(s.position).toEqual(cfg.map.start);
		}
	});
	it('unblocks exactly when all prerequisites are completed, then emits a normal message pending', () => {
		const { cfg, original } = sample();
		const flags = [...cfg.blockRules![0]!.requiredFlags];
		const base = { ...createMtDungeonSession(cfg), flags };
		expect(isMtDungeonBlockUnlocked(cfg.blockRules, 3, flags)).toBe(true);
		expect(effectiveMtDungeonScenarioIcons(cfg.scenarioIcons, cfg.blockRules, flags)?.[3]).toEqual({
			kind: 'DINothing'
		});
		expect(cfg.scenarioIcons?.[3]).toEqual({ kind: 'DIBlock' }); // no mutation of cached MT archive
		const r = applyMtDungeonCommandBatch(cfg, base, east);
		expect(r.ok).toBe(true);
		if (!r.ok) throw new Error('Unexpected blocked move');
		expect(r.pending).toMatchObject({ kind: 'scenario', itemValue: 3 });
		const intent = mtScenarioRewardIntent({
			configuration: cfg,
			session: r.session,
			definition: original,
			localized: original,
			languageUsed: 'fr'
		});
		expect(intent).toMatchObject({ scenarioIndex: 3, effect: { type: 'none' }, text: 'A passage opens' });
		const settled = settleMtDungeonInteraction(cfg, r.session, true);
		expect(settled.flags).toContain(getMtFlagIndex(cfg.map, 0, 2, 1));
		expect(settled.pending).toBeNull();
		expect(mtDungeonBlockStates(cfg.blockRules, settled.flags)).toEqual([{ scenarioIndex: 3, unlocked: true }]);
	});
	it('does not let a forged pending block bypass missing prerequisites', () => {
		const { cfg, original } = sample();
		const base = createMtDungeonSession(cfg);
		const forged = {
			...base,
			locked: true,
			pending: {
				kind: 'scenario' as const,
				from: { ...base.position },
				to: { x: 2, y: 1, l: 0 },
				flag: getMtFlagIndex(cfg.map, 0, 2, 1),
				itemValue: 3
			}
		};
		expect(() =>
			mtScenarioRewardIntent({
				configuration: cfg,
				session: forged,
				definition: original,
				localized: original,
				languageUsed: 'fr'
			})
		).toThrow();
	});
	it('does not count a different floor or coordinate as a completed prerequisite', () => {
		const { cfg } = sample();
		const required = cfg.blockRules![0]!.requiredFlags;
		expect(isMtDungeonBlockUnlocked(cfg.blockRules, 3, [required[0]!, required[1]!, required[2]! + 1])).toBe(false);
	});
	it('survives a JSON snapshot/restore like MtDungeonRun stageStates', () => {
		const { cfg } = sample();
		const stored = JSON.stringify({ flags: cfg.blockRules![0]!.requiredFlags });
		const flags = (JSON.parse(stored) as { flags: number[] }).flags;
		expect(mtDungeonBlockStates(cfg.blockRules, flags)).toEqual([{ scenarioIndex: 3, unlocked: true }]);
	});
	it('fails closed for missing/duplicate/circular prerequisites, preserving original data', () => {
		const { cfg, original } = sample();
		const sc = original.stages[0]!.scenarios;
		const bad = (refs: number[]) =>
			sc.map(s => (s.index === 3 ? { ...s, kind: { type: 'block' as const, scenarioIndexes: refs } } : s));
		expect(() => compileMtDungeonBlockRules(cfg.map, bad([0, 0]))).toThrow(MtDungeonBlockError);
		expect(() => compileMtDungeonBlockRules(cfg.map, bad([3]))).toThrow();
		expect(() => compileMtDungeonBlockRules(cfg.map, bad([999]))).toThrow();
		const lost = {
			...cfg.map,
			levels: [{ ...cfg.map.levels[0]!, rooms: cfg.map.levels[0]!.rooms.filter(r => r.item?.value !== 2) }]
		};
		expect(() => compileMtDungeonBlockRules(lost, sc)).toThrow('missing-original-scenario');
	});
	it('never opens a DIBlock if no verified rules are supplied', () => {
		const { cfg } = sample();
		expect(effectiveMtDungeonScenarioIcons(cfg.scenarioIcons, undefined, [1, 2, 3])?.[3]).toEqual({ kind: 'DIBlock' });
	});
});
