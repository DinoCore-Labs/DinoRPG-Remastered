import { ElementType } from '../enums/ElementType.js';
import { SkillType } from '../enums/SkillType.js';

export interface DinozSkillOwnAndUnlockable {
	learnableSkills: { skillId: number; type: SkillType; element: ElementType[] }[];
	unlockableSkills: { skillId: number; element: ElementType[] }[];
	element: number;
	name: string;
	display: string;
	level: number;
	canRelaunch: boolean;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	upChance: {
		fire: number;
		wood: number;
		water: number;
		lightning: number;
		air: number;
	};
}
