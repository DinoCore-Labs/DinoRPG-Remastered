import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { MapZone } from '@dinorpg/core/models/enums/MapZone.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { prisma } from '../../prisma.js';

export type BotSteppesProgressionStep = {
	type: 'move';
	placeId: PlaceEnum;
};

export async function getBotSteppesProgressionStep(
	userId: string,
	dinozId: number
): Promise<BotSteppesProgressionStep | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			placeId: true,
			life: true,
			state: true,
			status: {
				select: {
					statusId: true
				}
			}
		}
	});
	if (!dinoz || dinoz.life <= 0 || dinoz.state !== null) return null;

	const currentPlace = Object.values(placeListv2).find(
		place => place.placeId === dinoz.placeId
	);
	if (currentPlace?.map === MapZone.STEPPE) return null;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	if (!statusIds.has(DinozStatusId.SYLVENOIRE_KEY)) return null;

	if (dinoz.placeId === PlaceEnum.PORTE_DE_SYLVENOIRE) {
		return {
			type: 'move',
			placeId: PlaceEnum.GO_TO_STEPPES
		};
	}

	return {
		type: 'move',
		placeId: PlaceEnum.PORTE_DE_SYLVENOIRE
	};
}
