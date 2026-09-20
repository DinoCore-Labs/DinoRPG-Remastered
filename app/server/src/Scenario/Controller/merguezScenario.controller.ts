import {
	MERGUEZ_SCENARIO_KEY,
	MERGUEZ_SCENARIO_STEPS,
	MERGUEZ_SCENARIO_THRESHOLDS
} from '@dinorpg/core/models/scenarios/data/merguezScenario.js';

import { Prisma } from '../../../../prisma/index.js';

type ScenarioTransaction = Prisma.TransactionClient;

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
	/*
	 * On incrémente directement en base.
	 *
	 * Cela évite le classique :
	 *
	 * A lit 90
	 * B lit 90
	 * A écrit 100
	 * B écrit 100
	 *
	 * alors qu'on devrait avoir 110.
	 */
	const trackingUpdate = await tx.userScenario.updateMany({
		where: {
			userId: input.userId,
			scenarioKey: MERGUEZ_SCENARIO_KEY,
			progression: {
				gt: MERGUEZ_SCENARIO_STEPS.NOT_STARTED,
				lt: MERGUEZ_SCENARIO_STEPS.COMPLETED
			}
		},
		data: {
			tracking: {
				increment: input.usedCount
			}
		}
	});
	/*
	 * Scénario absent, non démarré
	 * ou déjà terminé.
	 */
	if (trackingUpdate.count !== 1) {
		return false;
	}
	/*
	 * Premier seuil :
	 *
	 * 100 merguez utilisées
	 * STARTED -> FIRST_REPORT
	 */
	const firstReport = await tx.userScenario.updateMany({
		where: {
			userId: input.userId,
			scenarioKey: MERGUEZ_SCENARIO_KEY,
			progression: MERGUEZ_SCENARIO_STEPS.STARTED,
			tracking: {
				gte: MERGUEZ_SCENARIO_THRESHOLDS.FIRST_REPORT_USED_COUNT
			}
		},
		data: {
			progression: MERGUEZ_SCENARIO_STEPS.FIRST_REPORT
		}
	});
	if (firstReport.count === 1) {
		return true;
	}
	/*
	 * Deuxième seuil :
	 *
	 * 500 merguez utilisées
	 * FIRST_REPORT_DONE -> FINAL_REPORT
	 */
	const finalReport = await tx.userScenario.updateMany({
		where: {
			userId: input.userId,
			scenarioKey: MERGUEZ_SCENARIO_KEY,
			progression: MERGUEZ_SCENARIO_STEPS.FIRST_REPORT_DONE,
			tracking: {
				gte: MERGUEZ_SCENARIO_THRESHOLDS.FINAL_REPORT_USED_COUNT
			}
		},
		data: {
			progression: MERGUEZ_SCENARIO_STEPS.FINAL_REPORT
		}
	});
	return finalReport.count === 1;
}
