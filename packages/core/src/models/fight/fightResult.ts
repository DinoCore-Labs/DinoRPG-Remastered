import { DinozStatusId } from '../dinoz/statusList.js';
import { ElementType } from '../enums/ElementType.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { Monster } from '../monster/monsterList.js';
import { FighterResultFiche } from './detailedFighter.js';
import { FightText } from './fightDialog.js';
import { FighterType } from './fighterType.js';
import { FightStep } from './fightStep.js';

export interface FightResult {
	fighters: FighterRecap[];
	goldEarned: number;
	xpEarned: number;
	levelUp: boolean;
	totalHpLost: number;
	result: boolean;
	history: FightStep[];
	hpLost: {
		id: number;
		hpLost: number;
	}[];
	itemsUsed: {
		id: number;
		itemsUsed: number[];
	}[];
	place: PlaceEnum;
	startText?: FightText;
	endText?: FightText;
	itemWon?: number;
	statusReward?: DinozStatusId;
}

export interface FighterRecap {
	id: number;
	type: FighterType;
	name: string;
	display: string | undefined;
	attacker: boolean;
	maxHp: number;
	startingHp: number;
	energy: number;
	maxEnergy: number;
	energyRecovery: number;
	dark?: boolean;
	size?: number;
}

export interface CatchResult {
	dinozId: number;
	monsterId: Monster;
	hp: number;
	id?: number;
}

export type FightStats = {
	// Total starting HP (initial fighters only)
	startingHp: number;

	// Total ending HP (not counting reinforcements)
	endingHp: number;

	// Total HP lost
	hpLost: number;

	// Total HP healed
	hpHealed: number;

	// Total attacks by me
	attacks: number;

	// Total attacks on me
	times_attacked: number;

	// Total multi-hits
	multiHits: number;

	// Total assaults by me
	assaults: number;

	// Total critical hits
	criticalHits: number;

	// Total assaults on me
	times_assaulted: number;

	// Total evasions
	evasions: number;

	// Total counters
	counters: number;

	// Total times poison was applied to an opponent
	poisoned: number;

	// Total damage dealt with poison to an opponent
	poison_damage: number;

	// Total times the Dinoz on the team were poisoned (not counting reinforcements)
	times_poisoned: number;

	// Total damage dealt with burn to opponents
	burn_damage: number;

	// Number of reinforcements called (e.g. clone, korgon, etc.)
	reinforcements: number;

	// Total times (not total duration) an opponent was petrified
	petrified: number;

	elements: Record<
		ElementType,
		{
			// Total damage dealt in one element
			damage_dealt: number;
			// Total number of attacks carried in one element
			attacks: number;
			// Total damage received in one element
			damage_received: number;
			// Total number of times an attack was received
			defenses: number;
		}
	>;
};

export interface FightProcessResult {
	// Seed used for the fight
	seed: string;
	// true: attackers won, false: defenders won
	winner: boolean;
	// List of attackers
	attackers: FighterResultFiche[];
	// List of defenders
	defenders: FighterResultFiche[];
	// List of catches to update
	catches: CatchResult[];
	// History of the fight
	steps: FightStep[];
	// Stats
	stats: FullFightStats;
	place: PlaceEnum;
	fighters: FighterRecap[];
}

export interface FullFightStats {
	attack: FightStats;
	defense: FightStats;
}
