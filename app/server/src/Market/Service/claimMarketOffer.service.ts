import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { OfferStatus } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { assertUserHasDinozAtMarket } from '../Helpers/market.helper.js';
import { addOfferContentToInventoryTx, assertUserCanReceiveOfferContent } from '../Helpers/marketInventory.helper.js';
import { transferDinozRankingTx } from '../Helpers/marketRanking.helper.js';
import { offerIdParamsSchema } from '../Schema/market.schema.js';

export async function claimMarketOffer(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	await assertUserHasDinozAtMarket(userId);

	const params = offerIdParamsSchema.parse(req.params);

	const offer = await prisma.offer.findFirst({
		where: {
			id: params.offerId,
			status: OfferStatus.ENDED
		},
		include: {
			items: true,
			dinoz: {
				select: {
					id: true,
					userId: true,
					level: true
				}
			},
			bids: {
				orderBy: {
					value: 'desc'
				},
				take: 1
			}
		}
	});

	if (!offer) {
		throw new ExpectedError('invalidOffer');
	}

	const winnerBid = offer.bids[0];
	const hasWinner = Boolean(winnerBid?.userId);
	const targetUserId = hasWinner ? winnerBid!.userId! : offer.sellerId;

	if (!targetUserId) {
		throw new ExpectedError('invalidOffer');
	}

	if (userId !== targetUserId) {
		throw new ExpectedError('invalidOffer');
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

	await assertUserCanReceiveOfferContent(targetUserId, {
		items,
		ingredients,
		dinozId: offer.dinozId,
		originalOwnerId: offer.dinoz?.userId ?? null
	});

	await prisma.$transaction(async tx => {
		if (offer.dinozId && offer.dinoz) {
			if (hasWinner) {
				await tx.dinoz.update({
					where: { id: offer.dinozId },
					data: {
						userId: targetUserId,
						state: null,
						leaderId: null
					}
				});

				if (offer.sellerId) {
					await transferDinozRankingTx(tx, {
						sellerId: offer.sellerId,
						winnerId: targetUserId,
						dinozLevel: offer.dinoz.level
					});
				}
			} else {
				await tx.dinoz.update({
					where: { id: offer.dinozId },
					data: {
						state: null
					}
				});
			}
		}

		await addOfferContentToInventoryTx(tx, targetUserId, items, ingredients);

		await tx.offer.update({
			where: { id: offer.id },
			data: {
				status: OfferStatus.CLAIMED
			}
		});
	});

	return reply.send({ ok: true });
}
