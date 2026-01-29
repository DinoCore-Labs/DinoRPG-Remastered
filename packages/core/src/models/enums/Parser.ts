export enum ConditionEnum {
	MINLEVEL = 'minlevel',
	MAXLEVEL = 'maxlevel',
	STATUS = 'status',
	SCENARIO = 'scenario',
	CURRENT_MISSION = 'curmssion',
	FINISHED_MISSION = 'mission',
	POSSESS_INGREDIENT = 'hasingr',
	POSSESS_OBJECT = 'hasobject',
	ACTIVE = 'active',
	PLAYER_EPIC = 'uvar',
	RANDOM = 'drand',
	HOUR = 'hour',
	TAG = 'tag',
	TIME = 'time',
	COLLEC = 'collec',
	GVAR = 'gvar',
	EVENT = 'event',
	CLANACT = 'clanact',
	SWAIT = 'swait',
	RACE = 'race',
	SKILL = 'skill',
	EQUIP = 'equip',
	UTIME = 'utime',
	GOTO = 'goto',
	TALKTO = 'talkTo',
	FINISH_MISSION = 'validate',
	KILL = 'kill',
	DO = 'do',
	HIDE_PLACE = 'hidePlace',
	PLACE_IS = 'place_is',
	OVERWRITE = 'overwrite',
	DINOZ_LIFE = 'dinoz_life',
	KILL_BOSS = 'kill_boss',
	LAUNCH_FIGHT = 'launch_fight',
	DAY = 'day',
	GIVE_ITEM = 'give_item',
	CURRENT_STEP = 'current_step',
	DINOZ_COUNT = 'dinoz_count',
	PLAYER_POINT = 'player_point'
}

export enum TriggerEnum {
	FIGHT = 'fight'
}

export enum RewardEnum {
	STATUS = 'status',
	CHANGE_ELEMENT = 'changeelem',
	MAXEXPERIENCE = 'maxExp',
	SKILL = 'skill',
	EXPERIENCE = 'xp',
	GOLD = 'gold',
	ITEM = 'item',
	MAX_ITEM = 'max_item',
	EPIC = 'epic',
	SCENARIO = 'scenario',
	TELEPORT = 'teleport',
	REDIRECT = 'redirect'
}

export enum Operator {
	AND = 'AND',
	OR = 'OR',
	NOT = 'NOT'
}

export enum Comparator {
	EQUAL = '==',
	GREATER = '>',
	GREATER_EQUAL = '>=',
	LESSER = '<',
	LESSER_EQUAL = '<='
}

export enum MathOperator {
	ADD = '+',
	EQUAL = '=',
	MULTIPLY = 'x',
	ADD_ASSAULT = '_'
}
