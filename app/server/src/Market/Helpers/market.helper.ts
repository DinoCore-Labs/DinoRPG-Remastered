import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';

export async function assertUserHasDinozAtMarket(userId: string) {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			userId,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		},
		select: { id: true }
	});

	if (!dinoz) {
		throw new ExpectedError('noDinozAtMarket');
	}
}
