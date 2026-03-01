import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { DetailedFighter, FighterResultFiche } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightProcessResult, FightStats } from '@dinorpg/core/models/fight/fightResult.js';
import { FightStatus, FightStatusLength } from '@dinorpg/core/models/fight/fightStatus.js';
import { FightStep, PrepareStep } from '@dinorpg/core/models/fight/fightStep.js';
import { LifeEffect, NotificationList } from '@dinorpg/core/models/fight/transpiler.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { CYCLE, FIGHT_INFINITE, OVERTIME_THRESHOLD, TIME_FACTOR } from '@dinorpg/core/utils/fightConstants.js';

import { SeededRandom } from '../prng.js';
import { DinozToGetFighter, FightConfiguration, FightRules } from './fight.mapper.js';
import {
	addStatus,
	applyStrategy,
	checkDeaths,
	createStatus,
	getLimitedRandomOpponent,
	hasItem,
	hasSkill,
	hasStatus,
	heal,
	initStepFighter,
	OVERTIME_ID,
	playFighterTurn,
	stepFighter,
	updateStat
} from './fightMethods.js';
import { initializeMonster } from './getFighters.js';
import { randomBetweenSeeded } from './randomBetween.js';

export type DetailedFight = {
	// Seeded random number generator, rng() generates a float between 0 and 1. Other methods exist to generate other types of numbers.
	rng: SeededRandom;
	place: PlaceEnum;
	loser: 'attackers' | 'defenders' | null;
	steps: FightStep[];
	timeout?: number;
	endedByTimeout: boolean;
	initialDinozList: DinozToGetFighter[];
	fighters: DetailedFighter[];
	protectedFighters: number[];
	deads: number[];
	// Moving time in the fight
	time: number;
	// Time left until the next status activates (poison, dot, or end of a status)
	nextStatusTrigger: number;
	// Time left until the next cycle activates (hypnosis, locked)
	nextCycleTrigger: number;
	lastFighterId: number | undefined;
	environment?: {
		type: Skill;
		caster: DetailedFighter;
		turnsLeft: number;
		timeout: number;
	};
	attackerData: {
		hasCook: boolean;
	};
	defenderData: {
		hasCook: boolean;
	};
	rules: FightRules;
	timeManipulatorUsed?: boolean;
	temporalStabilityUsed?: boolean;
	stats: {
		attack: FightStats;
		defense: FightStats;
	};
};

const orderFighters = (fightData: DetailedFight) => {
	fightData.fighters = fightData.fighters.sort((a, b) => {
		// Last if hp <= 0 or escaped
		if (a.hp <= 0 || a.escaped) return 1;
		if (b.hp <= 0 || b.escaped) return -1;

		// Random if times are equal
		if (a.time === b.time) {
			return fightData.rng() > 0.5 ? 1 : -1;
		}
		// Lowest time first
		return a.time - b.time;
	});
};

/**
 * @summary Generate a fight.
 *
 * It is up to the caller to set up properly the teams that will face each other and the rules of the fight.
 *
 * @returns FightProcessResult
 **/
const generateFight = (config: FightConfiguration, place: PlaceEnum, rng: SeededRandom): FightProcessResult => {
	let timeout = config.timeout;
	// Adjust the timeout with the time factor
	if (timeout) {
		timeout = timeout * TIME_FACTOR;
	}

	// Initialize fight data using the provided configuration.
	const fightData: DetailedFight = {
		rng,
		loser: null,
		steps: [] as FightStep[],
		timeout: timeout,
		endedByTimeout: false,
		initialDinozList: [...config.initialDinozList],
		fighters: config.fighters,
		deads: [] as number[],
		attackerData: {
			hasCook: config.attackerHasCook
		},
		defenderData: {
			hasCook: config.defenderHasCook
		},
		rules: config.rules,
		protectedFighters: [],
		time: 0,
		nextStatusTrigger: FIGHT_INFINITE,
		nextCycleTrigger: FIGHT_INFINITE,
		lastFighterId: undefined,
		place: config.place,
		stats: {
			attack: {
				startingHp: 0,
				endingHp: 0,
				hpLost: 0,
				hpHealed: 0,
				attacks: 0,
				times_attacked: 0,
				multiHits: 0,
				assaults: 0,
				criticalHits: 0,
				times_assaulted: 0,
				evasions: 0,
				counters: 0,
				poisoned: 0,
				poison_damage: 0,
				times_poisoned: 0,
				burn_damage: 0,
				petrified: 0,
				reinforcements: 0,
				elements: {
					[ElementType.FIRE]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.WOOD]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.WATER]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.LIGHTNING]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.AIR]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.VOID]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					}
				}
			},
			defense: {
				startingHp: 0,
				endingHp: 0,
				hpLost: 0,
				hpHealed: 0,
				attacks: 0,
				times_attacked: 0,
				multiHits: 0,
				assaults: 0,
				criticalHits: 0,
				times_assaulted: 0,
				evasions: 0,
				counters: 0,
				poisoned: 0,
				poison_damage: 0,
				times_poisoned: 0,
				burn_damage: 0,
				petrified: 0,
				reinforcements: 0,
				elements: {
					[ElementType.FIRE]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.WOOD]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.WATER]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.LIGHTNING]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.AIR]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					},
					[ElementType.VOID]: {
						damage_dealt: 0,
						attacks: 0,
						damage_received: 0,
						defenses: 0
					}
				}
			}
		}
	};

	// If a timeout is present, display it.
	if (fightData.timeout) {
		fightData.steps.push({
			action: 'timeLimit',
			time: fightData.timeout
		});
	}

	// Prepare the fight: fighters arrive, some special skills and items are handled *before* the start of the fight
	prepareFight(fightData);

	// Start the fight: handle skills and items that trigger at the beginning of the fight
	startFight(fightData);

	let turn = 0;

	// Order a first time fighters by initiative (random if equal)
	orderFighters(fightData);

	// Update time of all fighters relatively to the first fighter (with the lowest time)
	fightData.fighters.map(fighter => (fighter.time -= fightData.fighters[0].time));

	let overtimePoisonDamage = 10;

	// STRATEGIE
	fightData.fighters.forEach(fighter => {
		if (!fighter.skills.some(skill => skill.id === Skill.STRATEGIE)) return;

		applyStrategy(fightData, fighter);
	});

	// Hack to not continue the fight if one side has no fighter
	if (fightData.fighters.filter(f => !f.attacker).length === 0) {
		fightData.loser = 'defenders';
	} else if (fightData.fighters.filter(f => f.attacker).length === 0) {
		fightData.loser = 'attackers';
	}

	// Fight loop
	while (!fightData.loser) {
		// No fighters left, stop the fight.
		if (!fightData.fighters.length) {
			break;
		}

		// Timeout hit, stop the fight.
		if (fightData.endedByTimeout) {
			break;
		}

		// Order fighters by initiative (random if equal)
		orderFighters(fightData);

		// If fight is getting too long, poison all fighters with an overtime poison.
		if (fightData.time > OVERTIME_THRESHOLD) {
			fightData.fighters.forEach(fighter => {
				if (!hasStatus(fighter, FightStatus.OVERTIME_POISON)) {
					// Custom addition of the poisoned status to all fighters to override some error checks

					fighter.poisonedBy = {
						id: OVERTIME_ID,
						skill: 0 as Skill,
						damage: overtimePoisonDamage
					};

					// Add status
					const status_props = createStatus(FightStatus.OVERTIME_POISON, FightStatusLength.SUPER_SHORT);

					// Update the next trigger of status accordingly
					if (status_props.cycle && fightData.nextStatusTrigger > CYCLE) {
						fightData.nextStatusTrigger = CYCLE;
					} else if (status_props.time < fightData.nextStatusTrigger) {
						fightData.nextStatusTrigger = status_props.time;
					}

					fighter.status.push(status_props);

					// Add status step
					fightData.steps.push({
						action: 'addStatus',
						fighter: stepFighter(fighter),
						status: FightStatus.OVERTIME_POISON
					});
				}
			});

			// Increase overtime damage by 1 for each turn elapsed since overtime started.
			overtimePoisonDamage += 1;
		}

		if (turn > 1200) {
			// Too many turns
			console.warn('Too many turns, this should never happen');
			break;
		}

		// Play fighter turn
		playFighterTurn(fightData);

		// Check deaths
		checkDeaths(fightData);

		turn += 1;
	}

	const baoExists = fightData.fighters.some(
		fighter => fighter.type === FighterType.MONSTER && fighter.name === monsterList[Monster.BAOBOB].name
	);

	// Total end of fight hp (before end of fight regeneration)
	fightData.fighters.forEach(fighter => {
		// Ignore reinforcements
		if (fighter.master) {
			return;
		}
		updateStat(fightData, fighter, 'endingHp', fighter.hp);
	});

	if (!fightData.loser) {
		// The winner and loser will be calculated based on the remaining hp (%)
		// That is, the loser will be the one with lowest endingHp / startingHp
		// To avoid comparing non-integer numbers, instead of comparing
		// attack.endingHp / attack.startingHp < defense.endingHp / defense.startingHp
		// We can compare: attack.endingHp * defense.startingHp < defense.endingHp * attack.startingHp
		// Note that, for this formula to work, we need to do it after processing `endingHp` stat
		const left = fightData.stats.attack.endingHp * fightData.stats.defense.startingHp;
		const right = fightData.stats.defense.endingHp * fightData.stats.attack.startingHp;

		fightData.loser = left < right ? 'attackers' : 'defenders';
	}

	const winner = fightData.loser === 'defenders';

	// After fight regeneration
	fightData.fighters.forEach(fighter => {
		// No heal if dead
		if (fighter.hp <= 0) return;

		if (fighter.skills.some(skill => skill.id === Skill.PREMIERS_SOINS)) {
			// Heal 1HP
			heal(fightData, fighter, 1, undefined, LifeEffect.Heal);
		}

		if (fighter.skills.some(skill => skill.id === Skill.MEDECINE)) {
			// Heal beteen 0 and 3HP
			heal(fightData, fighter, randomBetweenSeeded(fightData.rng, 0, 3), undefined, LifeEffect.Heal);
		}

		if (fighter.skills.some(skill => skill.id === Skill.BRANCARDIER)) {
			// Get allies that lost HP
			const allies = fightData.fighters.filter(
				f => f.id !== fighter.id && f.attacker === fighter.attacker && f.hp < f.startingHp
			);

			if (allies.length) {
				// Get random ally
				const ally = allies[Math.floor(fightData.rng() * allies.length)];

				// Heal 1-5HP
				heal(fightData, ally, randomBetweenSeeded(fightData.rng, 1, 5), undefined, LifeEffect.Heal);
			}
		}

		if (baoExists && fighter.attacker) {
			// Regen to starting HP
			heal(fightData, fighter, fighter.startingHp - fighter.hp);
		}
	});

	if (winner) {
		// Curse if any M_CURSED_WAND
		if (fightData.fighters.some(fighter => fighter.skills.some(skill => skill.id === Skill.M_CURSED_WAND))) {
			fightData.fighters.forEach(f => {
				if (!f.attacker || f.initiallyCursed) return;
				if (hasStatus(f, FightStatus.NO_CURSE)) return;

				f.permanentStatusGained.push(DinozStatusId.CURSED);

				// Add cursed step
				fightData.steps.push({
					action: 'cursed',
					fighter: stepFighter(f)
				});
			});
		}
	}

	// Place hypnotized fighters in the right teams
	fightData.fighters.map(f => {
		if (f.hypnotized && f.hypnotized > 0) {
			f.attacker = !f.attacker;
		}
	});

	// Get dinoz results
	const attackersResults: FighterResultFiche[] = fightData.fighters
		.filter(fighter => fighter.attacker && fighter.type === FighterType.DINOZ)
		.map(dinoz => ({
			userId: dinoz.userId,
			dinozId: dinoz.id,
			hpLost: dinoz.startingHp - Math.max(dinoz.hp, 0),
			itemsUsed: dinoz.itemsUsed,
			goldLost: fightData.fighters
				.filter(fighter => !fighter.attacker && fighter.goldStolen?.[dinoz.id])
				.reduce((acc, fighter) => acc + (fighter.goldStolen?.[dinoz.id] ?? 0), 0),
			statusGained: dinoz.permanentStatusGained
		}));

	const defendersResults: FighterResultFiche[] = fightData.fighters
		.filter(fighter => !fighter.attacker && fighter.type === FighterType.DINOZ)
		.map(dinoz => ({
			userId: dinoz.userId,
			dinozId: dinoz.id,
			hpLost: dinoz.startingHp - Math.max(dinoz.hp, 0),
			itemsUsed: dinoz.itemsUsed,
			goldLost: 0,
			statusGained: dinoz.permanentStatusGained
		}));

	// Get catches data
	const catches = fightData.fighters
		.filter(fighter => fighter.catcher)
		.map(fighter => ({
			dinozId: fighter.catcher ?? 0,
			monsterId: (Object.values(monsterList).find(monster => monster.name === fighter.name)?.id ?? 0) as Monster,
			hp: fighter.hp,
			id: fighter.catchId
		}));

	return {
		seed: config.seed,
		winner,
		attackers: attackersResults,
		defenders: defendersResults,
		catches,
		steps: fightData.steps,
		stats: fightData.stats,
		place: place,
		fighters: config.fighters.map(f => {
			return {
				id: f.id,
				type: f.type,
				name: f.name,
				display: f.display,
				costume: f.costume?.skin,
				dark: f.dark,
				size: f.size,
				entrance: f.entrance,
				attacker: f.attacker,
				maxHp: f.maxHp,
				startingHp: f.startingHp,
				energy: f.maxEnergy, // starting energy is same as max energy
				maxEnergy: f.maxEnergy,
				energyRecovery: f.stats.special.energyRecovery ?? 1
			};
		})
	};
};

/**
 * @summary Prepare the fight: go through each fighter and process all skills, status, and items that happen before the scene is revealed to the player.
 * This may include some passive special effect that don't have a visual.
 * Note: This method updates the provided fight data.
 **/
const prepareFight = (fightData: DetailedFight) => {
	let prepareStep = {
		action: 'prepare',
		dinozList: [],
		monsterList: []
	} as PrepareStep;

	// Count monsters
	const monsterCount = fightData.fighters.filter(f => f.type !== FighterType.DINOZ).length;
	// Count monsters with M_RENFORT
	const renfortApplied = fightData.fighters.filter(f => f.skills.some(skill => skill.id === Skill.M_RENFORTS)).length;
	// Count monsters with M_WORM_CALL
	const wormCalls = fightData.fighters.filter(f => f.skills.some(skill => skill.id === Skill.M_WORM_CALL)).length;

	const reinforcementData = { existingMonsters: monsterCount, renfortApplied, wormCalls };

	// Use for loop to process elements that could be added while processing the loop
	for (let i = 0; i < fightData.fighters.length; i++) {
		const fighter = fightData.fighters[i];
		// Total the starting HP of all fighters
		updateStat(fightData, fighter, 'startingHp', fighter.startingHp);

		// Skills

		if (hasSkill(fighter, Skill.STRATEGIE)) {
			applyStrategy(fightData, fighter);
		}

		if (hasSkill(fighter, Skill.SPECIALISTE)) {
			// Remove the lowest element (at this point elements have been ordered)
			fighter.elements.pop();
		}

		if (hasSkill(fighter, Skill.FORME_ETHERALE)) {
			addStatus(fightData, fighter, FightStatus.INTANGIBLE, FightStatusLength.INFINITE, false);
		}

		if (hasSkill(fighter, Skill.TORCHE)) {
			addStatus(fightData, fighter, FightStatus.TORCHED, FightStatusLength.INFINITE, false);
		}

		if (hasSkill(fighter, Skill.ACUPUNCTURE)) {
			addStatus(fightData, fighter, FightStatus.HEALING, FightStatusLength.INFINITE, false);
		}

		// TODO refine
		// M_INITIATIVE_RESET
		const initiativeResetInTeam = fightData.fighters.some(
			f => f.attacker === fighter.attacker && f.skills.some(skill => skill.id === Skill.M_INITIATIVE_RESET)
		);
		if (initiativeResetInTeam) {
			fighter.time = 1;
		}
		const initiativeResetInOpponents = fightData.fighters.some(
			f => f.attacker !== fighter.attacker && f.skills.some(skill => skill.id === Skill.M_INITIATIVE_RESET)
		);
		if (initiativeResetInOpponents) {
			fighter.time = 0;
		}

		// Items

		if (hasItem(fighter, Item.BAMBOO_FRIEND)) {
			// Add the bamboo friend as reinforcement. This reinforcement cannot be blocked.
			const bamboo = initializeMonster(
				reinforcementData,
				null,
				fighter.attacker ? 0 : 1,
				monsterList[Monster.BAMBOOZ_SPROUTING],
				fightData.place,
				true,
				fightData.rng
			);
			bamboo.master = fighter.id;
			// Just add the fighter to the fight data. It should be processed at the end of the loop.
			fightData.fighters.push(bamboo);
		}

		// Costumes
		if (hasItem(fighter, Item.VEGETOX_COSTUME)) {
			fighter.costume = {
				skin: monsterList.VEGETOX_GUARD,
				breakable: true,
				item: Item.VEGETOX_COSTUME
			};
		} else if (hasItem(fighter, Item.GOBLIN_COSTUME)) {
			fighter.costume = {
				skin: monsterList.GOBLIN,
				breakable: true,
				item: Item.GOBLIN_COSTUME
			};
		}

		// Add the step
		if (fighter.type === FighterType.DINOZ || fighter.type === FighterType.REINFORCEMENT) {
			prepareStep.dinozList.push({
				fid: fighter.id,
				statusList: fighter.status.map(s => s.type),
				costume: fighter.costume?.skin.id
			});
		} else if (fighter.type === FighterType.MONSTER || fighter.type === FighterType.BOSS) {
			prepareStep.monsterList.push({
				fid: fighter.id,
				statusList: fighter.status.map(s => s.type),
				costume: fighter.costume?.skin.id
			});
		}
		// Clones are not expected
		// What about monsters for capture glove?
	}

	// Finally push prepare step to history
	fightData.steps.push(prepareStep);
};

/**
 * @summary Start of the the fight, process all skills, status and items that happen at the beginning of the fight.
 * Magic / permanent items are processed first.
 * Then skills.
 * Then consumable items.
 * Note: This method updates the provided fight data.
 **/
const startFight = (fightData: DetailedFight) => {
	// Process all magic items
	if (fightData.rules.canUseEquipment) {
		fightData.fighters.forEach(fighter => {
			// Insert use step for all magic items with passive effects - visual only
			fighter.items.forEach(item => {
				if (item.itemType === ItemType.MAGICAL && item.passiveEffect) {
					fightData.steps.push({
						action: 'itemUse',
						fighter: stepFighter(fighter),
						itemId: item.itemId
					});
				}
			});

			// Temporal reduction - effect already applied at this point
			if (fighter.items.some(item => item.itemId === Item.TEMPORAL_REDUCTION)) {
				fightData.steps.push({
					action: 'itemUse',
					fighter: stepFighter(fighter),
					itemId: Item.TEMPORAL_REDUCTION
				});
			}

			// Curse locker
			if (fighter.items.some(item => item.itemId === Item.CURSE_LOCKER)) {
				const opponent = getLimitedRandomOpponent(fightData, fighter, [FighterType.DINOZ]);

				if (opponent) {
					fightData.steps.push({
						action: 'itemUse',
						fighter: stepFighter(fighter),
						itemId: Item.CURSE_LOCKER
					});

					// Weakest element is the last in the array
					opponent.element = opponent.elements[opponent.elements.length - 1];
					// Lock opponent for 4 cycles on that element
					opponent.locked = 4 * CYCLE;

					// Add fx for locked
					fightData.steps.push({
						action: 'notify',
						fids: [opponent.id],
						notification: NotificationList.MonoElt
					});
					addStatus(fightData, opponent, FightStatus.LOCKED);
				}
			}
		});
	}

	// Then process all skills
	fightData.fighters.forEach(fighter => {
		// Cleptomania
		if (hasSkill(fighter, Skill.CLEPTOMANE)) {
			const opponent = getLimitedRandomOpponent(fightData, fighter, [FighterType.DINOZ]);

			if (opponent) {
				// Keep only magic items
				opponent.items = opponent.items.filter(item => item.itemType === ItemType.MAGICAL);

				// Add skill step
				fightData.steps.push({
					action: 'skillAnnounce',
					fid: fighter.id,
					skill: Skill.CLEPTOMANE
				});

				// Add disabled items step
				fightData.steps.push({
					action: 'notify',
					fids: [opponent.id],
					notification: NotificationList.NoUse
				});
			}
		}

		// JOKER
		if (hasSkill(fighter, Skill.JOKER)) {
			// 50% chance to get 25% / -25% speed
			fighter.stats.speed.global *= fightData.rng() > 0.5 ? 1.25 : 0.75;

			// Add skill step
			fightData.steps.push({
				action: 'skillAnnounce',
				fid: fighter.id,
				skill: Skill.JOKER
			});
		}

		if (hasSkill(fighter, Skill.DOUBLE_FACE)) {
			// 50% chance to get positive / negative time
			fighter.time += (fightData.rng() > 0.5 ? 10 : -10) * TIME_FACTOR;

			// Add skill step
			fightData.steps.push({
				action: 'skillAnnounce',
				fid: fighter.id,
				skill: Skill.DOUBLE_FACE
			});
		}
	});

	// Finally process all consumables items used only at start of the fight
	if (fightData.rules.canUseEquipment && !fightData.rules.canUsePermanentEquipmentOnly) {
		fightData.fighters.forEach(fighter => {
			// Insert use step for all items with passive effects and consume them - visual only.
			fighter.items.forEach((item, index) => {
				if (item.itemType === ItemType.CLASSIC && item.passiveEffect) {
					fightData.steps.push({
						action: 'itemUse',
						fighter: stepFighter(fighter),
						itemId: item.itemId
					});
					// Add to items used
					fighter.itemsUsed.push(item.itemId);
					// Remove from items
					fighter.items.splice(index, 1);
				}
			});
			// TODO check items in MT's code
		});
	}
};

export default generateFight;
