import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { describe, expect, it } from 'vitest';

import { stageKabukiTotemOpening } from '../../src/Scenario/Controller/kabukiTotemOpening.js';
import type { DetailedFight } from '../../src/utils/fight/generateFight.js';

const roster = [
	['igor', false],
	['Barbara', false],
	['Choupette', false],
	['Poupoule', false],
	['yakuzi', true],
	['Ninjutsu', true],
	['Kage', true]
] as const;

function fixture() {
	const fighters = roster.map(([name, attacker], index) => ({ id: 100 + index, name, attacker }));
	const steps: FightStep[] = [
		{
			action: 'prepare',
			dinozList: [],
			monsterList: fighters.map(f => ({ fid: f.id, statusList: [] }))
		}
	];
	return { fighters, steps } as unknown as Pick<DetailedFight, 'fighters' | 'steps'>;
}

describe('Kabuki Totem: real onStartFight reinforcement staging', () => {
	it('keeps Igor but not delayed characters in the initial prepare roster', () => {
		const fight = fixture();
		stageKabukiTotemOpening(fight);
		const prepare = fight.steps[0];
		if (!prepare || prepare.action !== 'prepare') throw new Error('prepare missing');
		expect(prepare.monsterList.map(f => f.fid)).toEqual([100]);
	});
	it('adds all six reinforcements in the original Motion Twin order', () => {
		const fight = fixture();
		stageKabukiTotemOpening(fight);
		expect(fight.steps.filter(s => s.action === 'arrive').map(s => s.action === 'arrive' && s.fid)).toEqual([
			101, 102, 103, 104, 105, 106
		]);
		expect(fight.fighters.map(f => f.name)).toEqual([
			'igor',
			'Barbara',
			'Choupette',
			'Poupoule',
			'yakuzi',
			'Ninjutsu',
			'Kage'
		]);
	});
	it('preserves the introductory talk/arrive timeline', () => {
		const fight = fixture();
		stageKabukiTotemOpening(fight);
		expect(fight.steps[1]).toMatchObject({ action: 'fightText', text: { speakerFid: 100 } });
		expect(fight.steps.at(-1)).toMatchObject({ action: 'fightText', text: { speakerFid: 104 } });
	});
	it('preserves the shared fighters array used by the engine recap', () => {
		const fight = fixture();
		const recapFighters = fight.fighters;
		stageKabukiTotemOpening(fight);
		expect(fight.fighters).toBe(recapFighters);
		const summoned = { id: 999, name: 'Summoned', attacker: true };
		fight.fighters.push(summoned as (typeof fight.fighters)[number]);
		expect(recapFighters.some(f => f.id === 999)).toBe(true);
	});
	it('refuses missing fighters before mutating the prepare roster', () => {
		const fight = fixture();
		fight.fighters.pop();
		expect(() => stageKabukiTotemOpening(fight)).toThrow(/Kage/);
		const prepare = fight.steps[0];
		if (!prepare || prepare.action !== 'prepare') throw new Error('prepare missing');
		expect(prepare.monsterList).toHaveLength(7);
	});
});
