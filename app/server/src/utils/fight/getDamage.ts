import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightStatus } from '@dinorpg/core/models/fight/fightStatus.js';
import { ASSAULT_POWER, ATTACK_GLOBAL_FACTOR } from '@dinorpg/core/utils/fightConstants.js';

import { SeededRandom } from '../prng.js';
import { hasStatus } from './fightMethods.js';
import { getFighterArmor, getFighterArmorBreak, getFighterCriticalHitDamage } from './getFighters.js';

const BASE_ATTACK_VALUE = 2;
const BASE_DEFENSE_VALUE = 0;

// Gets the assault value for a given element
// Does not take into account multipliers and next-assault-type bonuses
export const getAssaultValue = (fighter: DetailedFighter, element: ElementType, power?: number) => {
	return fighter.stats.base[element] * (power || ASSAULT_POWER) + fighter.stats.assaultBonus[element];
};

// Applies target resilience to damage (default in PVP is x^0.6, PVE is case by case)
export const applyResilienceToDamage = (target: DetailedFighter, damage: number) => {
	// Each point of resilience lowers the factor by 0.01
	// Minimum is 0.5
	// Maximum is 1.1
	let factor = Math.max(Math.min(1 - target.resilience * 0.01, 1.1), 0.5);

	return Math.round(Math.pow(Math.max(damage, 0), factor));
};

// Calculates the attack power for a given element, the fighter and the power of the attack
export const getElementalAttack = (fighter: DetailedFighter, element_type: ElementType, power: number) => {
	return [[element_type, fighter.stats.base[element_type] * power]] as [ElementType, number][];
};

// Calculates the attack power for multiple elements, the fighter and the power of the attack
export const getMultiElementalAttack = (fighter: DetailedFighter, element_type_power: [ElementType, number][]) => {
	// let air_attack = 0;
	// let fire_attack = 0;
	// let lightning_attack = 0;
	// let water_attack = 0;
	// let wood_attack = 0;
	// let void_attack = 0;

	// element_type_power.forEach(val => {
	// 	let ele = val[0];
	// 	let power = val[1];

	// if (ele === ElementType.AIR) {
	// 	air_attack = power * fighter.stats.base[ElementType.AIR];
	// }
	// else if (ele === ElementType.FIRE) {
	// 	fire_attack = power * fighter.stats.base[ElementType.FIRE];
	// }
	// else if (ele === ElementType.LIGHTNING) {
	// 	lightning_attack = power * fighter.stats.base[ElementType.LIGHTNING];
	// }
	// else if (ele === ElementType.WATER) {
	// 	water_attack = power * fighter.stats.base[ElementType.WATER];
	// }
	// else if (ele === ElementType.WOOD) {
	// 	wood_attack = power * fighter.stats.base[ElementType.WOOD];
	// }
	// else if (ele === ElementType.VOID) {
	// 	void_attack = power * fighter.stats.base[ElementType.VOID];
	// }
	// });

	return element_type_power.map(val => {
		let ele = val[0];
		let power = val[1];
		return [ele, fighter.stats.base[ele] * power];
	}) as [ElementType, number][];

	// return {
	// 	[ElementType.AIR]: air_attack,
	// 	[ElementType.FIRE]: fire_attack,
	// 	[ElementType.LIGHTNING]: lightning_attack,
	// 	[ElementType.WATER]: water_attack,
	// 	[ElementType.WOOD]: wood_attack,
	// 	[ElementType.VOID]: void_attack,
	// };
};

// Returns the attack and defense score for a given attack considering the various bonuses
// of the attacker and the target
// Note: calling this method resets the attacker's next assault bonuses (multiplier and additive)
export const getAttackDefense = (
	attacker: DetailedFighter,
	target: DetailedFighter,
	element_attack: [ElementType, number][],
	isCloseCombat: boolean
) => {
	let attack = BASE_ATTACK_VALUE;
	let defense = BASE_DEFENSE_VALUE;
	let sum_of_elements = 0;
	let elements: ElementType[] = [];

	// Go over all the elements of the attack
	// Add the attacker's elemental attack and possible bonus to the attack score
	// Add the target's elemental defense
	element_attack.forEach(val => {
		const ele = val[0];
		const att = val[1];
		elements.push(ele);
		attack += att;
		sum_of_elements += att;
		if (att > 0) {
			defense += target.stats.defense[ele] * att;
			if (isCloseCombat) {
				attack += attacker.stats.assaultBonus[ele];
			} else {
				attack += attacker.skillElementalBonus[ele];
			}
		}
	});

	// Add close combat specific bonuses
	if (isCloseCombat) {
		attack += attacker.nextAssaultBonus;
		attack *= attacker.nextAssaultMultiplier * attacker.allAssaultMultiplier;
		attacker.nextAssaultBonus = 0;
		attacker.nextAssaultMultiplier = 1;
	}

	// TODO this needs to be reworked, see Abysse
	// -25% to attack score if attacker is WEAKENED
	if (hasStatus(attacker, FightStatus.WEAKENED)) {
		attack *= 0.75;
	}

	// Average the defense in case of multi-element attack
	if (sum_of_elements > 0) {
		defense /= sum_of_elements;
	}

	return {
		attack,
		defense,
		elements
	};
};

// Applies final factors to the attack score:
// - random bonus of up to 33%
// - global factor
export const calculateDamage = (
	random: SeededRandom,
	attacker: DetailedFighter,
	target: DetailedFighter,
	attack: number,
	defense: number,
	isCloseCombat: boolean,
	isCritical: boolean
) => {
	// Apply critical hit damage for assaults
	if (isCloseCombat && isCritical) {
		let crit_bonus = getFighterCriticalHitDamage(attacker);
		attack *= crit_bonus;
	}

	// Apply random factor
	const random_attack_bonus = (random() * attack) / 3;
	attack += random_attack_bonus;

	// Apply global factor
	attack *= ATTACK_GLOBAL_FACTOR;

	// Start damage calculation
	let damage = attack;

	// Apply target's armor to the attack unless the attacker cancels it
	// E.g. 10% armor, means the attack is multiplied by 0,9
	if (!attacker.cancelArmor) {
		// Armor break only counters armor
		damage *= 1 - Math.max(0, getFighterArmor(target) - getFighterArmorBreak(attacker));
	}

	// Substract the defense
	damage -= defense;

	// If the attacker or target is a monster, reinforcement, or boss, apply the attacker's resilience.
	// Else, apply the target resilience by default.
	if (
		attacker.type === FighterType.MONSTER ||
		attacker.type === FighterType.REINFORCEMENT ||
		attacker.type === FighterType.BOSS
	) {
		damage = applyResilienceToDamage(attacker, damage);
	} else {
		// This covers also the target being a monster, reinforcement or boss.
		damage = applyResilienceToDamage(target, damage);
	}

	// Check for global minimum damage
	if (damage < attacker.minDamage) {
		damage = attacker.minDamage;
	}

	// Check for assault specific minimum damage
	if (isCloseCombat && damage < attacker.minAssaultDamage) {
		damage = attacker.minAssaultDamage;
	}

	return damage;
};
