import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';

import { BotStrategy } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

const FORCEBRUT_POLICY: Record<
	BotStrategy,
	{ minLifeRatio: number; maxOpponentLevelDelta: number; minIrmaQuantity: number }
> = {
	[BotStrategy.FIGHTER]: {
		minLifeRatio: 0.5,
		maxOpponentLevelDelta: 4,
		minIrmaQuantity: 1
	},
	[BotStrategy.BALANCED]: {
		minLifeRatio: 0.6,
		maxOpponentLevelDelta: 2,
		minIrmaQuantity: 2
	},
	[BotStrategy.GATHERER]: {
		minLifeRatio: 0.7,
		maxOpponentLevelDelta: 0,
		minIrmaQuantity: 3
	},
	[BotStrategy.EXPLORER]: {
		minLifeRatio: 0.7,
		maxOpponentLevelDelta: 0,
		minIrmaQuantity: 3
	}
};

export async function canBotFightForcebrut(
	userId: string,
	dinozId: number,
	strategy: BotStrategy
): Promise<boolean> {
	const dinoz = await prisma.dinoz.findFirst({
		where: { id: dinozId, userId },
		select: {
			placeId: true,
			level: true,
			life: true,
			maxLife: true,
			state: true,
			FBTournamentStep: true,
			status: { select: { statusId: true } }
		}
	});
	if (!dinoz) return false;
	if (dinoz.placeId !== PlaceEnum.FORCEBRUT) return false;
	if (dinoz.life <= 0 || dinoz.state !== null) return false;
	if (!dinoz.status.some(status => status.statusId === DinozStatusId.TOURNA)) return false;

	const policy = FORCEBRUT_POLICY[strategy];
	if (dinoz.life / Math.max(dinoz.maxLife, 1) < policy.minLifeRatio) return false;

	const [opponent, irma] = await Promise.all([
		prisma.forcebrutTournamentOpponent.findFirst({
			where: {
				step: dinoz.FBTournamentStep + 1,
				enabled: true
			},
			select: { id: true, level: true }
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

	if (!opponent) return false;
	if ((irma?.quantity ?? 0) < policy.minIrmaQuantity) return false;
	if (opponent.level > dinoz.level + policy.maxOpponentLevelDelta) return false;

	return true;
}
