import type { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { describe, expect, it } from 'vitest';

import type { DetailedFight } from '../../src/utils/fight/generateFight.js';
import { setGorgesYakuziInitialLife, summonKabukiAtGorges } from '../../src/utils/fight/kabukiYakuziFight.js';

const boss = (hp: number) =>
	({
		id: 1,
		name: 'yakuzi',
		attacker: false,
		type: FighterType.BOSS,
		hp,
		maxHp: 50,
		startingHp: 50,
		escaped: false,
		time: 0,
		skills: []
	}) as unknown as DetailedFighter;

function mockFight(yakuzi: DetailedFighter): DetailedFight {
	return {
		fighters: [yakuzi],
		steps: [],
		time: 0,
		place: 49,
		rng: () => 0.5
	} as unknown as DetailedFight;
}

describe('Kabuki MT — Gorges', () => {
	it('uses original yakkb1 stats', () => {
		const monster = monsterList[Monster.KABUKI_YAKUZI];
		expect(monster.hp).toBe(100);
		expect(monster.level).toBe(10);
		expect(monster.display).toBe('E9ERKdJzrAYd5P00');
		expect(monster.canBeCaptured).toBe(false);
	});
	it('starts Yakuzi at 30 HP without changing maxHP', () => {
		const yakuzi = boss(50);
		expect(setGorgesYakuziInitialLife([yakuzi])).toBe(true);
		expect(yakuzi.hp).toBe(30);
		expect(yakuzi.startingHp).toBe(30);
		expect(yakuzi.maxHp).toBe(50);
	});
	it('cannot summon while Yakuzi still fights', () => {
		const fight = mockFight(boss(1));
		expect(summonKabukiAtGorges(fight)).toBe(false);
		expect(fight.fighters).toHaveLength(1);
	});
	it('summons once on a lethal hit and Yakuzi escapes alive', () => {
		const yakuzi = boss(0);
		const fight = mockFight(yakuzi);
		expect(summonKabukiAtGorges(fight)).toBe(true);
		expect(fight.fighters).toHaveLength(2);
		const kabuki = fight.fighters[1];
		expect(kabuki.name).toBe('???');
		expect(kabuki.hp).toBe(100);
		expect(kabuki.attacker).toBe(false);
		expect(kabuki.escaped).not.toBe(true);
		expect(yakuzi.escaped).toBe(true);
		expect(yakuzi.hp).toBe(100);
		expect(fight.steps.map(step => step.action)).toEqual(['fightText', 'arrive', 'leave']);
		expect(summonKabukiAtGorges(fight)).toBe(false);
		expect(fight.fighters).toHaveLength(2);
	});
	it('does not affect unrelated bosses', () => {
		const wrong = { ...boss(0), name: 'igor' } as DetailedFighter;
		const fight = mockFight(wrong);
		expect(summonKabukiAtGorges(fight)).toBe(false);
	});
});
