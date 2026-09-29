import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';

import { gatherWithDinoz } from '../../Gather/Service/gatherWithDinoz.service.js';
import { getGatherGrid } from '../../Gather/Service/getGatherGrid.service.js';

export const BOT_GATHER_ACTIONS = new Set<Action>([
	Action.FISH,
	Action.CUEILLE,
	Action.ENERGY,
	Action.HUNT,
	Action.SEEK
]);

function shuffle<T>(values: T[]): T[] {
	const result = [...values];
	for (let index = result.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[result[index], result[swapIndex]] = [result[swapIndex], result[index]];
	}
	return result;
}

export async function executeBotGather(userId: string, dinozId: number, action: Action) {
	const grid = await getGatherGrid(userId, dinozId, action);
	const unopened: [number, number][] = [];

	for (let x = 0; x < grid.grid.length; x += 1) {
		for (let y = 0; y < grid.grid[x].length; y += 1) {
			if (grid.grid[x][y] === 0) {
				unopened.push([x, y]);
			}
		}
	}

	const boxes = shuffle(unopened).slice(0, Math.min(grid.gatherTurn, unopened.length));
	if (boxes.length === 0) {
		return null;
	}

	return gatherWithDinoz({
		userId,
		dinozId,
		type: action,
		box: boxes
	});
}
