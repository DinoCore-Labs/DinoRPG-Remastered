import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

import { DinozConcentrationState } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export type BotSylvenoireProgressionStep =
	| { type: 'move'; placeId: PlaceEnum }
	| {
			type: 'dialog';
			dialogId: 'bao_bob';
			preferredLinkIds: string[];
	  }
	| { type: 'enter_portal' }
	| { type: 'wait' };

const DARK_WORLD_PLACES = new Set<PlaceEnum>([
	PlaceEnum.PORTAIL,
	PlaceEnum.GOUFFRE,
	PlaceEnum.TOUR_SOMBRE,
	PlaceEnum.TOUR_SOMBRE_1,
	PlaceEnum.TOUR_SOMBRE_2,
	PlaceEnum.TOUR_SOMBRE_DONJON_1,
	PlaceEnum.TOUR_SOMBRE_DONJON_2,
	PlaceEnum.TOUR_SOMBRE_DONJON_3,
	PlaceEnum.TOUR_SOMBRE_DONJON_LAST
]);

export async function getBotSylvenoireProgressionStep(
	userId: string,
	dinozId: number
): Promise<BotSylvenoireProgressionStep | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: { id: dinozId, userId },
		select: {
			placeId: true,
			life: true,
			state: true,
			status: {
				select: { statusId: true }
			},
			concentration: {
				select: {
					session: {
						select: {
							state: true
						}
					}
				}
			}
		}
	});
	if (!dinoz || dinoz.life <= 0) return null;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	if (statusIds.has(DinozStatusId.SYLVENOIRE_KEY)) return null;
	if (!statusIds.has(DinozStatusId.FLIPPERS)) return null;

	if (dinoz.concentration) {
		if (dinoz.concentration.session.state === DinozConcentrationState.OPEN) {
			return { type: 'enter_portal' };
		}
		return { type: 'wait' };
	}

	if (DARK_WORLD_PLACES.has(dinoz.placeId as PlaceEnum)) {
		return {
			type: 'move',
			placeId: PlaceEnum.TOUR_SOMBRE_ENTREE
		};
	}

	const eligibleCount = await prisma.dinoz.count({
		where: {
			userId,
			life: { gt: 0 },
			state: null,
			status: {
				some: {
					statusId: DinozStatusId.FLIPPERS
				}
			}
		}
	});
	if (eligibleCount < 7) return null;

	if (dinoz.state !== null) return null;

	if (dinoz.placeId !== PlaceEnum.BAO_BOB) {
		return {
			type: 'move',
			placeId: PlaceEnum.BAO_BOB
		};
	}

	return {
		type: 'dialog',
		dialogId: 'bao_bob',
		preferredLinkIds: ['question', 'quest3', 'where', 'how', 'concen', 'ok']
	};
}
