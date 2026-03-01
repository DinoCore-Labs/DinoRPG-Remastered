import { DinozStatusId } from '../dinoz/statusList.js';
import { ElementType } from '../enums/ElementType.js';
import { ItemFiche } from '../items/itemFiche.js';
import { Item } from '../items/itemList.js';
import { MonsterFiche } from '../monster/monsterFiche.js';
import { SpecialStatUsedInFights } from '../skills/getSpecialStats.js';
import { SkillDetails } from '../skills/skillDetails.js';
import { Skill } from '../skills/skillList.js';
import { FighterType } from './fighterType.js';
import { FighterStatusData } from './fightStatus.js';
import { EntranceEffect } from './transpiler.js';

export interface DetailedFighter {
	// Metadata
	userId: string | null;
	id: number;
	name: string;
	level: number;
	display?: string;
	dark?: boolean;
	size?: number;
	entrance?: EntranceEffect;
	type: FighterType;
	// In case the fighter is a summon, this is the ID of the fighter that summoned them.
	master?: number;
	// Team side
	attacker: boolean;
	// Resilience determines how much damage a fighter takes in.
	// Damage formula is: damage^(1-resilience*0.01)
	// So each point in resilience lowers the damage receive.
	// PVP default is 40 points so 1 - 40*0.01 = 0.6 (the original number used by MT)
	// PVE is case by case
	resilience: number;
	escaped?: boolean;

	// Raw stats
	maxHp: number;
	startingHp: number;
	hp: number;
	energy: number;
	maxEnergy: number;
	stats: {
		base: Record<ElementType, number>;
		// Assault elemental bonuses. This includes the "allAssaultBonus" from MT too, as it is just handled as a bonus for all assault elements.
		assaultBonus: Record<ElementType, number>;
		defense: Record<ElementType, number>;
		special: Record<SpecialStatUsedInFights, number>;
		speed: Record<ElementType | 'global', number>;
	};
	// Items
	items: ItemFiche[];
	itemsUsed: number[];
	// Time of the fighter, determines whose turn it is. Fighter with the lowest time plays.
	time: number;
	// Available skills
	skills: SkillDetails[];
	// Current fight status
	status: FighterStatusData[];
	// Poisoned
	poisonedBy?: {
		id: number;
		skill: Skill;
		damage: number;
	};
	// Burned
	burnedBy?: {
		id: number;
		skill: Skill;
		damage: number;
	};
	// Elements
	elements: ElementType[];
	element: ElementType;
	locked?: number;
	// Min damage
	minDamage: number;
	minAssaultDamage: number;
	// Perception
	perception: boolean;
	// Flying
	canHitFlying: boolean;
	// Intangible
	canHitIntangible: boolean;
	// Rock
	hasRock: boolean;
	// Skill bonuses
	skillElementalBonus: Record<ElementType, number>;
	nextSkill?: SkillDetails;
	// Assault bonuses
	allAssaultMultiplier: number;
	nextAssaultBonus: number;
	nextAssaultMultiplier: number;
	// Cancel armor
	cancelArmor: boolean;
	// Cancel dodge
	cancelAssaultDodge: boolean;
	// Survival
	canSurvive?: boolean;
	// Costume
	costume?: {
		skin: MonsterFiche;
		breakable: boolean;
		item?: Item;
	};
	// Hypnotized: duration (in cycles) of the hypnosis
	hypnotized?: number;
	hasUsedHypnose: boolean;
	hasUsedHyperventilation: boolean;
	// Mud wall
	mudWall?: number;
	// Invocations
	invocations: number;
	// Protecting
	protecting?: number;
	// Absorb damage
	absorbed?: number;
	// Spikes
	spikes?: number;
	// Gold stolen
	goldStolen?: Record<number, number>;
	// Cursed
	initiallyCursed: boolean;
	permanentStatusGained: DinozStatusId[];
	// Previous target - only used for concentration
	previousTarget?: number;
	// Caught by
	catcher?: number;
	catchId?: number;
}

export interface FighterResultFiche {
	userId: string | null;
	dinozId: number;
	hpLost: number;
	itemsUsed: Item[];
	goldLost: number;
	statusGained: DinozStatusId[];
}
