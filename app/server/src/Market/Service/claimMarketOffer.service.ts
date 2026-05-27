import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { OfferStatus } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { discoverUserSkillsTx } from '../../Skill/Controller/discoveredUserSkills.controller.js';
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
					level: true,
					skills: {
						select: {
							skillId: true
						}
					}
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

	const hasWinner = winnerId !== null;
	const isSeller = sellerId === userId;
	const isWinner = winnerId === userId;

	if (!isSeller && !isWinner) {
		throw new ExpectedError('invalidOffer');
	}

	const targetUserId = hasWinner ? winnerId : sellerId;

	if (!targetUserId) {
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

	let discoveredSkills: number[] = [];
	let rewardUnlocked: number | undefined;

	await prisma.$transaction(async tx => {
		const claimed = await tx.offer.updateMany({
			where: { id: offer.id, status: OfferStatus.ENDED },
			data: { status: OfferStatus.CLAIMED }
		});

		if (claimed.count !== 1) {
			throw new ExpectedError('invalidOffer');
		}

		if (offer.dinozId && offer.dinoz) {
			if (hasWinner) {
				await tx.dinoz.update({
					where: { id: offer.dinozId },
					data: { userId: targetUserId, state: null, leaderId: null }
				});

				const discovery = await discoverUserSkillsTx(tx, {
					userId: targetUserId,
					skillIds: offer.dinoz.skills.map(skill => skill.skillId)
				});

				discoveredSkills = discovery.discoveredSkills;
				rewardUnlocked = discovery.rewardUnlocked;

				if (sellerId) {
					await transferDinozRankingTx(tx, {
						sellerId,
						winnerId: targetUserId,
						dinozLevel: offer.dinoz.level
					});
				}
			} else {
				await tx.dinoz.update({
					where: { id: offer.dinozId },
					data: { state: null }
				});
			}
		}

		await addOfferContentToInventoryTx(tx, targetUserId, items, ingredients);
	});

	return reply.send({
		ok: true,
		discoveredSkills,
		rewardUnlocked
	});
}
