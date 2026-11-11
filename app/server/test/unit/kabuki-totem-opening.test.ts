import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import type { FighterRecap } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { describe, expect, it } from 'vitest';

import { applyKabukiTotemOpening, buildKabukiTotemOpening } from '../../src/Scenario/Controller/kabukiTotemOpening.js';

const names: Array<[string, boolean]> = [
	['igor', false],
	['Barbara', false],
	['Choupette', false],
	['Poupoule', false],
	['yakuzi', true],
	['Ninjutsu', true],
	['Kage', true]
];
const roster = names.map(([name, attacker], index): FighterRecap => ({
	id: index + 101,
	name,
	attacker,
	type: FighterType.MONSTER,
	display: name,
	maxHp: 100,
	startingHp: 100,
	energy: 0,
	maxEnergy: 100,
	energyRecovery: 0
}));

describe('MT Kabuki Totem introduction', () => {
	it('replays the six arrivals in original MT order', () => {
		const steps = buildKabukiTotemOpening(roster);
		expect(
			steps.filter((s): s is Extract<FightStep, { action: 'arrive' }> => s.action === 'arrive').map(s => s.fid)
		).toEqual([102, 103, 104, 105, 106, 107]);
	});
	it('puts Igors speech before his companions, and Yakuzis help after the allies', () => {
		const steps = buildKabukiTotemOpening(roster);
		expect(steps[0]).toMatchObject({ action: 'fightText', text: { speakerFid: 101 } });
		expect(steps.at(-1)).toMatchObject({ action: 'fightText', text: { speakerFid: 105 } });
	});
	it('inserts immediately after prepare, leaving the simulated combat steps untouched', () => {
		const hit: FightStep = { action: 'arrive', fid: 999 };
		const steps: FightStep[] = [{ action: 'prepare', dinozList: [], monsterList: [] }, hit];
		applyKabukiTotemOpening({ fighters: roster, steps });
		expect(steps[0]?.action).toBe('prepare');
		expect(steps.at(-1)).toBe(hit);
		expect(steps[1]?.action).toBe('fightText');
	});
	it('fails safely when a required MT character is missing or duplicated', () => {
		expect(() => buildKabukiTotemOpening(roster.slice(1))).toThrow(/igor/);
		expect(() => buildKabukiTotemOpening([...roster, roster[0]!])).toThrow(/igor/);
	});
});
