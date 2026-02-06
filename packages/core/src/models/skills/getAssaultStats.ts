import { DinozFiche } from '../dinoz/dinozFiche.js';
import { DinozStatusId } from '../dinoz/statusList.js';
import { ElementType } from '../enums/ElementType.js';
import { MathOperator } from '../enums/Parser.js';
import { Stat } from '../enums/SkillStat.js';
import { SkillDetails } from './skillDetails.js';

export enum AssaultElement {
	FIRE = 'fire',
	WOOD = 'wood',
	WATER = 'water',
	LIGHTNING = 'lightning',
	AIR = 'air'
}

export const getAssaultStat = (
	dinoz: Pick<DinozFiche, 'nbrUpFire' | 'nbrUpWood' | 'nbrUpLightning' | 'nbrUpAir' | 'nbrUpWater'>,
	statuses: DinozStatusId[],
	skills: Pick<SkillDetails, 'effects' | 'name' | 'element'>[],
	elementName: AssaultElement,
	power = 5
) => {
	let element = 0;
	switch (elementName) {
		case 'fire':
			element = dinoz.nbrUpFire || 0;
			break;
		case 'wood':
			element = dinoz.nbrUpWood || 0;
			break;
		case 'lightning':
			element = dinoz.nbrUpLightning || 0;
			break;
		case 'air':
			element = dinoz.nbrUpAir || 0;
			break;
		case 'water':
			element = dinoz.nbrUpWater || 0;
			break;
		default:
			throw new Error(`Element ${elementName} not found`);
	}

	let bonus = 0;
	const details: {
		type: 'skill' | 'status' | 'element';
		name?: string;
		elements: string[];
		value: number;
	}[] = [];

	details.push({
		type: 'element',
		elements: [elementName],
		value: element
	});

	// Apply bonuses from statuses
	statuses.forEach(status => {
		switch (status) {
			case DinozStatusId.FIRE_CHARM: {
				if (elementName === AssaultElement.FIRE) {
					bonus += 3;

					details.push({
						type: 'status',
						name: DinozStatusId.FIRE_CHARM.toString(),
						elements: [],
						value: 3
					});
				}
				break;
			}
			default:
				break;
		}
	});

	// Get bonuses from skills
	skills.forEach(skill => {
		if (!skill.effects) return;

		const effect = skill.effects[`${elementName}Assault`];

		if (effect) {
			// Flat value
			if (effect.operator !== MathOperator.ADD_ASSAULT) {
				bonus += effect.value;
				details.push({
					type: 'skill',
					name: skill.name,
					elements: skill.element.map(
						element =>
							Object.entries(ElementType)
								.find(([, value]) => value === element)?.[0]
								.toLocaleLowerCase() || ''
					),
					value: effect.value
				});
			} else {
				// Other element value
				let otherElementValue = 0;
				switch (effect.valueAssault) {
					case Stat.FIRE_ASSAULT:
						otherElementValue = dinoz.nbrUpFire || 0;
						break;
					case Stat.WOOD_ASSAULT:
						otherElementValue = dinoz.nbrUpWood || 0;
						break;
					case Stat.LIGHTNING_ASSAULT:
						otherElementValue = dinoz.nbrUpLightning || 0;
						break;
					case Stat.AIR_ASSAULT:
						otherElementValue = dinoz.nbrUpAir || 0;
						break;
					case Stat.WATER_ASSAULT:
						otherElementValue = dinoz.nbrUpWater || 0;
						break;
					default:
						break;
				}

				bonus += otherElementValue;
				details.push({
					type: 'skill',
					name: skill.name,
					elements: skill.element.map(
						element =>
							Object.entries(ElementType)
								.find(([, value]) => value === element)?.[0]
								.toLocaleLowerCase() || ''
					),
					value: otherElementValue
				});
			}
		}
	});

	const result = element * power + bonus;

	return {
		name: elementName,
		value: result,
		base: element,
		bonus,
		details
	};
};
