import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

import { prisma } from '../../prisma.js';

export async function shouldBotDigOldStone(userId: string, dinozId: number): Promise<boolean> {
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
	if (!dinoz) return false;
	if (dinoz.life <= 0 || dinoz.state !== null) return false;
	if (dinoz.placeId !== PlaceEnum.RUINES_ASHPOUK) return false;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	const hasShovel =
		statusIds.has(DinozStatusId.SHOVEL) ||
		statusIds.has(DinozStatusId.ENHANCED_SHOVEL);
	const alreadyResolved =
		statusIds.has(DinozStatusId.OLD_STONE) ||
		statusIds.has(DinozStatusId.ASHPOUK_TOTEM);

	return hasShovel && !alreadyResolved;
}
