import { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

export function validateMissionDefinition(mission: MissionDefinition) {
	if (!mission.key) {
		throw new ExpectedError('Mission key is required');
	}
	if (!mission.group) {
		throw new ExpectedError(`Mission "${mission.key}" has no group`);
	}
	if (!mission.goals.length) {
		throw new ExpectedError(`Mission "${mission.key}" has no goals`);
	}
	if (!mission.rewards.length) {
		throw new ExpectedError(`Mission "${mission.key}" has no rewards`);
	}
	for (const goal of mission.goals) {
		if (goal.type === 'TALK' && !goal.npcKey) {
			throw new ExpectedError(`Mission "${mission.key}" has TALK goal without npcKey`);
		}
		if (goal.type === 'ACTION' && !goal.actionKey) {
			throw new ExpectedError(`Mission "${mission.key}" has ACTION goal without actionKey`);
		}
		if (goal.type === 'KILL' && goal.kill.count <= 0) {
			throw new ExpectedError(`Mission "${mission.key}" has invalid KILL count`);
		}
		if (goal.type === 'FIGHT_ACTION' && !goal.fightAction.actionKey) {
			throw new ExpectedError(`Mission "${mission.key}" has FIGHT_ACTION goal without actionKey`);
		}
		if (goal.type === 'USE_ITEM' && goal.quantity <= 0) {
			throw new ExpectedError(`Mission "${mission.key}" has invalid USE_ITEM quantity`);
		}
	}
}
