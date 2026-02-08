import { ElementNames } from '@dinorpg/core/models/enums/ElementType.js';
import { SkillVisualEffect } from '@dinorpg/core/models/enums/SkillVisualEffect.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import type { FighterRecap } from '@dinorpg/core/models/fight/fightResult.js';
import { BadFightStatus, GoodFightStatus } from '@dinorpg/core/models/fight/fightStatus.js';
import type { FightStep, StepFighter } from '@dinorpg/core/models/fight/fightStep.js';
import { itemNameList } from '@dinorpg/core/models/items/itemNameList.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';

import { sessionStore } from '../store/sessionStore';
import { formatText } from '../utils/formatText';
import { getSkillEnergy } from './transpileFight';

export type TFunction = (key: string, data?: Record<string, string | number>) => string;

const IGNORE_STEPS = ['moveTo', 'moveBack', 'resist', 'notify', 'anim', 'flip', 'attach'];
const DISPLAYED_STATUSES = [...GoodFightStatus, ...BadFightStatus];

const getFighterName = (fighter: StepFighter | number, t: TFunction) => {
	const store = sessionStore().getFightResult;
	let name = '';
	let attacker: boolean;
	if (typeof fighter === 'number') {
		if (!store) return name;
		const fighters = store.fighters as FighterRecap[];
		const tempo = fighters.find(f => f.id === fighter);
		if (!tempo) return name;
		if (tempo.type === FighterType.DINOZ || tempo.type === FighterType.CLONE) {
			name = tempo.name;
		} else {
			name = t(`fight.monster.${tempo.name}`);
		}
		attacker = tempo.attacker;
	} else {
		switch (fighter.type) {
			case FighterType.DINOZ:
				name = fighter.name;
				break;
			case FighterType.CLONE:
				name = `${fighter.name} (${t('fight.clone')})`;
				break;
			default:
				name = `${t(`fight.monster.${fighter.name}`)} (${fighter.id})`;
				break;
		}
		attacker = fighter.attacker;
	}

	return `${attacker ? ':attack:' : ':defense:'} ${name}`;
};

const getStatusName = (status: string, t: TFunction) => t(`fight.status.${status}`);

const getTranslatedString = (fightStep: FightStep, t: TFunction) => {
	if (IGNORE_STEPS.includes(fightStep.action)) {
		return '';
	}

	switch (fightStep.action) {
		case 'timeLimit':
			return t(`fight.step.${fightStep.action}`, {
				time: fightStep.time
			});
		case 'arrive':
			return t(`fight.step.${fightStep.action}`, {
				name: getFighterName(fightStep.fid, t)
			});
		case 'resist':
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.dinoz, t)
			});
		case 'hit': {
			if (fightStep.damage === null) {
				return t(`fight.step.hit-dodge`, {
					fighter: getFighterName(fightStep.fighter, t),
					target: getFighterName(fightStep.target, t)
				});
			} else {
				if (fightStep.critical) {
					return t('fight.step.hit-critical', {
						fighter: getFighterName(fightStep.fighter, t),
						damage: fightStep.damage,
						target: getFighterName(fightStep.target, t),
						elements: fightStep.elements.map(element => `:${ElementNames[element]}:`).join(', ')
					});
				} else {
					return t('fight.step.hit', {
						fighter: getFighterName(fightStep.fighter, t),
						damage: fightStep.damage,
						target: getFighterName(fightStep.target, t),
						elements: fightStep.elements.map(element => `:${ElementNames[element]}:`).join(', ')
					});
				}
			}
		}
		case 'moveTo':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fid, t),
				target: getFighterName(fightStep.tid, t)
			});
		case 'moveBack':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fid, t)
			});
		case 'attemptHit': {
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				target: getFighterName(fightStep.target, t)
			});
		}
		case 'death':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		case 'counter':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				opponent: getFighterName(fightStep.opponent, t)
			});
		case 'survive':
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.dinoz, t)
			});
		case 'skillAnnounce':
			return t(`fight.step.skillAnnounce`, {
				dinoz: getFighterName(fightStep.fid, t),
				skill: t(`skill.name.${skillList[fightStep.skill].name}`),
				energy: getSkillEnergy(fightStep.skill)
			});
		case 'skillActivate':
			if (fightStep.targets.length) {
				if (skillList[fightStep.skill].visualEffect == SkillVisualEffect.HEAL) {
					return t(`fight.step.skillActivate-heal-targets`, {
						dinoz: getFighterName(fightStep.fid, t),
						skill: t(`skill.name.${skillList[fightStep.skill].name}`),
						targets: fightStep.targets.map(target => getFighterName(target.tid, t)).join(', '),
						heals: fightStep.targets.map(target => target.damages ?? 0).join(', '),
						elements: skillList[fightStep.skill].element.map(element => `:${ElementNames[element]}:`).join(', ')
					});
				} else {
					return t(`fight.step.skillActivate-hit-targets`, {
						dinoz: getFighterName(fightStep.fid, t),
						skill: t(`skill.name.${skillList[fightStep.skill].name}`),
						targets: fightStep.targets.map(target => getFighterName(target.tid, t)).join(', '),
						damages: fightStep.targets.map(target => target.damages ?? 0).join(', '),
						elements: skillList[fightStep.skill].element.map(element => `:${ElementNames[element]}:`).join(', ')
					});
				}
			}
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.fid, t),
				skill: t(`skill.name.${skillList[fightStep.skill].name}`)
			});
		case 'skillExpire':
			return t(`fight.step.${fightStep.action}`, {
				dinoz: getFighterName(fightStep.dinoz, t),
				skill: t(`skill.name.${skillList[fightStep.skill].name}`)
			});
		case 'looseHp':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fid, t),
				hp: fightStep.hp
			});
		case 'addStatus':
			if (!DISPLAYED_STATUSES.includes(fightStep.status)) {
				return '';
			}
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				status: getStatusName(fightStep.status, t)
			});
		case 'removeStatus':
			if (!DISPLAYED_STATUSES.includes(fightStep.status)) {
				return '';
			}
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				status: getStatusName(fightStep.status, t)
			});
		case 'heal':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				hp: fightStep.hp
			});
		case 'itemUse':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				item: t(`items.name.${itemNameList[fightStep.itemId]}`)
			});
		case 'hypnotize':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		case 'gainEnergy':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t),
				energy: fightStep.energy
			});
		case 'newTurn':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		case 'statusTurn':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		case 'tired':
			return t(`fight.step.${fightStep.action}`, {
				fighter: getFighterName(fightStep.fighter, t)
			});
		default:
			return JSON.stringify(fightStep);
	}
};

const translateFightStep = (fightStep: FightStep, t: TFunction) => {
	return formatText(getTranslatedString(fightStep, t));
};

export default translateFightStep;
