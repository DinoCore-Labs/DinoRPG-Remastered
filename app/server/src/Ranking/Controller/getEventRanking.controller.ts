import gameConfig from '../../config/game.config.js';
import { getEventEdition } from '../../Events/Service/eventTracking.service.js';
import { getGameEventDateRange } from '../../GameEvent/Service/gameEvent.service.js';
import { prisma } from '../../prisma.js';

function getDaysSinceEventStart(eventId: string): number {
	const eventDetails = gameConfig.events.find(event => event.event === eventId);
	if (!eventDetails) {
		return 1;
	}
	const now = new Date();
	const range = getGameEventDateRange(eventDetails, now);
	if (!range) {
		return 1;
	}
	const startDate = Date.UTC(range.start.year, range.start.month - 1, range.start.day);
	const currentDate = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const diffTime = currentDate - startDate;
	if (diffTime < 0) {
		return 1;
	}
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
	return Math.max(1, diffDays);
}

export async function getPlayerEventRanking(
	eventId: string,
	page: number = 1,
	pageSize: number = 50,
	edition = getEventEdition()
) {
	const skip = (page - 1) * pageSize;
	const trackings = await prisma.userEventTracking.findMany({
		where: { eventId, edition },
		orderBy: { total: 'desc' },
		skip,
		take: pageSize,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					clan: {
						select: { name: true, id: true, langs: true }
					}
				}
			}
		}
	});
	const totalCount = await prisma.userEventTracking.count({ where: { eventId, edition } });
	const daysSinceStart = getDaysSinceEventStart(eventId);
	return {
		total: totalCount,
		page,
		pageSize,
		ranking: trackings.map((t, index) => ({
			position: skip + index + 1,
			user: { id: t.user.id, name: t.user.name },
			clanName: t.user.clan?.name,
			clanId: t.user.clan?.id,
			languages: t.user.clan?.langs,
			totalKills: t.total,
			dailyKills: t.daily,
			averageKills: (t.total / daysSinceStart).toFixed(1)
		}))
	};
}

export async function getClanEventRanking(
	eventId: string,
	page: number = 1,
	pageSize: number = 50,
	edition = getEventEdition()
) {
	const skip = (page - 1) * pageSize;
	const [trackings, totalCount] = await Promise.all([
		prisma.clanEventTracking.findMany({
			where: {
				eventId,
				edition
			},
			orderBy: {
				total: 'desc'
			},
			skip,
			take: pageSize
		}),
		prisma.clanEventTracking.count({
			where: {
				eventId,
				edition
			}
		})
	]);
	const daysSinceStart = getDaysSinceEventStart(eventId);
	return {
		total: totalCount,
		page,
		pageSize,
		ranking: trackings.map((tracking, index) => ({
			position: skip + index + 1,
			clanName: tracking.clanName,
			clanId: tracking.clanId,
			languages: tracking.clanLangs,
			totalKills: tracking.total,
			averageKills: (tracking.total / daysSinceStart).toFixed(1)
		}))
	};
}

export async function getSpecificClanEventRank(
	eventId: string,
	targetClanId: number,
	edition = getEventEdition()
): Promise<number | null> {
	const target = await prisma.clanEventTracking.findUnique({
		where: {
			eventId_edition_clanId: {
				eventId,
				edition,
				clanId: targetClanId
			}
		},
		select: {
			total: true
		}
	});
	if (!target) {
		return null;
	}
	const clansAhead = await prisma.clanEventTracking.count({
		where: {
			eventId,
			edition,
			total: {
				gt: target.total
			}
		}
	});
	return clansAhead + 1;
}
