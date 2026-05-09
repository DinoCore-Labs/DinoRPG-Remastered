import type { FastifyReply, FastifyRequest } from 'fastify';

import { OfferStatus, Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { assertUserHasDinozAtMarket } from '../Helpers/market.helper.js';
import { marketListParamsSchema, marketListQuerySchema } from '../Schema/market.schema.js';

const marketDinozSelect = {
	id: true,
	name: true,
	display: true,
	level: true,
	raceId: true,
	nbrUpFire: true,
	nbrUpWater: true,
	nbrUpWood: true,
	nbrUpLightning: true,
	nbrUpAir: true,
	skills: {
		select: {
			skillId: true
		}
	},
	status: {
		select: {
			statusId: true
		}
	}
};

export async function listMarketOffers(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	await assertUserHasDinozAtMarket(userId);

	const params = marketListParamsSchema.parse(req.params);
	const query = marketListQuerySchema.parse(req.query);

	const where: Prisma.OfferWhereInput = {};

	if (params.filter === 'dinoz') {
		where.dinozId = {
			not: null
		};
	}

	if (params.filter === 'items') {
		where.items = {
			some: {}
		};
	}

	if (params.filter === 'own') {
		where.OR = [
			{
				sellerId: userId
			},
			{
				bids: {
					some: {
						userId
					}
				}
			}
		];
	}

	if (query.sellerId) {
		where.sellerId = query.sellerId;
	}

	if (query.bidderId) {
		where.bids = {
			some: {
				userId: query.bidderId
			}
		};
	}

	where.status = query.expired ? { in: [OfferStatus.ENDED, OfferStatus.CLAIMED] } : OfferStatus.ONGOING;

	const pageSize = 10;
	const page = query.page;

	const [total, offers] = await Promise.all([
		prisma.offer.count({ where }),
		prisma.offer.findMany({
			where,
			skip: (page - 1) * pageSize,
			take: pageSize,
			orderBy: query.expired ? { id: 'desc' } : { endDate: 'asc' },
			include: {
				seller: {
					select: {
						id: true,
						name: true
					}
				},
				dinoz: {
					select: marketDinozSelect
				},
				items: true,
				bids: {
					orderBy: {
						value: 'desc'
					},
					take: 1,
					include: {
						user: {
							select: {
								id: true,
								name: true
							}
						}
					}
				}
			}
		})
	]);

	const mappedOffers = offers.map(offer => ({
		...offer,
		dinoz: offer.dinozDetails ? JSON.parse(offer.dinozDetails) : offer.dinoz
	}));

	const filteredOffers = query.onlyMines
		? mappedOffers.filter(offer => {
				const topBid = offer.bids[0];

				return offer.status === OfferStatus.ENDED && (offer.sellerId === userId || topBid?.userId === userId);
			})
		: mappedOffers;

	return reply.send({
		total,
		offers: filteredOffers
	});
}
