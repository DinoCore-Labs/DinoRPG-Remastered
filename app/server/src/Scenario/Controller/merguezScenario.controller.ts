import {
	MERGUEZ_SCENARIO_KEY,
	MERGUEZ_SCENARIO_STEPS,
	MERGUEZ_SCENARIO_THRESHOLDS
} from '@dinorpg/core/models/scenarios/data/merguezScenario.js';

import { Prisma } from '../../../../prisma/client.js';
import { getUserScenarioProgression, setUserScenarioProgression } from './scenarioProgress.controller.js';

type ScenarioTransaction = Prisma.TransactionClient;

function resolveNextMerguezProgression(currentProgression: number, nextTracking: number): number {
	if (
		currentProgression === MERGUEZ_SCENARIO_STEPS.STARTED &&
		nextTracking >= MERGUEZ_SCENARIO_THRESHOLDS.FIRST_REPORT_USED_COUNT
	) {
		return MERGUEZ_SCENARIO_STEPS.FIRST_REPORT;
	}

	if (
		currentProgression === MERGUEZ_SCENARIO_STEPS.FIRST_REPORT_DONE &&
		nextTracking >= MERGUEZ_SCENARIO_THRESHOLDS.FINAL_REPORT_USED_COUNT
	) {
		return MERGUEZ_SCENARIO_STEPS.FINAL_REPORT;
	}

	return currentProgression;
}

export async function advanceMerguezScenarioOnMerguezUsedTx(
	tx: ScenarioTransaction,
	input: {
		userId: string;
		usedCount: number;
	}
) {
	if (!Number.isInteger(input.usedCount) || input.usedCount <= 0) {
		return false;
	}

	const current = await getUserScenarioProgression(tx, input.userId, MERGUEZ_SCENARIO_KEY);

	if (current.progression <= MERGUEZ_SCENARIO_STEPS.NOT_STARTED) {
		return false;
	}

	if (current.progression >= MERGUEZ_SCENARIO_STEPS.COMPLETED) {
		return false;
	}

	const nextTracking = current.tracking + input.usedCount;
	const nextProgression = resolveNextMerguezProgression(current.progression, nextTracking);

	await setUserScenarioProgression(tx, {
		userId: input.userId,
		scenarioKey: MERGUEZ_SCENARIO_KEY,
		progression: nextProgression,
		tracking: nextTracking
	});

	return nextProgression !== current.progression;
}
