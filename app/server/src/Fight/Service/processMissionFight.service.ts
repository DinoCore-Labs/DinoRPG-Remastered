import type { MissionFightGoal } from '@dinorpg/core/models/missions/missionGoal.js';

//import { createMissionFight } from './missionFight.factory.js';

type StartMissionGoalFightInput = {
	userId: string;
	dinozId: number;
	goal: MissionFightGoal;
};

export async function processMissionFight(input: StartMissionGoalFightInput) {
	/*const fight = await createMissionFight({
		userId: input.userId,
		dinozId: input.dinozId,
		monsterKeys: input.goal.monsterKeys
	});

	return fight;*/
}
