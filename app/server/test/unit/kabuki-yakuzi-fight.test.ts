import type { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { describe, expect, it } from 'vitest';

import { escapeYakuziAfterDefeat } from '../../src/utils/fight/kabukiYakuziFight.js';

const boss = (hp: number, attacker = false, name = 'yakuzi') =>
	({
		id: 700,
		name,
		hp,
		attacker,
		escaped: false,
		type: FighterType.BOSS
	}) as DetailedFighter;

describe('Kabuki MT — Yakuzi at Forges', () => {
	it('leaves alive on a lethal hit, once only', () => {
		const yakuzi = boss(0);
		const steps: FightStep[] = [];
		expect(escapeYakuziAfterDefeat([yakuzi], steps)).toBe(true);
		expect(yakuzi.hp).toBe(1);
		expect(yakuzi.escaped).toBe(true);
		expect(steps).toEqual([
			{
				action: 'leave',
				fighter: {
					id: 700,
					name: 'yakuzi',
					type: FighterType.BOSS,
					attacker: false
				}
			}
		]);
		expect(escapeYakuziAfterDefeat([yakuzi], steps)).toBe(false);
		expect(steps).toHaveLength(1);
	});
	it('does nothing before defeat', () => {
		const yakuzi = boss(15);
		const steps: FightStep[] = [];
		expect(escapeYakuziAfterDefeat([yakuzi], steps)).toBe(false);
		expect(steps).toHaveLength(0);
	});
	it('cannot affect allies or unrelated bosses', () => {
		const steps: FightStep[] = [];
		expect(escapeYakuziAfterDefeat([boss(0, true), boss(0, false, 'igor')], steps)).toBe(false);
		expect(steps).toHaveLength(0);
	});
});
