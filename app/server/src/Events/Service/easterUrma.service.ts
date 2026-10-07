import { GameEvent } from '@dinorpg/core/models/game/gameEvents.js';

import { prisma } from '../../prisma.js';

export const URMA_EGG_PURCHASE_LIMIT = 300;

export function getUrmaTrackingKey(year: number): string {
	return `${GameEvent.EASTER}_URMA_${year}`;
}

export async function getUrmaEggPurchasedCount(userId: string, year: number): Promise<number> {
	const tracking = await prisma.userEventTracking.findUnique({
		where: {
			eventId_userId: {
				eventId: getUrmaTrackingKey(year),
				userId
			}
		},
		select: {
			total: true
		}
	});
	return tracking?.total ?? 0;
}

export async function getRemainingUrmaEggPurchases(userId: string, year: number): Promise<number> {
	const purchased = await getUrmaEggPurchasedCount(userId, year);
	return Math.max(0, URMA_EGG_PURCHASE_LIMIT - purchased);
}

export async function canBuyUrmaEggs(userId: string, year: number, quantity: number): Promise<boolean> {
	if (!Number.isInteger(quantity) || quantity <= 0) {
		return false;
	}
	const purchased = await getUrmaEggPurchasedCount(userId, year);
	return purchased + quantity <= URMA_EGG_PURCHASE_LIMIT;
}

export async function incrementUrmaEggPurchasedCount(userId: string, year: number, quantity: number): Promise<number> {
	if (!Number.isInteger(quantity) || quantity <= 0) {
		throw new Error(`Invalid Urma egg quantity: ${quantity}`);
	}
	const eventId = getUrmaTrackingKey(year);
	const tracking = await prisma.userEventTracking.upsert({
		where: {
			eventId_userId: {
				eventId,
				userId
			}
		},
		create: {
			eventId,
			userId,
			daily: quantity,
			total: quantity
		},
		update: {
			daily: {
				increment: quantity
			},
			total: {
				increment: quantity
			}
		},
		select: {
			total: true
		}
	});
	return tracking.total;
}
