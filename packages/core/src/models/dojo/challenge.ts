import type { FullFightStats } from '../fight/fightResult.js';

export enum ChallengeType {
	// Beat the opponent
	Kill = 'kill',
	// Receive less than N attacks
	TakeAttackQuantity = 'takeAttack',
	// Lose less than N hp
	TakeRawDamage = 'takeRawDmg',
	// Lose less than X% of hp
	TakePercentDamage = 'takePrctDmg',
	// Do at least N assaults
	Assault = 'assault',
	// X% of attacks are assaults
	AssaultPercentage = 'assaultPrct',
	// Deal up to N damage
	DealDamage = 'maxDmg',
	// Deal at least X% of starting hp
	DealPercentDamage = 'minPrctDmg',
	// Counter a minimum of N times
	CounterAttack = 'counter',
	// Dodge a minimum of N times
	Dodge = 'dodge',
	// Never get poisoned
	DodgePoison = 'noPoison',
	// Poison the opponent at least once
	PoisonOpponent = 'poison'
}

export type Challenge = {
	type: ChallengeType;
	goal: number;
};

export const challengeRanges: Readonly<Record<ChallengeType, [number, number]>> = {
	[ChallengeType.Kill]: [1, 1],
	[ChallengeType.TakeAttackQuantity]: [8, 15],
	[ChallengeType.TakeRawDamage]: [40, 100],
	[ChallengeType.TakePercentDamage]: [40, 80],
	[ChallengeType.Assault]: [2, 10],
	[ChallengeType.AssaultPercentage]: [10, 50],
	[ChallengeType.DealDamage]: [70, 100],
	[ChallengeType.DealPercentDamage]: [25, 75],
	[ChallengeType.CounterAttack]: [1, 2],
	[ChallengeType.Dodge]: [1, 2],
	[ChallengeType.DodgePoison]: [1, 1],
	[ChallengeType.PoisonOpponent]: [1, 1]
};

export function parseChallenge(challenge: Challenge, stats: FullFightStats) {
	switch (challenge.type) {
		case ChallengeType.Kill:
			return stats.defense.endingHp;
		case ChallengeType.TakeAttackQuantity:
			return stats.attack.times_attacked - challenge.goal;
		case ChallengeType.TakeRawDamage:
			return stats.attack.hpLost - challenge.goal;
		case ChallengeType.TakePercentDamage:
			return ((stats.attack.startingHp - stats.attack.endingHp) / stats.attack.startingHp) * 100 - challenge.goal;
		case ChallengeType.Assault:
			return challenge.goal - stats.attack.assaults;
		case ChallengeType.AssaultPercentage:
			return challenge.goal - (stats.attack.assaults / stats.attack.attacks) * 100;
		case ChallengeType.DealDamage:
			return stats.defense.hpLost - challenge.goal;
		case ChallengeType.DealPercentDamage:
			return challenge.goal - ((stats.defense.startingHp - stats.defense.endingHp) / stats.defense.startingHp) * 100;
		case ChallengeType.CounterAttack:
			return challenge.goal - stats.attack.counters;
		case ChallengeType.Dodge:
			return challenge.goal - stats.attack.evasions;
		case ChallengeType.DodgePoison:
			return stats.defense.poisoned;
		case ChallengeType.PoisonOpponent:
			return 1 - stats.attack.poisoned;
		default:
			return 0;
	}
}
