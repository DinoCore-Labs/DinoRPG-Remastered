import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';

import { resolveCurrentMission } from '../../Mission/Service/missionCurrent.service.js';
import { prisma } from '../../prisma.js';

export type BotMissionIntent =
	| { type: 'move'; placeId: number }
	| { type: 'fight' }
	| { type: 'dialog'; dialogId: string }
	| { type: 'wait' };

function getGoalIntent(goal: MissionGoal | null): BotMissionIntent | null {
	if (!goal) return null;

	switch (goal.type) {
		case 'AT':
			return goal.place == null ? null : { type: 'move', placeId: goal.place };
		case 'KILL':
			if (goal.kill.place != null) {
				return { type: 'move', placeId: goal.kill.place };
			}
			return { type: 'fight' };
		case 'FIGHT':
			return { type: 'fight' };
		case 'FIGHT_ACTION':
			if (goal.fightAction.place != null) {
				return { type: 'move', placeId: goal.fightAction.place };
			}
			return { type: 'fight' };
		case 'TALK':
			if (goal.display === 'dialog' && goal.dialogId) {
				return { type: 'dialog', dialogId: goal.dialogId };
			}
			if (goal.npcKey) {
				return { type: 'dialog', dialogId: goal.npcKey };
			}
			return null;
		case 'VALIDATE':
			return { type: 'dialog', dialogId: goal.npcKey };
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

	const intent = getGoalIntent(mission.currentGoal);
	if (!intent) return null;

	if (intent.type === 'move' && intent.placeId === dinoz.placeId) {
		if (mission.currentGoal?.type === 'KILL') {
			return { type: 'fight' };
		}
		return null;
	}

	return intent;
}
