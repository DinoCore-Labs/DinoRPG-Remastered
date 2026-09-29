import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';

import { resolveCurrentMission } from '../../Mission/Service/missionCurrent.service.js';
import { prisma } from '../../prisma.js';

export type BotMissionIntent =
	| { type: 'move'; placeId: number }
	| { type: 'fight' }
	| { type: 'dialog'; dialogId: string }
	| { type: 'interact' }
	| { type: 'wait' };

function getGoalIntent(goal: MissionGoal | null, currentPlaceId: number | null): BotMissionIntent | null {
	if (!goal) return null;

	const moveToGoalPlace = (placeId: number | null | undefined): BotMissionIntent | null => {
		if (placeId == null || placeId === currentPlaceId) return null;
		return { type: 'move', placeId };
	};

	switch (goal.type) {
		case 'AT':
			return moveToGoalPlace(goal.place);
		case 'KILL':
			return moveToGoalPlace(goal.kill.place) ?? { type: 'fight' };
		case 'FIGHT':
			return { type: 'interact' };
		case 'FIGHT_ACTION':
			return moveToGoalPlace(goal.fightAction.place) ?? { type: 'interact' };
		case 'TALK': {
			const move = moveToGoalPlace(goal.place);
			if (move) return move;
			if (goal.display === 'dialog' && goal.dialogId) {
				return { type: 'dialog', dialogId: goal.dialogId };
			}
			return { type: 'interact' };
		}
		case 'VALIDATE':
			return moveToGoalPlace(goal.place) ?? { type: 'interact' };
		case 'ACTION':
			return moveToGoalPlace(goal.place) ?? { type: 'interact' };
		case 'USE_ITEM':
		case 'USE_MONEY':
		case 'USE_INGREDIENT':
			return moveToGoalPlace(goal.place) ?? { type: 'interact' };
		case 'WAIT':
			return { type: 'wait' };
		default:
			return null;
	}
}

export async function getBotMissionIntent(dinozId: number): Promise<BotMissionIntent | null> {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			placeId: true,
			missions: {
				select: {
					id: true,
					missionKey: true,
					progression: true,
					tracking: true,
					isCompleted: true
				}
			}
		}
	});

	if (!dinoz) return null;

	const mission = resolveCurrentMission(dinoz.missions, dinoz.placeId);
	if (!mission) return null;

	const intent = getGoalIntent(mission.currentGoal, dinoz.placeId);
	if (!intent) return null;

	return intent;
}
