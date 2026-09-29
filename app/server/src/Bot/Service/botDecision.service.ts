import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { BotStrategy, DinozState } from '../../../../prisma/index.js';
import { getDinozMenuRequest } from '../../Dinoz/Controller/getDinozMenu.controller.js';
import { getAvailableActions, getItinerantPlaceId } from '../../Dinoz/Service/getDinozActions.service.js';

export type BotDecision = {
	dinozId: number;
	action: Action;
};

const SUPPORTED_ACTIONS = new Set<Action>([Action.REST, Action.FIGHT]);

const ACTION_WEIGHTS: Record<BotStrategy, Partial<Record<Action, number>>> = {
	[BotStrategy.BALANCED]: {
		[Action.FIGHT]: 50,
		[Action.REST]: 100
	},
	[BotStrategy.FIGHTER]: {
		[Action.FIGHT]: 90,
		[Action.REST]: 100
	},
	[BotStrategy.GATHERER]: {
		[Action.FIGHT]: 25,
		[Action.REST]: 100
	},
	[BotStrategy.EXPLORER]: {
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

		for (const action of actions) {
			if (!SUPPORTED_ACTIONS.has(action.name as Action)) continue;
			const actionName = action.name as Action;
			candidates.push({
				value: {
					dinozId: dinoz.id,
					action: actionName
				},
				weight: ACTION_WEIGHTS[strategy][actionName] ?? 1
			});
		}
	}

	const restDecision = candidates.find(candidate => candidate.value.action === Action.REST);
	if (restDecision) {
		return restDecision.value;
	}

	return weightedPick(candidates);
}
