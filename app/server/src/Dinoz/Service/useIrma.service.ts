import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { removeItem } from '../../Inventory/Controller/removeItem.controller.js';
import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { ownsDinoz } from '../../User/Controller/ownsDinoz.controller.js';
import { assertDinozNotConcentrating } from '../Controller/concentrationDinoz.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type UseIrmaParams = {
	id: string;
};

export async function restoreDinozAction(userId: string, dinozId: number) {
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId', { statusCode: 400 });
	}

	const isOwner = await ownsDinoz(userId, dinozId);
	if (!isOwner) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId
			}
		});
	}

	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			remaining: true,
			fight: true,
			gather: true,
			followers: { select: { id: true, remaining: true, fight: true, gather: true } },
			user: {
				select: {
					id: true,
					items: true
				}
			}
		}
	});

	if (!dinoz || !dinoz.user) {
		throw new ExpectedError('dinozNotFound', {
			statusCode: 404,
			params: {
				dinozId
			}
		});
	}

	const team = [dinoz, ...(dinoz.followers ?? [])];
	for (const teamDinoz of team) {
		await assertDinozNotConcentrating(teamDinoz.id);
	}

	const irmaItemId = itemList[Item.POTION_IRMA].itemId;
	const irmaQuantity = dinoz.user.items?.find(i => i.itemId === irmaItemId);
	const neededIrma = team.filter(d => d.remaining === 0 && (!d.fight || !d.gather)).length;

	if (neededIrma > 0 && (!irmaQuantity || irmaQuantity.quantity < neededIrma)) {
		throw new ExpectedError('notEnoughIrma', { statusCode: 400 });
	}

	for (const teamDinoz of team.filter(d => !d.fight || !d.gather)) {
		if (teamDinoz.remaining > 0) {
			await updateDinoz(teamDinoz.id, {
				fight: true,
				gather: true,
				remaining: { decrement: 1 }
			});
		} else {
			await updateDinoz(teamDinoz.id, {
				fight: true,
				gather: true
			});
		}
	}

	if (neededIrma > 0) {
		await removeItem(dinoz.user.id, irmaItemId, neededIrma);
		await incrementUserStat(StatTracking.ITEM_USED, dinoz.user.id, neededIrma);
	}

	return {
		category: ItemEffect.ACTION,
		value: neededIrma
	};
}

export async function useIrma(req: FastifyRequest<{ Params: UseIrmaParams }>, reply: FastifyReply) {
	const result = await restoreDinozAction(req.user.id, Number(req.params.id));
	return reply.send(result);
}
