import { prisma } from '../../prisma.js';

function isNewDay(updatedAt: Date): boolean {
	const now = new Date();
	return (
		updatedAt.getUTCDate() !== now.getUTCDate() ||
		updatedAt.getUTCMonth() !== now.getUTCMonth() ||
		updatedAt.getUTCFullYear() !== now.getUTCFullYear()
	);
}

export function getEventEdition(date = new Date()): number {
	return date.getUTCFullYear();
}

export async function incrementUserEventProgression(
	userId: string,
	eventId: string,
	amount: number,
	edition = getEventEdition()
) {
	const currentTrack = await prisma.userEventTracking.upsert({
		where: {
			eventId_edition_userId: {
				eventId,
				edition,
				userId
			}
		},
		update: {},
		create: {
			eventId,
			edition,
			userId
		}
	});
	let newDaily = currentTrack.daily + amount;
	if (isNewDay(currentTrack.updatedAt)) {
		newDaily = amount;
	}
	await prisma.userEventTracking.update({
		where: {
			id: currentTrack.id
		},
		data: {
			daily: newDaily,
			total: currentTrack.total + amount
		}
	});
}

export async function getUserEventTracking(userId: string, eventId: string, edition = getEventEdition()) {
	return prisma.userEventTracking.findUnique({
		where: {
			eventId_edition_userId: {
				eventId,
				edition,
				userId
			}
		}
	});
}
