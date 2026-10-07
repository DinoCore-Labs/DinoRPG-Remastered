import gameConfig from '../../config/game.config.js';
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

export async function getPlayerEventRanking(eventId: string, page: number = 1, pageSize: number = 50) {
	const skip = (page - 1) * pageSize;

	const trackings = await prisma.userEventTracking.findMany({
		where: { eventId },
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

	const totalCount = await prisma.userEventTracking.count({ where: { eventId } });
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

export async function getClanEventRanking(eventId: string, page: number = 1, pageSize: number = 50) {
	const skip = (page - 1) * pageSize;

	const trackings = await prisma.userEventTracking.findMany({
		where: { eventId, user: { clanId: { not: null } } },
		include: {
			user: {
				select: {
					clan: {
						select: { name: true, id: true, langs: true }
					}
				}
			}
		}
	});

	const clanTotals = new Map<number, { clanName: string; clanId: number; languages: string[]; totalKills: number }>();

	for (const t of trackings) {
		const clan = t.user.clan;
		if (!clan) continue;

		if (!clanTotals.has(clan.id)) {
			clanTotals.set(clan.id, { clanName: clan.name, clanId: clan.id, languages: clan.langs, totalKills: 0 });
		}
		clanTotals.get(clan.id)!.totalKills += t.total;
	}

	const sortedClans = Array.from(clanTotals.values()).sort((a, b) => b.totalKills - a.totalKills);
	const totalCount = sortedClans.length;
	const daysSinceStart = getDaysSinceEventStart(eventId) || 1; // Prevent division by zero

	const paginatedClans = sortedClans.slice(skip, skip + pageSize);

	return {
		total: totalCount,
		page,
		pageSize,
		ranking: paginatedClans.map((c, index) => ({
			position: skip + index + 1,
			clanName: c.clanName,
			clanId: c.clanId,
			languages: c.languages,
			totalKills: c.totalKills,
			averageKills: (c.totalKills / daysSinceStart).toFixed(1)
		}))
	};
}

export async function getSpecificClanEventRank(eventId: string, targetClanId: number): Promise<number | null> {
	const trackings = await prisma.userEventTracking.findMany({
		where: { eventId, user: { clanId: { not: null } } },
		select: { total: true, user: { select: { clanId: true } } }
	});

	const clanTotals = new Map<number, number>();

	for (const t of trackings) {
		const clanId = t.user.clanId;
		if (!clanId) continue;
		clanTotals.set(clanId, (clanTotals.get(clanId) || 0) + t.total);
	}

	const sortedClans = Array.from(clanTotals.entries()).sort((a, b) => b[1] - a[1]);

	const rankIndex = sortedClans.findIndex(c => c[0] === targetClanId);
	if (rankIndex === -1) return null; // Not participating or 0 kills
	return rankIndex + 1;
}
