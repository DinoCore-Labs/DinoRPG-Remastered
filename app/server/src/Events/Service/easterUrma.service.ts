import { GameEvent } from '@dinorpg/core/models/game/gameEvents.js';

import { prisma } from '../../prisma.js';
import { getEventEdition } from './eventTracking.service.js';

export const URMA_EGG_PURCHASE_LIMIT = 300;

export function getUrmaTrackingKey(year: number): string {
	return `${GameEvent.EASTER}_URMA_${year}`;
}

export function getUrmaEdition(date = new Date()): number {
	return getEventEdition(date);
}

export async function getUrmaEggPurchasedCount(userId: string, edition: number): Promise<number> {
	const tracking = await prisma.userEventTracking.findUnique({
		where: {
			eventId_edition_userId: {
				eventId: getUrmaTrackingKey(edition),
				edition: edition,
				userId
			}
		},
		select: {
			total: true
		}
	});
	return tracking?.total ?? 0;
}

export async function getRemainingUrmaEggPurchases(userId: string, edition: number): Promise<number> {
	const purchased = await getUrmaEggPurchasedCount(userId, edition);
	return Math.max(0, URMA_EGG_PURCHASE_LIMIT - purchased);
}

export async function canBuyUrmaEggs(userId: string, edition: number, quantity: number): Promise<boolean> {
	if (!Number.isInteger(quantity) || quantity <= 0) {
		return false;
	}
	const purchased = await getUrmaEggPurchasedCount(userId, edition);
	return purchased + quantity <= URMA_EGG_PURCHASE_LIMIT;
}

export async function incrementUrmaEggPurchasedCount(
	userId: string,
	edition: number,
	quantity: number
): Promise<number> {
	if (!Number.isInteger(quantity) || quantity <= 0) {
		throw new Error(`Invalid Urma egg quantity: ${quantity}`);
	}
	const eventId = getUrmaTrackingKey(edition);
	const tracking = await prisma.userEventTracking.upsert({
		where: {
			eventId_edition_userId: {
				eventId,
				edition: edition,
				userId
			}
		},
		create: {
			eventId,
			edition: edition,
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
