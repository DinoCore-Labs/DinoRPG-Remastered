import { MARKET_EXPIRATION_JOB_KEY } from '@dinorpg/core/models/market/constants.js';
import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';

import { GameLogType, MoneyType, OfferStatus } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { newNotif } from '../../Notification/Service/notification.service.js';
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
		await tx.offer.update({
			where: { id: offer.id },
			data: {
				dinozDetails: offer.dinoz ? JSON.stringify(offer.dinoz) : null
			}
		});

		if (winnerBid?.userId && offer.sellerId) {
			const sellerGold = winnerBid.value * 1000;
			await tx.userWallet.update({
				where: {
					userId_type: {
						userId: offer.sellerId,
						type: MoneyType.GOLD
					}
				},
				data: {
					amount: { increment: sellerGold }
				}
			});

			await safeCreateGameLog({
				type: GameLogType.GoldWon,
				userId: offer.sellerId,
				dinozId: offer.dinoz?.id ?? null,
				values: [String(sellerGold)],
				metadata: {
					source: 'market',
					offerId: offer.id,
					winnerId: winnerBid.userId,
					bidValue: winnerBid.value,
					amount: sellerGold,
					wallet: MoneyType.GOLD
				}
			});

			await safeCreateGameLog({
				type: GameLogType.OfferWon,
				userId: winnerBid.userId,
				dinozId: offer.dinoz?.id ?? null,
				values: [String(winnerBid.value)],
				metadata: {
					offerId: offer.id,
					sellerId: offer.sellerId,
					winnerId: winnerBid.userId,
					value: winnerBid.value,
					currency: MoneyType.TREASURE_TICKET,
					dinozId: offer.dinoz?.id ?? null
				}
			});

			await newNotif(offer.sellerId, NotificationType.MARKET_OFFER_SOLD, { price: sellerGold });
			await newNotif(winnerBid.userId, NotificationType.MARKET_OFFER_WIN, { price: winnerBid.value });
		} else {
			await safeCreateGameLog({
				type: GameLogType.OfferExpired,
				userId: offer.sellerId,
				dinozId: offer.dinoz?.id ?? null,
				metadata: {
					offerId: offer.id,
					sellerId: offer.sellerId,
					dinozId: offer.dinoz?.id ?? null,
					reason: 'no_bid'
				}
			});

			if (offer.sellerId) {
				await newNotif(offer.sellerId, NotificationType.MARKET_OFFER_UNSOLD);
			}
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
