import { getGameCalendarYear } from '../../GameEvent/Service/gameEvent.service.js';
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
	return getGameCalendarYear(date);
}

export async function incrementUserEventProgression(
	userId: string,
	eventId: string,
	amount: number,
	edition = getEventEdition()
) {
	const user = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			clan: {
				select: {
					id: true,
					name: true,
					langs: true
				}
			}
		}
	});
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
	await prisma.$transaction(async tx => {
		await tx.userEventTracking.update({
			where: {
				id: currentTrack.id
			},
			data: {
				daily: newDaily,
				total: currentTrack.total + amount
			}
		});
		if (user?.clan) {
			await tx.clanEventTracking.upsert({
				where: {
					eventId_edition_clanId: {
						eventId,
						edition,
						clanId: user.clan.id
					}
				},
				create: {
					eventId,
					edition,
					clanId: user.clan.id,
					clanName: user.clan.name,
					clanLangs: user.clan.langs,
					total: amount
				},
				update: {
					total: {
						increment: amount
					}
				}
			});
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
