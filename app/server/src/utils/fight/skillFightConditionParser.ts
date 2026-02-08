import { Operator } from '@dinorpg/core/models/enums/Parser.js';
import { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { BadFightStatus, GoodFightStatus } from '@dinorpg/core/models/fight/fightStatus.js';
import { SkillFightCondition, SkillFightConditionEnum } from '@dinorpg/core/models/skills/skillFightCondition.js';

import { getAllies, getOpponents, hasStatus } from './fightMethods.js';
import { DetailedFight } from './generateFight.js';
import { randomBetweenSeeded } from './randomBetween.js';

/**
 * @summary Determine if the condition to use a skill is met.
 * @param condition Condition to use the skill
 * @param fightData Any data regarding the fight, used to determine if the skill can be use
 * @param fighter Any data bout the skill user, used to determine if the skill can be use
 * @returns true if the skill can be used, false, if it cannot
 */
export const checkSkillCondition = (
	condition: SkillFightCondition | undefined,
	fightData: DetailedFight,
	fighter: DetailedFighter
): boolean => {
	if (!condition) return true;
	let conditionResult = true;

	if (condition[Operator.AND]) {
		for (const subCondition of condition[Operator.AND]) {
			conditionResult = conditionResult && checkSkillCondition(subCondition, fightData, fighter);
		}
	} else if (condition[Operator.OR]) {
		conditionResult = false;
		for (const subCondition of condition[Operator.OR]) {
			conditionResult = conditionResult || checkSkillCondition(subCondition, fightData, fighter);
		}
	} else if (condition[Operator.NOT]) {
		conditionResult = !checkSkillCondition(condition[Operator.NOT], fightData, fighter);
	}

	if (condition[Operator.AND] || condition[Operator.OR] || condition[Operator.NOT]) {
		return conditionResult;
	}

	return skillConditionParser(condition, fightData, fighter);
};

export const skillConditionParser = (
	condition: SkillFightCondition,
	fightData: DetailedFight,
	fighter: DetailedFighter
): boolean => {
	let result;

	if (!condition) return true;

	const MIN_HP = condition[SkillFightConditionEnum.MIN_HP];
	const MAX_HP = condition[SkillFightConditionEnum.MAX_HP];
	const FULL_HP = condition[SkillFightConditionEnum.FULL_HP];
	const LOST_HP_0 = condition[SkillFightConditionEnum.LOST_HP_0];
	const LOST_HP_1 = condition[SkillFightConditionEnum.LOST_HP_1];
	const LOST_HP_2 = condition[SkillFightConditionEnum.LOST_HP_2];
	const ALIVE = condition[SkillFightConditionEnum.ALIVE];
	const ESCAPED = condition[SkillFightConditionEnum.ESCAPED];
	const INVOCATION = condition[SkillFightConditionEnum.INVOCATION];
	const STATUS = condition[SkillFightConditionEnum.STATUS];
	const BAD_STATUS = condition[SkillFightConditionEnum.BAD_STATUS];
	const GOOD_STATUS = condition[SkillFightConditionEnum.GOOD_STATUS];
	const TEAM_STATUS = condition[SkillFightConditionEnum.TEAM_STATUS];
	const OPPONENT_STATUS = condition[SkillFightConditionEnum.OPPONENT_STATUS];
	const HYPERVENTILATION = condition[SkillFightConditionEnum.HYPERVENTILATION];
	const MAINS_COLLANTES = condition[SkillFightConditionEnum.MAINS_COLLANTES];
	const HYPNOSIS = condition[SkillFightConditionEnum.HYPNOSIS];
	const CAN_HIT_FLYING = condition[SkillFightConditionEnum.CAN_HIT_FLYING];
	const ENVIRONMENT = condition[SkillFightConditionEnum.ENVIRONMENT];
	const MIN_ALLIES = condition[SkillFightConditionEnum.MIN_ALLIES];
	const MIN_OPPONENTS = condition[SkillFightConditionEnum.MIN_OPPONENTS];
	const MIN_ELEMENTS = condition[SkillFightConditionEnum.MIN_ELEMENTS];
	const ITEM_USED = condition[SkillFightConditionEnum.ITEM_USED];
	const MIN_SPEED = condition[SkillFightConditionEnum.MIN_SPEED];

	if (MIN_HP) {
		result = fighter.hp >= MIN_HP;
	} else if (MAX_HP) {
		result = fighter.hp <= MAX_HP;
	} else if (FULL_HP) {
		result = fighter.startingHp === fighter.hp;
	} else if (LOST_HP_0) {
		result = fighter.startingHp - fighter.hp >= LOST_HP_0;
	} else if (LOST_HP_1) {
		// The more HP lost, the more likely to be true.
		// 100% to be true if the fighter has lost as much or more than the condition value.
		let hpDelta = LOST_HP_1 - (fighter.startingHp - fighter.hp);
		if (hpDelta < 0) hpDelta = 0;
		result = randomBetweenSeeded(fightData.rng, 0, hpDelta) === 0;
	} else if (LOST_HP_2) {
		// The more HP lost, the more likely to be true.
		// 100% to be true if the fighter has lost as much or more than the condition value.
		let hpDelta = Math.round((LOST_HP_2 - (fighter.startingHp - fighter.hp)) / 10);
		if (hpDelta < 0) hpDelta = 0;
		result = randomBetweenSeeded(fightData.rng, 0, hpDelta) === 0;
	} else if (ALIVE) {
		result = fighter.hp > 0;
	} else if (ESCAPED) {
		result = fighter.escaped;
	} else if (INVOCATION) {
		result = fighter.invocations > 0;
	} else if (STATUS) {
		result = hasStatus(fighter, STATUS);
	} else if (BAD_STATUS) {
		result = fighter.status.some(s => BadFightStatus.includes(s.type));
	} else if (GOOD_STATUS) {
		result = fighter.status.some(s => GoodFightStatus.includes(s.type));
	} else if (TEAM_STATUS) {
		const allies = getAllies(fightData, fighter);
		result = allies.some(ally => hasStatus(ally, TEAM_STATUS));
	} else if (OPPONENT_STATUS) {
		result = getOpponents(fightData, fighter).some(f => hasStatus(f, OPPONENT_STATUS));
	} else if (HYPERVENTILATION) {
		result = !fighter.hasUsedHyperventilation;
	} else if (MAINS_COLLANTES) {
		result = !fighter.cancelAssaultDodge;
	} else if (HYPNOSIS) {
		result = !fighter.hasUsedHypnose;
	} else if (CAN_HIT_FLYING) {
		result = fighter.canHitFlying;
	} else if (ENVIRONMENT) {
		result = fightData.environment === undefined;
	} else if (MIN_ALLIES) {
		result = getAllies(fightData, fighter, MIN_ALLIES[0]).length >= MIN_ALLIES[1];
	} else if (MIN_OPPONENTS) {
		result = getOpponents(fightData, fighter, MIN_OPPONENTS[0]).length >= MIN_OPPONENTS[1];
	} else if (MIN_ELEMENTS) {
		result = fighter.elements.length >= MIN_ELEMENTS;
	} else if (ITEM_USED) {
		result = fighter.itemsUsed.includes(ITEM_USED);
	} else if (MIN_SPEED) {
		result = fighter.stats.speed.global >= MIN_SPEED;
	} else {
		result = false;
	}

	if (!result) result = false;

	return result;
};
