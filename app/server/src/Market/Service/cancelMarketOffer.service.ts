import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { OfferStatus } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { assertUserHasDinozAtMarket } from '../Helpers/market.helper.js';
import { addOfferContentToInventoryTx, assertUserCanReceiveOfferContent } from '../Helpers/marketInventory.helper.js';
import { offerIdParamsSchema } from '../Schema/market.schema.js';

export async function cancelMarketOffer(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	await assertUserHasDinozAtMarket(userId);

	const params = offerIdParamsSchema.parse(req.params);

	const offer = await prisma.offer.findFirst({
		where: {
			id: params.offerId,
			status: OfferStatus.ONGOING
		},
		include: {
			items: true,
			bids: true,
			dinoz: {
				select: {
					id: true,
					userId: true
				}
			}
		}
	});

	if (!offer || offer.sellerId !== userId) {
		throw new ExpectedError('invalidOffer');
	}

	if (offer.bids.length > 0) {
		throw new ExpectedError('offerInProgress');
	}

	const items = offer.items
		.filter(item => !item.isIngredient)
		.map(item => ({
			itemId: item.itemId,
			quantity: item.quantity
		}));

	const ingredients = offer.items
		.filter(item => item.isIngredient)
		.map(item => ({
			ingredientId: item.itemId,
			quantity: item.quantity
		}));

	await assertUserCanReceiveOfferContent(userId, {
		items,
		ingredients,
		dinozId: offer.dinozId,
		originalOwnerId: offer.dinoz?.userId ?? null
	});

	await prisma.$transaction(async tx => {
		if (offer.dinozId) {
			await tx.dinoz.update({
				where: { id: offer.dinozId },
				data: {
					state: null
				}
			});
		}

		await addOfferContentToInventoryTx(tx, userId, items, ingredients);

		await tx.offer.delete({
			where: { id: offer.id }
		});
	});

	return reply.send({ ok: true });
}
