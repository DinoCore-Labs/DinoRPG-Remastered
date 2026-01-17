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
