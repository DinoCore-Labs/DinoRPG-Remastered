import { MARKET_EXPIRATION_JOB_KEY } from '@dinorpg/core/models/market/constants.js';

import { MoneyType, OfferStatus } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

const BATCH_SIZE = 50;

const dinozSnapshotSelect = {
	id: true,
	name: true,
	display: true,
	level: true,
	raceId: true,
	nbrUpFire: true,
	nbrUpWater: true,
	nbrUpLightning: true,
	nbrUpWood: true,
	nbrUpAir: true,
	status: {
		select: {
			statusId: true
		}
	},
	skills: {
		select: {
			skillId: true
		}
	}
};

export async function expireMarketOffer(offerId: number) {
	return prisma.$transaction(async tx => {
		const locked = await tx.offer.updateMany({
			where: {
				id: offerId,
				status: OfferStatus.ONGOING,
				endDate: {
					lte: new Date()
				}
			},
			data: {
				status: OfferStatus.ENDED
			}
		});

		if (locked.count !== 1) {
			return false;
		}

		const offer = await tx.offer.findUnique({
			where: { id: offerId },
			include: {
				seller: {
					select: {
						id: true,
						name: true
					}
				},
				dinoz: {
					select: dinozSnapshotSelect
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
			return false;
		}

		const winnerBid = offer.bids[0];

		await tx.offer.update({
			where: { id: offer.id },
			data: {
				dinozDetails: offer.dinoz ? JSON.stringify(offer.dinoz) : null
			}
		});

		if (winnerBid?.userId && offer.sellerId) {
			await tx.userWallet.update({
				where: {
					userId_type: {
						userId: offer.sellerId,
						type: MoneyType.GOLD
					}
				},
				data: {
					amount: {
						increment: winnerBid.value * 1000
					}
				}
			});
		}

		return true;
	});
}

export async function expireDueMarketOffers() {
	const dueOffers = await prisma.offer.findMany({
		where: {
			status: OfferStatus.ONGOING,
			endDate: {
				lte: new Date()
			}
		},
		select: {
			id: true
		},
		orderBy: {
			endDate: 'asc'
		},
		take: BATCH_SIZE
	});

	let processed = 0;

	for (const offer of dueOffers) {
		const expired = await expireMarketOffer(offer.id);

		if (expired) {
			processed++;
		}
	}

	return {
		processed
	};
}

export async function getNextMarketOfferExpirationDate(): Promise<Date | null> {
	const nextOffer = await prisma.offer.findFirst({
		where: {
			status: OfferStatus.ONGOING
		},
		select: {
			endDate: true
		},
		orderBy: {
			endDate: 'asc'
		}
	});

	return nextOffer?.endDate ?? null;
}

export async function scheduleNextMarketOfferExpiration(): Promise<Date | null> {
	const nextRunAt = await getNextMarketOfferExpirationDate();

	await prisma.jobDefinition.update({
		where: {
			key: MARKET_EXPIRATION_JOB_KEY
		},
		data: {
			nextRunAt
		}
	});

	return nextRunAt;
}
