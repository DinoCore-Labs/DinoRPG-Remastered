import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightResult } from '@dinorpg/core/models/fight/fightResult.js';

import { User } from '../../../../prisma/index.js';
import { DinozToGetFighter } from '../../utils/fight/fight.mapper.js';
import { PlayerForConditionCheck } from '../../utils/user/userConditionCheck.js';
import { DinozToRewardFight } from './fight.service.js';

export async function movementListener(
	user: Pick<User, 'id' /*| 'teacher' | 'cooker'*/> & PlayerForConditionCheck,
	team: (DinozToGetFighter & DinozToRewardFight) /*& DinozToGetActualStep*/[],
	finalPlace: PlaceEnum,
	activeDinoz: number
): Promise<FightResult | false> {
	// Special actions
	//const potentialSpecialActions = Object.values(specialActions).find(special => special.place === finalPlace);

	/*if (potentialSpecialActions && checkCondition(potentialSpecialActions.condition, player, player.dinoz[0].id)) {
		if (potentialSpecialActions.opponents) {
			// Trigger a fight against the opponents of the special action
			const fightResult = calculateFightVsMonsters(team, player, finalPlace, potentialSpecialActions.opponents);

			const partyLeader = team.find(d => d.id === activeDinoz);
			if (!partyLeader) {
				throw new ExpectedError(`Cannot find dinoz ${activeDinoz} in the team`);
			}
			const result: FightResult = await rewardFight(
				team,
				potentialSpecialActions.opponents,
				fightResult,
				finalPlace,
				player
			);
			if (fightResult.winner) {
				await rewarder(potentialSpecialActions.reward, [partyLeader], player.id, true);
				//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
			}
			if (potentialSpecialActions.startText) {
				result.startText = potentialSpecialActions.startText;
			}
			if (potentialSpecialActions.endText) {
				result.endText = potentialSpecialActions.endText;
			}
			return result;
		} else {
			await rewarder(potentialSpecialActions.reward, team, player.id, true);
			//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
		}
	}*/

	// Check if any dinoz has an unfinished mission
	/*const dinozMission = team.flatMap(dinoz => dinoz.missions).find(m => !m.isFinished);

	if (dinozMission) {
		// Find the dinoz with the unfinished mission
		const dinozWithMission = team.find(dinoz => dinoz.missions.some(m => m.missionId === dinozMission.missionId));
		if (dinozWithMission) {
			// Check the actual step of the dinoz with the unfinished mission
			const actualStep = getActualStep(dinozWithMission);

			if (actualStep?.stepId !== undefined) {
				if (actualStep.place === finalPlace && actualStep.requirement.actionType === ConditionEnum.KILL_BOSS) {
					const fightResult = calculateFightVsMonsters(team, player, finalPlace, actualStep.requirement.target);
					const result = await rewardFight(team, actualStep.requirement.target, fightResult, finalPlace, player);
					if (fightResult.winner) {
						const teamIds = team.map(dinoz => dinoz.id);

						await updateMissionStep(player.id, teamIds, dinozMission.missionId, actualStep.stepId + 1);
						await updateMultipleDinoz(teamIds, { placeId: finalPlace });
					}
					return result;
				}
			}
		}
	}*/
	return false;
}
