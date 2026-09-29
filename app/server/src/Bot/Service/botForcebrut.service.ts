import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';

import { prisma } from '../../prisma.js';

export async function canBotFightForcebrut(userId: string, dinozId: number): Promise<boolean> {
	const dinoz = await prisma.dinoz.findFirst({
		where: { id: dinozId, userId },
		select: {
			placeId: true,
			life: true,
			state: true,
			FBTournamentStep: true,
			status: { select: { statusId: true } }
		}
	});
	if (!dinoz) return false;
	if (dinoz.placeId !== PlaceEnum.FORCEBRUT) return false;
	if (dinoz.life <= 0 || dinoz.state !== null) return false;
	if (!dinoz.status.some(status => status.statusId === DinozStatusId.TOURNA)) return false;

	const [opponent, irma] = await Promise.all([
		prisma.forcebrutTournamentOpponent.findFirst({
			where: {
				step: dinoz.FBTournamentStep + 1,
				enabled: true
			},
			select: { id: true }
		}),
		prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId,
					itemId: itemList[Item.POTION_IRMA].itemId
				}
			},
			select: { quantity: true }
		})
	]);

	return Boolean(opponent) && (irma?.quantity ?? 0) > 0;
}
