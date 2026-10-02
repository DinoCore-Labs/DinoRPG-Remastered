import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { assertTutorialMovementAllowed } from '../../Tutorial/Controller/tutorial.movement.js';
import { canGoToThisPlace } from '../../utils/dinoz/dinozFiche.mapper.js';

export async function findBotMissionNextHop(
	userId: string,
	dinozId: number,
	currentPlaceId: number,
	targetPlaceId: number
): Promise<number | null> {
	if (currentPlaceId === targetPlaceId) return null;

	const user = await getDinozFightDataRequest(dinozId, userId);
	if (!user) return null;

	const dinoz = user.dinoz.find(entry => entry.id === dinozId);
	if (!dinoz || dinoz.leaderId || dinoz.state !== null || dinoz.life <= 0 || !dinoz.fight) {
		return null;
	}

	const team = user.dinoz.filter(member => member.id === dinoz.id || member.leaderId === dinoz.id);
	const visited = new Set<number>([currentPlaceId]);
	const queue: { placeId: number; firstHop: number | null }[] = [
		{
			placeId: currentPlaceId,
			firstHop: null
		}
	];

	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) break;

		const place = Object.values(placeListv2).find(entry => entry.placeId === current.placeId);
		if (!place) continue;

		for (const move of place.moves) {
			try {
				await assertTutorialMovementAllowed({
					userId,
					fromPlace: place.placeId,
					toPlace: move.target
				});
			} catch {
				continue;
			}

			if (move.condition) {
				const teamCanMove = team.every(member =>
					canGoToThisPlace(
						{
							...user,
							dinoz: [member]
						},
						move.condition!,
						member.id
					)
				);
				if (!teamCanMove) continue;
			}

			const destination = Object.values(placeListv2).find(entry => entry.placeId === move.target);
			const arrivalPlaceId = destination?.gotoPlaceId ?? move.target;
			const firstHop = current.firstHop ?? move.target;

			/*
			 * Certains planners visent volontairement le nœud de
			 * transition (GO_TO_*), tandis que d'autres visent le
			 * lieu réel après gotoPlaceId. Les deux doivent être
			 * considérés comme atteints par la même arête.
			 */
			if (move.target === targetPlaceId || arrivalPlaceId === targetPlaceId) {
				return firstHop;
			}

			if (visited.has(arrivalPlaceId)) continue;
			visited.add(arrivalPlaceId);
			queue.push({
				placeId: arrivalPlaceId,
				firstHop
			});
		}
	}

	return null;
}
