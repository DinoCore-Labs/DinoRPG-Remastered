import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { MissionFightActionGoal, MissionFightGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from './fight.service.js';

type StartMissionGoalFightInput = {
	userId: string;
	dinozId: number;
	goal: MissionFightGoal | MissionFightActionGoal;
};

function getMissionMonsterKeys(goal: MissionFightGoal | MissionFightActionGoal) {
	if (goal.type === 'FIGHT') {
		return goal.monsterKeys;
	}
	return goal.fightAction.monsterKeys ?? [];
}

function getMissionFightPlace(goal: MissionFightGoal | MissionFightActionGoal, fallbackPlace: number) {
	if (goal.type === 'FIGHT_ACTION') {
		return goal.fightAction.place ?? fallbackPlace;
	}
	return fallbackPlace;
}

export async function processMissionFight(input: StartMissionGoalFightInput): Promise<FightResult> {
	const user = await getDinozFightDataRequest(input.dinozId, input.userId);
	if (!user) {
		throw new ExpectedError('userNotFound', { params: { id: input.userId } });
	}
	const dinozData = user.dinoz.find(dinoz => dinoz.id === input.dinozId);
	if (!dinozData) {
		throw new ExpectedError('dinozNotFound', { params: { id: input.dinozId } });
	}
	const team = user.dinoz.filter(dinoz => dinoz.life > 0 && dinoz.state === null);
	const monsterKeys = getMissionMonsterKeys(input.goal);
	const monsters = monsterKeys.map(monsterKey => {
		const monster = monsterByKey[monsterKey];
		if (!monster) {
			throw new ExpectedError(`Unknown mission monster key "${monsterKey}".`);
		}
		return monster;
	});

	const place = getMissionFightPlace(input.goal, dinozData.placeId);
	const fightResult = calculateFightVsMonsters(team, user, place, monsters);
	const result = await rewardFightVsMonsters(team, monsters, fightResult, place, user, {
		disableGoldReward: true
	});

	for (const dinoz of team) {
		await updateDinoz(dinoz.id, { fight: false });
	}

	if (input.goal.type === 'FIGHT_ACTION') {
		return {
			...result,
			source: 'mission',
			background: input.goal.fightAction.background ?? result.background,
			startText: input.goal.fightAction.beginText
				? {
						type: input.goal.fightAction.beginMonsterKey ? 'announce' : 'message',
						text: input.goal.fightAction.beginText
					}
				: undefined,
			endText: input.goal.fightAction.winText
				? {
						type: 'message',
						text: input.goal.fightAction.winText
					}
				: undefined
		};
	}
	return {
		...result,
		source: 'mission'
	};
}
