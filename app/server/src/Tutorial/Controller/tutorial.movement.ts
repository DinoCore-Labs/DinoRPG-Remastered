import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { getTutorialObjective } from '@dinorpg/core/models/tutorial/tutorial.data.js';
import { TUTORIAL_SCENARIO_KEY, type TutorialObjectiveKey } from '@dinorpg/core/models/tutorial/tutorial.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';

type TutorialMovementRule = {
	from: PlaceEnum;
	blockedTargets: readonly PlaceEnum[];
};

/**
 * Reproduction lisible des anciennes restrictions ptuto.
 *
 * Ancien :
 *
 * ptuto = 186861
 * Dinoville -> Université interdit
 *
 * ptuto = 674288
 * Fontaine -> Dinoville / Papy Joe / Forcebrut interdits
 *
 * Désormais ces règles dépendent directement
 * de l'identifiant de l'objectif courant.
 */
const tutorialMovementRules: Partial<Record<TutorialObjectiveKey, TutorialMovementRule>> = {
	move: {
		from: PlaceEnum.DINOVILLE,
		blockedTargets: [PlaceEnum.UNIVERSITE]
	},
	port: {
		from: PlaceEnum.FOUTAINE_DE_JOUVENCE,
		blockedTargets: [PlaceEnum.DINOVILLE, PlaceEnum.PAPY_JOE, PlaceEnum.FORCEBRUT]
	}
};

type AssertTutorialMovementAllowedParams = {
	userId: string;
	fromPlace: PlaceEnum;
	toPlace: PlaceEnum;
};

export async function assertTutorialMovementAllowed(params: AssertTutorialMovementAllowedParams): Promise<void> {
	const tutorial = await prisma.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				scenarioKey: TUTORIAL_SCENARIO_KEY,
				userId: params.userId
			}
		},
		select: {
			progression: true
		}
	});
	/*
	 * Pas de scénario tutorial :
	 * ancien compte / tutoriel non activé.
	 */
	if (!tutorial) {
		return;
	}
	const objective = getTutorialObjective(tutorial.progression);
	/*
	 * Tutoriel terminé ou progression inconnue.
	 */
	if (!objective) {
		return;
	}
	const rule = tutorialMovementRules[objective.id];
	if (!rule) {
		return;
	}
	/*
	 * La restriction ne concerne que le lieu
	 * historique correspondant à l'objectif.
	 */
	if (params.fromPlace !== rule.from) {
		return;
	}
	if (!rule.blockedTargets.includes(params.toPlace)) {
		return;
	}
	throw new ExpectedError('tutorialMovementRestricted', {
		params: {
			objectiveId: objective.id
		}
	});
}
