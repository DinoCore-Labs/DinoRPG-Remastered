import { MARKET_BID_EXTENSION_MS } from '@dinorpg/core/models/market/constants.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { GameLogType, MoneyType, OfferStatus } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import { assertUserHasDinozAtMarket } from '../Helpers/market.helper.js';
import { bidOfferBodySchema, offerIdParamsSchema } from '../Schema/market.schema.js';
import { scheduleNextMarketOfferExpiration } from './expireMarketOffers.service.js';

export async function bidMarketOffer(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	await assertUserHasDinozAtMarket(userId);

	const params = offerIdParamsSchema.parse(req.params);
	const body = bidOfferBodySchema.parse(req.body);

	await prisma.$transaction(async tx => {
		const offer = await tx.offer.findFirst({
			where: {
				id: params.offerId,
				status: OfferStatus.ONGOING
			},
			include: {
				bids: {
					orderBy: {
						value: 'desc'
					},
					take: 1
				}
			}
		});

		if (!offer || offer.sellerId === userId) {
			throw new ExpectedError('invalidOffer');
		}

		if (offer.endDate <= new Date()) {
			throw new ExpectedError('offerEnded');
		}

		const topBid = offer.bids[0];
		const minimumBid = Math.ceil(offer.total / 1000);

		if (body.value < minimumBid) {
			throw new ExpectedError('bidIsLower');
		}

		if (topBid && body.value <= topBid.value) {
			throw new ExpectedError('bidIsLower');
		}

		if (topBid?.userId) {
			await tx.userWallet.update({
				where: {
					userId_type: {
						userId: topBid.userId,
						type: MoneyType.TREASURE_TICKET
					}
				},
				data: {
					amount: {
						increment: topBid.value
					}
				}
			});
		}

		const wallet = await tx.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId,
					type: MoneyType.TREASURE_TICKET
				}
			},
			select: {
				id: true,
				amount: true
			}
		});

		if (wallet.amount < body.value) {
			throw new ExpectedError('notEnoughTickets');
		}

		const user = await tx.user.findUniqueOrThrow({
			where: { id: userId },
			select: {
				name: true
			}
		});

		await tx.userWallet.update({
			where: { id: wallet.id },
			data: {
				amount: {
					decrement: body.value
				}
			}
		});

		const bid = await tx.offerBid.create({
			data: {
				offerId: offer.id,
				userId,
				userName: user.name,
				value: body.value
			}
		});

		await safeCreateGameLog({
			type: GameLogType.OfferBid,
			userId,
			values: [],
			metadata: {
				offerId: offer.id,
				bidId: bid.id,
				value: body.value,
				currency: MoneyType.TREASURE_TICKET,
				sellerId: offer.sellerId,
				previousTopBid: topBid
					? {
							userId: topBid.userId,
							value: topBid.value
						}
					: null
			}
		});

		await tx.offer.update({
			where: { id: offer.id },
			data: {
				endDate: new Date(offer.endDate.getTime() + MARKET_BID_EXTENSION_MS)
			}
		});
	});
	await scheduleNextMarketOfferExpiration();

	return reply.send({ ok: true });
}
