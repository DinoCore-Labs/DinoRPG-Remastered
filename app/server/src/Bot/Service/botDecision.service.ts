import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { BotProgressionGoal, BotStrategy, DinozState } from '../../../../prisma/index.js';
import { getDinozMenuRequest } from '../../Dinoz/Controller/getDinozMenu.controller.js';
import { getAvailableActions, getItinerantPlaceId } from '../../Dinoz/Service/getDinozActions.service.js';
import { BOT_GATHER_ACTIONS, isBotGatherAction } from './botGather.service.js';
import { getBotMoveTargets } from './botMovement.service.js';
import { getBotTutorialPlan } from './botTutorial.service.js';
import { getBotMissionIntent } from './botMission.service.js';
import { canBotBuyAnotherDinoz } from './botEconomy.service.js';
import { getBotGroupPlan, getBotUngroupPlan } from './botGroup.service.js';
import { findBotEquipCandidate } from './botEquipment.service.js';
import { getBotShopPurchase } from './botShop.service.js';
import { getBotDinozActivityScore } from './botDinozSelector.service.js';
import { findBotMissionNextHop } from './botPathfinding.service.js';
import { getBotLanternProgressionStep } from './botProgressionPlanner.service.js';
import { getBotShamanProgressionStep } from './botShamanProgression.service.js';
import { shouldBotDigOldStone } from './botProgressionOpportunity.service.js';
import { getBotForcebrutUnlockStep } from './botForcebrutProgression.service.js';
import { canBotFightForcebrut } from './botForcebrut.service.js';
import { getOrAssignBotProgressionGoal } from './botProgressionMemory.service.js';
import { getBotKorgonProgressionStep } from './botKorgonProgression.service.js';
import { getBotSylvenoireProgressionStep } from './botSylvenoireProgression.service.js';
import { getBotForestGuardianProgressionStep } from './botForestGuardianProgression.service.js';
import { getBotSteppesProgressionStep } from './botSteppesProgression.service.js';
import { getBotMagnetiteProgressionStep } from './botMagnetiteProgression.service.js';
import { getBotMarketOfferPlan, shouldBotGoToMarket } from './botMarket.service.js';
import { getBotItinerantSalePlan } from './botItinerantMerchant.service.js';
import { listAvailableDialogs } from '../../Dialog/Service/dialog.service.js';

export type BotDecision = {
	dinozId: number;
	action:
		| Action
		| 'move'
		| 'dialog'
		| 'heal'
		| 'buy_dinoz'
		| 'group'
		| 'ungroup'
		| 'equip'
		| 'shop'
		| 'market_sell'
		| 'itinerant_sell'
		| 'forcebrut'
		| 'enter_dark_portal'
		| 'progression_dialog'
		| 'progression_dig'
		| 'mission_dialog'
		| 'mission_interact'
		| 'mission_wait'
		| 'tutorial_event'
		| 'tutorial_dialog'
		| 'tutorial_buy_burger'
		| 'tutorial_use_burger';
	shopId?: number;
	dialogId?: string;
	preferredLinkIds?: string[];
	targetPlaceId?: number;
	tutorialEvent?: 'DINOZ_ADOPTED' | 'GUIDE_MICHEL_SPOKEN' | 'CLAN_PAGE_VISITED' | 'ACCOUNT_PAGE_VISITED' | 'TUTORIAL_FINISHED';
};

const SUPPORTED_ACTIONS = new Set<Action>([
	Action.REST,
	Action.FIGHT,
	Action.ACTION,
	Action.IRMA,
	Action.IRMAS,
	Action.LEVEL_UP,
	Action.NPC,
	...BOT_GATHER_ACTIONS
]);

const ACTION_WEIGHTS: Record<BotStrategy, Partial<Record<Action, number>>> = {
	[BotStrategy.BALANCED]: {
		[Action.NPC]: 30,
		[Action.LEVEL_UP]: 120,
		[Action.IRMA]: 70,
		[Action.IRMAS]: 70,
		[Action.ACTION]: 80,
		[Action.FIGHT]: 50,
		[Action.REST]: 100
	},
	[BotStrategy.FIGHTER]: {
		[Action.NPC]: 20,
		[Action.LEVEL_UP]: 120,
		[Action.IRMA]: 70,
		[Action.IRMAS]: 70,
		[Action.ACTION]: 80,
		[Action.FIGHT]: 90,
		[Action.REST]: 100
	},
	[BotStrategy.GATHERER]: {
		[Action.NPC]: 20,
		[Action.LEVEL_UP]: 120,
		[Action.IRMA]: 70,
		[Action.IRMAS]: 70,
		[Action.ACTION]: 80,
		[Action.FIGHT]: 25,
		[Action.REST]: 100
	},
	[BotStrategy.EXPLORER]: {
		[Action.NPC]: 45,
		[Action.LEVEL_UP]: 120,
		[Action.IRMA]: 70,
		[Action.IRMAS]: 70,
		[Action.ACTION]: 80,
		[Action.FIGHT]: 35,
		[Action.REST]: 100
	}
};

function isActiveDinozState(state: DinozState | null): boolean {
	return state !== DinozState.frozen && state !== DinozState.sacrificed;
}

function weightedPick<T>(entries: { value: T; weight: number }[]): T | null {
	const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
	if (total <= 0) return null;

	let cursor = Math.random() * total;
	for (const entry of entries) {
		cursor -= Math.max(0, entry.weight);
		if (cursor <= 0) return entry.value;
	}
	return entries.at(-1)?.value ?? null;
}

export async function chooseBotDecision(userId: string, strategy: BotStrategy): Promise<BotDecision | null> {
	const playerData = await getDinozMenuRequest(userId);
	if (!playerData) {
		throw new ExpectedError('userNotFound', { params: { userId } });
	}

	const tutorialDinoz = playerData.dinoz[0];
	if (tutorialDinoz) {
		const tutorialPlan = await getBotTutorialPlan(userId, tutorialDinoz.id);
		if (tutorialPlan) {
			switch (tutorialPlan.type) {
				case 'event':
					return {
						dinozId: tutorialDinoz.id,
						action: 'tutorial_event',
						tutorialEvent: tutorialPlan.event
					};
				case 'move': {
					const nextHop = await findBotMissionNextHop(
						userId,
						tutorialDinoz.id,
						tutorialDinoz.placeId,
						tutorialPlan.placeId
					);
					if (nextHop != null) {
						return {
							dinozId: tutorialDinoz.id,
							action: 'move',
							targetPlaceId: nextHop
						};
					}
					return null;
				}
				case 'dialog':
					return {
						dinozId: tutorialDinoz.id,
						action: 'tutorial_dialog',
						dialogId: tutorialPlan.dialogId,
						preferredLinkIds: tutorialPlan.preferredLinkIds
					};
				case 'buy_burger':
					return {
						dinozId: tutorialDinoz.id,
						action: 'tutorial_buy_burger'
					};
				case 'use_burger':
					return {
						dinozId: tutorialDinoz.id,
						action: 'tutorial_use_burger'
					};
				case 'fight':
					return {
						dinozId: tutorialDinoz.id,
						action: Action.FIGHT
					};
			}
		}
	}

	const activeDinozCount = playerData.dinoz.filter(dinoz => isActiveDinozState(dinoz.state)).length;
	const itinerantPlaceId = await getItinerantPlaceId();
	const followableDinozCandidates = playerData.dinoz.map(dinoz => ({
		id: dinoz.id,
		raceId: dinoz.raceId,
		placeId: dinoz.placeId,
		leaderId: dinoz.leaderId,
		state: dinoz.state,
		life: dinoz.life,
		followers: dinoz.followers,
		skills: dinoz.skills,
		items: dinoz.items,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir
	}));

	const candidates: { value: BotDecision; weight: number }[] = [];
	const progressionGoals = new Map<number, BotProgressionGoal | null>();
	for (const dinoz of playerData.dinoz.slice(0, 3)) {
		progressionGoals.set(
			dinoz.id,
			await getOrAssignBotProgressionGoal(userId, dinoz.id)
		);
	}

	for (const dinoz of playerData.dinoz) {
		if (!isActiveDinozState(dinoz.state) || dinoz.life <= 0) continue;

		const sylvenoireStep = await getBotSylvenoireProgressionStep(userId, dinoz.id);
		if (!sylvenoireStep || sylvenoireStep.type === 'wait') continue;

		const memoryBonus =
			progressionGoals.get(dinoz.id) === BotProgressionGoal.SYLVENOIRE_KEY ? 140 : 0;

		if (sylvenoireStep.type === 'enter_portal') {
			candidates.push({
				value: {
					dinozId: dinoz.id,
					action: 'enter_dark_portal'
				},
				weight: 420 + memoryBonus
			});
			continue;
		}

		if (sylvenoireStep.type === 'move') {
			const nextHop = await findBotMissionNextHop(
				userId,
				dinoz.id,
				dinoz.placeId,
				sylvenoireStep.placeId
			);
			if (nextHop != null) {
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'move',
						targetPlaceId: nextHop
					},
					weight: 390 + memoryBonus
				});
			}
			continue;
		}

		candidates.push({
			value: {
				dinozId: dinoz.id,
				action: 'progression_dialog',
				dialogId: sylvenoireStep.dialogId,
				preferredLinkIds: sylvenoireStep.preferredLinkIds
			},
			weight: 410 + memoryBonus
		});
	}

	for (const dinoz of playerData.dinoz.slice(0, 3)) {
		if (!isActiveDinozState(dinoz.state) || dinoz.life <= 0) continue;

		const forcebrutUnlock = await getBotForcebrutUnlockStep(userId, dinoz.id);
		if (forcebrutUnlock) {
			if (forcebrutUnlock.type === 'move') {
				const nextHop = await findBotMissionNextHop(
					userId,
					dinoz.id,
					dinoz.placeId,
					forcebrutUnlock.placeId
				);
				if (nextHop != null) {
					candidates.push({
						value: {
							dinozId: dinoz.id,
							action: 'move',
							targetPlaceId: nextHop
						},
						weight: 275 + (progressionGoals.get(dinoz.id) === BotProgressionGoal.FORCEBRUT_TRAINING ? 100 : 0)
					});
				}
			} else {
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'progression_dialog',
						dialogId: forcebrutUnlock.dialogId,
						preferredLinkIds: forcebrutUnlock.preferredLinkIds
					},
					weight: 285 + (progressionGoals.get(dinoz.id) === BotProgressionGoal.FORCEBRUT_TRAINING ? 100 : 0)
				});
			}
		}

		const shamanStep = await getBotShamanProgressionStep(userId, dinoz.id);
		if (!shamanStep) continue;

		if (shamanStep.type === 'move') {
			const nextHop = await findBotMissionNextHop(
				userId,
				dinoz.id,
				dinoz.placeId,
				shamanStep.placeId
			);
			if (nextHop != null) {
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'move',
						targetPlaceId: nextHop
					},
					weight: 255 + (progressionGoals.get(dinoz.id) === BotProgressionGoal.SHAMAN_STRATEGY ? 100 : 0)
				});
			}
		}

		if (shamanStep.type === 'dialog') {
			candidates.push({
				value: {
					dinozId: dinoz.id,
					action: 'progression_dialog',
					dialogId: shamanStep.dialogId,
					preferredLinkIds: shamanStep.preferredLinkIds
				},
				weight: 265 + (progressionGoals.get(dinoz.id) === BotProgressionGoal.SHAMAN_STRATEGY ? 100 : 0)
			});
		}
	}

	for (const dinoz of playerData.dinoz.slice(0, 3)) {
		if (!isActiveDinozState(dinoz.state) || dinoz.life <= 0) continue;

		const magnetiteStep = await getBotMagnetiteProgressionStep(userId, dinoz.id);
		if (magnetiteStep) {
			const memoryBonus =
				progressionGoals.get(dinoz.id) === BotProgressionGoal.MAGNETITE ? 150 : 0;

			if (magnetiteStep.type === 'move') {
				const nextHop = await findBotMissionNextHop(
					userId,
					dinoz.id,
					dinoz.placeId,
					magnetiteStep.placeId
				);
				if (nextHop != null) {
					candidates.push({
						value: {
							dinozId: dinoz.id,
							action: 'move',
							targetPlaceId: nextHop
						},
						weight: 360 + memoryBonus
					});
				}
			} else {
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'progression_dialog',
						dialogId: magnetiteStep.dialogId,
						preferredLinkIds: magnetiteStep.preferredLinkIds
					},
					weight: 370 + memoryBonus
				});
			}
		}

		const steppesStep = await getBotSteppesProgressionStep(userId, dinoz.id);
		if (steppesStep) {
			const nextHop = await findBotMissionNextHop(
				userId,
				dinoz.id,
				dinoz.placeId,
				steppesStep.placeId
			);
			if (nextHop != null) {
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'move',
						targetPlaceId: nextHop
					},
					weight:
						310 +
						(progressionGoals.get(dinoz.id) === BotProgressionGoal.STEPPES_ACCESS ? 140 : 0)
				});
			}
		}

		const forestStep = await getBotForestGuardianProgressionStep(userId, dinoz.id);
		if (forestStep) {
			if (forestStep.type === 'move') {
				const nextHop = await findBotMissionNextHop(
					userId,
					dinoz.id,
					dinoz.placeId,
					forestStep.placeId
				);
				if (nextHop != null) {
					candidates.push({
						value: {
							dinozId: dinoz.id,
							action: 'move',
							targetPlaceId: nextHop
						},
						weight: 235
					});
				}
			} else {
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'progression_dialog',
						dialogId: forestStep.dialogId,
						preferredLinkIds: forestStep.preferredLinkIds
					},
					weight: 245
				});
			}
		}

		const korgonStep = await getBotKorgonProgressionStep(userId, dinoz.id);
		if (korgonStep) {
			if (korgonStep.type === 'move') {
				const nextHop = await findBotMissionNextHop(
					userId,
					dinoz.id,
					dinoz.placeId,
					korgonStep.placeId
				);
				if (nextHop != null) {
					candidates.push({
						value: {
							dinozId: dinoz.id,
							action: 'move',
							targetPlaceId: nextHop
						},
						weight:
							245 +
							(progressionGoals.get(dinoz.id) === BotProgressionGoal.KORGON_FLIPPERS ? 120 : 0)
					});
				}
			} else {
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'progression_dialog',
						dialogId: korgonStep.dialogId,
						preferredLinkIds: korgonStep.preferredLinkIds
					},
					weight:
						255 +
						(progressionGoals.get(dinoz.id) === BotProgressionGoal.KORGON_FLIPPERS ? 120 : 0)
				});
			}
		}

		const progressionStep = await getBotLanternProgressionStep(userId, dinoz.id);
		if (!progressionStep) continue;

		switch (progressionStep.type) {
			case 'move': {
				const nextHop = await findBotMissionNextHop(
					userId,
					dinoz.id,
					dinoz.placeId,
					progressionStep.placeId
				);
				if (nextHop != null) {
					candidates.push({
						value: {
							dinozId: dinoz.id,
							action: 'move',
							targetPlaceId: nextHop
						},
						weight: 230 + (progressionGoals.get(dinoz.id) === BotProgressionGoal.LANTERN ? 100 : 0)
					});
				}
				break;
			}
			case 'dialog':
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'progression_dialog',
						dialogId: progressionStep.dialogId,
						preferredLinkIds: progressionStep.preferredLinkIds
					},
					weight: 240 + (progressionGoals.get(dinoz.id) === BotProgressionGoal.LANTERN ? 100 : 0)
				});
				break;
			case 'dig':
				candidates.push({
					value: {
						dinozId: dinoz.id,
						action: 'progression_dig'
					},
					weight: 240 + (progressionGoals.get(dinoz.id) === BotProgressionGoal.LANTERN ? 100 : 0)
				});
				break;
			case 'level':
				break;
		}
	}
	const movementWeight: Record<BotStrategy, number> = {
		[BotStrategy.BALANCED]: 25,
		[BotStrategy.FIGHTER]: 10,
		[BotStrategy.GATHERER]: 20,
		[BotStrategy.EXPLORER]: 80
	};

	const gatherWeight: Record<BotStrategy, number> = {
		[BotStrategy.BALANCED]: 35,
		[BotStrategy.FIGHTER]: 10,
		[BotStrategy.GATHERER]: 100,
		[BotStrategy.EXPLORER]: 25
	};

	const marketPlan = await getBotMarketOfferPlan(userId);
	if (marketPlan) {
		const marketDinoz = playerData.dinoz.find(
			dinoz =>
				dinoz.placeId === PlaceEnum.PLACE_DU_MARCHE &&
				isActiveDinozState(dinoz.state) &&
				dinoz.life > 0
		);

		if (marketDinoz) {
			candidates.push({
				value: {
					dinozId: marketDinoz.id,
					action: 'market_sell'
				},
				weight: 90
			});
		} else if (await shouldBotGoToMarket(userId)) {
			const mover = playerData.dinoz.find(
				dinoz => isActiveDinozState(dinoz.state) && dinoz.life > 0
			);
			if (mover) {
				const nextHop = await findBotMissionNextHop(
					userId,
					mover.id,
					mover.placeId,
					PlaceEnum.PLACE_DU_MARCHE
				);
				if (nextHop != null) {
					candidates.push({
						value: {
							dinozId: mover.id,
							action: 'move',
							targetPlaceId: nextHop
						},
						weight: 85
					});
				}
			}
		}
	}

	for (const dinoz of playerData.dinoz) {
		if (await canBotFightForcebrut(userId, dinoz.id, strategy)) {
			candidates.push({
				value: {
					dinozId: dinoz.id,
					action: 'forcebrut'
				},
				weight: strategy === BotStrategy.FIGHTER ? 210 : 130
			});
		}

		if (await shouldBotDigOldStone(userId, dinoz.id)) {
			candidates.push({
				value: {
					dinozId: dinoz.id,
					action: 'progression_dig'
				},
				weight:
					320 +
					(progressionGoals.get(dinoz.id) === BotProgressionGoal.FORCEBRUT_TRAINING ? 100 : 0)
			});
		}

		const actions = await getAvailableActions(
			dinoz,
			playerData,
			{},
			{
				activeDinozCount,
				followableDinozCandidates,
				itinerantPlaceId
			}
		);

		const missionIntent = await getBotMissionIntent(dinoz.id);
		if (missionIntent) {
			switch (missionIntent.type) {
				case 'move': {
					const nextHop = await findBotMissionNextHop(
						userId,
						dinoz.id,
						dinoz.placeId,
						missionIntent.placeId
					);
					if (nextHop != null) {
						candidates.push({
							value: {
								dinozId: dinoz.id,
								action: 'move',
								targetPlaceId: nextHop
							},
							weight: 160 + getBotDinozActivityScore(dinoz, 'mission')
						});
					}
					break;
				}
				case 'fight':
					if (actions.some(action => action.name === Action.FIGHT)) {
						candidates.push({
							value: { dinozId: dinoz.id, action: Action.FIGHT },
							weight: 170 + getBotDinozActivityScore(dinoz, Action.FIGHT)
						});
					}
					break;
				case 'dialog': {
					const dialogs = await listAvailableDialogs({
						userId,
						dinozId: dinoz.id
					});
					if (dialogs.some(dialog => dialog.id === missionIntent.dialogId)) {
						candidates.push({
							value: {
								dinozId: dinoz.id,
								action: 'mission_dialog',
								dialogId: missionIntent.dialogId
							},
							weight: 180 + getBotDinozActivityScore(dinoz, 'mission')
						});
					}
					break;
				}
				case 'interact':
					if (actions.some(action => action.name === Action.MISSION)) {
						candidates.push({
							value: { dinozId: dinoz.id, action: 'mission_interact' },
							weight: 180
						});
					}
					break;
				case 'wait':
					candidates.push({
						value: { dinozId: dinoz.id, action: 'mission_wait' },
						weight: 150
					});
					break;
			}
		}

		const moveTargets = await getBotMoveTargets(userId, dinoz.id);
		for (const targetPlaceId of moveTargets) {
			candidates.push({
				value: { dinozId: dinoz.id, action: 'move', targetPlaceId },
				weight: movementWeight[strategy]
			});
		}

		for (const action of actions) {
			if (action.name === Action.SHOP && typeof action.prop === 'number') {
				if (await getBotShopPurchase(userId, action.prop)) {
					candidates.push({
						value: {
							dinozId: dinoz.id,
							action: 'shop',
							shopId: action.prop
						},
						weight: 30
					});
				}
				continue;
			}
			if (action.name === Action.ITINERANTSHOP && typeof action.prop === 'number') {
				if (await getBotItinerantSalePlan(userId, action.prop)) {
					candidates.push({
						value: {
							dinozId: dinoz.id,
							action: 'itinerant_sell',
							shopId: action.prop
						},
						weight: 115
					});
				}
				continue;
			}

			if (!SUPPORTED_ACTIONS.has(action.name as Action)) continue;
			const actionName = action.name as Action;

			if (actionName === Action.NPC) {
				if (typeof action.prop === 'string') {
					candidates.push({
						value: {
							dinozId: dinoz.id,
							action: 'dialog',
							dialogId: action.prop
						},
						weight: ACTION_WEIGHTS[strategy][Action.NPC] ?? 20
					});
				}
				continue;
			}

			candidates.push({
				value: {
					dinozId: dinoz.id,
					action: actionName
				},
				weight: isBotGatherAction(actionName)
					? gatherWeight[strategy] + getBotDinozActivityScore(dinoz, actionName)
					: actionName === Action.FIGHT
						? (ACTION_WEIGHTS[strategy][actionName] ?? 1) + getBotDinozActivityScore(dinoz, actionName)
						: ACTION_WEIGHTS[strategy][actionName] ?? 1
			});
		}
	}

	for (const dinoz of playerData.dinoz) {
		if (dinoz.life > 0 && dinoz.life < Math.round(dinoz.maxLife * 0.35)) {
			candidates.unshift({
				value: { dinozId: dinoz.id, action: 'heal' },
				weight: 200
			});
		}
	}

	for (const dinoz of playerData.dinoz) {
		if (await findBotEquipCandidate(dinoz.id)) {
			candidates.push({
				value: { dinozId: dinoz.id, action: 'equip' },
				weight: strategy === BotStrategy.FIGHTER ? 45 : 25
			});
		}
	}

	const ungroupDinozId = await getBotUngroupPlan(userId);
	if (ungroupDinozId != null) {
		candidates.push({
			value: { dinozId: ungroupDinozId, action: 'ungroup' },
			weight: 190
		});
	}

	const groupPlan = await getBotGroupPlan(userId);
	if (groupPlan) {
		candidates.push({
			value: { dinozId: groupPlan.leaderId, action: 'group' },
			weight: strategy === BotStrategy.FIGHTER ? 60 : 35
		});
	}

	if (await canBotBuyAnotherDinoz(userId)) {
		candidates.push({
			value: { dinozId: playerData.dinoz[0]?.id ?? 0, action: 'buy_dinoz' },
			weight: 35
		});
	}

	const levelUpDecision = candidates.find(candidate => candidate.value.action === Action.LEVEL_UP);
	if (levelUpDecision) {
		return levelUpDecision.value;
	}

	const healDecision = candidates.find(candidate => candidate.value.action === 'heal');
	if (healDecision) {
		return healDecision.value;
	}

	const progressionDecision = candidates
		.filter(
			candidate =>
				candidate.weight >= 230 &&
				(candidate.value.action === 'progression_dialog' ||
					candidate.value.action === 'progression_dig' ||
					candidate.value.action === 'enter_dark_portal' ||
					candidate.value.action === 'move')
		)
		.sort((a, b) => b.weight - a.weight)[0];
	if (progressionDecision) {
		return progressionDecision.value;
	}

	const restDecision = candidates.find(candidate => candidate.value.action === Action.REST);
	if (restDecision) {
		return restDecision.value;
	}

	return weightedPick(candidates);
}
