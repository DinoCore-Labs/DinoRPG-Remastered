import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { MARKET_OFFER_DURATION_MS } from '@dinorpg/core/models/market/constants.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { DinozState, GameLogType, OfferStatus } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import { assertUserHasDinozAtMarket } from '../Helpers/market.helper.js';
import { assertUserOwnsOfferContent, removeOfferContentFromInventoryTx } from '../Helpers/marketInventory.helper.js';
import { createMarketOfferBodySchema } from '../Schema/market.schema.js';
import { scheduleNextMarketOfferExpiration } from './expireMarketOffers.service.js';

export async function createMarketOffer(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	await assertUserHasDinozAtMarket(userId);

	const body = createMarketOfferBodySchema.parse(req.body);
	const dinozId = body.dinozId ?? null;

	if (!dinozId && body.items.length === 0 && body.ingredients.length === 0) {
		throw new ExpectedError('emptyOffer');
	}

	const existingOffer = await prisma.offer.findFirst({
		where: {
			sellerId: userId,
			status: OfferStatus.ONGOING
		},
		select: {
			id: true
		}
	});

	if (existingOffer) {
		throw new ExpectedError('alreadyOffer');
	}

	await assertUserOwnsOfferContent(userId, body.items, body.ingredients);

	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: {
			id: true,
			name: true
		}
	});

	if (dinozId) {
		const dinoz = await prisma.dinoz.findFirst({
			where: {
				id: dinozId,
				userId
			},
			select: {
				id: true,
				placeId: true,
				state: true,
				leaderId: true,
				followers: {
					select: {
						id: true
					}
				},
				items: {
					select: {
						id: true
					}
				}
			}
		});

		if (!dinoz) {
			throw new ExpectedError('invalidDinoz');
		}

		if (dinoz.placeId !== PlaceEnum.PLACE_DU_MARCHE) {
			throw new ExpectedError('dinozNotAtMarket');
		}

		if (dinoz.state === DinozState.selling) {
			throw new ExpectedError('dinozAlreadySelling');
		}

		if (dinoz.state !== null) {
			throw new ExpectedError('invalidDinozState');
		}

		if (dinoz.leaderId || dinoz.followers.length > 0) {
			throw new ExpectedError('dinozInGroup');
		}

		if (dinoz.items.length > 0) {
			throw new ExpectedError('equippedItems');
		}
	}

	const offer = await prisma.$transaction(async tx => {
		const createdOffer = await tx.offer.create({
			data: {
				sellerId: userId,
				sellerName: user.name,
				dinozId,
				total: body.total,
				endDate: new Date(Date.now() + MARKET_OFFER_DURATION_MS),
				status: OfferStatus.ONGOING,
				items: {
					create: [
						...body.items.map(item => ({
							itemId: item.itemId,
							quantity: item.quantity,
							isIngredient: false
						})),
						...body.ingredients.map(ingredient => ({
							itemId: ingredient.ingredientId,
							quantity: ingredient.quantity,
							isIngredient: true
						}))
					]
				}
			}
		});

		if (dinozId) {
			await tx.dinoz.update({
				where: { id: dinozId },
				data: {
					state: DinozState.selling
				}
			});
		}

		await removeOfferContentFromInventoryTx(tx, userId, body.items, body.ingredients);

		await safeCreateGameLog({
			type: GameLogType.OfferNew,
			userId,
			dinozId,
			values: [],
			metadata: {
				offerId: createdOffer.id,
				total: body.total,
				dinozId,
				items: body.items,
				ingredients: body.ingredients,
				endDate: createdOffer.endDate.toISOString()
			}
		});

		return createdOffer;
	});
	await scheduleNextMarketOfferExpiration();

	return reply.send(offer);
}
