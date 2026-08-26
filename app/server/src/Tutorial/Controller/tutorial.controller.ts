import { getTutorialObjective } from '@dinorpg/core/models/tutorial/tutorial.data.js';
import { TUTORIAL_COMPLETED_PROGRESSION, TUTORIAL_SCENARIO_KEY } from '@dinorpg/core/models/tutorial/tutorial.js';

import { prisma } from '../../prisma.js';

export async function getCurrentTutorial(userId: string) {
	const tutorial = await prisma.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				scenarioKey: TUTORIAL_SCENARIO_KEY,
				userId
			}
		},
		select: {
			progression: true
		}
	});
	if (!tutorial) {
		return null;
	}
	if (tutorial.progression >= TUTORIAL_COMPLETED_PROGRESSION) {
		return {
			completed: true,
			progression: tutorial.progression,
			objective: null
		};
	}
	const objective = getTutorialObjective(tutorial.progression);
	if (!objective) {
		return null;
	}
	return {
		completed: false,
		progression: tutorial.progression,
		objective: {
			id: objective.id,
			begin: objective.begin,
			end: objective.end,
			helpers: objective.helpers
		}
	};
}
