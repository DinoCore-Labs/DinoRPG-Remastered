import { DinozFiche } from '../dinoz/dinozFiche.js';
import { DinozStatusId } from '../dinoz/statusList.js';
import { ElementType } from '../enums/ElementType.js';
import { MathOperator } from '../enums/Parser.js';
import { Item, itemList } from '../items/itemList.js';
import { operatorProcess } from '../utils/operatorProcess.js';
import { SkillDetails } from './skillDetails.js';
import { Skill, skillList } from './skillList.js';

export enum SpecialStat {
	// Unique
	HP_REGEN = 'hpRegen',
	INITIATIVE = 'initiative',
	ENERGY = 'energy',
	ENERGY_RECOVERY = 'energyRecovery',
	MAX_FOLLOWERS = 'maxFollowers',
	BUBBLE_RATE = 'bubbleRate',
	TORCH_DAMAGE = 'torchDamage',
	ACID_BLOOD_DAMAGE = 'acidBloodDamage',
	// Counters
	COUNTER = 'counter',
	// FIRE_COUNTER = 'fireCounter',
	// WOOD_COUNTER = 'woodCounter',
	// WATER_COUNTER = 'waterCounter',
	// LIGHTNING_COUNTER = 'lightningCounter',
	// AIR_COUNTER = 'airCounter',
	// VOID_COUNTER = 'voidCounter',
	// Armors
	ARMOR = 'armor',
	// FIRE_ARMOR = 'fireArmor',
	// WOOD_ARMOR = 'woodArmor',
	// WATER_ARMOR = 'waterArmor',
	// LIGHTNING_ARMOR = 'lightningArmor',
	// AIR_ARMOR = 'airArmor',
	// VOID_ARMOR = 'voidArmor',
	// Armor Ignores
	ARMOR_BREAK = 'armorBreak',
	// ASSAULT_IGNORE_ARMOR = 'assaultIgnoreArmor',
	// FIRE_IGNORE_ARMOR = 'fireIgnoreArmor',
	// WOOD_IGNORE_ARMOR = 'woodIgnoreArmor',
	// WATER_IGNORE_ARMOR = 'waterIgnoreArmor',
	// LIGHTNING_IGNORE_ARMOR = 'lightningIgnoreArmor',
	// AIR_IGNORE_ARMOR = 'airIgnoreArmor',
	// VOID_IGNORE_ARMOR = 'voidIgnoreArmor',
	// Evasions
	EVASION = 'evasion',
	// FIRE_EVASION = 'fireEvasion',
	// WOOD_EVASION = 'woodEvasion',
	// WATER_EVASION = 'waterEvasion',
	// LIGHTNING_EVASION = 'lightningEvasion',
	// AIR_EVASION = 'airEvasion',
	// VOID_EVASION = 'voidEvasion',
	// Super evasions
	SUPER_EVASION = 'superEvasion',
	// FIRE_SUPER_EVASION = 'fireSuperEvasion',
	// WOOD_SUPER_EVASION = 'woodSuperEvasion',
	// WATER_SUPER_EVASION = 'waterSuperEvasion',
	// LIGHTNING_SUPER_EVASION = 'lightningSuperEvasion',
	// AIR_SUPER_EVASION = 'airSuperEvasion',
	// VOID_SUPER_EVASION = 'voidSuperEvasion',
	// Multihits
	MULTIHIT = 'multihit',
	// FIRE_MULTIHIT = 'fireMultihit',
	// WOOD_MULTIHIT = 'woodMultihit',
	// WATER_MULTIHIT = 'waterMultihit',
	// LIGHTNING_MULTIHIT = 'lightningMultihit',
	// AIR_MULTIHIT = 'airMultihit',
	// VOID_MULTIHIT = 'voidMultihit',
	// Speeds
	SPEED = 'speed',
	FIRE_SPEED = 'fireSpeed',
	WOOD_SPEED = 'woodSpeed',
	WATER_SPEED = 'waterSpeed',
	LIGHTNING_SPEED = 'lightningSpeed',
	AIR_SPEED = 'airSpeed',
	// VOID_SPEED = 'voidSpeed'
	// Critical Hit Chance
	CRITICAL_HIT_CHANCE = 'criticalHitChance',
	// Critical Hit Damage
	CRITICAL_HIT_DAMAGE = 'criticalHitDamage'
}

// Special statistics handled as a %.
// Base is 1. Multiplier are  used as 1.x (for x%)
// But then when attemping a roll, you have a deduce 1.
export enum SpecialStatAsPercent {
	// Uniques
	BUBBLE_RATE = 'bubbleRate',
	// Counters
	COUNTER = 'counter',
	// FIRE_COUNTER = 'fireCounter',
	// WOOD_COUNTER = 'woodCounter',
	// WATER_COUNTER = 'waterCounter',
	// LIGHTNING_COUNTER = 'lightningCounter',
	// AIR_COUNTER = 'airCounter',
	// VOID_COUNTER = 'voidCounter',
	// Armors
	ARMOR = 'armor',
	// FIRE_ARMOR = 'fireArmor',
	// WOOD_ARMOR = 'woodArmor',
	// WATER_ARMOR = 'waterArmor',
	// LIGHTNING_ARMOR = 'lightningArmor',
	// AIR_ARMOR = 'airArmor',
	// VOID_ARMOR = 'voidArmor',
	// Armor Ignores
	ARMOR_BREAK = 'armorBreak',
	// ASSAULT_IGNORE_ARMOR = 'assaultIgnoreArmor',
	// FIRE_IGNORE_ARMOR = 'fireIgnoreArmor',
	// WOOD_IGNORE_ARMOR = 'woodIgnoreArmor',
	// WATER_IGNORE_ARMOR = 'waterIgnoreArmor',
	// LIGHTNING_IGNORE_ARMOR = 'lightningIgnoreArmor',
	// AIR_IGNORE_ARMOR = 'airIgnoreArmor',
	// VOID_IGNORE_ARMOR = 'voidIgnoreArmor',
	// Evasions
	EVASION = 'evasion',
	// FIRE_EVASION = 'fireEvasion',
	// WOOD_EVASION = 'woodEvasion',
	// WATER_EVASION = 'waterEvasion',
	// LIGHTNING_EVASION = 'lightningEvasion',
	// AIR_EVASION = 'airEvasion',
	// VOID_EVASION = 'voidEvasion',
	// Super evasions
	SUPER_EVASION = 'superEvasion',
	// FIRE_SUPER_EVASION = 'fireSuperEvasion',
	// WOOD_SUPER_EVASION = 'woodSuperEvasion',
	// WATER_SUPER_EVASION = 'waterSuperEvasion',
	// LIGHTNING_SUPER_EVASION = 'lightningSuperEvasion',
	// AIR_SUPER_EVASION = 'airSuperEvasion',
	// VOID_SUPER_EVASION = 'voidSuperEvasion',
	// Multihits
	MULTIHIT = 'multihit',
	// FIRE_MULTIHIT = 'fireMultihit',
	// WOOD_MULTIHIT = 'woodMultihit',
	// WATER_MULTIHIT = 'waterMultihit',
	// LIGHTNING_MULTIHIT = 'lightningMultihit',
	// AIR_MULTIHIT = 'airMultihit',
	// VOID_MULTIHIT = 'voidMultihit'
	CRITICAL_HIT_CHANCE = 'criticalHitChance',
	CRITICAL_HIT_DAMAGE = 'criticalHitDamage'
}

export enum UniqueSpecialStatUsedInFights {
	INITIATIVE = 'initiative',
	ENERGY = 'energy',
	ENERGY_RECOVERY = 'energyRecovery',
	BUBBLE_RATE = 'bubbleRate',
	TORCH_DAMAGE = 'torchDamage',
	ACID_BLOOD_DAMAGE = 'acidBloodDamage'
}

export type SpecialStatUsedInFights = Exclude<SpecialStat, SpecialStat.HP_REGEN | SpecialStat.MAX_FOLLOWERS>;

export const BaseSpecialStats = {
	...Object.values(SpecialStat).reduce(
		(acc, value) => {
			acc[value] = 0;
			return acc;
		},
		{} as Record<SpecialStat, number>
	),
	[SpecialStat.HP_REGEN]: 1,
	[SpecialStat.ENERGY]: 100,
	[SpecialStat.ENERGY_RECOVERY]: 1,
	[SpecialStat.MAX_FOLLOWERS]: 2,
	// Speeds
	[SpecialStat.SPEED]: 1,
	[SpecialStat.FIRE_SPEED]: 1,
	[SpecialStat.WOOD_SPEED]: 1,
	[SpecialStat.WATER_SPEED]: 1,
	[SpecialStat.LIGHTNING_SPEED]: 1,
	[SpecialStat.AIR_SPEED]: 1,
	// [SpecialStat.VOID_SPEED]: 1
	[SpecialStat.CRITICAL_HIT_DAMAGE]: 0.5
};

export const getSpecialStat = (
	dinoz: Pick<DinozFiche, 'items' | 'nbrUpFire' | 'nbrUpWood' | 'nbrUpLightning' | 'nbrUpAir' | 'nbrUpWater'>,
	statuses: DinozStatusId[],
	skills: Pick<SkillDetails, 'id' | 'effects' | 'name' | 'element'>[],
	stat: SpecialStat,
	PRIEST?: boolean
) => {
	// Special case for BUBBLE_RATE (value not influenced by skills)
	if (stat === SpecialStat.BUBBLE_RATE) {
		// Return null if no bubble skill
		if (!skills.some(skill => skill.id === Skill.BULLE)) {
			return null;
		}

		// (Water + Air) / All
		const value =
			((dinoz.nbrUpWater || 0) + (dinoz.nbrUpAir || 0)) /
			((dinoz.nbrUpWater || 0) +
				(dinoz.nbrUpWood || 0) +
				(dinoz.nbrUpFire || 0) +
				(dinoz.nbrUpLightning || 0) +
				(dinoz.nbrUpAir || 0));

		return {
			name: 'bubbleRate',
			percent: true,
			multiplier: false,
			// Clamp value between 30% and 100%
			value: value < 0.3 ? 0.3 : value
		};
	}

	// Special case for TORCH_DAMAGE (value not influenced by skills)
	if (stat === SpecialStat.TORCH_DAMAGE) {
		// Return null if no lighter in inventory and no torch skill
		if (
			!dinoz.items?.some(item => item === itemList[Item.ZIPPO].itemId) &&
			!skills.some(skill => skill.id === Skill.TORCHE)
		) {
			return null;
		}

		return {
			name: 'torchDamage',
			// Fire
			value: dinoz.nbrUpFire || 1,
			details: [
				{
					type: 'base',
					name: 'base',
					percent: false,
					multiplier: false,
					elements: ['fire'],
					value: dinoz.nbrUpFire || 1
				}
			]
		};
	}

	// Special case for ACID_BLOOD_DAMAGE (value not influenced by skills)
	if (stat === SpecialStat.ACID_BLOOD_DAMAGE) {
		// Return null if no acid blood skill
		if (!skills.some(skill => skill.id === Skill.SANG_ACIDE)) {
			return null;
		}

		return {
			name: 'acidBloodDamage',
			// Water / 2
			value: Math.ceil((dinoz.nbrUpWater || 0) / 2),
			details: [
				{
					type: 'base',
					name: 'base',
					percent: false,
					multiplier: false,
					elements: ['water'],
					value: dinoz.nbrUpWater || 0
				}
			]
		};
	}

	let value = BaseSpecialStats[stat];
	let base_stat = value;
	let multiplier = 1;
	let details: {
		type: 'skill' | 'item' | 'status' | 'base';
		name: string;
		percent: boolean;
		multiplier: boolean;
		elements: string[];
		value: number;
	}[] = [];

	const percent = (Object.values(SpecialStatAsPercent) as string[]).includes(stat);

	// Add base details if not 0
	if (value !== 0) {
		details.push({
			type: 'base',
			name: 'base',
			percent,
			multiplier: false,
			elements: [],
			value: percent ? value * 100 : value
		});
	}

	// Start as 1 for percent stats to allow multiplication
	if (percent) {
		value += 1;
	}

	// Apply bonuses from statuses
	statuses.forEach(status => {
		switch (status) {
			case DinozStatusId.CUSCOUZ_MALEDICTION: {
				if (stat === SpecialStat.ARMOR) {
					value *= 0.7;

					details.push({
						type: 'status',
						name: DinozStatusId.CUSCOUZ_MALEDICTION.toString(),
						percent: true,
						multiplier: true,
						elements: [],
						value: 0.7
					});
				}
				break;
			}
			default:
				break;
		}
	});

	// Apply bonuses from skills
	skills.forEach(skill => {
		if (!skill.effects) return;

		const effect = skill.effects[stat];

		if (effect && effect.operator !== MathOperator.ADD_ASSAULT) {
			value = operatorProcess(value, effect);

			const percent = (Object.values(SpecialStatAsPercent) as string[]).includes(stat.toString());

			let finalValue;
			if (percent) {
				// Multiply by 100 for a percent
				finalValue = Math.round(effect.value * 100);
			} else {
				// Other use the effect value
				finalValue = effect.value;
			}
			if (base_stat > 0) {
				// For multipliers, add 1 to the final value so it shows as "x 1.20" (for example)
				finalValue += 1;
			}

			details.push({
				type: 'skill',
				name: skill.name,
				percent,
				multiplier: effect.operator === MathOperator.MULTIPLY,
				elements: skill.element.map(
					el =>
						Object.entries(ElementType)
							.find(([, value]) => value === el)?.[0]
							.toLocaleLowerCase() || ''
				),
				value: effect.value
			});
		}
	});

	// Apply bonuses from items
	dinoz.items.forEach(item_id => {
		const item = itemList[item_id as Item];

		if (!item.passiveEffect) return;

		const effect = item.passiveEffect[stat];
		const isAddition = typeof effect === 'number';

		if (effect) {
			// let effectValue = 0;
			let effectValue = operatorProcess(0, effect);
			if (effect.operator === MathOperator.ADD) {
				value += effect.value;
			}
			if (effect.operator === MathOperator.MULTIPLY) {
				multiplier *= effect.value;
			}

			const percent = (Object.values(SpecialStatAsPercent) as string[]).includes(stat.toString());

			let finalValue;
			if (percent) {
				// Multiply by 100 for a percent
				finalValue = Math.round(effectValue * 100);
			} else {
				// Other use the effect value
				finalValue = effectValue;
			}
			if (base_stat > 0 && !isAddition) {
				// For multipliers, add 1 to the final value so it shows as "x 1.20" (for example)
				finalValue += 1;
			}

			details.push({
				type: 'item',
				name: item.name,
				percent,
				multiplier: !isAddition,
				elements: [],
				value: finalValue
			});
		}
	});

	// Apply bonuses from priest
	if (stat === SpecialStat.HP_REGEN && PRIEST) {
		value++;
		details.push({
			type: 'skill',
			name: skillList[Skill.PRETRE].name,
			percent: false,
			multiplier: false,
			elements: [],
			value: 1
		});
	}

	// Order details by value type (multiplier last) (base first)
	details = details.sort((a, b) => {
		if (a.type === b.type) {
			return a.percent === b.percent ? 0 : a.percent ? 1 : -1;
		}

		return a.type === 'base' ? -1 : 1;
	});

	return {
		name: stat,
		percent,
		value: +(value * multiplier),
		details
	};
};
