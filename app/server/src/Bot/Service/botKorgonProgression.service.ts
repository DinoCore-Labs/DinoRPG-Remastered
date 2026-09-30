import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

import { prisma } from '../../prisma.js';

export type BotKorgonProgressionStep =
	| { type: 'move'; placeId: PlaceEnum }
	| {
			type: 'dialog';
			dialogId: 'dian_korgsey';
			preferredLinkIds: string[];
	  };

export async function getBotKorgonProgressionStep(
	userId: string,
	dinozId: number
): Promise<BotKorgonProgressionStep | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			placeId: true,
			status: {
				select: { statusId: true }
			},
			missions: {
				select: {
					missionKey: true,
					isCompleted: true
				}
			}
		}
	});
	if (!dinoz) return null;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	if (statusIds.has(DinozStatusId.FLIPPERS)) {
		return null;
	}

	const activeMission = dinoz.missions.find(mission => !mission.isCompleted);
	if (activeMission?.missionKey === 'kswim') {
		return null;
	}
	if (activeMission) {
		return null;
	}

	if (dinoz.placeId !== PlaceEnum.CAMP_KORGON) {
		return {
			type: 'move',
			placeId: PlaceEnum.CAMP_KORGON
		};
	}

	if (!statusIds.has(DinozStatusId.DIAN)) {
		return {
			type: 'dialog',
			dialogId: 'dian_korgsey',
			preferredLinkIds: [
				'korgons',
				'why',
				'wood',
				'tame',
				'interest',
				'service',
				'missions'
			]
		};
	}

	return {
		type: 'dialog',
		dialogId: 'dian_korgsey',
		preferredLinkIds: ['missions']
	};
}
