import { Item } from '@dinorpg/core/models/items/itemList.js';

import type { Prisma } from '../../../../prisma/index.js';
import { getUserScenarioProgression, setUserScenarioProgression } from './scenarioProgress.controller.js';

type ScenarioTransaction = Prisma.TransactionClient;

const STAR_SCENARIO_KEY = 'star';

async function addMagicStarTx(tx: ScenarioTransaction, userId: string) {
	await tx.userItems.upsert({
		where: {
			itemId_userId: {
				itemId: Item.MAGIC_STAR,
				userId
			}
		},
		create: {
			userId,
			itemId: Item.MAGIC_STAR,
			quantity: 1
		},
		update: {
			quantity: {
				increment: 1
			}
		}
	});
}

export async function advanceStarScenarioWithRewardTx(
	tx: ScenarioTransaction,
	input: {
		userId: string;
		expectedProgression: number;
		nextProgression: number;
	}
) {
	const current = await getUserScenarioProgression(tx, input.userId, STAR_SCENARIO_KEY);

	if (current.progression !== input.expectedProgression) {
		return false;
	}

	await addMagicStarTx(tx, input.userId);

	await setUserScenarioProgression(tx, {
		userId: input.userId,
		scenarioKey: STAR_SCENARIO_KEY,
		progression: input.nextProgression,
		tracking: current.tracking
	});

	return true;
}
