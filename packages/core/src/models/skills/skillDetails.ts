import { ElementType } from '../enums/ElementType.js';
import { Energy } from '../enums/Energy.js';
import { MathOperator } from '../enums/Parser.js';
import { RaceEnum } from '../enums/Race.js';
import { Stat } from '../enums/SkillStat.js';
import { SkillTreeType } from '../enums/SkillTreeType.js';
import { SkillType } from '../enums/SkillType.js';
import { SkillVisualEffect } from '../enums/SkillVisualEffect.js';
import { AuraFxType, DamagesEffect, GotoEffect, LifeEffect, SkillFxType } from '../fight/transpiler.js';
import { SkillFightCondition } from './skillFightCondition.js';
import { Skill } from './skillList.js';

type OtherAssaults<T> = Exclude<
	Stat.FIRE_ASSAULT | Stat.WATER_ASSAULT | Stat.AIR_ASSAULT | Stat.LIGHTNING_ASSAULT | Stat.WOOD_ASSAULT,
	T
>;

export type PassiveEffects = {
	[Stat.MAX_HP]?: EffectDescriptor;
	[Stat.HP_REGEN]?: EffectDescriptor;
	[Stat.MAX_FOLLOWERS]?: EffectDescriptor;
	[Stat.INITIATIVE]?: EffectDescriptor;
	[Stat.ENERGY]?: EffectDescriptor;
	[Stat.ENERGY_RECOVERY]?: EffectDescriptor;
	// Elements
	[Stat.FIRE_ELEMENT]?: EffectDescriptor;
	[Stat.WOOD_ELEMENT]?: EffectDescriptor;
	[Stat.WATER_ELEMENT]?: EffectDescriptor;
	[Stat.LIGHTNING_ELEMENT]?: EffectDescriptor;
	[Stat.AIR_ELEMENT]?: EffectDescriptor;
	// Speeds
	[Stat.SPEED]?: EffectDescriptor;
	[Stat.FIRE_SPEED]?: EffectDescriptor;
	[Stat.WOOD_SPEED]?: EffectDescriptor;
	[Stat.WATER_SPEED]?: EffectDescriptor;
	[Stat.LIGHTNING_SPEED]?: EffectDescriptor;
	[Stat.AIR_SPEED]?: EffectDescriptor;
	// [Stat.VOID_SPEED]?: [MathOperator.MULTIPLY, number];
	// Defenses
	[Stat.FIRE_DEFENSE]?: EffectDescriptor;
	[Stat.WOOD_DEFENSE]?: EffectDescriptor;
	[Stat.WATER_DEFENSE]?: EffectDescriptor;
	[Stat.LIGHTNING_DEFENSE]?: EffectDescriptor;
	[Stat.AIR_DEFENSE]?: EffectDescriptor;
	// Assaults
	[Stat.FIRE_ASSAULT]?: EffectDescriptor; // | OtherAssaults<Stat.FIRE_ASSAULT>;
	[Stat.WOOD_ASSAULT]?: EffectDescriptor; // | OtherAssaults<Stat.WOOD_ASSAULT>;
	[Stat.WATER_ASSAULT]?: EffectDescriptor; // | OtherAssaults<Stat.WATER_ASSAULT>;
	[Stat.LIGHTNING_ASSAULT]?: EffectDescriptor; // | OtherAssaults<Stat.LIGHTNING_ASSAULT>;
	[Stat.AIR_ASSAULT]?: EffectDescriptor; // | OtherAssaults<Stat.AIR_ASSAULT>;
	// Armors
	[Stat.ARMOR]?: EffectDescriptor;
	// [Stat.FIRE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_ARMOR]?: [MathOperator.MULTIPLY, number];
	// Counters
	[Stat.COUNTER]?: EffectDescriptor;
	// [Stat.FIRE_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_COUNTER]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_COUNTER]?: [MathOperator.MULTIPLY, number];
	// Armor ignores
	[Stat.ARMOR_BREAK]?: EffectDescriptor;
	// [Stat.ASSAULT_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.FIRE_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_IGNORE_ARMOR]?: [MathOperator.MULTIPLY, number];
	// Evasions
	[Stat.EVASION]?: EffectDescriptor;
	// [Stat.FIRE_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_EVASION]?: [MathOperator.MULTIPLY, number];
	// Super evasions
	[Stat.SUPER_EVASION]?: EffectDescriptor;
	// [Stat.FIRE_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_SUPER_EVASION]?: [MathOperator.MULTIPLY, number];
	// Multihits
	[Stat.MULTIHIT]?: EffectDescriptor;
	// [Stat.FIRE_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.WOOD_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.WATER_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.LIGHTNING_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.AIR_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// [Stat.VOID_MULTIHIT]?: [MathOperator.MULTIPLY, number];
	// Critical Hit Chance
	[Stat.CRITICAL_HIT_CHANCE]?: EffectDescriptor;
	// Critical Hit Damage
	[Stat.CRITICAL_HIT_DAMAGE]?: EffectDescriptor;
};

export type EffectDescriptor =
	| {
			operator: MathOperator.ADD | MathOperator.MULTIPLY | MathOperator.EQUAL;
			value: number;
	  }
	| {
			operator: MathOperator.ADD_ASSAULT;
			valueAssault: OtherAssaults<Stat.FIRE_ASSAULT>;
			excludedAssault: Stat.FIRE_ASSAULT;
	  }
	| {
			operator: MathOperator.ADD_ASSAULT;
			valueAssault: OtherAssaults<Stat.WATER_ASSAULT>;
			excludedAssault: Stat.WATER_ASSAULT;
	  }
	| {
			operator: MathOperator.ADD_ASSAULT;
			valueAssault: OtherAssaults<Stat.WOOD_ASSAULT>;
			excludedAssault: Stat.WOOD_ASSAULT;
	  }
	| {
			operator: MathOperator.ADD_ASSAULT;
			valueAssault: OtherAssaults<Stat.AIR_ASSAULT>;
			excludedAssault: Stat.AIR_ASSAULT;
	  }
	| {
			operator: MathOperator.ADD_ASSAULT;
			valueAssault: OtherAssaults<Stat.LIGHTNING_ASSAULT>;
			excludedAssault: Stat.LIGHTNING_ASSAULT;
	  };

export interface SkillDetails {
	id: Skill;
	name: string;
	type: SkillType;
	energy: Energy;
	element: ElementType[];
	activatable: boolean;
	state?: boolean;
	tree?: SkillTreeType;
	unlockedFrom?: Skill[];
	raceId?: RaceEnum[]; // For specific race skill (ex : fly for Pteroz)
	isBaseSkill: boolean; // If true : dinoz knows this skill when bought
	isSphereSkill: boolean; // true : the skill can only be learned with a sphere object
	effects?: PassiveEffects;
	globalEffects?: PassiveEffects;
	priority?: number;
	probability?: number;
	fightCondition?: SkillFightCondition;
	visualEffect?: SkillVisualEffect; // Effect for Skill "activate" steps
	color?: string; // Color for skill "activate" step
	speed?: number; // Speed of skill, notably used for "Projectile" and "Rafale" effects
	radius?: number; // Radius, notably used for "Generate" effect
	power?: number; // Power, notably used for "Rafale" or "Generate" effect
	anim?: string; // Animation to use for supported visual effects (ex: invocation)
	visualEffectBis?: SkillVisualEffect; // Second effect for Skill "activate" steps
	colorBis?: string; // Color for 2nd skill "activate" step
	lifeEffect?: {
		// Effect for Skill with assault effect
		fx: LifeEffect;
		amount?: number;
		size?: number;
	};
	gotoEffect?: GotoEffect; // Effect for Skill "go to" steps
	shadeColor?: {
		col1?: number;
		col2?: number;
	};
	damageEffect?: DamagesEffect;
	fxType?: AuraFxType | SkillFxType | number; // Used for Aura, Skill, Healing or Snow effects
	fx?: string;
}
