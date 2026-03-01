import { MapZone } from '../enums/MapZone.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { GameEvent } from '../events/events.js';
import { EntranceEffect } from '../fight/transpiler.js';
import { Skill } from '../skills/skillList.js';
import { Boss } from './bossList.js';
import { Monster } from './monsterList.js';

export type MonsterFiche = {
	id: Monster | Boss;
	name: string;
	boss?: boolean;
	hp: number;
	elements: { air: number; fire: number; lightning: number; water: number; wood: number };
	// bonus attack for monster
	bonus_attack?: number | undefined;
	// bonus defense for monster
	bonus_defense?: number | undefined;
	// Resilience determines how much damage a fighter takes in.
	// Damage formula is: damage^(1-resilience*0.01)
	// So each point in resilience lowers the damage receive.
	// PVP default is 40 points so 1 - 40*0.01 = 0.6 (the original number used by MT)
	// PVE (aka monsters) is case by case
	resilience: number;
	groups?: groupMonster[];
	xp?: number;
	xpBonus?: number;
	gold?: number;
	// Chance of encountering this monster.
	odds: number;
	level: number;
	zones: MapZone[];
	places?: PlaceEnum[];
	special?: boolean;
	skills?: Skill[];
	canBeCaptured: boolean;
	events?: GameEvent[];
	noMove?: boolean;
	display?: string;
	// Changes the size of the monster sprite. 100 means unchanged.
	size?: number;
	// Gives a dark color to the monster if true.
	dark?: boolean;
	// Specifies an entrance effet for the monster.
	entrance?: EntranceEffect;
	text?: {
		entrance?: string;
		death?: string;
	};
};

export type groupMonster = {
	quantity: number;
	odds: number;
};
