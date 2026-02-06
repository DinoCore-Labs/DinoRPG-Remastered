import { FIGHT_INFINITE } from '../../utils/fightConstants.js';

export enum FightStatus {
	// Bad
	ASLEEP = 'asleep',
	SLOWED = 'slowed',
	PETRIFIED = 'petrified',
	POISONED = 'poisoned',
	BURNED = 'burned',
	LOCKED = 'locked',
	DAZZLED = 'dazzled',
	STUNNED = 'stunned',
	// Good
	TORCHED = 'torched',
	INTANGIBLE = 'intangible',
	FLYING = 'flying',
	QUICKENED = 'quickened',
	SHIELDED = 'shielded',
	BLESSED = 'blessed',
	HEALING = 'healing',
	// Skills
	COPY_HEAL = 'copyHeal',
	NO_INVOCATION = 'noInvocation',
	USED_FUJIN = 'usedFujin',
	NO_ASSAULT = 'noAssault',
	NO_POISON = 'noPoison',
	NO_CURSE = 'noCurse',
	KEEP_FLYING = 'keepFlying',
	NO_DEATH = 'noDeath',
	// Items
	CURED = 'cured',
	BEER = 'beer',
	STOLE_LIFE = 'stoleLife',
	// Environments
	NO_EVENT = 'noEvent',
	NO_SKILL = 'noSkill',
	WEAKENED = 'weakened',
	LIGHTNING_STRUCK = 'lightningStruck',
	AIR_SLOWED = 'airSlowed',
	// Other
	// Only used for when fights are too long
	OVERTIME_POISON = 'overtime_poison'
}

export const GoodFightStatus = [
	FightStatus.TORCHED,
	FightStatus.INTANGIBLE,
	FightStatus.FLYING,
	FightStatus.QUICKENED,
	FightStatus.SHIELDED,
	FightStatus.BLESSED,
	FightStatus.HEALING
];

export const BadFightStatus = [
	FightStatus.ASLEEP,
	FightStatus.SLOWED,
	FightStatus.PETRIFIED,
	FightStatus.POISONED,
	FightStatus.BURNED,
	FightStatus.LOCKED,
	FightStatus.DAZZLED,
	FightStatus.STUNNED
];

export const IncapacitatingStatus = [FightStatus.ASLEEP, FightStatus.PETRIFIED, FightStatus.STUNNED];

export enum FightStatusLength {
	SUPER_SHORT = 6,
	SHORT = 15,
	MEDIUM = 30,
	LONG = 80,
	INFINITE = FIGHT_INFINITE
}

export type FighterStatusData = {
	type: FightStatus;
	time: number;
	timeSinceLastCycle: number;
	cycle: boolean;
};
