import { describe, expect, it } from 'vitest';

import { mtDungeonEntryCondition, parseMtDungeonDefinitions } from '../../../src/models/dungeon/dungeon.definition.js';

const TEST_XML = `<?xml version="1.0"?>
<dungeons>
<!-- The real MT file has the same layout -->
<d id="stepp" name="Les Cavernes Magnétiques" gold="150000" monsters="worm:scorp" cond="active(cavmagnet)">
  <enter place="spylon">L' entrée &amp; le départ.</enter>
  <stage skin="desert">
    <scenario icon="scroll" micon="misc">Journal de Mandragore</scenario>
    <scenario obj="hotpan" count="6">Vous obtenez six pains.</scenario>
    <scenario monsters="singmu:singmu"/>
    <scenario block="0:1"/>
    <scenario collec="demon" reload="1">Collection</scenario>
  </stage>
  <exit place="spylon">La sortie</exit>
</d>
</dungeons>`;

describe('MT DungeonXML (DinoRPG/src/data/Dungeon.hx)', () => {
	it('preserves dungeon metadata and entrance/exit text', () => {
		const [d] = parseMtDungeonDefinitions(TEST_XML);
		expect(d).toMatchObject({
			id: 'stepp',
			name: 'Les Cavernes Magnétiques',
			gold: 150000,
			condition: 'active(cavmagnet)',
			monsters: ['worm', 'scorp'],
			tower: false,
			enter: { place: 'spylon', text: "L' entrée & le départ." },
			exit: { place: 'spylon', text: 'La sortie' }
		});
	});
	it('retains indexed scenario kinds and legacy default chest icon', () => {
		const scenarios = parseMtDungeonDefinitions(TEST_XML)[0]!.stages[0]!.scenarios;
		expect(scenarios).toHaveLength(5);
		expect(scenarios[1]).toMatchObject({
			index: 1,
			icon: 'chest',
			messageIcon: 'chest',
			kind: { type: 'object', key: 'hotpan', count: 6 }
		});
		expect(scenarios[2]!.kind).toEqual({ type: 'monsters', keys: ['singmu', 'singmu'] });
		expect(scenarios[3]!.kind).toEqual({ type: 'block', scenarioIndexes: [0, 1] });
		expect(scenarios[4]!.reload).toBe(true);
	});
	it('maps each original dungeon entrance syntax to native Remastered conditions', () => {
		expect(mtDungeonEntryCondition('active(cavmagnet)')).toEqual({ type: 'active', key: 'cavmagnet' });
		expect(mtDungeonEntryCondition('mission(mbegin)')).toEqual({
			type: 'mission',
			key: 'mbegin',
			status: { type: 'current' }
		});
		expect(mtDungeonEntryCondition('scenario(monisl,4+)')).toEqual({
			type: 'scenario',
			key: 'monisl',
			progression: 4,
			compare: 'gte'
		});
		expect(mtDungeonEntryCondition('scenario(smog,26+)')).toEqual({
			type: 'scenario',
			key: 'smog',
			progression: 26,
			compare: 'gte'
		});
	});
	it('rejects unknown expressions instead of guessing semantics', () => {
		expect(() => mtDungeonEntryCondition('random(monisl)')).toThrow('Unsupported');
	});
	it('rejects malformed and ambiguous historical scenarios', () => {
		expect(() => parseMtDungeonDefinitions(TEST_XML.replace('obj="hotpan"', 'obj="hotpan" monsters="singmu"'))).toThrow(
			'Ambiguous'
		);
		expect(() => parseMtDungeonDefinitions(TEST_XML.replace('</dungeons>', '</unknown>'))).toThrow('Mismatched');
	});
	it('rejects injected DTDs and invalid XML', () => {
		expect(() => parseMtDungeonDefinitions('<!DOCTYPE foo><dungeons/>')).toThrow('Declarations/DTDs');
		expect(() => parseMtDungeonDefinitions('<dungeons><d></dungeons>')).toThrow('Mismatched');
	});
});
