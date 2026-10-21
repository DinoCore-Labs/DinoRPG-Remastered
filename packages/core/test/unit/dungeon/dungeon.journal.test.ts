import { describe, expect, it } from 'vitest';

import type {
	MtDungeonDefinition,
	MtDungeonScenarioDefinition
} from '../../../src/models/dungeon/dungeon.definition.js';
import { buildMtDungeonJournal } from '../../../src/models/dungeon/dungeon.journal.js';
import { restoreMtDungeonProgress, snapshotMtDungeonProgress } from '../../../src/models/dungeon/dungeon.progress.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import { createMtDungeonSession, type MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';

const kinds = [{ type: 'none' } as const, { type: 'object', key: 'irma', count: 10 } as const];
function scenario(index: number, stage: number): MtDungeonScenarioDefinition {
	return {
		index,
		kind: kinds[index]!,
		icon: index === 0 ? 'scroll' : 'chest',
		messageIcon: null,
		reload: index === 0,
		text: `MT stage ${stage} text ${index}`
	};
}
const original: MtDungeonDefinition = {
	id: 'stepp',
	name: 'Les Cavernes',
	gold: 150000,
	condition: null,
	monsters: ['worm'],
	tower: false,
	enter: { place: 'spylon', text: '' },
	exit: { place: 'spylon', text: '' },
	stages: [0, 1].map(stage => ({ skin: 'desert', scenarios: [scenario(0, stage), scenario(1, stage)] }))
};
const localized: MtDungeonDefinition = {
	...original,
	stages: original.stages.map((stage, i) => ({
		...stage,
		scenarios: stage.scenarios.map((sc, j) => ({ ...sc, text: `Localized ${i}-${j}` }))
	}))
};
function config(stage: number): MtSessionConfiguration {
	return {
		mapId: `stepp_${stage}`,
		map: {
			width: 5,
			height: 5,
			start: { x: 1, y: 1, l: 0 },
			exit: { x: 4, y: 4, l: 0 },
			levels: [
				{
					table: Array.from({ length: 5 }, () => Array(5).fill(true) as boolean[]),
					rooms: [
						{ id: 0, x: 1, y: 1, w: 4, h: 4, doors: [], item: { kind: 'IScenario', x: 2, y: 1, value: 0 } },
						{ id: 1, x: 2, y: 2, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 2, y: 2, value: 1 } }
					]
				}
			]
		}
	};
}
const configurations = (mapId: string) => config(Number(mapId.slice(-1)));
const flag = (stage: number, x: number, y: number) => getMtFlagIndex(config(stage).map, 0, x, y);
const opts = (session: ReturnType<typeof createMtDungeonSession>) => ({
	session,
	original,
	localized,
	languageUsed: 'en',
	getConfiguration: configurations
});

describe('MT step 20G — claimed-only journal', () => {
	it('does not leak hidden scenario texts or pending/unclaimed chest contents', () => {
		const fresh = createMtDungeonSession(config(0));
		expect(buildMtDungeonJournal(opts(fresh)).entries).toEqual([]);
		const claimed = { ...fresh, flags: [flag(0, 2, 1)] };
		const entries = buildMtDungeonJournal(opts(claimed)).entries;
		expect(entries).toEqual([
			{
				mapId: 'stepp_0',
				stage: 0,
				level: 0,
				scenarioIndex: 0,
				icon: 'scroll',
				text: 'Localized 0-0'
			}
		]);
		expect(entries.some(entry => entry.text.includes('0-1'))).toBe(false);
	});

	it('reconstructs discovered texts across stages and after persisted exit/re-entry', () => {
		const previous = createMtDungeonSession(config(1));
		const claimed = {
			...previous,
			flags: [flag(1, 2, 2)],
			stageStates: {
				stepp_0: { keys: [], flags: [flag(0, 2, 1)], fog: createMtDungeonSession(config(0)).fog }
			}
		};
		const saved = JSON.parse(JSON.stringify(snapshotMtDungeonProgress(claimed))) as unknown;
		const reopened = restoreMtDungeonProgress(createMtDungeonSession(config(0)), saved, configurations);
		const entries = buildMtDungeonJournal(opts(reopened)).entries;
		expect(entries.map(entry => `${entry.mapId}:${entry.scenarioIndex}`)).toEqual(['stepp_0:0', 'stepp_1:1']);
		expect(entries.map(entry => entry.text)).toEqual(['Localized 0-0', 'Localized 1-1']);
	});

	it('does not treat an uncommitted pending event as a completed scroll', () => {
		const session = createMtDungeonSession(config(0));
		const pending = {
			...session,
			locked: true,
			pending: {
				kind: 'scenario' as const,
				from: { ...session.position },
				to: { x: 2, y: 1, l: 0 },
				flag: flag(0, 2, 1),
				itemValue: 0
			}
		};
		expect(buildMtDungeonJournal(opts(pending)).entries).toEqual([]);
	});

	it('refuses foreign stages and translations that change canonical rewards', () => {
		const session = createMtDungeonSession(config(0));
		const foreign = {
			...session,
			stageStates: {
				katak_0: { keys: [], flags: [1], fog: null }
			}
		};
		expect(() => buildMtDungeonJournal(opts(foreign))).toThrow('Cross-dungeon');
		const modified = {
			...localized,
			stages: localized.stages.map(stage => ({
				...stage,
				scenarios: stage.scenarios.map(s => ({ ...s, kind: { type: 'none' as const } }))
			}))
		};
		expect(() => buildMtDungeonJournal({ ...opts(session), localized: modified })).toThrow();
	});
});
