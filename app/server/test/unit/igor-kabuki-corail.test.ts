import type { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import { describe, expect, it } from 'vitest';

import type { DetailedFight } from '../../src/utils/fight/generateFight.js';
import {
	finishIgorKabukiCoralFight,
	IGOR_KABUKI_TEXT,
	releaseIgorKabukiCompanions,
	reserveIgorKabukiCompanions
} from '../../src/utils/fight/igorKabukiFight.js';

const fighter = (id: number, name: string, attacker = false, hp = 100) =>
	({
		id,
		name,
		attacker,
		hp,
		startingHp: hp,
		type: attacker ? FighterType.DINOZ : FighterType.BOSS
	}) as unknown as DetailedFighter;
const battle = (fighters: DetailedFighter[], outcome: FightOutcome = FightOutcome.DefenderWin) =>
	({
		fighters,
		outcome,
		steps: []
	}) as unknown as DetailedFight;

describe('Kabuki MT — Igor at Coral Mines', () => {
	it('keeps Igor alone until his three reinforcements arrive in MT order', () => {
		const all = [
			fighter(1, 'igor'),
			fighter(2, 'Barbara'),
			fighter(3, 'Choupette'),
			fighter(4, 'Poupoule'),
			fighter(5, 'Dinoz', true)
		];
		const fight = battle(all);
		const waiting = reserveIgorKabukiCompanions(fight);
		expect(fight.fighters.map(f => f.name)).toEqual(['igor', 'Dinoz']);
		expect(waiting.map(f => f.name)).toEqual(['Barbara', 'Choupette', 'Poupoule']);
		const starting: string[] = [];
		releaseIgorKabukiCompanions(fight, waiting, (_f, f, stat) => starting.push(`${f.name}:${stat}`));
		expect(starting).toEqual(['Barbara:startingHp', 'Choupette:startingHp', 'Poupoule:startingHp']);
		expect(fight.fighters.map(f => f.name)).toEqual(['igor', 'Dinoz', 'Barbara', 'Choupette', 'Poupoule']);
		expect(fight.steps.map(s => s.action)).toEqual([
			'fightText',
			'fightText',
			'arrive',
			'fightText',
			'arrive',
			'fightText',
			'arrive'
		]);
	});
	it('forces MT victory and revives KO player Dinoz to 1 HP for persistence', () => {
		const dead = fighter(10, 'Dinoz', true, 0);
		const living = fighter(11, 'Alive', true, 16);
		const fight = battle([dead, living, fighter(1, 'igor')], FightOutcome.DefenderWin);
		expect(finishIgorKabukiCoralFight(fight)).toBe(1);
		expect(fight.outcome).toBe(FightOutcome.AttackerWin);
		expect(dead.hp).toBe(1);
		expect(living.hp).toBe(16);
		expect(fight.steps.map(s => s.action)).toEqual(['fightText', 'heal']);
		expect(fight.steps[0]).toEqual({ action: 'fightText', text: { type: 'message', text: IGOR_KABUKI_TEXT.leave } });
	});
	it('does not revive non-player enemies', () => {
		const enemy = fighter(1, 'igor', false, 0);
		const fight = battle([enemy], FightOutcome.DefenderWin);
		expect(finishIgorKabukiCoralFight(fight)).toBe(0);
		expect(enemy.hp).toBe(0);
	});
	it('does not allow a missing companion to silently become a different fight', () => {
		const fight = battle([fighter(1, 'igor'), fighter(2, 'Barbara')]);
		expect(() => reserveIgorKabukiCompanions(fight)).toThrow(/Choupette/);
	});
});
