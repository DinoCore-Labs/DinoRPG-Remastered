import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';

import { Dinoz, DinozCatch, DinozItems, DinozSkills, DinozStatus } from '../../../../prisma/index.js';

export type DinozToGetFighter = Pick<
	Dinoz,
	| 'id'
	| 'level'
	| 'name'
	| 'life'
	| 'maxLife'
	| 'nbrUpFire'
	| 'nbrUpWood'
	| 'nbrUpWater'
	| 'nbrUpLightning'
	| 'nbrUpAir'
	| 'display'
> & {
	userId: string | null;
	items: Pick<DinozItems, 'itemId'>[];
	skills: Pick<DinozSkills, 'skillId'>[];
	status: Pick<DinozStatus, 'statusId'>[];
	catches: Pick<DinozCatch, 'id' | 'hp' | 'monsterId'>[];
};

export interface FightRules {
	castleFight: boolean;
	canUseCapture: boolean;
	enableStats: boolean;
	poisonEnabled: boolean;
	canUseEquipment: boolean;
	// Permanent means non-consumable.
	canUsePermanentEquipmentOnly: boolean;
}

export const MONSTER_FIGHT_RULES: FightRules = {
	castleFight: false,
	canUseCapture: true,
	enableStats: false,
	poisonEnabled: true,
	canUseEquipment: true,
	canUsePermanentEquipmentOnly: false
};

export const DOJO_CHALLENGE_RULES: FightRules = {
	castleFight: false,
	canUseCapture: false,
	enableStats: true,
	poisonEnabled: true,
	canUseEquipment: true,
	canUsePermanentEquipmentOnly: true
};

export const STANDARD_PVP_RULES: FightRules = {
	castleFight: false,
	canUseCapture: false,
	enableStats: false,
	poisonEnabled: true,
	canUseEquipment: true,
	canUsePermanentEquipmentOnly: false
};

export interface FightConfiguration {
	// Seed
	seed: string;
	// (Optional) Timeout, forces the fight to end after some time has elapsed
	timeout?: number;
	// rules
	rules: FightRules;
	// Teams
	attackerHasCook: boolean;
	defenderHasCook: boolean;
	// Fighters
	initialDinozList: DinozToGetFighter[];
	fighters: DetailedFighter[];
	// Place
	place: PlaceEnum;
}
