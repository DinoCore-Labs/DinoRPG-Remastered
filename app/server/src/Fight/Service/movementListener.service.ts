import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { MissionFightGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { DinozMissions, User } from '../../../../prisma/index.js';
import { updateMultipleDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { advanceDinozMissionOnFight, advanceDinozMissionOnMove } from '../../Mission/Controller/mission.progress.js';
import { resolveCurrentMission } from '../../Mission/Service/missionCurrent.service.js';
import { prisma } from '../../prisma.js';
import { DinozToGetFighter } from '../../utils/fight/fight.mapper.js';
import { UserForConditionCheck } from '../../utils/user/userConditionCheck.js';
import { calculateFightVsMonsters, type DinozToRewardFight, rewardFightVsMonsters } from './fight.service.js';

type DinozToCheckMissionFight = {
	id: number;
	missions: Pick<DinozMissions, 'id' | 'missionKey' | 'progression' | 'tracking' | 'isCompleted'>[];
};

type TriggeredMissionFight = {
	dinozId: number;
	missionKey: string;
	monsterKeys: MissionFightGoal['monsterKeys'];
};

function getTriggeredMissionFightOnMove(
	member: DinozToCheckMissionFight,
	finalPlace: PlaceEnum
): TriggeredMissionFight | null {
	const resolvedMission = resolveCurrentMission(member.missions);
	if (!resolvedMission?.currentGoal) {
		return null;
	}
	const currentGoal = resolvedMission.currentGoal;
	if (currentGoal.type !== 'AT') {
		return null;
	}
	if (currentGoal.place == null || currentGoal.place !== finalPlace) {
		return null;
	}
	const nextGoal = resolvedMission.definition.goals[resolvedMission.state.progression + 1] ?? null;
	if (!nextGoal || nextGoal.type !== 'FIGHT') {
		return null;
	}
	return {
		dinozId: member.id,
		missionKey: resolvedMission.state.missionKey,
		monsterKeys: nextGoal.monsterKeys
	};
}

function sameTriggeredFight(a: TriggeredMissionFight, b: TriggeredMissionFight): boolean {
	if (a.missionKey !== b.missionKey) {
		return false;
	}
	if (a.monsterKeys.length !== b.monsterKeys.length) {
		return false;
	}
	for (let i = 0; i < a.monsterKeys.length; i += 1) {
		if (a.monsterKeys[i] !== b.monsterKeys[i]) {
			return false;
		}
	}
	return true;
}

export async function movementListener(
	user: Pick<User, 'id' | 'teacher' | 'cooker'> & UserForConditionCheck,
	team: (DinozToGetFighter & DinozToRewardFight & DinozToCheckMissionFight)[],
	finalPlace: PlaceEnum,
	activeDinoz: number
): Promise<FightResult | false> {
	const orderedTeam = [
		...team.filter(member => member.id === activeDinoz),
		...team.filter(member => member.id !== activeDinoz)
	];
	const triggeredFights = orderedTeam
		.map(member => getTriggeredMissionFightOnMove(member, finalPlace))
		.filter((fight): fight is TriggeredMissionFight => fight !== null);
	const triggeredFight = triggeredFights[0];
	if (!triggeredFight) {
		return false;
	}
	const monsters = triggeredFight.monsterKeys.map(monsterKey => {
		const monster = monsterByKey[monsterKey];
		if (!monster) {
			throw new ExpectedError(`Unknown mission monster key "${monsterKey}"`);
		}
		return monster;
	});
	const fightResult = calculateFightVsMonsters(team, user, finalPlace, monsters);
	const result = await rewardFightVsMonsters(team, monsters, fightResult, finalPlace, user);
	const winner = fightResult.outcome === FightOutcome.AttackerWin;
	if (winner) {
		const teamIds = team.map(dinoz => dinoz.id);
		await updateMultipleDinoz(teamIds, { placeId: finalPlace });
		const dinozIdsToAdvance = triggeredFights
			.filter(fight => sameTriggeredFight(fight, triggeredFight))
			.map(fight => fight.dinozId);
		await prisma.$transaction(async tx => {
			for (const dinozId of dinozIdsToAdvance) {
				await advanceDinozMissionOnMove(tx, {
					dinozId,
					place: finalPlace
				});
				await advanceDinozMissionOnFight(tx, {
					dinozId
				});
			}
		});
	}
	return result;
}
