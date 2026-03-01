import { DinozItems } from '@dinorpg/core/models/dinoz/dinozItems.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
//import { ConditionEnum } from '@dinorpg/core/models/enums/Parser.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { currentEvents, EventDetails, GameEvent } from '@dinorpg/core/models/events/events.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightProcessResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { bossList } from '@dinorpg/core/models/monster/bossList.js';
import { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { placeList, SWAMP_FOG_DAYS } from '@dinorpg/core/models/place/placeList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { calculatePvExp, getMaxXp } from '@dinorpg/core/utils/dinozUtils.js';
//import { getActualStep } from '@drpg/core/utils/MissionUtils';
//import { createCatch, removeCatch, updateCatch } from '../dao/dinozCatchDao.js';
//import { scenarioChecker } from '../utils/scenarioChecker.js';
//import { getPlayerEventProgression, increasePlayerEventProgression } from '../dao/eventsDao.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { Dinoz, DinozSkills, DinozStatus, User } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../../Dinoz/Controller/dinozStatus.controller.js';
import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { removeItemFromDinoz } from '../../Inventory/Controller/removeItemFromDinoz.controller.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { addMoney, removeMoney } from '../../User/Controller/money.controller.js';
import { calculateXPBonus, isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { generateString, getRandomNumber } from '../../utils/dinoz/displayDinoz.js';
import {
	DinozToGetFighter,
	FightConfiguration,
	FightRules,
	MONSTER_FIGHT_RULES
} from '../../utils/fight/fight.mapper.js';
import generateFight from '../../utils/fight/generateFight.js';
import getFighters from '../../utils/fight/getFighters.js';
import randomBetween from '../../utils/fight/randomBetween.js';
import weightedRandom from '../../utils/fight/weightedRandom.js';
import { createXorShift32, hashStringToInt } from '../../utils/prng.js';
import { ProcessFightInput } from '../Schema/fight.schema.js';
import { movementListener } from './movementListener.service.js';

/**
 * @summary Process a fight
 * @param req
 * @return FightResult
 */
export async function processFight(req: FastifyRequest<{ Body: ProcessFightInput }>, reply: FastifyReply) {
	const dinozId = req.body.dinozId;

	const dayOfWeek = new Date().getDay();
	const authed = req.user;

	// Get Dinoz info
	const user = await getDinozFightDataRequest(dinozId, authed.id);
	if (!user) throw new ExpectedError('userNotFound', { params: { id: authed.id } });

	const dinozData = user.dinoz.find(d => d.id === dinozId);
	if (!dinozData) throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });

	// Marais Collant - No fight days
	if (SWAMP_FOG_DAYS.includes(dayOfWeek) && dinozData.placeId === PlaceEnum.MARAIS_COLLANT) {
		if (!dinozData.status.some(s => s.statusId === DinozStatusId.WEIRD_SWAMP_SEEN)) {
			await addStatusToDinoz(dinozData.id, DinozStatusId.WEIRD_SWAMP_SEEN);
		}
		throw new ExpectedError('noFight');
	}

	if (dinozData.canRename) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	if (dinozData.state !== null) {
		throw new ExpectedError(`Dinoz is not able to fight.`);
	}

	let team = user.dinoz;

	// Go through followers and make those that are unavailable leave the group.
	const unavailableFollowers = team.filter(d => d.life <= 0 || d.state !== null);

	if (unavailableFollowers.length > 0) {
		for (const d of unavailableFollowers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
		team = team.filter(d => d.life > 0 && d.state === null);
	}

	/*if (dinozData.concentration) {
		throw new ExpectedError(translate(`concentration`, authed));
	}*/

	if (team.some(d => !d.fight)) {
		throw new ExpectedError(`missingIrma`);
	}

	if (!isAlive(dinozData)) {
		throw new ExpectedError(`dead`);
	}

	// Look for a special action that happens on the fight.
	let fight = await movementListener(user, team, dinozData.placeId, dinozId);

	// If no fight happened, trigger a regular fight.
	if (!fight) {
		fight = await fightMonstersAtPlace(team, dinozData.placeId, user);
	}

	// Consume fight action
	for (const dino of team) {
		await updateDinoz(dino.id, {
			fight: false
		});
	}

	// Update player stats
	await incrementUserStat(
		StatTracking.KILL_M,
		user.id,
		fight?.fighters.filter(f => f.type === FighterType.MONSTER).length ?? 0
	);

	return reply.send(fight);
}

/**
 * @summary Calculates a fight against monsters at a given place, award
 *
 * This method generates the list of monsters encountered by the group.
 * The group of Dinoz will earn experience and gold.
 * The monsters are considered the defending team and in case of draw, the monsters (defenders) are considered as winners.
 *
 * @returns FightProcessResult
 **/
export async function fightMonstersAtPlace(
	team: (DinozToGetFighter & DinozToRewardFight) /*& DinozToCheckMissionFight*/[],
	placeId: PlaceEnum,
	user: Pick<User, 'id' | 'teacher' | 'cooker'>
) {
	const dayOfWeek = new Date().getDay();
	let monsters = await generateMonsterList(team, placeId);

	// Marais Collant - No fights days.
	if (SWAMP_FOG_DAYS.includes(dayOfWeek) && placeId === PlaceEnum.MARAIS_COLLANT) {
		monsters = [];
		for (const dinoz of team) {
			if (!dinoz.status.some(s => s.statusId === DinozStatusId.WEIRD_SWAMP_SEEN)) {
				await addStatusToDinoz(dinoz.id, DinozStatusId.WEIRD_SWAMP_SEEN);
			}
		}
	}
	const fightResult = calculateFightVsMonsters(team, user, placeId, monsters);
	const result = await rewardFight(team, monsters, fightResult, placeId, user);

	// If any dinoz is on a mission, check if the fight result progress the mission
	/*for (const dinoz of team) {
		if (dinoz.missions.some(mission => !mission.isFinished)) {
			const dinozAtFuturePlace = structuredClone(dinoz);
			dinozAtFuturePlace.placeId = placeId;
			await checkMissionFight(dinozAtFuturePlace, result);
		}
	}*/
	return result;
}

/**
 * @summary Calculates a fight against monsters
 * If a seed is provided, the fight will be played using said seed. If not a seed will be generated.
 * Rules are:
 * - capture is authorized
 * - stats are disabled
 *
 * The monsters are considered the defending team and in case of draw, the monsters (defenders) are considered as winners.
 *
 * @returns FightProcessResult
 **/
export function calculateFightVsMonsters(
	team: DinozToGetFighter[],
	user: Pick<User, 'id' /*| 'cooker'*/>,
	place: PlaceEnum,
	monsters?: MonsterFiche[],
	seed?: string
): FightProcessResult {
	const rng_seed = seed ?? generateString(20);
	const rng = createXorShift32(hashStringToInt(rng_seed));

	const fighters = getFighters(
		{
			dinozList: team,
			monsterList: []
		},
		{
			dinozList: [],
			monsterList: monsters ?? []
		},
		place,
		rng
	);

	const fightConfiguration: FightConfiguration = {
		seed: rng_seed,

		// Flags
		rules: MONSTER_FIGHT_RULES,

		// Teams
		attackerHasCook: false, // replace with user.cooker when cooker implementation is done
		defenderHasCook: false,

		// Fighters
		initialDinozList: team,
		fighters,

		// Place
		place
	};

	return generateFight(fightConfiguration, place, rng);
}

/**
 * @summary Calculates a fight between two teams
 * If a seed is provided, the fight will be played using said seed. If not a seed will be generated.
 * Rules are:
 * - capture is not authorized
 * - stats are enabled
 *
 * The monsters are considered the defending team and in case of draw, the monsters (defenders) are considered as winners.
 *
 * @returns FightProcessResult
 **/
export function calculateFightBetweenPlayers(
	rules: FightRules,
	teamA: DinozToGetFighter[],
	cookerA: boolean,
	teamB: DinozToGetFighter[],
	cookerB: boolean,
	place: PlaceEnum,
	timeout?: number,
	seed?: string
): FightProcessResult {
	const rng_seed = seed ?? generateString(20);
	const rng = createXorShift32(hashStringToInt(rng_seed));

	const fighters = getFighters(
		{
			dinozList: teamA,
			monsterList: []
		},
		{
			dinozList: teamB,
			monsterList: []
		},
		place,
		rng
	);

	const initialDinozList = [...teamA, ...teamB];

	const fightConfiguration: FightConfiguration = {
		seed: rng_seed,

		// Timeout
		timeout: timeout ?? 1000,

		// Flags
		rules,

		// Teams
		attackerHasCook: cookerA,
		defenderHasCook: cookerB,

		// Fighters
		initialDinozList,
		fighters,

		// Place
		place
	};

	return generateFight(fightConfiguration, place, rng);
}

export type DinozToRewardFight = Parameters<typeof rewardFight>[0][number];
export async function rewardFight(
	team: (Pick<Dinoz, 'id' | 'level' | 'experience' | 'life' | 'placeId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
		items: Pick<DinozItems, 'itemId'>[];
	})[],
	monsters: MonsterFiche[],
	fightResult: FightProcessResult,
	place: PlaceEnum,
	user: Pick<User, 'id' | 'teacher'>
) {
	if (!team.length) {
		throw new ExpectedError('userNotFound');
	}

	const userId = user.id;

	const XP_NEWB_BONUS = [20, 15, 10, 6.6, 4.3, 2.5];

	// let teamLevel = 0;
	// teamLevel += dinozData.level;

	const goldFactor = 1.0;
	let totalWinXP = 0;

	const teamLevel = team.reduce((acc, dinoz) => acc + dinoz.level, 0);

	let fgold = 0;
	let levelup = false;
	let gold = 0;

	for (const d of team) {
		//TODO escape
		/*//if escaped, no XP !
		if( Lambda.has( escaped, r.f) )
			continue;*/

		let xp = 0;
		const cur = d.level / teamLevel;

		/** Restrict the use of low level dinoz in order to make easy money **/
		let gfact = 1.0;
		if (d.experience >= getMaxXp(d) && d.level < gameConfig.dinoz.maxLevel) gfact = 0.1;
		/** Dinoz with malediction not generating gold **/
		if (d.status.some(status => status.statusId === DinozStatusId.CURSED)) {
			gfact = 0.0;
		}

		for (const f of monsters) {
			const factor = f.level >= d.level ? 1 : 4 / (4 + (d.level - f.level));
			let monsterXp = (f.xp ?? 10) * factor * cur;
			fgold += (f.gold ?? 1.0) * factor * cur * gfact;
			// newbie bonus
			if (d.level <= 5) monsterXp += XP_NEWB_BONUS[d.level - 1] * cur;
			// bonus for fighters of same level of the monster
			if (Math.abs(f.level - d.level) <= 5 && f.xpBonus) monsterXp += f.xpBonus;
			xp += monsterXp;
		}

		xp = calculatePvExp(xp, d.level, gameConfig.dinoz.maxLevel, gameConfig.dinoz.initialMaxLevel);

		xp = calculateXPBonus(d, xp, user);
		const max = getMaxXp(d);
		if (d.experience >= max) {
			// No xp if the dinoz was already at max
			levelup = true;
			xp = 0;
		} else if (d.experience + xp >= max) {
			// Else, allow xp overflow (should happen only once) and raise levelup flag
			levelup = true;
		}
		totalWinXP += xp;

		const attacker = fightResult.attackers.find(a => a.dinozId === d.id);
		if (!attacker) {
			throw new ExpectedError(`Attacker ${d.id} doesn't exist.`);
		}

		await updateDinoz(d.id, {
			life: {
				decrement: attacker.hpLost
			},
			experience: {
				increment: fightResult.winner ? xp : 0
			}
		});
		//await createLog(LogType.XPEarned, playerId, d.id, fightResult.winner ? xp : 0);
		//await createLog(LogType.HPLost, playerId, d.id, attacker.hpLost);

		// Log death if dinoz is dead
		/*if (attacker.hpLost >= d.life) {
			await createLog(LogType.Death, playerId, d.id);
		}*/

		// Add statuses
		for (const status of attacker.statusGained) {
			if (d.status.some(s => s.statusId === status)) continue;

			await addStatusToDinoz(d.id, status);
		}

		// Handle dinoz statuses
		for (const dinozStatus of d.status) {
			if (dinozStatus.statusId === DinozStatusId.FIRE_CHARM || dinozStatus.statusId === DinozStatusId.WATER_CHARM) {
				// 1/11 chance to remove charm
				if (randomBetween(0, 10) === 0) {
					await removeStatusFromDinoz(d.id, dinozStatus.statusId);
				}
			}
		}

		gold += (getRandomNumber(0, 36) + 43) * 10; // Gold base average: 610
	}

	const napo = team.filter(d => d.items.filter(i => i.itemId === Item.GOLDEN_NAPODINO)).length;
	const fprob = getRandomNumber(0, 100) - 10 * napo;

	let goldMultiplier = 1;
	if (fprob < 1) goldMultiplier = 10;
	else if (fprob < 11) goldMultiplier = 3;

	let teamSizeMalus = 1;
	for (let i = 2; i <= team.length; i++) {
		teamSizeMalus -= 0.5 * Math.pow(0.1, i - 2);
	}
	// Apply malus only if fgold is above or equal to 1.
	const malus = fgold >= 1 ? fgold * teamSizeMalus : fgold;
	gold = Math.round(gold * goldMultiplier * goldFactor * malus);

	const goldLost = fightResult.attackers.reduce((partialSum, a) => partialSum + a.goldLost, 0);
	gold -= goldLost;
	if (monsters.length === 0) {
		gold = 0;
	}

	// Check events monsters
	const eventMonsters = monsters.filter(m => m.events && m.events.length > 0);
	let itemWon = undefined;

	for (const m of eventMonsters) {
		if (m.events && m.events.length > 0 && fightResult.winner) {
			//await increasePlayerEventProgression(playerId, m.events[0]);
			switch (m.events[0]) {
				case GameEvent.CHRISTMAS:
					if (Math.floor(Math.random() * 100) <= 5) {
						itemWon = Item.CHRISTMAS_TICKET;
						await addItemToInventory(userId, Item.CHRISTMAS_TICKET, 1);
						//await createLog(LogType.ItemFound, playerId, fightResult.attackers[0].dinozId, Item.CHRISTMAS_TICKET);
					}
					break;
				case GameEvent.VALENTINE:
					if (Math.floor(Math.random() * 100) <= 15) {
						// itemsWon = Item.CHRISTMAS_TICKET;
						// await increaseItemQuantity(playerId, Item.CHRISTMAS_TICKET, 1);
					}
					break;
				default:
					break;
			}
		}
	}

	// If attackers won
	if (fightResult.winner) {
		await addMoney(userId, gold);
	} else if (goldLost) {
		await removeMoney(userId, goldLost);
	}

	// Items used
	const merguezPerPlayer: Record<string, number> = {};
	for (const fighter of [...fightResult.attackers, ...fightResult.defenders]) {
		for (const itemUsed of fighter.itemsUsed) {
			const itemRef = itemList[itemUsed];

			// Remove only classic items
			if (itemRef.itemType === ItemType.CLASSIC) {
				await removeItemFromDinoz(fighter.dinozId, itemUsed);
			}

			if (fighter.userId && itemUsed === Item.GOBLIN_MERGUEZ) {
				if (!merguezPerPlayer[fighter.userId]) {
					merguezPerPlayer[fighter.userId] = 0;
				}
				merguezPerPlayer[fighter.userId]++;
			}
		}
	}

	// Handle goblin merguez
	for (const [userId, merguezUsed] of Object.entries(merguezPerPlayer)) {
		await incrementUserStat(StatTracking.MERGUEZ, userId, merguezUsed);
	}

	//scenarioChecker(playerId, fightResult, monsters);

	// Catches
	/*for (const dinozCatch of fightResult.catches) {
		if (!dinozCatch.id) {
			// New catch

			// Ignore dead catch
			if (dinozCatch.hp <= 0) continue;

			// Create catch
			await createCatch(dinozCatch.dinozId, dinozCatch.monsterId, dinozCatch.hp);
		} else {
			// Existing catch

			// Delete catch if dead
			if (dinozCatch.hp <= 0) {
				await removeCatch(dinozCatch.id);
				continue;
			}

			// Update catch
			await updateCatch(dinozCatch.id, dinozCatch.hp);
		}
	}*/

	/*await createLog(
		LogType.Fight,
		playerId,
		undefined,
		fightResult.winner ? gold : -goldLost,
		fightResult.winner ? totalWinXP : 0,
		fightResult.attackers.reduce((partialSum, a) => partialSum + a.hpLost, 0)
	);*/

	const fighters = fightResult.fighters.map(f => {
		return {
			id: f.id,
			type: f.type,
			name: f.name,
			display: f.display,
			attacker: f.attacker,
			maxHp: f.maxHp,
			startingHp: f.startingHp,
			energy: f.energy,
			maxEnergy: f.maxEnergy,
			energyRecovery: f.energyRecovery,
			dark:
				f.type === FighterType.BOSS
					? (Object.values(bossList).find(b => b.name === f.name)?.dark ?? undefined)
					: undefined,
			size:
				f.type === FighterType.BOSS
					? (Object.values(bossList).find(b => b.name === f.name)?.size ?? undefined)
					: undefined
		};
	});
	return {
		fighters: fighters,
		goldEarned: fightResult.winner ? gold : -goldLost,
		xpEarned: fightResult.winner ? totalWinXP : 0,
		levelUp: fightResult.winner ? levelup : false,
		totalHpLost: fightResult.attackers.reduce((partialSum, a) => partialSum + a.hpLost, 0),
		result: fightResult.winner,
		history: fightResult.steps,
		hpLost: fightResult.attackers.map(a => ({
			id: a.dinozId,
			hpLost: a.hpLost
		})),
		itemsUsed: fightResult.attackers.map(a => ({
			id: a.dinozId,
			itemsUsed: a.itemsUsed
		})),
		place: place,
		itemWon: itemWon
	};
}

/**
 * Calculate the probability of a monster to appear
 * @param dinozLevel Level of the dinoz
 * @param p Probability of the monster to appear
 * @param monsterLvl Level of the monster
 * @returns The probability of the monster to appear
 */
function monsterLevelProba(dinozLevel: number, p: number, monsterLvl: number): number {
	let delta = dinozLevel - monsterLvl;
	// If monster level is higher than dinoz level
	if (delta < 0) {
		// If monster is too high level p = 0
		if (delta < -3) return 0;
		delta = -delta * 3;
	}
	delta = Math.pow(delta, 1.5);
	return Math.round((p * 1000) / (3 + delta));
}

function eventMonsterProba(
	dinozLevel: number,
	p: number,
	monsterLvl: number,
	event: EventDetails,
	eventMonsterKilled: number
) {
	let eventFactor = 1;
	if (eventMonsterKilled > event.softCap) {
		eventFactor = 0.3 * Math.exp(-0.069 * (eventMonsterKilled - event.softCap));
	}
	let delta = dinozLevel - monsterLvl;
	// If monster level is higher than dinoz level
	if (delta < 0) {
		// If monster is too high level p = 0
		if (delta < -3) return 0;
		delta = -delta * 3;
	}
	delta = Math.pow(delta, 1.5);
	delta = Math.round((p * 1000) / (3 + delta));
	return Math.round(delta * eventFactor);
}

/**
 * @summary Return a list of monsters to fight
 * @param team List of dinoz
 * @param placeOfFight Place of the fight
 * @returns List of monsters to fight
 */
export async function generateMonsterList(
	team: Pick<Dinoz, 'level' | 'placeId'> /*& DinozToCheckMissionFight*/[],
	placeOfFight: PlaceEnum
): Promise<MonsterFiche[]> {
	let teamPowerLevel = 0;
	let greatestFighterLevel = 0;
	for (const dinoz of team) {
		teamPowerLevel += dinoz.level;
		if (dinoz.level > greatestFighterLevel) greatestFighterLevel = dinoz.level;
	}
	const diff = (team.length + 2) / (team.length * 2 + 1);
	teamPowerLevel = Math.round(teamPowerLevel * diff);

	const specialProb = getRandomNumber(0, 100);
	const place = Object.values(placeList).find(place => place.placeId === placeOfFight);
	if (!place) {
		throw new ExpectedError(`This place doesn't exist.`);
	}
	const events = currentEvents();
	let eventMonsterKilled = 0;
	if (events.length > 0) {
		//const playerEvent = await getPlayerEventProgression(team[0].playerId, events[0].name);
		//eventMonsterKilled = playerEvent?.dailyProgression ?? 0;
	}
	const monsters = Object.values(monsterList)
		// Filter the possible monsters to fight
		.filter(m => {
			// Filter monsters by place if defined
			if (m.places && !m.places.includes(place.placeId)) return false;
			// Filter event monsters
			if (m.events && m.events.length > 0) {
				if (events.length === 0) return false;
				if (!m.events.some(event => events.map(e => e.name).includes(event))) return false;
			}
			// Filter monsters by zones
			return m.zones.includes(place.map);
		})
		// Calculate the probability of each monster to appear
		.map(m => {
			// 1 - If monster is a mission target, boost its probability
			/*for (const dinoz of team) {
				const actualStep = getActualStep(dinoz);
				if (
					actualStep &&
					actualStep.requirement.actionType === ConditionEnum.KILL &&
					actualStep.requirement.target.includes(m.name)
				) {
					return {
						monster: m,
						p: monsterLevelProba(greatestFighterLevel, m.odds * 10, m.level)
					};
				}
			}*/
			// 2 - If monster is special, check if it appears
			if (m.special) {
				const display = m.odds >= specialProb;
				return {
					monster: m,
					p: monsterLevelProba(greatestFighterLevel, display ? 100 : 0, m.level)
				};
				// 3 - Event monsters (already filtered previously
			} else if (m.events) {
				return {
					monster: m,
					p: eventMonsterProba(greatestFighterLevel, m.odds, m.level, events[0], eventMonsterKilled)
				};
				// 4 - Default case
			} else {
				return {
					monster: m,
					p: monsterLevelProba(greatestFighterLevel, m.odds, m.level)
				};
			}
		})
		// Keep only monsters with a probability greater than 0
		.filter(m => m.p > 0);

	let monsterLevel = 0;
	const monsterArray: MonsterFiche[] = [];
	let total = 0;
	for (const monsterArrayElement of monsters) {
		if (monsterArrayElement.p === null) {
			monsterLevel += monsterArrayElement.monster.level;
			monsterArray.push(monsterArrayElement.monster);
			monsters.shift();
		} else {
			total += monsterArrayElement.p;
		}
	}

	if (monsterArray.length === 0 && total === 0) {
		for (const monsterArrayElement of monsters) {
			monsterArrayElement.p = 100;
		}
	}

	const mdelta = Math.max(Math.round(teamPowerLevel / 4), 2);
	const ml = monsters.map(a => {
		return { monster: a.monster, odds: a.p };
	});
	while (monsterLevel < teamPowerLevel) {
		// Already calculted before
		// const total = ml.reduce((acc, item) => acc + item.odds, 0);
		const m = weightedRandom(ml).monster;
		let count = 1;
		if (m.groups) {
			const weightedGroup = weightedRandom(m.groups).quantity;
			count += weightedGroup;
		}
		for (let i = 0; i < count; i++) {
			monsterLevel += m.level;
			monsterArray.push(m);
			if (m.groups && count > 1 && monsterLevel >= teamPowerLevel) {
				break;
			}
		}
		if (m.special) {
			// TODO: Rework this part to avoid using delete

			// delete monsters[randomIndex];
			break;
		}
		monsterLevel += mdelta;
	}

	return monsterArray;
}
