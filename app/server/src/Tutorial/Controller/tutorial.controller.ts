import { getTutorialObjective } from '@dinorpg/core/models/tutorial/tutorial.data.js';
import {
	TUTORIAL_COMPLETED_PROGRESSION,
	TUTORIAL_SCENARIO_KEY,
	type TutorialEvent,
	type TutorialObjective,
	type TutorialObjectiveKey,
	tutorialObjectiveKeys
} from '@dinorpg/core/models/tutorial/tutorial.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { checkDialogCondition } from '../../utils/conditions/checkDialogCondition.js';
import { buildTutorialContext } from './tutorial.context.js';
import { applyTutorialRewards } from './tutorial.reward.js';

type TutorialTransaction = Prisma.TransactionClient;

type TutorialTrigger =
	| {
			type: 'event';
			event: TutorialEvent;
	  }
	| {
			type: 'condition';
	  };

type TutorialAdvanceParams = {
	userId: string;
	dinozId: number;
	/**
	 * Équivalent du noReward historique.
	 *
	 * Permet de faire avancer le tutoriel sans attribuer
	 * la récompense de l'objectif courant.
	 */
	noReward?: boolean;
};

export type HandleTutorialEventParams = TutorialAdvanceParams & {
	event: TutorialEvent;
};

export type RefreshTutorialProgressParams = TutorialAdvanceParams;

export type TutorialAdvanceResult = {
	active: boolean;
	advanced: boolean;
	completed: boolean;
	progression: number | null;
	completedObjectiveId: TutorialObjectiveKey | null;
	currentObjectiveId: TutorialObjectiveKey | null;
	skippedObjectiveIds: TutorialObjectiveKey[];
};

function getObjectiveProgression(objectiveKey: TutorialObjectiveKey): number {
	const progression = tutorialObjectiveKeys.indexOf(objectiveKey);
	if (progression === -1) {
		throw new Error(`Tutorial objective "${objectiveKey}" is not registered`);
	}
	return progression;
}

function getNextProgression(objective: TutorialObjective): number {
	if (!objective.next) {
		return TUTORIAL_COMPLETED_PROGRESSION;
	}
	return getObjectiveProgression(objective.next);
}

function getObjectiveIdFromProgression(progression: number): TutorialObjectiveKey | null {
	if (progression >= TUTORIAL_COMPLETED_PROGRESSION) {
		return null;
	}
	return getTutorialObjective(progression)?.id ?? null;
}

function createAdvanceResult(params: {
	active: boolean;
	advanced: boolean;
	progression: number | null;
	completedObjectiveId?: TutorialObjectiveKey | null;
	skippedObjectiveIds?: TutorialObjectiveKey[];
}): TutorialAdvanceResult {
	const progression = params.progression;
	return {
		active: params.active,
		advanced: params.advanced,
		completed: progression !== null && progression >= TUTORIAL_COMPLETED_PROGRESSION,
		progression,
		completedObjectiveId: params.completedObjectiveId ?? null,
		currentObjectiveId: progression === null ? null : getObjectiveIdFromProgression(progression),
		skippedObjectiveIds: params.skippedObjectiveIds ?? []
	};
}

async function getTutorialProgression(tx: TutorialTransaction, userId: string) {
	return tx.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				scenarioKey: TUTORIAL_SCENARIO_KEY,
				userId
			}
		},
		select: {
			id: true,
			progression: true
		}
	});
}

async function canValidateObjective(
	tx: TutorialTransaction,
	params: TutorialAdvanceParams,
	objective: TutorialObjective,
	trigger: TutorialTrigger
): Promise<boolean> {
	let context: Awaited<ReturnType<typeof buildTutorialContext>> | null = null;
	/*
	 * @cond historique :
	 * condition nécessaire pour accéder / utiliser l'objectif.
	 */
	if (objective.cond) {
		context = await buildTutorialContext(tx, {
			userId: params.userId,
			dinozId: params.dinozId
		});
		if (!checkDialogCondition(objective.cond, context)) {
			return false;
		}
	}
	if (objective.validation.type === 'event') {
		return trigger.type === 'event' && trigger.event === objective.validation.event;
	}
	if (trigger.type !== 'condition') {
		return false;
	}
	context ??= await buildTutorialContext(tx, {
		userId: params.userId,
		dinozId: params.dinozId
	});
	return checkDialogCondition(objective.validation.condition, context);
}

/**
 * Reproduit le comportement historique :
 *
 * après validation d'un objectif, si les objectifs suivants
 * possèdent un `valid` déjà satisfait, ils sont sautés.
 *
 * Très important :
 * les objectifs sautés NE donnent PAS leurs récompenses.
 *
 * C'est le comportement de l'ancien :
 *
 * while (next.valid && Script.eval(next.valid))
 *     next = next.next;
 */
async function resolveAutoSkippedProgression(
	tx: TutorialTransaction,
	params: TutorialAdvanceParams,
	startProgression: number
): Promise<{
	progression: number;
	skippedObjectiveIds: TutorialObjectiveKey[];
}> {
	let progression = startProgression;
	const skippedObjectiveIds: TutorialObjectiveKey[] = [];
	const visitedProgressions = new Set<number>();
	let context: Awaited<ReturnType<typeof buildTutorialContext>> | null = null;
	while (progression < TUTORIAL_COMPLETED_PROGRESSION) {
		if (visitedProgressions.has(progression)) {
			throw new Error(`Circular tutorial progression detected at "${progression}"`);
		}
		visitedProgressions.add(progression);
		const objective = getTutorialObjective(progression);
		if (!objective) {
			break;
		}
		/*
		 * Les validations par événement ne peuvent jamais être
		 * sautées automatiquement.
		 *
		 * C'est l'équivalent d'un ancien objectif sans @valid.
		 */
		if (objective.validation.type !== 'condition') {
			break;
		}
		context ??= await buildTutorialContext(tx, {
			userId: params.userId,
			dinozId: params.dinozId
		});
		if (!checkDialogCondition(objective.validation.condition, context)) {
			break;
		}
		skippedObjectiveIds.push(objective.id);
		progression = getNextProgression(objective);
	}
	return {
		progression,
		skippedObjectiveIds
	};
}

async function advanceTutorial(
	tx: TutorialTransaction,
	params: TutorialAdvanceParams,
	trigger: TutorialTrigger
): Promise<TutorialAdvanceResult> {
	const tutorial = await getTutorialProgression(tx, params.userId);
	/*
	 * Aucun UserScenario("tutorial") :
	 * compte historique ou tutoriel non activé.
	 */
	if (!tutorial) {
		return createAdvanceResult({
			active: false,
			advanced: false,
			progression: null
		});
	}
	if (tutorial.progression >= TUTORIAL_COMPLETED_PROGRESSION) {
		return createAdvanceResult({
			active: true,
			advanced: false,
			progression: tutorial.progression
		});
	}
	const objective = getTutorialObjective(tutorial.progression);
	if (!objective) {
		throw new Error(`Tutorial objective not found for progression "${tutorial.progression}"`);
	}
	const canValidate = await canValidateObjective(tx, params, objective, trigger);
	if (!canValidate) {
		return createAdvanceResult({
			active: true,
			advanced: false,
			progression: tutorial.progression
		});
	}
	/*
	 * Première progression :
	 *
	 * on avance d'abord vers l'objectif suivant avec un
	 * compare-and-swap.
	 *
	 * Deux requêtes concurrentes peuvent avoir lu le même
	 * objectif courant, mais une seule pourra effectuer
	 * progression X -> Y.
	 */
	const nextProgression = getNextProgression(objective);
	const claim = await tx.userScenario.updateMany({
		where: {
			id: tutorial.id,
			userId: params.userId,
			progression: tutorial.progression
		},
		data: {
			progression: nextProgression
		}
	});
	/*
	 * Une autre transaction a déjà validé cet objectif.
	 *
	 * On ne donne SURTOUT PAS la récompense une seconde fois.
	 */
	if (claim.count !== 1) {
		const latestTutorial = await getTutorialProgression(tx, params.userId);
		return createAdvanceResult({
			active: latestTutorial !== null,
			advanced: false,
			progression: latestTutorial?.progression ?? null
		});
	}
	/*
	 * La progression et les récompenses sont dans la même
	 * transaction Prisma.
	 *
	 * Si une récompense échoue, l'UPDATE précédent est rollback.
	 */
	if (!params.noReward) {
		await applyTutorialRewards(tx, params.userId, objective.rewards);
	}
	/*
	 * Reproduction du while(next.valid) du jeu historique.
	 */
	const skipped = await resolveAutoSkippedProgression(tx, params, nextProgression);
	if (skipped.progression !== nextProgression) {
		await tx.userScenario.update({
			where: {
				id: tutorial.id
			},
			data: {
				progression: skipped.progression
			}
		});
	}
	return createAdvanceResult({
		active: true,
		advanced: true,
		progression: skipped.progression,
		completedObjectiveId: objective.id,
		skippedObjectiveIds: skipped.skippedObjectiveIds
	});
}

/**
 * Version transactionnelle.
 *
 * À utiliser lorsqu'on est DÉJÀ dans une transaction Prisma,
 * par exemple depuis un dialogue, une adoption ou un déplacement.
 */
export function handleTutorialEventTx(tx: TutorialTransaction, params: HandleTutorialEventParams) {
	return advanceTutorial(tx, params, {
		type: 'event',
		event: params.event
	});
}

/**
 * Version autonome.
 */
export function handleTutorialEvent(params: HandleTutorialEventParams) {
	return prisma.$transaction(tx => handleTutorialEventTx(tx, params));
}

/**
 * Vérifie l'objectif conditionnel courant à l'intérieur
 * d'une transaction existante.
 */
export function refreshTutorialProgressTx(tx: TutorialTransaction, params: RefreshTutorialProgressParams) {
	return advanceTutorial(tx, params, {
		type: 'condition'
	});
}

/**
 * Version autonome.
 */
export function refreshTutorialProgress(params: RefreshTutorialProgressParams) {
	return prisma.$transaction(tx => refreshTutorialProgressTx(tx, params));
}

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
	/*
	 * IMPORTANT :
	 * validation + rewards restent côté serveur.
	 *
	 * Le client ne reçoit que les informations d'affichage.
	 */
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
