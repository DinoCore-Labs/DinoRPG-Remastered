import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

/**
 * Checks if the given updatedAt date is from a previous day.
 */
function isNewDay(updatedAt: Date): boolean {
	const now = new Date();
	return (
		updatedAt.getUTCDate() !== now.getUTCDate() ||
		updatedAt.getUTCMonth() !== now.getUTCMonth() ||
		updatedAt.getUTCFullYear() !== now.getUTCFullYear()
	);
}

export async function incrementUserEventProgression(userId: string, eventId: string, amount: number) {
	// Upsert to ensure the tracking exists
	const currentTrack = await prisma.userEventTracking.upsert({
		where: { eventId_userId: { eventId, userId } },
		update: {},
		create: { eventId, userId }
	});

	let newDaily = currentTrack.daily + amount;
	if (isNewDay(currentTrack.updatedAt)) {
		newDaily = amount; // Reset daily count if it's a new day
	}

	await prisma.userEventTracking.update({
		where: { id: currentTrack.id },
		data: {
			daily: newDaily,
			total: currentTrack.total + amount
		}
	});
}

export async function getUserEventTracking(userId: string, eventId: string) {
	return prisma.userEventTracking.findUnique({
		where: { eventId_userId: { eventId, userId } }
	});
}
