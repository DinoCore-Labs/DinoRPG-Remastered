import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { MapZone } from '@dinorpg/core/models/enums/MapZone.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FighterStatusData, FightStatus } from '@dinorpg/core/models/fight/fightStatus.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { PlacesByMap } from '@dinorpg/core/models/place/placeList.js';
import { AssaultElement, getAssaultStat } from '@dinorpg/core/models/skills/getAssaultStats.js';
import { DefenseElement, getDefenseStat } from '@dinorpg/core/models/skills/getDefenseStats.js';
import { getSpecialStat, SpecialStat } from '@dinorpg/core/models/skills/getSpecialStats.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { TIME_BASE, TIME_FACTOR } from '@dinorpg/core/utils/fightConstants.js';

import { SeededRandom } from '../prng.js';
import { DinozToGetFighter } from './fight.mapper.js';
import { createStatus, setMaxEnergy } from './fightMethods.js';
import { DetailedFight } from './generateFight.js';
import { getAssaultValue } from './getDamage.js';
import { MonsterBonus } from './monsterBonuses.js';
import { randomBetweenSeeded } from './randomBetween.js';

interface Team {
	dinozList: DinozToGetFighter[];
	monsterList: MonsterFiche[];
	[Skill.ELECTROLYSE]?: boolean;
	[Skill.CHEF_DE_GUERRE]?: boolean;
	[Skill.GARDE_FORESTIER]?: boolean;
	[Skill.MAITRE_LEVITATEUR]?: boolean;
	[Item.EMBER]?: boolean;
	[Item.BEER]?: boolean;
}

export const initializeDinoz = (
	team: Team | null,
	teamIndex: number,
	dinoz: DinozToGetFighter,
	place: PlaceEnum,
	bossFight: boolean,
	random: SeededRandom
) => {
	// Costume
	let costume: MonsterFiche | undefined = undefined;

	// Find items for non clone figther
	const items = dinoz.items.map(item => {
		const itemFiche = Object.values(itemList).find(i => i.itemId === item.itemId);

		if (!itemFiche) {
			throw new Error(`Item ${item.itemId} not found`);
		}

		// Add bamboo monster
		if (team && itemFiche.itemId === Item.BAMBOO_FRIEND) {
			// TODO: fix and use the right methods or do it somewhere else as it may be missed
			team.monsterList.push({ ...monsterList.BAMBOOZ_SPROUTING });
		}

		// Set costume
		if (team && itemFiche.itemId === Item.VEGETOX_COSTUME) {
			costume = monsterList.VEGETOX_GUARD;
		}
		if (team && itemFiche.itemId === Item.GOBLIN_COSTUME) {
			costume = monsterList.GOBLIN;
		}

		return { ...itemFiche };
	});

	// Find skills for non clone fighter
	const skills = dinoz.skills.map(skill => {
		const skillDetails = skillList[skill.skillId as Skill];

		if (!skillDetails) {
			throw new Error(`Skill ${skill.skillId} not found`);
		}

		return { ...skillDetails };
	});

	// Statuses
	const dinozStatus = dinoz.status.map(status => status.statusId as DinozStatusId);

	// Ignore CATCHING_GLOVE if this is a boss fight
	if (bossFight && dinozStatus.includes(DinozStatusId.CATCHING_GLOVE)) {
		dinozStatus.splice(dinozStatus.indexOf(DinozStatusId.CATCHING_GLOVE), 1);
	}

	const dinozWithItems = {
		...dinoz,
		items: dinoz.items.map(item => item.itemId)
	};

	const fighter: DetailedFighter = {
		id: dinoz.id,
		userId: dinoz.userId,
		display: dinoz.display,
		name: dinoz.name,
		level: dinoz.level,
		type: FighterType.DINOZ,
		attacker: teamIndex === 0,
		maxHp: dinoz.maxLife,
		startingHp: dinoz.life,
		hp: dinoz.life,
		energy: 100,
		maxEnergy: 100,
		resilience: 40,
		stats: {
			base: {
				[ElementType.AIR]: dinoz.nbrUpAir,
				[ElementType.FIRE]: dinoz.nbrUpFire,
				[ElementType.LIGHTNING]: dinoz.nbrUpLightning,
				[ElementType.WATER]: dinoz.nbrUpWater,
				[ElementType.WOOD]: dinoz.nbrUpWood,
				[ElementType.VOID]: 0
			},
			assaultBonus: {
				[ElementType.AIR]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.AIR).bonus,
				[ElementType.FIRE]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.FIRE).bonus,
				[ElementType.LIGHTNING]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.LIGHTNING).bonus,
				[ElementType.WATER]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.WATER).bonus,
				[ElementType.WOOD]: getAssaultStat(dinoz, dinozStatus, skills, AssaultElement.WOOD).bonus,
				[ElementType.VOID]: 0
			},
			defense: {
				[ElementType.AIR]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.AIR).value,
				[ElementType.FIRE]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.FIRE).value,
				[ElementType.LIGHTNING]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.LIGHTNING).value,
				[ElementType.WATER]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.WATER).value,
				[ElementType.WOOD]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.WOOD).value,
				[ElementType.VOID]: getDefenseStat(dinoz, dinozStatus, skills, DefenseElement.NEUTRAL).value
			},
			special: {
				[SpecialStat.INITIATIVE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.INITIATIVE)?.value ?? 0,
				[SpecialStat.ENERGY]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ENERGY)?.value ?? 0,
				[SpecialStat.ENERGY_RECOVERY]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ENERGY_RECOVERY)?.value ?? 0,
				[SpecialStat.ARMOR]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ARMOR)?.value ?? 0,
				[SpecialStat.ARMOR_BREAK]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ARMOR_BREAK)?.value ?? 0,
				[SpecialStat.MULTIHIT]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.MULTIHIT)?.value ?? 0,
				[SpecialStat.EVASION]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.EVASION)?.value ?? 0,
				[SpecialStat.SUPER_EVASION]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.SUPER_EVASION)?.value ?? 0,
				[SpecialStat.COUNTER]: getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.COUNTER)?.value ?? 0,
				[SpecialStat.SPEED]: getSpecialStat(dinozWithItems, [], skills, SpecialStat.SPEED)?.value ?? 0,
				[SpecialStat.FIRE_SPEED]: getSpecialStat(dinozWithItems, [], skills, SpecialStat.FIRE_SPEED)?.value ?? 0,
				[SpecialStat.WOOD_SPEED]: getSpecialStat(dinozWithItems, [], skills, SpecialStat.WOOD_SPEED)?.value ?? 0,
				[SpecialStat.WATER_SPEED]: getSpecialStat(dinozWithItems, [], skills, SpecialStat.WATER_SPEED)?.value ?? 0,
				[SpecialStat.LIGHTNING_SPEED]:
					getSpecialStat(dinozWithItems, [], skills, SpecialStat.LIGHTNING_SPEED)?.value ?? 0,
				[SpecialStat.AIR_SPEED]: getSpecialStat(dinozWithItems, [], skills, SpecialStat.AIR_SPEED)?.value ?? 0,
				[SpecialStat.BUBBLE_RATE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.BUBBLE_RATE)?.value ?? 0,
				[SpecialStat.TORCH_DAMAGE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.TORCH_DAMAGE)?.value ?? 0,
				[SpecialStat.ACID_BLOOD_DAMAGE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value ?? 0,
				[SpecialStat.CRITICAL_HIT_CHANCE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.CRITICAL_HIT_CHANCE)?.value ?? 0,
				[SpecialStat.CRITICAL_HIT_DAMAGE]:
					getSpecialStat(dinozWithItems, dinozStatus, skills, SpecialStat.CRITICAL_HIT_DAMAGE)?.value ?? 0
			},
			speed: {
				[ElementType.AIR]: 1,
				[ElementType.FIRE]: 1,
				[ElementType.LIGHTNING]: 1,
				[ElementType.WATER]: 1,
				[ElementType.WOOD]: 1,
				[ElementType.VOID]: 1,
				global: 1
			}
		},
		items,
		itemsUsed: [],
		time: 0,
		skills,
		status: [],
		elements: [],
		element: ElementType.AIR,
		minDamage: 1,
		minAssaultDamage: 1,
		skillElementalBonus: {
			[ElementType.AIR]: 0,
			[ElementType.FIRE]: 0,
			[ElementType.LIGHTNING]: 0,
			[ElementType.WATER]: 0,
			[ElementType.WOOD]: 0,
			[ElementType.VOID]: 0
		},
		allAssaultMultiplier: 1,
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		costume,
		invocations: 1,
		initiallyCursed: dinoz.status.some(status => status.statusId === DinozStatusId.CURSED),
		permanentStatusGained: [],
		perception: false,
		canHitFlying: false,
		canHitIntangible: false,
		cancelArmor: false,
		cancelAssaultDodge: false,
		hasRock: false,
		hasUsedHypnose: false,
		hasUsedHyperventilation: false
	};

	handleSkills(random, team, fighter, place);
	handleDinozStatuses(fighter, dinozStatus);

	// Order skills by priority, random if equal
	fighter.skills.sort((a, b) => {
		const aPriority = a.priority ?? 0;
		const bPriority = b.priority ?? 0;

		if (aPriority !== bPriority) {
			return bPriority - aPriority;
		}

		return random() > 0.5 ? 1 : -1;
	});

	// Time
	let initiative = fighter.stats.special.initiative;

	// Temporal reduction
	if (fighter.items.some(item => item.itemId === Item.TEMPORAL_REDUCTION)) {
		// Reduce by 50%
		initiative *= 0.5;
	}

	// Deduct the time from the fighter's initial time
	fighter.time -= initiative * TIME_FACTOR;
	// Add a random amount of time between 0 and 9 to randomize the first fighter
	fighter.time += Math.floor(random() * TIME_BASE) * TIME_FACTOR;

	// Energy
	setMaxEnergy(fighter, fighter.stats.special.energy ?? 100);
	fighter.energy = fighter.maxEnergy;

	// Handle elements (from highest to lowest)
	const elements = [
		{ element: ElementType.FIRE, value: fighter.stats.base[ElementType.FIRE] },
		{ element: ElementType.WOOD, value: fighter.stats.base[ElementType.WOOD] },
		{ element: ElementType.WATER, value: fighter.stats.base[ElementType.WATER] },
		{ element: ElementType.LIGHTNING, value: fighter.stats.base[ElementType.LIGHTNING] },
		{ element: ElementType.AIR, value: fighter.stats.base[ElementType.AIR] }
	];

	// Order the elements from highest to lowest, random if equal
	elements.sort((a, b) => {
		if (b.value !== a.value) {
			return b.value - a.value;
		}
		return random() > 0.5 ? 1 : -1;
	});

	// SPECIALISTE
	if (fighter.skills.some(skill => skill.id === Skill.SPECIALISTE)) {
		// Remove the lowest element
		elements.pop();
	}

	fighter.elements = elements.map(element => element.element);
	fighter.element = fighter.elements[0];

	return fighter;
};

export const cloneDinoz = (dinoz: DetailedFighter, fightData: DetailedFight) => {
	const has_tear = dinoz.items.some(item => item.itemId === Item.TEAR_OF_LIFE);
	const clone_id = -1 - fightData.fighters.filter(f => f.type !== FighterType.DINOZ).length;

	const clone: DetailedFighter = {
		id: clone_id,
		userId: dinoz.userId,
		display: dinoz.display,
		name: dinoz.name,
		level: dinoz.level,
		type: FighterType.CLONE, // TODO: this may not work well, in case a monster calls a clone, it's still a monster
		attacker: dinoz.attacker,
		maxHp: dinoz.maxHp,
		startingHp: has_tear ? dinoz.maxHp * 0.1 : 1,
		hp: has_tear ? dinoz.maxHp * 0.1 : 1,
		energy: 100, // Default for clone
		maxEnergy: 100, // Default for clone
		resilience: dinoz.resilience,
		stats: {
			base: dinoz.stats.base,
			assaultBonus: dinoz.stats.assaultBonus,
			defense: dinoz.stats.defense,
			special: {
				[SpecialStat.INITIATIVE]: 0, // No initative for clones
				[SpecialStat.ENERGY]: 0, // No energy recovery bonus for clones
				[SpecialStat.ENERGY_RECOVERY]: 0, // No energy recovery bonus for clones
				[SpecialStat.ARMOR]: dinoz.stats.special[SpecialStat.ARMOR],
				[SpecialStat.ARMOR_BREAK]: dinoz.stats.special[SpecialStat.ARMOR_BREAK],
				[SpecialStat.MULTIHIT]: dinoz.stats.special[SpecialStat.MULTIHIT],
				[SpecialStat.EVASION]: dinoz.stats.special[SpecialStat.EVASION],
				[SpecialStat.SUPER_EVASION]: dinoz.stats.special[SpecialStat.SUPER_EVASION],
				[SpecialStat.COUNTER]: dinoz.stats.special[SpecialStat.COUNTER],
				[SpecialStat.SPEED]: dinoz.stats.special[SpecialStat.SPEED],
				[SpecialStat.FIRE_SPEED]: dinoz.stats.special[SpecialStat.FIRE_SPEED],
				[SpecialStat.WOOD_SPEED]: dinoz.stats.special[SpecialStat.WOOD_SPEED],
				[SpecialStat.WATER_SPEED]: dinoz.stats.special[SpecialStat.WATER_SPEED],
				[SpecialStat.LIGHTNING_SPEED]: dinoz.stats.special[SpecialStat.LIGHTNING_SPEED],
				[SpecialStat.AIR_SPEED]: dinoz.stats.special[SpecialStat.AIR_SPEED],
				[SpecialStat.BUBBLE_RATE]: 0, // No bubble for clones
				[SpecialStat.TORCH_DAMAGE]: 0, // No torch for clones
				[SpecialStat.ACID_BLOOD_DAMAGE]: 0, // No acid blood for clones
				[SpecialStat.CRITICAL_HIT_CHANCE]: dinoz.stats.special[SpecialStat.CRITICAL_HIT_CHANCE],
				[SpecialStat.CRITICAL_HIT_DAMAGE]: dinoz.stats.special[SpecialStat.CRITICAL_HIT_DAMAGE]
			},
			speed: dinoz.stats.speed
		},
		items: [], // No items for clones
		itemsUsed: [],
		time: dinoz.time, // Clone start with their summoner's time
		skills: [], // No skills for clones
		status: [], // No statuses for clones
		elements: [], // Copy exactly the elements of the original dinoz, see below
		element: ElementType.AIR, // Temporary, is changed below
		minDamage: dinoz.minDamage,
		minAssaultDamage: dinoz.minAssaultDamage,
		skillElementalBonus: dinoz.skillElementalBonus,
		allAssaultMultiplier: 1, // Not carried over to clone from original dinoz
		nextAssaultBonus: 0, // Not carried over to clone from original dinoz
		nextAssaultMultiplier: 1, // Not carried over to clone from original dinoz
		costume: undefined,
		invocations: 0,
		initiallyCursed: false,
		permanentStatusGained: [],
		// Copy also special passives from original dinoz
		perception: dinoz.perception,
		canHitFlying: dinoz.canHitFlying,
		canHitIntangible: dinoz.canHitIntangible,
		cancelArmor: dinoz.cancelArmor,
		hasRock: dinoz.hasRock,
		// Cancel dodge is not copied
		cancelAssaultDodge: false,
		hasUsedHypnose: false,
		hasUsedHyperventilation: false
	};

	// Redo the element ordering because the original dinoz may have altered elements
	// Handle elements (from highest to lowest)
	const elements = [
		{ element: ElementType.FIRE, value: clone.stats.base[ElementType.FIRE] },
		{ element: ElementType.WOOD, value: clone.stats.base[ElementType.WOOD] },
		{ element: ElementType.WATER, value: clone.stats.base[ElementType.WATER] },
		{ element: ElementType.LIGHTNING, value: clone.stats.base[ElementType.LIGHTNING] },
		{ element: ElementType.AIR, value: clone.stats.base[ElementType.AIR] }
	];

	// Order the elements from highest to lowest, random if equal
	elements.sort((a, b) => {
		if (b.value !== a.value) {
			return b.value - a.value;
		}
		return fightData.rng() > 0.5 ? 1 : -1;
	});
	clone.elements = elements.map(element => element.element);
	clone.element = clone.elements[0];

	return clone;
};

export const initializeMonster = (
	memory: {
		existingMonsters: number;
		renfortApplied: number;
		wormCalls: number;
	},
	team: Team | null,
	teamIndex: number,
	monster: MonsterFiche,
	place: PlaceEnum,
	is_reinforcement: boolean,
	random: SeededRandom
): DetailedFighter => {
	memory.existingMonsters++;

	// Find skills
	const skills =
		monster.skills?.map(skill => {
			const skillDetails = skillList[skill];

			if (!skillDetails) {
				throw new Error(`Skill ${skill} not found`);
			}

			// Reduce probability by 3.5 for each consecutive M_RENFORTS
			let probability = skillDetails.probability ?? 0;

			if (skill === Skill.M_RENFORTS) {
				probability -= 3.5 * memory.renfortApplied;
				memory.renfortApplied++;
			}

			if (skill === Skill.M_WORM_CALL) {
				probability -= 3.5 * memory.renfortApplied;
				memory.wormCalls++;
			}

			if (probability < 0) {
				probability = 0;
			}

			return {
				...skillDetails,
				probability
			};
		}) ?? [];

	// Statuses
	const status: FighterStatusData[] = [];

	if (monster.noMove) {
		status.push(createStatus(FightStatus.NO_ASSAULT));
	}

	const similiDinoz = {
		nbrUpFire: monster.elements.fire,
		nbrUpWood: monster.elements.wood,
		nbrUpLightning: monster.elements.lightning,
		nbrUpAir: monster.elements.air,
		nbrUpWater: monster.elements.water,
		items: []
	};

	const fighter: DetailedFighter = {
		id: -memory.existingMonsters,
		userId: null,
		display: monster.display ?? '',
		name: monster.name,
		level: monster.level,
		type: is_reinforcement ? FighterType.REINFORCEMENT : monster.boss ? FighterType.BOSS : FighterType.MONSTER,
		attacker: teamIndex === 0,
		maxHp: monster.hp,
		startingHp: monster.hp,
		hp: monster.hp,
		energy: 100,
		maxEnergy: 100,
		resilience: monster.resilience,
		stats: {
			base: {
				[ElementType.AIR]: monster.elements.air,
				[ElementType.FIRE]: monster.elements.fire,
				[ElementType.LIGHTNING]: monster.elements.lightning,
				[ElementType.WATER]: monster.elements.water,
				[ElementType.WOOD]: monster.elements.wood,
				[ElementType.VOID]: monster.bonus_attack ?? 0
			},
			assaultBonus: {
				[ElementType.AIR]: getAssaultStat(similiDinoz, [], skills, AssaultElement.AIR).bonus,
				[ElementType.FIRE]: getAssaultStat(similiDinoz, [], skills, AssaultElement.FIRE).bonus,
				[ElementType.LIGHTNING]: getAssaultStat(similiDinoz, [], skills, AssaultElement.LIGHTNING).bonus,
				[ElementType.WATER]: getAssaultStat(similiDinoz, [], skills, AssaultElement.WATER).bonus,
				[ElementType.WOOD]: getAssaultStat(similiDinoz, [], skills, AssaultElement.WOOD).bonus,
				[ElementType.VOID]: 0
			},
			defense: {
				[ElementType.AIR]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.AIR).value + (monster.bonus_defense ?? 0),
				[ElementType.FIRE]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.FIRE).value + (monster.bonus_defense ?? 0),
				[ElementType.LIGHTNING]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.LIGHTNING).value + (monster.bonus_defense ?? 0),
				[ElementType.WATER]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.WATER).value + (monster.bonus_defense ?? 0),
				[ElementType.WOOD]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.WOOD).value + (monster.bonus_defense ?? 0),
				[ElementType.VOID]:
					getDefenseStat(similiDinoz, [], skills, DefenseElement.NEUTRAL).value + (monster.bonus_defense ?? 0)
			},
			special: {
				[SpecialStat.INITIATIVE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.INITIATIVE)?.value ?? 0,
				[SpecialStat.ENERGY]: getSpecialStat(similiDinoz, [], skills, SpecialStat.ENERGY)?.value ?? 0,
				[SpecialStat.ENERGY_RECOVERY]: getSpecialStat(similiDinoz, [], skills, SpecialStat.ENERGY_RECOVERY)?.value ?? 0,
				[SpecialStat.ARMOR]: getSpecialStat(similiDinoz, [], skills, SpecialStat.ARMOR)?.value ?? 0,
				[SpecialStat.ARMOR_BREAK]: getSpecialStat(similiDinoz, [], skills, SpecialStat.ARMOR_BREAK)?.value ?? 0,
				[SpecialStat.MULTIHIT]: getSpecialStat(similiDinoz, [], skills, SpecialStat.MULTIHIT)?.value ?? 0,
				[SpecialStat.EVASION]: getSpecialStat(similiDinoz, [], skills, SpecialStat.EVASION)?.value ?? 0,
				[SpecialStat.SUPER_EVASION]: getSpecialStat(similiDinoz, [], skills, SpecialStat.SUPER_EVASION)?.value ?? 0,
				[SpecialStat.COUNTER]: getSpecialStat(similiDinoz, [], skills, SpecialStat.COUNTER)?.value ?? 0,
				[SpecialStat.SPEED]: getSpecialStat(similiDinoz, [], skills, SpecialStat.SPEED)?.value ?? 0,
				[SpecialStat.FIRE_SPEED]: getSpecialStat(similiDinoz, [], skills, SpecialStat.FIRE_SPEED)?.value ?? 0,
				[SpecialStat.WOOD_SPEED]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WOOD_SPEED)?.value ?? 0,
				[SpecialStat.WATER_SPEED]: getSpecialStat(similiDinoz, [], skills, SpecialStat.WATER_SPEED)?.value ?? 0,
				[SpecialStat.LIGHTNING_SPEED]: getSpecialStat(similiDinoz, [], skills, SpecialStat.LIGHTNING_SPEED)?.value ?? 0,
				[SpecialStat.AIR_SPEED]: getSpecialStat(similiDinoz, [], skills, SpecialStat.AIR_SPEED)?.value ?? 0,
				[SpecialStat.BUBBLE_RATE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.BUBBLE_RATE)?.value ?? 0,
				[SpecialStat.TORCH_DAMAGE]: getSpecialStat(similiDinoz, [], skills, SpecialStat.TORCH_DAMAGE)?.value ?? 0,
				[SpecialStat.ACID_BLOOD_DAMAGE]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.ACID_BLOOD_DAMAGE)?.value ?? 0,
				[SpecialStat.CRITICAL_HIT_CHANCE]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.CRITICAL_HIT_CHANCE)?.value ?? 0,
				[SpecialStat.CRITICAL_HIT_DAMAGE]:
					getSpecialStat(similiDinoz, [], skills, SpecialStat.CRITICAL_HIT_DAMAGE)?.value ?? 0
			},
			speed: {
				[ElementType.AIR]: 1,
				[ElementType.FIRE]: 1,
				[ElementType.LIGHTNING]: 1,
				[ElementType.WATER]: 1,
				[ElementType.WOOD]: 1,
				[ElementType.VOID]: 1,
				global: 1
			}
		},
		items: [],
		itemsUsed: [],
		// Add a random amount of time between 0 and 10 to randomize the first fighter
		time: Math.round(random() * TIME_BASE) * TIME_FACTOR,
		skills,
		status,
		elements: [
			ElementType.FIRE,
			ElementType.WOOD,
			ElementType.WATER,
			ElementType.LIGHTNING,
			ElementType.AIR,
			ElementType.VOID
		],
		element: ElementType.FIRE,
		minDamage: 1,
		minAssaultDamage: 1,
		skillElementalBonus: {
			[ElementType.AIR]: 0,
			[ElementType.FIRE]: 0,
			[ElementType.LIGHTNING]: 0,
			[ElementType.WATER]: 0,
			[ElementType.WOOD]: 0,
			[ElementType.VOID]: 0
		},
		allAssaultMultiplier: 1,
		nextAssaultBonus: 0,
		nextAssaultMultiplier: 1,
		invocations: 0,
		initiallyCursed: false,
		permanentStatusGained: [],
		perception: false,
		canHitFlying: false,
		canHitIntangible: false,
		cancelArmor: false,
		cancelAssaultDodge: false,
		hasRock: false,
		hasUsedHypnose: false,
		hasUsedHyperventilation: false
	};

	// Order skills by priority, random if equal
	fighter.skills.sort((a, b) => {
		const aPriority = a.priority ?? 0;
		const bPriority = b.priority ?? 0;

		if (aPriority !== bPriority) {
			return bPriority - aPriority;
		}

		return random() > 0.5 ? 1 : -1;
	});

	// Time
	const { initiative } = fighter.stats.special;

	// Deduct the time from the fighter's initial time
	fighter.time -= initiative * TIME_FACTOR;
	// Add a random amount of time between 0 and 10 to randomize the first fighter
	fighter.time += Math.round(random() * TIME_BASE) * TIME_FACTOR;

	// Energy
	setMaxEnergy(fighter, fighter.stats.special.energy ?? 100);
	fighter.energy = fighter.maxEnergy;

	// Handle elements (from highest to lowest)
	const elements = [
		{ element: ElementType.FIRE, value: fighter.stats.base[ElementType.FIRE] },
		{ element: ElementType.WOOD, value: fighter.stats.base[ElementType.WOOD] },
		{ element: ElementType.WATER, value: fighter.stats.base[ElementType.WATER] },
		{ element: ElementType.LIGHTNING, value: fighter.stats.base[ElementType.LIGHTNING] },
		{ element: ElementType.AIR, value: fighter.stats.base[ElementType.AIR] },
		{ element: ElementType.VOID, value: fighter.stats.base[ElementType.VOID] }
	];

	// Order the elements from highest to lowest, random if equal
	elements.sort((a, b) => {
		if (b.value !== a.value) {
			return b.value - a.value;
		}
		return random() > 0.5 ? 1 : -1;
	});

	// Filter out elements with 0 value
	fighter.elements = elements.filter(element => element.value > 0).map(element => element.element);

	if (fighter.elements.length === 0) {
		fighter.elements = [ElementType.VOID];
	}

	// Handle bonuses after the elements have been handled
	const handleMonsterBonuses = MonsterBonus[monster.id];

	if (handleMonsterBonuses) {
		handleMonsterBonuses(fighter);
	}

	// Skills only after the elements have been handled
	handleSkills(random, team, fighter, place);

	// SPECIALISTE
	if (fighter.skills.some(skill => skill.id === Skill.SPECIALISTE)) {
		// Remove the lowest element
		if (fighter.elements.length > 1) {
			elements.pop();
		}
	}

	fighter.element = fighter.elements[0];

	return fighter;
};

const handleDinozStatuses = (fighter: DetailedFighter, statuses: DinozStatusId[]) => {
	const fighterHas = statuses.reduce(
		(acc, status) => {
			acc[status] = true;
			return acc;
		},
		{} as Record<DinozStatusId, boolean>
	);

	if (fighterHas[DinozStatusId.CUSCOUZ_MALEDICTION]) {
		fighter.costume = monsterList.FRUTOX_DEFENDER;
	}

	if (fighterHas[DinozStatusId.CATCHING_GLOVE]) {
		fighter.skills.push({ ...skillList[Skill.CATCH] });
	}
};

const handleSkills = (random: SeededRandom, team: Team | null, fighter: DetailedFighter, place: PlaceEnum) => {
	const fighterHas = fighter.skills.reduce(
		(acc, skill) => {
			acc[skill.id as Skill] = true;
			return acc;
		},
		{} as Record<Skill, boolean>
	);

	// FIRE
	if (fighterHas[Skill.CHARGE]) {
		fighter.nextAssaultBonus += 5;
	}

	if (fighterHas[Skill.BELIER]) {
		fighter.nextAssaultBonus += 20;
	}

	if (team && fighterHas[Skill.CHEF_DE_GUERRE]) {
		team[Skill.CHEF_DE_GUERRE] = true;
	}

	// WOOD
	if (fighterHas[Skill.TENACITE]) {
		fighter.minDamage += 1;
	}

	if (team && fighterHas[Skill.GARDE_FORESTIER]) {
		team[Skill.GARDE_FORESTIER] = true;
	}

	if (fighterHas[Skill.FORCE_CONTROL]) {
		if (fighter.minAssaultDamage < 10) {
			fighter.minAssaultDamage = 10;
		}
	}

	// WATER
	if (fighterHas[Skill.PERCEPTION]) {
		fighter.canHitIntangible = true;
		fighter.perception = true;
	}

	if (fighterHas[Skill.KARATE_SOUS_MARIN]) {
		fighter.skillElementalBonus[ElementType.WATER] += 10;
	}

	if (fighterHas[Skill.SAPEUR]) {
		// Increase item use probability by 50%
		fighter.items.forEach(item => {
			let probability = (item.probability ?? 0) * 1.5;
			if (probability > 100) {
				probability = 100;
			}
			item.probability = probability;
		});
	}

	// AIR
	if (fighterHas[Skill.SAUT]) {
		fighter.canHitFlying = true;
	}

	if (team && fighterHas[Skill.MAITRE_LEVITATEUR]) {
		team[Skill.MAITRE_LEVITATEUR] = true;
	}

	if (fighterHas[Skill.SOUFFLE_DE_VIE]) {
		fighter.status.push(createStatus(FightStatus.NO_POISON));
		fighter.status.push(createStatus(FightStatus.NO_CURSE));
	}

	// Race
	if (fighterHas[Skill.ROCK]) {
		fighter.hasRock = true;
	}

	// 50% chance to get positive / negative time
	if (fighterHas[Skill.DOUBLE_FACE]) {
		fighter.time += (random() > 0.5 ? TIME_BASE : -TIME_BASE) * TIME_FACTOR;
	}

	if (fighterHas[Skill.ROUGE]) {
		// +20 assault damage if on GTOUTCHAUD
		if (PlacesByMap[MapZone.GTOUTCHAUD]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	if (fighterHas[Skill.VERT]) {
		// +20 assault damage if on JUNGLE
		if (PlacesByMap[MapZone.JUNGLE]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	if (fighterHas[Skill.BLEU]) {
		// +20 assault damage if on ILES
		if (PlacesByMap[MapZone.ILES]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	if (fighterHas[Skill.JAUNE]) {
		// +20 assault damage if on STEPPE
		if (PlacesByMap[MapZone.STEPPE]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	if (fighterHas[Skill.BLANC]) {
		// +20 assault damage if on NIMBAO
		if (PlacesByMap[MapZone.NIMBAO]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 20;
			fighter.stats.assaultBonus[ElementType.FIRE] += 20;
			fighter.stats.assaultBonus[ElementType.WOOD] += 20;
			fighter.stats.assaultBonus[ElementType.WATER] += 20;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 20;
		}
	}

	// RACE
	if (fighterHas[Skill.CHARGE_CORNUE]) {
		fighter.nextAssaultMultiplier *= 1.2;
	}

	if (fighterHas[Skill.PIETINEMENT]) {
		fighter.cancelArmor = true;
	}

	if (fighterHas[Skill.FORCE_DE_LUMIERE]) {
		// +30 assault damage if on DARKWORLD
		if (PlacesByMap[MapZone.DARKWORLD]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 30;
			fighter.stats.assaultBonus[ElementType.FIRE] += 30;
			fighter.stats.assaultBonus[ElementType.WOOD] += 30;
			fighter.stats.assaultBonus[ElementType.WATER] += 30;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 30;
		}
	}

	if (fighterHas[Skill.ORIGINE_CAUSHEMESHENNE]) {
		// +30 assault damage if on CAUSHEMESH
		if (PlacesByMap[MapZone.CAUSHEMESH]?.includes(place)) {
			fighter.stats.assaultBonus[ElementType.AIR] += 30;
			fighter.stats.assaultBonus[ElementType.FIRE] += 30;
			fighter.stats.assaultBonus[ElementType.WOOD] += 30;
			fighter.stats.assaultBonus[ElementType.WATER] += 30;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 30;
		}
	}

	// DOUBLE
	if (team && fighterHas[Skill.ELECTROLYSE]) {
		team[Skill.ELECTROLYSE] = true;
	}

	// SPHERE
	if (fighterHas[Skill.SURVIE]) {
		fighter.canSurvive = true;
	}

	// MONSTER
	if (fighterHas[Skill.M_TOWER_GUARDIAN]) {
		fighter.stats.base[ElementType.FIRE] = 10;
		fighter.stats.base[ElementType.WOOD] = 10;
		fighter.stats.base[ElementType.WATER] = 10;
		fighter.stats.base[ElementType.LIGHTNING] = 10;
		fighter.stats.base[ElementType.AIR] = 10;
		fighter.stats.base[ElementType.VOID] = 10;
		fighter.canHitFlying = true;
		fighter.canHitIntangible = true;
		const randomElement = randomBetweenSeeded(random, 1, 6) as ElementType;
		// Lock to a single element
		fighter.elements = [randomElement];
		fighter.element = randomElement;
	}

	// TODO: handle other skills
};

// Applies a bonus of a given element to all defenses of the fighter, except void
// The defense in the first "weak" element gains 0.5 of the bonus
// The defense in the second "weak" element gains 0.5 of the bonus
// The defense of the element itself, gains the bonus
// The defense in the first "strong" element, gains 1.5 of the bonus
// The defense in the second "strong" element, gains 1.5 of the bonus
// In other words, here we look at what is the contribution of element X to element Y. It is given by the matrix:
// Row is element of the bonus \ Column is impact on the other elements
//           \  Fire  |  Wood  |  Water  | Lightning |  Air
// Fire      |    1   |  1.5   |   1.5   |     0.5   |  0.5
// Wood      |   0.5  |    1   |   1.5   |     1.5   |  0.5
// Water     |   0.5  |  0.5   |     1   |     1.5   |  1.5
// Lightning |   1.5  |  0.5   |   0.5   |       1   |  1.5
// Air       |   1.5  |  1.5   |   0.5   |     0.5   |    1
// For example: a bonus of 2 in Air will propagate to the all the elements as follows by looking at the Air row:
// 2 * 1.5 in Fire and Wood, 2 * 0.5 in Water and Lightning and 2 * 1 in Air
// Vocabulary-wise, this can be said as Air is strong against Fire and Wood as it provides the most defense against those elements
// and weak against water and lightning as the provides the least defense against those elements
// The "wheel" is: an element is strong against the next 2 and weak against the previous 2
// Fire -> Wood -> Water
// ^                |
// |                v
// Air    <-    Lightning
const applyGlobalDefenseBonus = (fighter: DetailedFighter, element: ElementType, bonus: number) => {
	const elementWheel: ElementType[] = [
		ElementType.FIRE,
		ElementType.WOOD,
		ElementType.WATER,
		ElementType.LIGHTNING,
		ElementType.AIR
	] as const;

	if (element === ElementType.VOID) {
		throw new Error(`Cannot process global defense bonus of void`);
	}

	// The defense of the element itself increases by the bonus
	fighter.stats.defense[element] += bonus;
	// The defense in the first next element increases by 1.5 of the bonus, this is the first "strong" element
	fighter.stats.defense[elementWheel[(elementWheel.indexOf(element) + 1) % elementWheel.length]] += 1.5 * bonus;
	// The defense in the second next element increases by 1.5 of the bonus, this is the second "strong" element
	fighter.stats.defense[elementWheel[(elementWheel.indexOf(element) + 2) % elementWheel.length]] += 1.5 * bonus;
	// The defense in the third element increases by 0.5 of the bonus, this is the first "weak" element
	fighter.stats.defense[elementWheel[(elementWheel.indexOf(element) + 3) % elementWheel.length]] += 0.5 * bonus;
	// The defense in the fourth element increases by 0.5 of the bonus, this is the second "weak" element
	fighter.stats.defense[elementWheel[(elementWheel.indexOf(element) + 4) % elementWheel.length]] += 0.5 * bonus;
};

const getFighters = (team1: Team, team2: Team, place: PlaceEnum, random: SeededRandom): DetailedFighter[] => {
	const fighters: DetailedFighter[] = [];

	const memory = {
		existingMonsters: 0,
		renfortApplied: 0,
		wormCalls: 0
	};

	const bossFight = team2.monsterList.some(monster => monster.boss);

	[team1, team2].forEach((team, index) => {
		const { dinozList, monsterList: monsters } = team;

		// Dinoz
		fighters.push(
			...dinozList.map(dinoz => {
				const fighter = initializeDinoz(team, index, dinoz, place, bossFight, random);

				// Catches
				for (let i = 0; i < dinoz.catches.length; i++) {
					// Limit to 3 catches
					if (i > 2) break;

					const dinozCatch = dinoz.catches[i];
					const probabilities = [3, 1, 1, 1];
					const catchSkill = fighter.skills.find(skill => skill.id === Skill.CATCH);

					if (!catchSkill) {
						throw new Error(`Dinoz ${dinoz.id} has no catch skill`);
					}

					// Adjust catch probability
					catchSkill.probability = probabilities[i];

					const monster = initializeMonster(
						memory,
						team,
						index,
						{ ...monsterList[dinozCatch.monsterId as Monster] },
						place,
						true,
						random
					);
					monster.startingHp = dinozCatch.hp;
					monster.hp = dinozCatch.hp;
					monster.catcher = dinoz.id;
					monster.catchId = dinozCatch.id;

					// Add monster
					fighters.push(monster);
				}

				return fighter;
			})
		);

		// Monsters
		fighters.push(...monsters.map(monster => initializeMonster(memory, team, index, monster, place, false, random)));
	});

	// Handle team wide modifiers
	fighters.forEach(fighter => {
		const team = fighter.attacker ? team1 : team2;

		// FIRE
		if (team[Skill.CHEF_DE_GUERRE]) {
			fighter.stats.assaultBonus[ElementType.AIR] += 2;
			fighter.stats.assaultBonus[ElementType.FIRE] += 2;
			fighter.stats.assaultBonus[ElementType.WOOD] += 2;
			fighter.stats.assaultBonus[ElementType.WATER] += 2;
			fighter.stats.assaultBonus[ElementType.LIGHTNING] += 2;
			fighter.stats.assaultBonus[ElementType.VOID] += 2;
		}
		// WOOD: global wood defense bonus to the team
		if (team[Skill.GARDE_FORESTIER]) {
			applyGlobalDefenseBonus(fighter, ElementType.WOOD, 3);
		}
		// LIGHTNING
		if (team[Skill.ELECTROLYSE]) {
			fighter.stats.speed.global *= 0.95;
		}
		// AIR
		if (team[Skill.MAITRE_LEVITATEUR]) {
			fighter.canHitFlying = true;
		}

		// ITEMS
		if (team1[Item.EMBER] || team2[Item.EMBER]) {
			fighter.stats.assaultBonus[ElementType.FIRE] += getAssaultValue(fighter, ElementType.FIRE) * 0.3;
		}
		if (team1[Item.BEER] || team2[Item.BEER]) {
			fighter.status.push(createStatus(FightStatus.BEER));
		}
	});

	return fighters;
};

/**
 * Determine the counter chance of the fighter.
 * The counter chance minimum is 0% and maximum is 90%.
 * @param fighter The fighter to get the counter stat from.
 * @returns {number} Returns the % chance of the fighter to counter between 0 an 0.9.
 */
export const getFighterCounter = (fighter: DetailedFighter) => {
	// Remove 1 to recenter the value at 0.
	const counterTotal = fighter.stats.special.counter - 1;

	return Math.min(0.9, Math.max(0, counterTotal));
};

/**
 * Determine the multihit chance of the fighter.
 * The multihit chance minimum is 0% and maximum is 90%.
 * The chance is reduced by half for each multihit previously landed in the same attack.
 * @param fighter The fighter to get the multihit stat from.
 * @param multiHitCounter Optional argument to get the chance of multihit chance after a certain number of multihits. Do not provide to get base chance.
 * @returns {number} Returns the % chance of the fighter to land a multihit between 0 an 0.9.
 */
export const getFighterMultihit = (fighter: DetailedFighter, multiHitCounter?: number) => {
	// Reduce the combo chance by 1/2 for every combo.
	const multiHitFactor = Math.pow(0.5, multiHitCounter ?? 0);

	// Remove 1 to recenter the value at 0.
	const multihitTotal = (fighter.stats.special.multihit - 1) * multiHitFactor;

	return Math.min(0.9, Math.max(0, multihitTotal));
};

/**
 * Determine the evasion chance of the fighter.
 * The evasion chance minimum is 0% and maximum is 90%.
 * @param fighter The fighter to get the evasion stat from.
 * @returns {number} Returns the % chance of the fighter to land an evasion between 0 an 0.9.
 */
export const getFighterEvasion = (fighter: DetailedFighter) => {
	// Remove 1 to recenter the value at 0.
	const evasionTotal = fighter.stats.special.evasion - 1;

	return Math.min(0.9, Math.max(0, evasionTotal));
};

/**
 * Determine the super evasion chance of the fighter.
 * The super evasion chance minimum is 0% and maximum is 90%.
 * @param fighter The fighter to get the super evasion stat from.
 * @returns {number} Returns the % chance of the fighter to land a super evasion between 0 an 0.9.
 */
export const getFighterSuperEvasion = (fighter: DetailedFighter) => {
	// Remove 1 to recenter the value at 0.
	const superEvasionTotal = fighter.stats.special.superEvasion - 1;

	return Math.min(0.9, Math.max(0, superEvasionTotal));
};

/**
 * Determine the armor of the fighter.
 * The armor minimum is 0% and maximum is 90%.
 * @param fighter The fighter to get the armor stat from.
 * @returns {number} Returns the armor of the fighter between 0 an 0.9.
 */
export const getFighterArmor = (fighter: DetailedFighter) => {
	return Math.min(0.9, Math.max(0, fighter.stats.special.armor - 1));
};

/**
 * Determine the armor break of the fighter.
 * The armor break minimum is 0% and maximum is 90%.
 * @param fighter The fighter to get the armor break stat from.
 * @returns {number} Returns the armor break of the fighter between 0 an 0.9.
 */
export const getFighterArmorBreak = (fighter: DetailedFighter) => {
	return Math.min(0.9, Math.max(0, fighter.stats.special.armorBreak - 1));
};

/**
 * Determine the critical hit chance of the fighter.
 * The critical hit chance minimum is 0% and maximum is 90%.
 * @param fighter The fighter to get the critical hit chance stat stat from.
 * @returns {number} Returns the critical hit chance of the fighter between 0 an 0.9.
 */
export const getFighterCriticalHitChance = (fighter: DetailedFighter) => {
	return Math.min(0.9, Math.max(0, fighter.stats.special.criticalHitChance - 1));
};

/**
 * Determine the critical hit damage of the fighter.
 * The critical hit damage minimum is 0%. There is no maximum.
 * @param fighter The fighter to get the critical hit damage stat stat from.
 * @returns {number} Returns the critical hit damage of the fighter between 0 an 0.9.
 */
export const getFighterCriticalHitDamage = (fighter: DetailedFighter) => {
	return Math.max(0, fighter.stats.special.criticalHitDamage);
};

export default getFighters;
