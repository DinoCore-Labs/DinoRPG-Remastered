import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { GameLogType, OfferStatus } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import { assertUserHasDinozAtMarket } from '../Helpers/market.helper.js';
import { addOfferContentToInventoryTx, assertUserCanReceiveOfferContent } from '../Helpers/marketInventory.helper.js';
import { offerIdParamsSchema } from '../Schema/market.schema.js';
import { scheduleNextMarketOfferExpiration } from './expireMarketOffers.service.js';

export async function cancelMarketOffer(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	await assertUserHasDinozAtMarket(userId);
	const params = offerIdParamsSchema.parse(req.params);
	await prisma.$transaction(async tx => {
		/*
		 * Use the same offer lock as bidMarketOffer.
		 *
		 * A bid and a cancellation for the same offer must never
		 * be processed simultaneously.
		 */
		await tx.$executeRaw`
			SELECT pg_advisory_xact_lock(${params.offerId}::bigint)
		`;
		const currentOffer = await tx.offer.findFirst({
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
		if (!currentOffer || currentOffer.sellerId !== userId) {
			throw new ExpectedError('invalidOffer');
		}
		if (currentOffer.bids.length > 0) {
			throw new ExpectedError('offerInProgress');
		}
		const items = currentOffer.items
			.filter(item => !item.isIngredient)
			.map(item => ({
				itemId: item.itemId,
				quantity: item.quantity
			}));
		const ingredients = currentOffer.items
			.filter(item => item.isIngredient)
			.map(item => ({
				ingredientId: item.itemId,
				quantity: item.quantity
			}));
		/*
		 * Capacity validation is done before restoring the content.
		 */
		await assertUserCanReceiveOfferContent(userId, {
			items,
			ingredients,
			dinozId: currentOffer.dinozId,
			originalOwnerId: currentOffer.dinoz?.userId ?? null
		});
		if (currentOffer.dinozId) {
			await tx.dinoz.update({
				where: {
					id: currentOffer.dinozId
				},
				data: {
					state: null
				}
			});
		}
		await addOfferContentToInventoryTx(tx, userId, items, ingredients);
		await safeCreateGameLog({
			type: GameLogType.OfferCancelled,
			userId,
			dinozId: currentOffer.dinozId,
			metadata: {
				offerId: currentOffer.id,
				total: currentOffer.total,
				dinozId: currentOffer.dinozId,
				items,
				ingredients
			}
		});
		await tx.offer.delete({
			where: {
				id: currentOffer.id
			}
		});
		return currentOffer;
	});
	await scheduleNextMarketOfferExpiration();
	return reply.send({
		ok: true
	});
}
