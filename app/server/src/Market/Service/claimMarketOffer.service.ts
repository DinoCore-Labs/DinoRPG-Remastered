import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { MoneyType, OfferStatus } from '../../../../prisma/index.js';
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
	const winnerId = winnerBid?.userId ?? null;
	const sellerId = offer.sellerId;

	const hasWinner = Boolean(winnerId);
	const isSeller = sellerId === userId;
	const isWinner = winnerId === userId;

	if (!isSeller && !isWinner) {
		throw new ExpectedError('invalidOffer');
	}

	if (!hasWinner && !isSeller) {
		throw new ExpectedError('invalidOffer');
	}

	const contentTargetUserId = hasWinner ? winnerId : sellerId;

	if (!contentTargetUserId) {
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

	await assertUserCanReceiveOfferContent(contentTargetUserId, {
		items,
		ingredients,
		dinozId: offer.dinozId,
		originalOwnerId: offer.dinoz?.userId ?? null
	});

	await prisma.$transaction(async tx => {
		const claimed = await tx.offer.updateMany({
			where: {
				id: offer.id,
				status: OfferStatus.ENDED
			},
			data: {
				status: OfferStatus.CLAIMED
			}
		});

		if (claimed.count !== 1) {
			throw new ExpectedError('invalidOffer');
		}

		if (hasWinner && winnerBid && sellerId) {
			await tx.userWallet.upsert({
				where: {
					userId_type: {
						userId: sellerId,
						type: MoneyType.TREASURE_TICKET
					}
				},
				create: {
					userId: sellerId,
					type: MoneyType.TREASURE_TICKET,
					amount: winnerBid.value
				},
				update: {
					amount: {
						increment: winnerBid.value
					}
				}
			});
		}

		if (offer.dinozId && offer.dinoz) {
			if (hasWinner) {
				await tx.dinoz.update({
					where: { id: offer.dinozId },
					data: {
						userId: contentTargetUserId,
						state: null,
						leaderId: null
					}
				});

				if (sellerId) {
					await transferDinozRankingTx(tx, {
						sellerId,
						winnerId: contentTargetUserId,
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

		await addOfferContentToInventoryTx(tx, contentTargetUserId, items, ingredients);
	});

	return reply.send({ ok: true });
}
