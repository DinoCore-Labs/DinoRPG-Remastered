import type { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import { describe, expect, it } from 'vitest';

import type { DetailedFight } from '../../src/utils/fight/generateFight.js';
import { completeKabukiYakuziFight, KABUKI_FIGHT_TEXT } from '../../src/utils/fight/kabukiYakuziFight.js';

const dinoz = (hp: number, id: number): DetailedFighter =>
	({
		id,
		name: `Dinoz ${id}`,
		hp,
		attacker: true,
		type: FighterType.DINOZ
	}) as unknown as DetailedFighter;

function fight(outcome: FightOutcome, fighters: DetailedFighter[]): DetailedFight {
	return { outcome, fighters, steps: [] } as unknown as DetailedFight;
}

describe('Kabuki MT — fight epilogues', () => {
	it('Forges: resurrects dead attacker Dinoz to exactly 1 HP only after victory', () => {
		const dead = dinoz(0, 100);
		const alive = dinoz(12, 101);
		const f = fight(FightOutcome.AttackerWin, [dead, alive]);
		expect(completeKabukiYakuziFight(f, 'kabuki_yakuzi_forges')).toBe(1);
		expect(dead.hp).toBe(1);
		expect(alive.hp).toBe(12);
		expect(f.steps.map(step => step.action)).toEqual(['fightText', 'heal']);
		expect(f.steps[0]).toEqual({
			action: 'fightText',
			text: { type: 'message', text: KABUKI_FIGHT_TEXT.yakuziRun }
		});
	});

	it('Forges: no revive and no message if defeated', () => {
		const dead = dinoz(0, 100);
		const f = fight(FightOutcome.DefenderWin, [dead]);
		expect(completeKabukiYakuziFight(f, 'kabuki_yakuzi_forges')).toBe(0);
		expect(dead.hp).toBe(0);
		expect(f.steps).toEqual([]);
	});

	it('Gorges: original ending message, no Dinoz resurrection', () => {
		const dead = dinoz(0, 100);
		const f = fight(FightOutcome.AttackerWin, [dead]);
		expect(completeKabukiYakuziFight(f, 'kabuki_yakuzi_gorges')).toBe(0);
		expect(dead.hp).toBe(0);
		expect(f.steps).toEqual([
			{
				action: 'fightText',
				text: { type: 'message', text: KABUKI_FIGHT_TEXT.strangeDinoz }
			}
		]);
	});

	it('does not change unrelated fights', () => {
		const dead = dinoz(0, 100);
		const f = fight(FightOutcome.AttackerWin, [dead]);
		expect(completeKabukiYakuziFight(f, undefined)).toBe(0);
		expect(dead.hp).toBe(0);
		expect(f.steps).toEqual([]);
	});
});
