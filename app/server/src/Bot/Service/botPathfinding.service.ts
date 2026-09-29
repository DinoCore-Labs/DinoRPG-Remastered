import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { getBotMoveTargets } from './botMovement.service.js';

export async function findBotMissionNextHop(
	userId: string,
	dinozId: number,
	currentPlaceId: number,
	targetPlaceId: number
): Promise<number | null> {
	if (currentPlaceId === targetPlaceId) return null;

	const visited = new Set<number>([currentPlaceId]);
	const queue: { placeId: number; firstHop: number | null }[] = [{ placeId: currentPlaceId, firstHop: null }];

	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) break;

		const place = Object.values(placeListv2).find(entry => entry.placeId === current.placeId);
		if (!place) continue;

		let allowedTargets: number[];
		if (current.placeId === currentPlaceId) {
			allowedTargets = await getBotMoveTargets(userId, dinozId);
		} else {
			allowedTargets = place.moves.map(move => move.target);
		}

		for (const next of allowedTargets) {
			if (visited.has(next)) continue;
			visited.add(next);

			const firstHop = current.firstHop ?? next;
			if (next === targetPlaceId) {
				return firstHop;
			}

			queue.push({ placeId: next, firstHop });
		}
	}

	return null;
}
