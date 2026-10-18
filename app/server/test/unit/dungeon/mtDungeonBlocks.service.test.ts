import { effectiveMtDungeonScenarioIcons } from '@dinorpg/core/models/dungeon/dungeon.blocks.js';
import { describe, expect, it } from 'vitest';

import { MtDungeonArchive } from '../../../src/Dungeon/Service/mtDungeonArchive.service.js';

/** Runs against the user's 11 byte-verified maps and 4 byte-verified catalogues. */
describe('MT original DSKBlock bindings (no map or XML modifications)', () => {
	const archive = new MtDungeonArchive();
	it('binds Quetzaco prerequisites to the original stage-0 map', () => {
		const cfg = archive.configuration('mquetz_0');
		expect(cfg.blockRules?.map(b => b.scenarioIndex)).toEqual([5, 8, 11, 12]);
		expect(cfg.blockRules?.map(b => b.requiredFlags.length)).toEqual([3, 2, 1, 1]);
		expect(cfg.scenarioIcons?.[5]).toEqual({ kind: 'DIBlock' });
		expect(effectiveMtDungeonScenarioIcons(cfg.scenarioIcons, cfg.blockRules, [])?.[5]).toEqual({ kind: 'DIBlock' });
		expect(
			effectiveMtDungeonScenarioIcons(cfg.scenarioIcons, cfg.blockRules, cfg.blockRules![0]!.requiredFlags)?.[5]
		).toEqual({ kind: 'DINothing' });
	});
	it('binds Cuzcous boss exit to stage 2, not to stage 0 or 1', () => {
		expect(archive.configuration('mcuzco_0').blockRules).toEqual([]);
		expect(archive.configuration('mcuzco_1').blockRules).toEqual([]);
		const bossStage = archive.configuration('mcuzco_2');
		expect(bossStage.blockRules?.map(b => b.scenarioIndex)).toEqual([2]);
		expect(bossStage.blockRules?.[0]?.requiredFlags.length).toBe(1);
	});
	it('retains other original MT dungeons with no DSKBlock', () => {
		expect(archive.configuration('stepp_0').blockRules).toEqual([]);
	});
});
