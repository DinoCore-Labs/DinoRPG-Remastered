import type { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { describe, expect, it } from 'vitest';

import { validateMissionDefinition } from '../../src/Mission/Controller/mission.validation.js';

function createMission(goal: MissionGoal): MissionDefinition {
	return {
		key: 'test',
		group: 'test',
		nameKey: 'test.name',
		beginKey: 'test.begin',
		endKey: 'test.end',
		goals: [goal],
		rewards: [
			{
				type: 'XP',
				value: 1
			}
		],
		labels: {}
	};
}

describe('validateMissionDefinition', () => {
	it.each([
		{
			type: 'COMPLETE_GROUP',
			group: 'test'
		},
		{
			type: 'REQUIRE_EFFECT',
			effectKey: 'test',
			titleKey: 'test'
		},
		{
			type: 'BRANCH',
			label: 'test'
		},
		{
			type: 'DIG',
			messageKey: 'test'
		}
	] as MissionGoal[])('rejects unsupported goal $type', goal => {
		expect(() => validateMissionDefinition(createMission(goal))).toThrow(`unsupported goal type "${goal.type}"`);
	});
	it('rejects an invalid USE_INGREDIENT quantity', () => {
		expect(() =>
			validateMissionDefinition(
				createMission({
					type: 'USE_INGREDIENT',
					place: 1,
					ingredientKey: 'energie_air',
					quantity: 0,
					nameKey: 'test'
				})
			)
		).toThrow('invalid USE_INGREDIENT quantity');
	});
});
