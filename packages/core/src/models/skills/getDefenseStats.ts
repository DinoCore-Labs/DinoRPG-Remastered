import { DinozFiche } from '../dinoz/dinozFiche.js';
import { DinozStatusId } from '../dinoz/statusList.js';
import { ElementType } from '../enums/ElementType.js';
import { operatorProcess } from '../utils/operatorProcess.js';
import { SkillDetails } from './skillDetails.js';

export enum DefenseElement {
	FIRE = 'fire',
	WOOD = 'wood',
	WATER = 'water',
	LIGHTNING = 'lightning',
	AIR = 'air',
	NEUTRAL = 'void'
}

// Determines the defense of a given element
// For the sake of a nice break down, here we look at what elements contribute to element X
// It is given by the following matrix. Note that this matrix is different than the contribution of element X to element Y.
// Row is element of the defense \ Column is the contribution of each element to that defense
//           \  Fire  |  Wood  |  Water  | Lightning |  Air
// Fire      |    1   |  0.5   |   0.5   |     1.5   |  1.5
// Wood      |   1.5  |    1   |   0.5   |     0.5   |  1.5
// Water     |   1.5  |  1.5   |     1   |     0.5   |  0.5
// Lightning |   0.5  |  1.5   |   1.5   |       1   |  0.5
// Air       |   0.5  |  0.5   |   1.5   |     1.5   |    1
// For example: to know the factor of each element for the Air defense, look at the Air row:
// 0.5 from Fire and Wood, 1.5 from Water and Lightning and 1 from Air
// Vocabulary-wise, this can be said as:
// - Fire and Wood are weak against Air because they provide the least defense against it
// - Water and Lightning are strong against Air because they provide the most defense against it
// The "wheel" is: an element is strong against the next 2 and weak against the previous 2
// Fire -> Wood -> Water
// ^                |
// |                v
// Air    <-    Lightning
export const getDefenseStat = (
	dinoz: Pick<DinozFiche, 'nbrUpFire' | 'nbrUpWood' | 'nbrUpLightning' | 'nbrUpAir' | 'nbrUpWater'>,
	statuses: DinozStatusId[],
	skills: Pick<SkillDetails, 'effects' | 'name' | 'element' | 'globalEffects'>[],
	elementName: DefenseElement
) => {
	const elementWheel = [
		DefenseElement.FIRE,
		DefenseElement.WOOD,
		DefenseElement.WATER,
		DefenseElement.LIGHTNING,
		DefenseElement.AIR
	] as const;

	const elementStat = {
		[DefenseElement.FIRE]: dinoz.nbrUpFire || 0,
		[DefenseElement.WOOD]: dinoz.nbrUpWood || 0,
		[DefenseElement.WATER]: dinoz.nbrUpWater || 0,
		[DefenseElement.LIGHTNING]: dinoz.nbrUpLightning || 0,
		[DefenseElement.AIR]: dinoz.nbrUpAir || 0
	};

	// Sum of all elements for neutral
	if (elementName === DefenseElement.NEUTRAL) {
		return {
			name: DefenseElement.NEUTRAL,
			neutral: true,
			value: Object.values(elementStat).reduce((acc, cur) => acc + cur, 0),
			details: Object.entries(elementStat).map(([key, value]) => ({
				type: 'element',
				name: key,
				element: key,
				elements: [key],
				value,
				global: false
			}))
		};
	}

	const details: {
		type: 'skill' | 'element' | 'status';
		name?: string;
		element: string;
		elements: string[];
		value: number;
		global?: boolean;
	}[] = [];

	// x1
	const element = {
		name: elementName,
		value: elementStat[elementName],
		bonus: 0,
		globalBonus: 0
	};

	// Weak element, contributes x0.5
	const firstWeakElementName = elementWheel[(elementWheel.indexOf(elementName) + 1) % elementWheel.length];
	const firstWeakElement = {
		name: firstWeakElementName,
		value: elementStat[firstWeakElementName],
		bonus: 0,
		globalBonus: 0
	};
	const secondWeakElementName = elementWheel[(elementWheel.indexOf(elementName) + 2) % elementWheel.length];
	const secondWeakElement = {
		name: secondWeakElementName,
		value: elementStat[secondWeakElementName],
		bonus: 0,
		globalBonus: 0
	};

	// Strong element contributes x1.5
	const firstStrongElementName = elementWheel[(elementWheel.indexOf(elementName) + 3) % elementWheel.length];
	const firstStrongElement = {
		name: firstStrongElementName,
		value: elementStat[firstStrongElementName],
		bonus: 0,
		globalBonus: 0
	};
	const secondStrongElementName = elementWheel[(elementWheel.indexOf(elementName) + 4) % elementWheel.length];
	const secondStrongElement = {
		name: secondStrongElementName,
		value: elementStat[secondStrongElementName],
		bonus: 0,
		globalBonus: 0
	};

	// Get global bonuses from skills for the 5 elements
	[secondWeakElement, firstWeakElement, element, firstStrongElement, secondStrongElement].forEach((elem, index) => {
		// Status
		statuses.forEach(status => {
			switch (status) {
				case DinozStatusId.WATER_CHARM:
					{
						if (elem.name !== DefenseElement.WATER) return;

						const multiplicator = index < 2 ? 0.5 : index === 2 ? 1 : 1.5;
						element.bonus += 3 * multiplicator;

						details.push({
							type: 'status',
							name: DinozStatusId.WATER_CHARM.toString(),
							element: DefenseElement.WATER,
							elements: [],
							value: 3,
							global: true
						});
					}
					break;
				default:
					break;
			}
		});
		skills.forEach(skill => {
			if (!skill.globalEffects) return;

			const effect = skill.globalEffects[`${elem.name}Defense`];

			if (effect) {
				let valueEffect = operatorProcess(0, effect);
				// Flat value
				elem.globalBonus += valueEffect;

				details.push({
					type: 'skill',
					name: skill.name,
					element: elem.name,
					elements: skill.element.map(
						el =>
							Object.entries(ElementType)
								.find(([, value]) => value === el)?.[0]
								.toLocaleLowerCase() || ''
					),
					value: valueEffect,
					global: true
				});
			}
		});
	});

	// Get fixed bonuses from skills for the main element
	skills.forEach(skill => {
		if (!skill.effects) return;

		const effect = skill.effects[`${elementName}Defense`];

		if (effect) {
			let valueEffect = operatorProcess(0, effect);
			// Flat value
			element.bonus += valueEffect;

			details.push({
				type: 'skill',
				name: skill.name,
				element: element.name,
				elements: skill.element.map(
					el =>
						Object.entries(ElementType)
							.find(([, value]) => value === el)?.[0]
							.toLocaleLowerCase() || ''
				),
				value: valueEffect
			});
		}
	});

	// Do not ceil/round or this will mess with the fight calculation. Up to the user of the method to ceil/round.
	const result =
		0.5 * (secondWeakElement.value + secondWeakElement.globalBonus) +
		secondWeakElement.bonus +
		0.5 * (firstWeakElement.value + firstWeakElement.globalBonus) +
		firstWeakElement.bonus +
		(element.value + element.bonus + element.globalBonus) +
		1.5 * (firstStrongElement.value + firstStrongElement.globalBonus) +
		firstStrongElement.bonus +
		1.5 * (secondStrongElement.value + secondStrongElement.globalBonus) +
		secondStrongElement.bonus;

	return {
		name: elementName,
		strong1: firstStrongElement,
		strong2: secondStrongElement,
		weak1: firstWeakElement,
		weak2: secondWeakElement,
		element,
		details,
		value: result
	};
};
