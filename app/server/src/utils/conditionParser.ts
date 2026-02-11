import { Condition } from '@dinorpg/core/models/enums/ConditionType.js';
import { Comparator, ConditionEnum } from '@dinorpg/core/models/enums/Parser.js';
import { placeList } from '@dinorpg/core/models/place/placeList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { PlayerForConditionCheck } from './user/userConditionCheck.js';

export function conditionParser(condition: Condition, user: PlayerForConditionCheck, activeDinoz: number): boolean {
	let result;
	const GOTO = condition[ConditionEnum.GOTO];
	const PLACE_IS = condition[ConditionEnum.PLACE_IS];

	const MIN_LEVEL = condition[ConditionEnum.MINLEVEL];
	const MAX_LEVEL = condition[ConditionEnum.MAXLEVEL];
	const STATUS = condition[ConditionEnum.STATUS];
	//const FINISHED_MISSION = condition[ConditionEnum.FINISHED_MISSION];
	const SKILL = condition[ConditionEnum.SKILL];
	//const SCENARIO = condition[ConditionEnum.SCENARIO];
	const POSSESS_OBJECT = condition[ConditionEnum.POSSESS_OBJECT];
	const PLAYER_EPIC = condition[ConditionEnum.PLAYER_EPIC];
	const RANDOM = condition[ConditionEnum.RANDOM];
	const COLLEC = condition[ConditionEnum.COLLEC];
	const DINOZ_LIFE = condition[ConditionEnum.DINOZ_LIFE];
	const ACTIVE = condition[ConditionEnum.ACTIVE];
	const DAY = condition[ConditionEnum.DAY];
	const TIME = condition[ConditionEnum.TIME];
	const EQUIP = condition[ConditionEnum.EQUIP];
	const HOUR = condition[ConditionEnum.HOUR];
	const CURRENT_MISSION = condition[ConditionEnum.CURRENT_MISSION];
	const CURRENT_STEP = condition[ConditionEnum.CURRENT_STEP];
	const DINOZ_COUNT = condition[ConditionEnum.DINOZ_COUNT];
	const PLAYER_POINT = condition[ConditionEnum.PLAYER_POINT];
	const POSSESS_INGREDIENT = condition[ConditionEnum.POSSESS_INGREDIENT];

	const myDinoz = user.dinoz.find(d => d.id === activeDinoz);

	const dinozCount = user.ranking?.dinozCount ?? 0;

	if (!myDinoz) {
		throw new ExpectedError(`No dinoz ${activeDinoz} found for parser.`);
	}

	if (MIN_LEVEL) {
		result = myDinoz.level >= MIN_LEVEL;
	} else if (MAX_LEVEL) {
		result = myDinoz.level <= MAX_LEVEL;
	} else if (STATUS) {
		result = myDinoz.status.some(st => st.statusId === STATUS);
	} /*else if (FINISHED_MISSION) {
		result = myDinoz.missions.find(missions => missions.missionId === FINISHED_MISSION)?.isFinished ?? false;
	} else if (CURRENT_MISSION) {
		result =
			myDinoz.missions.find(missions => missions.missionId === CURRENT_MISSION && missions.isFinished === false) !==
			undefined;
	} else if (CURRENT_STEP) {
		result =
			myDinoz.missions.find(missions => missions.step === CURRENT_STEP && missions.isFinished === false) !== undefined;
	}*/ else if (DINOZ_COUNT) {
		const [comparator, value] = DINOZ_COUNT;

		switch (comparator) {
			case '==':
				result = dinozCount === value;
				break;
			case '>':
				result = dinozCount > value;
				break;
			case '>=':
				result = dinozCount >= value;
				break;
			case '<':
				result = dinozCount < value;
				break;
			case '<=':
				result = dinozCount <= value;
				break;
			default:
				result = false;
				break;
		}
	} else if (SKILL) {
		result = myDinoz.skills.some(dinozSkill => dinozSkill.skillId === SKILL);
	} else if (GOTO) {
		const place = Object.entries(placeList).find(place => place[0].toUpperCase() === GOTO.toUpperCase());
		if (!place) {
			throw new Error(`Place ${GOTO} doesn't exist.`);
		}
		result = user.dinoz.every(dinoz => place[1].placeId === dinoz.placeId);
	} else if (PLACE_IS) {
		const thisplace = placeList[PLACE_IS];

		result = myDinoz.placeId === thisplace.placeId;
	} /*else if (SCENARIO) {
		const quest = SCENARIO[0];
		const step = SCENARIO[1];
		const target = SCENARIO[2];
		const playerQuest = user.quests.find(q => q.questId === quest);
		if (playerQuest) {
			switch (target) {
				case '=':
					result = playerQuest.progression === step;
					break;
				case '+':
					result = playerQuest.progression >= step;
					break;
				case '-':
					result = playerQuest.progression <= step;
					break;
				default:
					result = false;
					break;
			}
		} else if (step === 0 && !playerQuest) {
			result = true;
		} else {
			result = false;
		}
	}*/ else if (POSSESS_OBJECT) {
		result =
			user.items.some(item => item.itemId === POSSESS_OBJECT) ||
			user.dinoz.some(dinoz => dinoz.items.some(item => item.itemId === POSSESS_OBJECT));
	} else if (PLAYER_EPIC) {
		result = user.rewards.some(reward => reward.rewardId === PLAYER_EPIC);
	} else if (RANDOM) {
		const score = Math.floor(Math.random() * RANDOM);
		const target = 0;
		result = score == target;
	} else if (COLLEC) {
		result = user.rewards.some(reward => reward.rewardId === COLLEC);
	} else if (DINOZ_LIFE) {
		switch (DINOZ_LIFE[0]) {
			case '==':
				return myDinoz.life === DINOZ_LIFE[1];
			case '>':
				return myDinoz.life > DINOZ_LIFE[1];
			case '>=':
				return myDinoz.life >= DINOZ_LIFE[1];
			case '<':
				return myDinoz.life < DINOZ_LIFE[1];
			case '<=':
				return myDinoz.life <= DINOZ_LIFE[1];
			default:
				return false;
		}
	} else if (ACTIVE) {
		result = ACTIVE;
	} /*else if (DAY !== undefined) {
		result = dayjs().day() === DAY;
	} else if (TIME) {
		const hour = dayjs().hour();
		const seed = hour + myDinoz.id;
		const rng = prand.xoroshiro128plus(seed);
		const value = prand.unsafeUniformIntDistribution(0, TIME, rng); // value between 0 and TIME (based on actual hour + dinozId)
		result = value === 0;
	}*/ else if (EQUIP) {
		result = myDinoz.items.some(i => i.itemId === EQUIP);
	} /* else if (HOUR) {
		const hour = dayjs().hour();
		result = hour === HOUR;
	}*/ else if (PLAYER_POINT) {
		const totalPoints = user.ranking?.points ?? 0;
		switch (PLAYER_POINT[0]) {
			case Comparator.EQUAL:
				return totalPoints === PLAYER_POINT[1];
			case Comparator.GREATER:
				return totalPoints > PLAYER_POINT[1];
			case Comparator.GREATER_EQUAL:
				return totalPoints >= PLAYER_POINT[1];
			case Comparator.LESSER:
				return totalPoints < PLAYER_POINT[1];
			case Comparator.LESSER_EQUAL:
				return totalPoints <= PLAYER_POINT[1];
			default:
				return false;
		}
	} else if (POSSESS_INGREDIENT) {
		const ingredientQuantity = user.ingredients?.find(i => i.ingredientId === POSSESS_INGREDIENT[0])?.quantity ?? 0;
		switch (POSSESS_INGREDIENT[1]) {
			case Comparator.EQUAL:
				return ingredientQuantity === POSSESS_INGREDIENT[2];
			case Comparator.GREATER:
				return ingredientQuantity > POSSESS_INGREDIENT[2];
			case Comparator.GREATER_EQUAL:
				return ingredientQuantity >= POSSESS_INGREDIENT[2];
			case Comparator.LESSER:
				return ingredientQuantity < POSSESS_INGREDIENT[2];
			case Comparator.LESSER_EQUAL:
				return ingredientQuantity <= POSSESS_INGREDIENT[2];
			default:
				return false;
		}
	} else {
		result = false;
	}

	if (!result) result = false;

	return result;
}
