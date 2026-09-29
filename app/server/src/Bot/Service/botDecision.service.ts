import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { BotStrategy, DinozState } from '../../../../prisma/index.js';
import { getDinozMenuRequest } from '../../Dinoz/Controller/getDinozMenu.controller.js';
import { getAvailableActions, getItinerantPlaceId } from '../../Dinoz/Service/getDinozActions.service.js';
import { BOT_GATHER_ACTIONS } from './botGather.service.js';
import { getBotMoveTargets } from './botMovement.service.js';

export type BotDecision = {
	dinozId: number;
	action: Action | 'move';
	targetPlaceId?: number;
};

const SUPPORTED_ACTIONS = new Set<Action>([
	Action.REST,
	Action.FIGHT,
	Action.ACTION,
	Action.IRMA,
	Action.IRMAS,
	Action.LEVEL_UP,
	...BOT_GATHER_ACTIONS
]);

const ACTION_WEIGHTS: Record<BotStrategy, Partial<Record<Action, number>>> = {
	[BotStrategy.BALANCED]: {
		[Action.LEVEL_UP]: 120,
		[Action.IRMA]: 70,
		[Action.IRMAS]: 70,
		[Action.ACTION]: 80,
		[Action.FIGHT]: 50,
		[Action.REST]: 100
	},
	[BotStrategy.FIGHTER]: {
		[Action.LEVEL_UP]: 120,
		[Action.IRMA]: 70,
		[Action.IRMAS]: 70,
		[Action.ACTION]: 80,
		[Action.FIGHT]: 90,
		[Action.REST]: 100
	},
	[BotStrategy.GATHERER]: {
		[Action.LEVEL_UP]: 120,
		[Action.IRMA]: 70,
		[Action.IRMAS]: 70,
		[Action.ACTION]: 80,
		[Action.FIGHT]: 25,
		[Action.REST]: 100
	},
	[BotStrategy.EXPLORER]: {
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

	for (const dinoz of playerData.dinoz) {
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

		const moveTargets = await getBotMoveTargets(userId, dinoz.id);
		for (const targetPlaceId of moveTargets) {
			candidates.push({
				value: { dinozId: dinoz.id, action: 'move', targetPlaceId },
				weight: movementWeight[strategy]
			});
		}

		for (const action of actions) {
			if (!SUPPORTED_ACTIONS.has(action.name as Action)) continue;
			const actionName = action.name as Action;
			candidates.push({
				value: {
					dinozId: dinoz.id,
					action: actionName
				},
				weight: BOT_GATHER_ACTIONS.has(actionName)
					? gatherWeight[strategy]
					: ACTION_WEIGHTS[strategy][actionName] ?? 1
			});
		}
	}

	const levelUpDecision = candidates.find(candidate => candidate.value.action === Action.LEVEL_UP);
	if (levelUpDecision) {
		return levelUpDecision.value;
	}

	const restDecision = candidates.find(candidate => candidate.value.action === Action.REST);
	if (restDecision) {
		return restDecision.value;
	}

	return weightedPick(candidates);
}
