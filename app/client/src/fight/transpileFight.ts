import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { GroundEnum } from '@dinorpg/core/models/enums/GroundEnum.js';
import { SkillVisualEffect } from '@dinorpg/core/models/enums/SkillVisualEffect.js';
import type { FightText } from '@dinorpg/core/models/fight/fightDialog.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import type { FighterRecap } from '@dinorpg/core/models/fight/fightResult.js';
import { FightStatus } from '@dinorpg/core/models/fight/fightStatus.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import {
	DamagesEffect,
	DinoAction,
	EntranceEffect,
	FinishState,
	LifeEffect,
	StatusEffect,
	type transpiled
} from '@dinorpg/core/models/fight/transpiler.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { Boss, bossList } from '@dinorpg/core/models/monster/bossList.js';
import { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { placeList } from '@dinorpg/core/models/place/placeList.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import {
	BASE_ASSAULT_ENERGY_COST,
	BASE_ENERGY_COST,
	ENERGY_RECOVERY_BASE_FACTOR
} from '@dinorpg/core/utils/fightConstants.js';

import type { TFunction } from './translateFightStep';

export function resolveFightingPlace(placeId: number) {
	const place = Object.values(placeList).find(p => p.placeId === placeId);
	if (!place) return;
	return {
		bg: place.background,
		top: place.top ?? 120,
		bottom: place.bottom ?? 0,
		right: 0,
		ground: place.ground ?? GroundEnum.NONE
	};
}

export function convertElementToLifeEffect(element: ElementType) {
	switch (element) {
		case ElementType.VOID:
			return LifeEffect.Normal;
		case ElementType.FIRE:
			return LifeEffect.Fire;
		case ElementType.WOOD:
			return LifeEffect.Wood;
		case ElementType.WATER:
			return LifeEffect.Water;
		case ElementType.LIGHTNING:
			return LifeEffect.Lightning;
		case ElementType.AIR:
			return LifeEffect.Air;
		default:
			return LifeEffect.Normal;
	}
}

export function resolveSkillName(skillId: number, t: TFunction) {
	const skill = Object.values(skillList).find(skill => skill.id === skillId);
	if (!skill) return 'inconnu';
	return t(`skill.name.${skill.name}`);
}

export function resolveItemName(itemId: number, t: TFunction) {
	const item = Object.values(itemList).find(item => item.itemId === itemId);
	if (!item) return 'inconnu';
	return t(`items.name.${item.name}`);
}

export function resolveItemImagePath(itemId: number) {
	const item = Object.values(itemList).find(item => item.itemId === itemId);
	if (!item) return 'inconnu';
	return item.display;
}

export function getSkillEnergy(skillId: number) {
	const skill = Object.values(skillList).find(skill => skill.id === skillId);
	if (!skill) return 0;
	return skill.energy;
}

export function setFighterEnergy(fighter: FighterRecap, newEnergy: number) {
	if (newEnergy > fighter.maxEnergy) {
		fighter.energy = fighter.maxEnergy;
	} else if (newEnergy < 0) {
		fighter.energy = 0;
	} else {
		fighter.energy = newEnergy;
	}
}

export function resolveMonsterName(monster: string, t: TFunction) {
	return t(`fight.monster.${monster}`);
}

export function resolveFighterSize(fighter: FighterRecap) {
	if (fighter.costume) {
		return fighter.costume.size ? fighter.costume.size / 100 : 1;
	} else if (fighter.type === FighterType.DINOZ || fighter.type === FighterType.CLONE) {
		return fighter.maxHp / 100;
	} else {
		return fighter.size ? fighter.size / 100 : 1;
	}
}

export function resolveFighterDisplay(fighter: FighterRecap) {
	if (fighter.costume) {
		return fighter.costume.display ?? fighter.costume.name;
	} else {
		return fighter.display ?? fighter.name;
	}
}

export function isFighterADinoz(fighter: FighterRecap) {
	if (fighter.costume) {
		return false;
	} else {
		return fighter.type === FighterType.DINOZ || fighter.type === FighterType.CLONE;
	}
}

function isMonster(value: Monster | Boss): value is Monster {
	return Object.values(Monster).includes(value as Monster);
}

function isBoss(value: Monster | Boss): value is Boss {
	return Object.values(Boss).includes(value as Boss);
}

export function resolveSkillVisualEffect(skillId: number) {
	return Object.values(skillList).find(skill => skill.id === skillId)?.visualEffect ?? SkillVisualEffect.TODO; // Default to TODO
}

export function resolveStatus(status: FightStatus) {
	switch (status) {
		case FightStatus.ASLEEP:
			return StatusEffect.Sleep;
		case FightStatus.TORCHED:
			return StatusEffect.Flames;
		case FightStatus.BURNED:
			return StatusEffect.Burn;
		case FightStatus.INTANGIBLE:
			return StatusEffect.Intang;
		case FightStatus.FLYING:
			return StatusEffect.Fly;
		case FightStatus.SLOWED:
			return StatusEffect.Slow;
		case FightStatus.QUICKENED:
			return StatusEffect.Quick;
		case FightStatus.PETRIFIED:
			return StatusEffect.Stoned;
		case FightStatus.SHIELDED:
			return StatusEffect.Shield;
		case FightStatus.BLESSED:
			return StatusEffect.Bless;
		case FightStatus.POISONED:
		case FightStatus.OVERTIME_POISON:
			return StatusEffect.Poison;
		case FightStatus.HEALING:
			return StatusEffect.Heal;
		case FightStatus.LOCKED:
			return StatusEffect.MonoElt;
		case FightStatus.DAZZLED:
			return StatusEffect.Dazzled;
		case FightStatus.STUNNED:
			return StatusEffect.Stun;
		default:
			return -1;
	}
}

export function transpileFight(
	fighters: Array<FighterRecap>,
	fight: Array<FightStep>,
	t: TFunction,
	victory: boolean,
	startText?: FightText,
	endText?: FightText,
	dojo?: boolean
) {
	const history: transpiled[] = [];
	// Basic tracking of active fighters, this may not cover all cases.
	const activeFighters: FighterRecap[] = [];
	// ID of the previous fighter that played a turn
	let lastFighterId: number | undefined = undefined;
	// ID of the fighter whose turn it is
	let currentFighterId: number | undefined = undefined;
	// Assault combo counter of the current fighter
	let currentFighterCombo = 0;
	// ID of the fighter countering an assault
	let counteringFighterId = 0;
	// Assault combo of the fighter countering
	let counteringFighterCombo = 0;
	let myFighter: FighterRecap | undefined;
	let timeLimit: number | undefined;
	if (startText) {
		history.push({
			action: DinoAction.TEXT,
			message: t(`quest.${startText.text}`)
		});
	}
	for (const [i, step] of fight.entries()) {
		switch (step.action) {
			case 'timeLimit':
				timeLimit = step.time;
				history.push({
					action: DinoAction.TIMELIMIT,
					time: step.time
				});
				break;
			case 'prepare':
				// Prepare all Dinoz that participate in the fight
				step.dinozList.forEach(d => {
					myFighter = fighters.find(f => f.id === d.fid);
					if (!myFighter) {
						console.warn(`Cannot find fighter ${d.fid}`);
						return;
					}
					if (d.costume && isMonster(d.costume)) {
						myFighter.costume = monsterList[d.costume];
					} else if (d.costume && isBoss(d.costume)) {
						myFighter.costume = bossList[d.costume];
					}
					activeFighters.push(myFighter);
					history.push({
						action: DinoAction.ADD,
						fighter: {
							props: [myFighter.type === FighterType.BOSS ? 'Boss' : null, myFighter.dark ? 'Dark' : null],
							dino: isFighterADinoz(myFighter),
							life: myFighter.startingHp,
							maxLife: myFighter.maxHp,
							name:
								myFighter.type === FighterType.DINOZ || myFighter.type === FighterType.CLONE
									? myFighter.name
									: resolveMonsterName(myFighter.name, t),
							side: myFighter.attacker,
							scale: resolveFighterSize(myFighter),
							fid: myFighter.id,
							gfx: resolveFighterDisplay(myFighter),
							entrance: myFighter.entrance ?? EntranceEffect.STAND // Default to STAND for pre-display arrival
						}
					});
					// Initialize energy of fighter
					history.push({
						action: DinoAction.ENERGY,
						fighters: [{ fid: myFighter.id, energy: myFighter.energy }]
					});
					history.push({
						action: DinoAction.MAXENERGY,
						fighters: [{ fid: myFighter.id, energy: myFighter.maxEnergy }]
					});
					if (myFighter.type === 'monster') {
						const resolvedMonster = Object.values(monsterList).find(m => m.name === myFighter?.name);
						if (resolvedMonster && resolvedMonster.text && resolvedMonster.text.entrance) {
							history.push({
								action: DinoAction.TALK,
								fid: myFighter.id,
								message: t(`quest.${resolvedMonster.text.entrance}`)
							});
						}
					} else if (myFighter.type === 'boss') {
						const resolvedBoss = Object.values(bossList).find(b => b.name === myFighter?.name);
						if (resolvedBoss && resolvedBoss.text && resolvedBoss.text.entrance) {
							history.push({
								action: DinoAction.TALK,
								fid: myFighter.id,
								message: t(`quest.${resolvedBoss.text.entrance}`)
							});
						}
					}

					// Add status visual effect prior to revealing the fight scene
					d.statusList.forEach(s => {
						const status = resolveStatus(s);
						if (status) {
							history.push({
								action: DinoAction.STATUS,
								fid: d.fid,
								status: status
							});
						}
					});

					myFighter = undefined;
				});

				// Reveal the fight scene
				history.push({
					action: DinoAction.DISPLAY
				});

				// Introduce the other fighters to the scene
				step.monsterList.forEach(m => {
					myFighter = fighters.find(f => f.id === m.fid);
					if (!myFighter) {
						console.warn(`Cannot find fighter ${m.fid}`);
						return;
					}
					activeFighters.push(myFighter);
					history.push({
						action: DinoAction.ADD,
						fighter: {
							props: [myFighter.type === FighterType.BOSS ? 'Boss' : null, myFighter.dark ? 'Dark' : null],
							dino: isFighterADinoz(myFighter),
							life: myFighter.startingHp,
							maxLife: myFighter.maxHp,
							name:
								myFighter.type === FighterType.DINOZ || myFighter.type === FighterType.CLONE
									? myFighter.name
									: resolveMonsterName(myFighter.name, t),
							side: myFighter.attacker,
							scale: resolveFighterSize(myFighter),
							fid: myFighter.id,
							gfx: resolveFighterDisplay(myFighter),
							entrance: myFighter.entrance ?? EntranceEffect.RUN // Default to RUN for post-display arrival
						}
					});
					// Initialize energy of fighter
					history.push({
						action: DinoAction.ENERGY,
						fighters: [{ fid: myFighter.id, energy: myFighter.energy }]
					});
					history.push({
						action: DinoAction.MAXENERGY,
						fighters: [{ fid: myFighter.id, energy: myFighter.maxEnergy }]
					});
					if (myFighter.type === 'monster') {
						const resolvedMonster = Object.values(monsterList).find(m => m.name === myFighter?.name);
						if (resolvedMonster && resolvedMonster.text && resolvedMonster.text.entrance) {
							history.push({
								action: DinoAction.TALK,
								fid: myFighter.id,
								message: t(`quest.${resolvedMonster.text.entrance}`)
							});
						}
					} else if (myFighter.type === 'boss') {
						const resolvedBoss = Object.values(bossList).find(b => b.name === myFighter?.name);
						if (resolvedBoss && resolvedBoss.text && resolvedBoss.text.entrance) {
							history.push({
								action: DinoAction.TALK,
								fid: myFighter.id,
								message: t(`quest.${resolvedBoss.text.entrance}`)
							});
						}
					}
					// Add status visual effect
					m.statusList.forEach(s => {
						const status = resolveStatus(s);
						if (status) {
							history.push({
								action: DinoAction.STATUS,
								fid: m.fid,
								status: status
							});
						}
					});

					myFighter = undefined;
				});
				break;
			case 'arrive':
				myFighter = fighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}
				activeFighters.push(myFighter);
				history.push({
					action: DinoAction.ADD,
					fighter: {
						props: [myFighter.type === FighterType.BOSS ? 'Boss' : null, myFighter.dark ? 'Dark' : null],
						dino: myFighter.type === FighterType.DINOZ || myFighter.type === FighterType.CLONE,
						life: myFighter.startingHp,
						maxLife: myFighter.maxHp,
						name:
							myFighter.type === FighterType.DINOZ || myFighter.type === FighterType.CLONE
								? myFighter.name
								: resolveMonsterName(myFighter.name, t),
						side: myFighter.attacker,
						scale:
							myFighter.type === FighterType.DINOZ || myFighter.type === FighterType.CLONE
								? myFighter.maxHp / 100
								: myFighter.size
									? myFighter.size / 100
									: 1,
						fid: myFighter.id,
						gfx: myFighter.display,
						entrance: EntranceEffect.JUMP // Actual default is stand, but it's way less classy
					}
				});
				// Initialize energy of fighter
				history.push({
					action: DinoAction.ENERGY,
					fighters: [{ fid: myFighter.id, energy: myFighter.energy }]
				});
				history.push({
					action: DinoAction.MAXENERGY,
					fighters: [{ fid: myFighter.id, energy: myFighter.maxEnergy }]
				});
				if (myFighter.type === 'monster') {
					const resolvedMonster = Object.values(monsterList).find(m => m.name === myFighter?.name);
					if (resolvedMonster && resolvedMonster.text && resolvedMonster.text.entrance) {
						history.push({
							action: DinoAction.TALK,
							fid: myFighter.id,
							message: t(`quest.${resolvedMonster.text.entrance}`)
						});
					}
				} else if (myFighter.type === 'boss') {
					const resolvedBoss = Object.values(bossList).find(b => b.name === myFighter?.name);
					if (resolvedBoss && resolvedBoss.text && resolvedBoss.text.entrance) {
						history.push({
							action: DinoAction.TALK,
							fid: myFighter.id,
							message: t(`quest.${resolvedBoss.text.entrance}`)
						});
					}
				}
				myFighter = undefined;
				break;
			case 'activateEnvironment':
				break;
			case 'addStatus':
				const status = resolveStatus(step.status);
				if (status) {
					history.push({
						action: DinoAction.STATUS,
						fid: step.fighter.id,
						status: status
					});
				}
				break;
			case 'attemptHit':
				const next = fight[i + 1];
				if (!next || next.action !== 'hit') {
					history.push({
						action: DinoAction.DAMAGES,
						fid: step.fighter.id,
						tid: step.target.id,
						damages: 0,
						effect: DamagesEffect.Missed
					});
				}
				break;
			case 'cursed':
				break;
			case 'death':
				myFighter = activeFighters.find(f => f.id === step.fighter.id);
				if (myFighter && myFighter.type === 'monster') {
					const resolvedMonster = Object.values(monsterList).find(m => m.name === myFighter?.name);
					if (resolvedMonster && resolvedMonster.text && resolvedMonster.text.entrance) {
						history.push({
							action: DinoAction.TALK,
							fid: myFighter.id,
							message: t(`quest.${resolvedMonster.text.entrance}`)
						});
					}
				} else if (myFighter && myFighter.type === 'boss') {
					const resolvedBoss = Object.values(bossList).find(b => b.name === myFighter?.name);
					if (resolvedBoss && resolvedBoss.text && resolvedBoss.text.entrance) {
						history.push({
							action: DinoAction.TALK,
							fid: myFighter.id,
							message: t(`quest.${resolvedBoss.text.entrance}`)
						});
					}
				}
				history.push({
					action: DinoAction.DEAD,
					fid: step.fighter.id
				});
				activeFighters.filter(f => f.id != step.fighter.id);
				myFighter = undefined;
				break;
			case 'disabledItems':
				break;
			case 'endHypnosis':
				history.push({
					action: DinoAction.GOTO,
					fid: step.fighter.id,
					tid: step.ally.id,
					saveStartPosition: false
				});
				history.push({
					action: DinoAction.FLIP,
					fid: step.fighter.id
				});
				break;
			case 'expireEnvironment':
				break;
			case 'gainEnergy':
				myFighter = activeFighters.find(f => f.id === step.fighter.id);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fighter.id}`);
					return;
				}
				myFighter.energy += step.energy;
				history.push({
					action: DinoAction.ENERGY,
					fighters: [{ fid: step.fighter.id, energy: step.energy }]
				});
				myFighter = undefined;
				break;
			case 'hypnotize':
				history.push({
					action: DinoAction.SKILL,
					skill: SkillVisualEffect.HYPNOSE,
					details: {
						fid: step.fighter.id,
						targets: [{ id: step.target.id }]
					}
				});
				break;
			case 'heal':
				history.push({
					action: DinoAction.REGEN,
					fid: step.fighter.id,
					amount: step.hp,
					lifeFx: { fx: step.fx }
				});
				break;
			case 'hit':
				// Determine the effect of the hit: by default it is based on the element
				// But it can be overridden by a special effect associated to the skill

				const element = step.elements[0] ?? ElementType.VOID;

				let hitFx = {
					fx: convertElementToLifeEffect(element)
				};

				let damageFx;
				if (step.skill) {
					const hit_skill = Object.values(skillList).find(skill => skill.id === step.skill);
					if (hit_skill && hit_skill.lifeEffect) {
						hitFx = hit_skill.lifeEffect;
					}
					if (hit_skill && hit_skill.damageEffect) {
						damageFx = hit_skill.damageEffect;
					}
				}
				history.push({
					action: DinoAction.DAMAGES,
					fid: step.fighter.id,
					tid: step.target.id,
					damages: step.damage,
					lifeFx: hitFx,
					effect: damageFx,
					textColor: step.critical ? 0xffff00 : undefined,
					textScaleFactor: step.critical ? 3 : undefined
				});

				myFighter = activeFighters.find(f => f.id === step.fighter.id);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fighter.id}`);
					return;
				}
				if (currentFighterId === myFighter.id && currentFighterCombo === 0) {
					// First assault of fighter whose turn it is
					setFighterEnergy(myFighter, myFighter.energy - BASE_ASSAULT_ENERGY_COST - BASE_ENERGY_COST);
					currentFighterCombo++;
				} else if (currentFighterId === myFighter.id && currentFighterCombo > 0) {
					// Subsequent assault combo of fighter whose turn it is
					// Each combo increases the cost by 1, in other words the combo number
					setFighterEnergy(myFighter, myFighter.energy - BASE_ENERGY_COST - currentFighterCombo);
					currentFighterCombo++;
				} else {
					// It is a counter
					// Update the ID of the fighter countering and reset the counter combo
					if (counteringFighterId !== myFighter.id) {
						counteringFighterId = myFighter.id;
						counteringFighterCombo = 0;
					}
					// Each combo increases the cost by 1, in other words the combo number
					setFighterEnergy(myFighter, myFighter.energy - BASE_ENERGY_COST - counteringFighterCombo);
					counteringFighterCombo++;
				}
				history.push({
					action: DinoAction.ENERGY,
					fighters: [{ fid: myFighter.id, energy: myFighter.energy }]
				});
				myFighter = undefined;
				break;
			case 'itemUse':
				history.push({
					action: DinoAction.OBJECT,
					fid: step.fighter.id,
					name: resolveItemName(step.itemId, t),
					item: resolveItemImagePath(step.itemId)
				});
				break;
			case 'leave':
				history.push({
					action: DinoAction.ESCAPE,
					fid: step.fighter.id
				});
				break;
			case 'looseHp':
				history.push({
					action: DinoAction.LOST,
					fid: step.fid,
					amount: step.hp,
					lifeFx: {
						fx: step.fx
					}
				});
				break;
			case 'loseSphere':
				break;
			case 'moveBack':
				history.push({
					action: DinoAction.RETURN,
					fid: step.fid
				});
				break;
			case 'moveTo':
				if (step.skill) {
					const skill = Object.values(skillList).find(skill => skill.id === step.skill);
					history.push({
						action: DinoAction.GOTO,
						fid: step.fid,
						tid: step.tid,
						effect: skill?.gotoEffect,
						shadeColor: skill?.shadeColor
					});
				} else {
					history.push({
						action: DinoAction.GOTO,
						fid: step.fid,
						tid: step.tid
					});
				}
				break;
			case 'flip':
				history.push({
					action: DinoAction.FLIP,
					fid: step.fid
				});
				break;
			case `statusTurn`:
			case `newTurn`:
				// Note the ID of the fighter playing a turn and reset the combo and counter stats
				lastFighterId = currentFighterId;
				currentFighterId = step.fighter.id;
				currentFighterCombo = 0;
				counteringFighterId = 0;
				counteringFighterCombo = 0;
				// Decrement the time bar if a time limit and time bar were set
				if (timeLimit) {
					timeLimit -= step.delta;
					history.push({
						action: DinoAction.PAUSE,
						time: step.delta
					});
				}

				const energyStep = {
					action: DinoAction.ENERGY,
					fighters: [] as {
						fid: number;
						energy: number;
					}[]
				};
				activeFighters.forEach(activeF => {
					if (lastFighterId !== undefined && lastFighterId === currentFighterId && activeF.id === currentFighterId) {
						return;
					}
					const myFighter = activeFighters.find(f => activeF.id === f.id);
					if (!myFighter) {
						return;
					}
					setFighterEnergy(
						myFighter,
						Math.round(myFighter.energy + myFighter.energyRecovery * step.delta * ENERGY_RECOVERY_BASE_FACTOR)
					);
					energyStep.fighters.push({ fid: myFighter.id, energy: myFighter.energy });
				});
				// Update energy of fighters except the one that is playing a new turn.
				history.push(energyStep as transpiled);
				break;
			case 'reduceEnergy':
				break;
			case 'removeCostume':
				break;
			case 'removeStatus':
				const statusRemoved = resolveStatus(step.status);
				if (statusRemoved) {
					history.push({
						action: DinoAction.NOSTATUS,
						fid: step.fighter.id,
						status: statusRemoved
					});
				}
				break;
			case 'resist':
				break;
			case 'revive':
				break;
			case 'setCostume':
				break;
			case 'skillAnnounce':
				myFighter = activeFighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}
				// Announce the skill
				history.push({
					action: DinoAction.ANNOUNCE,
					fid: step.fid,
					message: resolveSkillName(step.skill, t)
				});
				// Update the energy
				setFighterEnergy(myFighter, myFighter.energy - getSkillEnergy(step.skill));
				history.push({
					action: DinoAction.ENERGY,
					fighters: [
						{
							fid: myFighter.id,
							energy: myFighter.energy
						}
					]
				});
				myFighter = undefined;
				break;
			case 'skillActivate':
				myFighter = activeFighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}

				const skill = Object.values(skillList).find(skill => skill.id === step.skill);
				if (step.targets.length > 0) {
					if (!skill) {
						console.warn(`Cannot find skill ${step.skill}`);
					}
					const targetsHit = step.targets.filter(t => t.damages ?? 0 > 0).length;
					history.push({
						action: DinoAction.SKILL,
						skill: resolveSkillVisualEffect(step.skill),
						details: {
							fid: step.fid,
							targets: step.targets.map(t => {
								return { id: t.tid, life: t.damages };
							}),
							color: skill?.color,
							speed: skill?.speed,
							radius: skill?.radius,
							power: skill?.power,
							type: skill?.fxType,
							fx: skill?.fx,
							anim: skill?.anim
						}
					});
					// Play a second effect if specified
					if (skill?.visualEffectBis) {
						history.push({
							action: DinoAction.SKILL,
							skill: skill.visualEffectBis,
							details: {
								fid: step.fid,
								targets: step.targets.map(t => {
									return { id: t.tid };
								}),
								color: skill?.color,
								type: skill?.fxType,
								fx: skill?.fx
							}
						});
					}
					// Remove energy per target hit if a at least one target was hit
					if (targetsHit > 0) {
						setFighterEnergy(myFighter, myFighter.energy - targetsHit * BASE_ENERGY_COST);
						history.push({
							action: DinoAction.ENERGY,
							fighters: [{ fid: myFighter.id, energy: myFighter.energy }]
						});
					}
					myFighter = undefined;
				} else {
					history.push({
						action: DinoAction.SKILL,
						skill: resolveSkillVisualEffect(step.skill),
						details: {
							fid: step.fid,
							targets: [{ id: step.fid }],
							color: skill?.color,
							type: skill?.fxType,
							fx: skill?.fx
						}
					});
				}
				// Black hole and sylphide extract the fighter from the fight so extract it from the list of actives too
				if (step.skill && (step.skill == Skill.TROU_NOIR || step.skill == Skill.SYLPHIDES)) {
					activeFighters.filter(f => f.id != step.fid);
				}
				myFighter = undefined;
				break;
			case 'skillExpire':
				break;
			case 'notify': {
				history.push({
					action: DinoAction.NOTIFY,
					fids: step.fids,
					notification: step.notification
				});
				break;
			}
			case 'anim': {
				history.push({
					action: DinoAction.SKILL,
					skill: SkillVisualEffect.ANIM,
					details: {
						fid: step.fid,
						anim: step.anim
					}
				});
				break;
			}
			case 'attach': {
				history.push({
					action: DinoAction.SKILL,
					skill: SkillVisualEffect.ATTACH,
					details: {
						fid: step.fid,
						fx: step.fx
					}
				});
				break;
			}
			case 'loseCostume':
				myFighter = activeFighters.find(f => f.id === step.fid);
				if (!myFighter) {
					console.warn(`Cannot find fighter ${step.fid}`);
					return;
				}
				myFighter.costume = undefined;
				history.push({
					action: DinoAction.ESCAPE,
					fid: step.fid
				});
				history.push({
					action: DinoAction.ADD,
					fighter: {
						props: [myFighter.type === FighterType.BOSS ? 'Boss' : null, myFighter.dark ? 'Dark' : null],
						dino: myFighter.type === FighterType.DINOZ || myFighter.type === FighterType.CLONE,
						life: step.currentHp,
						maxLife: myFighter.maxHp,
						name:
							myFighter.type === FighterType.DINOZ || myFighter.type === FighterType.CLONE
								? myFighter.name
								: resolveMonsterName(myFighter.name, t),
						side: myFighter.attacker,
						scale: resolveFighterSize(myFighter),
						fid: myFighter.id,
						gfx: myFighter.display,
						entrance: myFighter.entrance ?? EntranceEffect.RUN // Default to RUN for any post-start arrivals
					}
				});
				break;
			case 'stealGold':
				break;
			case 'survive':
				break;
		}
	}
	if (endText && victory) {
		history.push({
			action: DinoAction.TEXT,
			message: t(`quest.${endText.text}`)
		});
	}
	if (dojo) {
		history.push({
			action: DinoAction.FINISH,
			right: FinishState.STAND,
			left: FinishState.STAND
		});
	} else if (victory) {
		history.push({
			action: DinoAction.FINISH,
			right: FinishState.STAND,
			left: FinishState.RUN
		});
	} else {
		history.push({
			action: DinoAction.FINISH,
			right: FinishState.STAND,
			left: FinishState.STAND
		});
	}

	return history;
}
