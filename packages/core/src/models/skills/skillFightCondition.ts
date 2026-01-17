import { Operator } from '../enums/Parser.js';
import { FighterType } from '../fight/fighterType.js';
import { FightStatus } from '../fight/fightStatus.js';
import { Item } from '../items/itemList.js';

export enum SkillFightConditionEnum {
	MIN_HP,
	MAX_HP,
	FULL_HP,
	LOST_HP_0,
	LOST_HP_1,
	LOST_HP_2,
	ALIVE,
	ESCAPED,
	INVOCATION,
	STATUS,
	BAD_STATUS,
	GOOD_STATUS,
	TEAM_STATUS,
	OPPONENT_STATUS,
	HYPERVENTILATION,
	MAINS_COLLANTES,
	HYPNOSIS,
	CAN_HIT_FLYING,
	ENVIRONMENT,
	MIN_ALLIES,
	MIN_OPPONENTS,
	MIN_ELEMENTS,
	ITEM_USED,
	MIN_SPEED
}

export type SkillFightCondition = {
	[Operator.AND]?: [SkillFightCondition, SkillFightCondition, ...SkillFightCondition[]];
	[Operator.OR]?: [SkillFightCondition, SkillFightCondition, ...SkillFightCondition[]];
	[Operator.NOT]?: SkillFightCondition;
	// Minimum amount of HP needed
	[SkillFightConditionEnum.MIN_HP]?: number;
	// Maximum amount of HP needed
	[SkillFightConditionEnum.MAX_HP]?: number;
	// Must have as many HP as it had when the fight started
	[SkillFightConditionEnum.FULL_HP]?: boolean;
	// Must have lost at least a certain amount of HP (basic startingHp - hp)
	[SkillFightConditionEnum.LOST_HP_0]?: number;
	// Random roll base on lost HP formula 1 (based on hpDelta)
	[SkillFightConditionEnum.LOST_HP_1]?: number;
	// Random roll base on lost HP formula 2 (based on hpDelta/10)
	[SkillFightConditionEnum.LOST_HP_2]?: number;
	// Must be alive
	[SkillFightConditionEnum.ALIVE]?: boolean;
	// Must have escaped
	[SkillFightConditionEnum.ESCAPED]?: boolean;
	// Must be able to summon its invocation
	[SkillFightConditionEnum.INVOCATION]?: boolean;
	// Must have the specified status
	[SkillFightConditionEnum.STATUS]?: FightStatus;
	// Must have at least one good status
	[SkillFightConditionEnum.GOOD_STATUS]?: boolean;
	// Must have at least one bad status
	[SkillFightConditionEnum.BAD_STATUS]?: boolean;
	// At least one team-member has the specified status
	[SkillFightConditionEnum.TEAM_STATUS]?: FightStatus;
	// At least one opponent has the specified status
	[SkillFightConditionEnum.OPPONENT_STATUS]?: FightStatus;
	// Must be able to use HYPERVENTILATION
	[SkillFightConditionEnum.HYPERVENTILATION]?: boolean;
	// Must be able to use MAIN_COLLANTES
	[SkillFightConditionEnum.MAINS_COLLANTES]?: boolean;
	// Must be able to use HYPNOSIS
	[SkillFightConditionEnum.HYPNOSIS]?: boolean;
	// Must be able to hit flying fighters
	[SkillFightConditionEnum.CAN_HIT_FLYING]?: boolean;
	// Must be able to use an environment
	[SkillFightConditionEnum.ENVIRONMENT]?: boolean;
	// Must have a minimum number of allies
	[SkillFightConditionEnum.MIN_ALLIES]?: [FighterType[], number];
	// Must have a minimum number of opponents
	[SkillFightConditionEnum.MIN_OPPONENTS]?: [FighterType[], number];
	// Must have a minimum number of elements in its wheel
	[SkillFightConditionEnum.MIN_ELEMENTS]?: number;
	// Must have use an item
	[SkillFightConditionEnum.ITEM_USED]?: Item;
	// Must have minimum speed
	[SkillFightConditionEnum.MIN_SPEED]?: number;
};
