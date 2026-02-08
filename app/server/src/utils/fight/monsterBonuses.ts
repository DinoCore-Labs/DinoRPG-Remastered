import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FightStatus } from '@dinorpg/core/models/fight/fightStatus.js';
import { Boss } from '@dinorpg/core/models/monster/bossList.js';
import { Monster } from '@dinorpg/core/models/monster/monsterList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { TIME_FACTOR } from '@dinorpg/core/utils/fightConstants.js';

import { createStatus } from './fightMethods.js';

const worm = (monster: DetailedFighter) => {
	monster.stats.special.armor *= 1.1;
	monster.canHitFlying = true;
	monster.hp = monster.startingHp / 2;
};

const sentinel = (monster: DetailedFighter) => {
	monster.stats.special.counter *= 1.9;
	monster.status.push(createStatus(FightStatus.NO_ASSAULT));
};

const stinger = (monster: DetailedFighter) => {
	monster.stats.special.evasion *= 1.6;
	monster.stats.speed.global *= 1.5;
	monster.status.push(createStatus(FightStatus.NO_POISON));
};

const brig1 = (monster: DetailedFighter) => {
	monster.stats.speed.global *= 1.7;
	setSkillProbability(monster, Skill.M_STEAL, 10);
};

const brig2 = (monster: DetailedFighter) => {
	monster.stats.speed.global *= 0.7;
	monster.time -= 15 * TIME_FACTOR;
	monster.stats.special.multihit *= 1.3;
	setSkillProbability(monster, Skill.M_STEAL, 5);
};

const brig3 = (monster: DetailedFighter) => {
	setSkillProbability(monster, Skill.M_STEAL, 30);
};

const ggoupi = (monster: DetailedFighter) => {
	monster.status.push(createStatus(FightStatus.NO_POISON));
};

const singmu = (monster: DetailedFighter) => {
	monster.stats.special.multihit *= 1.5;
	monster.stats.speed.global *= 0.3;
};

const cyclo = (monster: DetailedFighter) => {
	monster.stats.special.evasion *= 1.15;
	monster.stats.special.multihit *= 1.3;
};

const gromst = (monster: DetailedFighter) => {
	monster.stats.special.evasion *= 1.15;
	monster.stats.special.multihit *= 1.3;
};

const multiplySkillProbability = (monster: DetailedFighter, skillId: Skill, multiplier: number) => {
	const skill = monster.skills.find(skill => skill.id === skillId);

	if (!skill) {
		throw new Error(`Skill ${skillId} not found`);
	}

	skill.probability = (skill.probability ?? 0) * multiplier;
};

const setSkillProbability = (monster: DetailedFighter, skillId: Skill, value: number) => {
	const skill = monster.skills.find(skill => skill.id === skillId);

	if (!skill) {
		throw new Error(`Skill ${skillId} not found`);
	}

	skill.probability = value;
};

export const MonsterBonus: Partial<Record<Monster | Boss, (monster: DetailedFighter) => void>> = {
	[Monster.GOBLIN]: monster => {
		monster.stats.special.counter *= 1.5;
		monster.stats.special.multihit *= 1.3;
	},
	[Monster.DARK_SMASHROOM]: monster => {
		multiplySkillProbability(monster, Skill.M_RENFORTS, 2);
	},
	[Monster.WORM]: monster => {
		worm(monster);
	},
	[Monster.WORM2]: monster => {
		monster.stats.speed.global *= 0.6;
	},
	[Monster.EARTHWORM_MATRIARCH]: monster => {
		worm(monster);
		multiplySkillProbability(monster, Skill.M_WORM_CALL, 2);
	},
	[Monster.EARTHWORM_BABY]: monster => {
		worm(monster);
	},
	[Monster.COQDUR]: monster => {
		monster.stats.speed.global *= 0.4;
	},
	[Monster.RONCIV]: monster => {
		sentinel(monster);
	},
	[Monster.GRDIEN]: monster => {
		sentinel(monster);

		// Comet
		monster.stats.speed.global *= 1.5;
		monster.stats.base[ElementType.WOOD] = 15;
	},
	[Monster.TW_BIGBEASTLY_1]: monster => {
		monster.time += 100000 * TIME_FACTOR;
		monster.status.push(createStatus(FightStatus.ASLEEP));
	},
	[Monster.SCORP]: monster => {
		stinger(monster);
	},
	[Monster.STINGOZ]: monster => {
		stinger(monster);
	},
	[Monster.SCORPWINK_THIEF]: monster => {
		stinger(monster);
		brig3(monster);
	},
	[Monster.SCORPWINK_THIEF_2]: monster => {
		stinger(monster);
		setSkillProbability(monster, Skill.M_STEAL, 10);
	},
	[Monster.CACTUS]: monster => {
		monster.stats.special.evasion *= 1.3;
		monster.stats.speed.global *= 1.3;
		monster.spikes = 2;
	},
	[Monster.TRIPOU_THE_SOFTY]: monster => {
		multiplySkillProbability(monster, Skill.EMBUCHE, 6);
	},
	[Monster.EMMEMA_BANDIT]: monster => {
		multiplySkillProbability(monster, Skill.EMBUCHE, 6);
	},
	[Monster.BRIG1_ALL]: monster => {
		brig1(monster);
	},
	[Monster.BRIG1_HOME]: monster => {
		brig1(monster);
	},
	[Monster.BRIG2_ALL]: monster => {
		brig2(monster);
	},
	[Monster.BRIG2_HOME]: monster => {
		brig2(monster);
	},
	[Monster.MERGUEZ_THIEF]: monster => {
		brig2(monster);
	},
	[Monster.BRIG3_ALL]: monster => {
		brig3(monster);
	},
	[Monster.BRIG3_HOME]: monster => {
		brig3(monster);
	},
	[Monster.GROPI]: monster => {
		ggoupi(monster);
	},
	[Monster.ELEMENTAL_DISCIPLE]: monster => {
		monster.time -= 100 * TIME_FACTOR;
	},
	[Monster.MOUKTIZ]: monster => {
		monster.stats.speed.global *= 0.6;
		monster.stats.special.evasion *= 1.2;
	},
	[Monster.FRUTOX_DEFENDER]: monster => {
		monster.time -= 20 * TIME_FACTOR;
	},
	[Monster.FRUKOPTER]: monster => {
		monster.time -= 15 * TIME_FACTOR;
		monster.status.push(createStatus(FightStatus.KEEP_FLYING));
	},
	[Monster.DEMYOM]: monster => {
		singmu(monster);
	},
	[Monster.DEMYOM_RUINS]: monster => {
		singmu(monster);
	},
	[Monster.DEMYOM_2]: monster => {
		singmu(monster);
	},
	[Monster.SOLDIER]: monster => {
		cyclo(monster);
	},
	[Monster.CAPITAIN]: monster => {
		cyclo(monster);
	},
	[Monster.ECURENNE]: monster => {
		monster.stats.special.evasion *= 1.15;
		monster.stats.special.multihit *= 1.3;
	},
	[Monster.GROMSTER]: monster => {
		gromst(monster);
	},
	[Monster.PINK_GROMSTER]: monster => {
		gromst(monster);
	},
	[Monster.SNOW_GROMSTER]: monster => {
		gromst(monster);
	},
	[Monster.CHIMCHEREE]: monster => {
		gromst(monster);
	},
	[Monster.LAPOUF]: monster => {
		monster.stats.special.evasion *= 1.05;
		monster.stats.special.multihit *= 1.05;
		monster.stats.special.counter *= 1.1;
		monster.stats.speed.global *= 0.5;
	},
	[Boss.TW_BIGBEASTLY]: monster => {
		multiplySkillProbability(monster, Skill.CELERITE, 3);
	},
	[Boss.PR_IGOR]: monster => {
		monster.stats.special.evasion *= 1.25;
		monster.stats.speed.global *= 3;
	},
	[Boss.YAKUZI]: monster => {
		monster.stats.special.multihit *= 1.25;
	},
	[Boss.DARK_MEGASHROOM]: monster => {
		ggoupi(monster);
	},
	[Boss.DARK_MEGASHROOM_2]: monster => {
		ggoupi(monster);
	},
	[Boss.MASKED_KORGON]: monster => {
		multiplySkillProbability(monster, Skill.LANCEUR_DE_GLAND, 2);
	},
	[Boss.SOUTHERN_KORGON]: monster => {
		multiplySkillProbability(monster, Skill.LANCEUR_DE_GLAND, 2);
	},
	[Boss.DEMYOM_DEFENDER]: monster => {
		monster.stats.speed.global *= 1.5;
		monster.stats.assaultBonus[ElementType.FIRE] += 25;
		monster.stats.assaultBonus[ElementType.WOOD] += 25;
		monster.stats.assaultBonus[ElementType.WATER] += 25;
		monster.stats.assaultBonus[ElementType.LIGHTNING] += 25;
		monster.stats.assaultBonus[ElementType.AIR] += 25;
		monster.time -= 100 * TIME_FACTOR;
		monster.status.push(createStatus(FightStatus.NO_POISON));
	},
	[Boss.GROTOX]: monster => {
		monster.stats.speed.global *= 0.4;
	},
	[Boss.BEHEMOUNT]: monster => {
		monster.status.push(createStatus(FightStatus.NO_DEATH));
	},
	[Boss.SERPETHER_2]: monster => {
		monster.status.push(createStatus(FightStatus.NO_DEATH));
	}
};
