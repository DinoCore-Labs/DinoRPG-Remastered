import { actualPlace } from '@dinorpg/core/utils/dinozUtils.js';

import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { canGoToThisPlace } from '../../utils/dinoz/dinozFiche.mapper.js';
import { assertTutorialMovementAllowed } from '../../Tutorial/Controller/tutorial.movement.js';

export async function getBotMoveTargets(userId: string, dinozId: number): Promise<number[]> {
	const user = await getDinozFightDataRequest(dinozId, userId);
	if (!user) return [];

	const dinoz = user.dinoz.find(entry => entry.id === dinozId);
	if (!dinoz || dinoz.leaderId || dinoz.state !== null || dinoz.life <= 0 || !dinoz.fight) {
		return [];
	}

	const currentPlace = actualPlace(dinoz);
	const team = user.dinoz.filter(member => member.id === dinoz.id || member.leaderId === dinoz.id);
	const allowed: number[] = [];

	for (const move of currentPlace.moves) {
		try {
			await assertTutorialMovementAllowed({
				userId,
				fromPlace: currentPlace.placeId,
				toPlace: move.target
			});

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

			allowed.push(move.target);
		} catch {
			continue;
		}
	}

	return allowed;
}
