import { Language } from '@dinorpg/core/models/config/language.js';
import { GameEvent } from '@dinorpg/core/models/game/gameEvents.js';
import { NewsType } from '@dinorpg/core/models/news/news.js';

import gameConfig from '../../config/game.config.js';
import { distributeChristmasRewards } from '../../Events/Service/eventChristmasRewards.service.js';
import { getGameEventDateRange } from '../../GameEvent/Service/gameEvent.service.js';
import { newsService } from '../../News/Service/news.service.js';

// Seuls ces événements publient des actualités automatiquement.
// Les autres (Halloween, Saint-Valentin, 1er avril) sont des thèmes visuels.
const AUTOMATIC_NEWS_TYPES: Partial<Record<GameEvent, NewsType>> = {
	[GameEvent.BIRTHDAY]: NewsType.EVENT_BIRTHDAY,
	[GameEvent.CHRISTMAS]: NewsType.EVENT_CHRISTMAS,
	[GameEvent.EASTER]: NewsType.EVENT_EASTER
};

export async function checkEventNews() {
	const now = new Date();
	const tz = gameConfig.general.gameTimeZone ?? 'UTC';
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: tz,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	});
	const parts = formatter.formatToParts(now);
	const year = parseInt(parts.find(p => p.type === 'year')!.value, 10);
	const month = parseInt(parts.find(p => p.type === 'month')!.value, 10);
	const day = parseInt(parts.find(p => p.type === 'day')!.value, 10);
	for (const event of gameConfig.events) {
		const newsType = AUTOMATIC_NEWS_TYPES[event.event];
		if (!newsType) continue;

		const eventNameLower = event.event.toLowerCase();
		const range = getGameEventDateRange(event, now);
		if (!range) {
			console.warn(`[Events] Unable to resolve date range for ${event.event}`);
			continue;
		}
		const isStartDay = range.start.year === year && range.start.month === month && range.start.day === day;
		const isEndDay = range.end.year === year && range.end.month === month && range.end.day === day;
		if (isStartDay) {
			const titleKey = `news.event.${eventNameLower}.start.title`;
			const excerptKey = `news.event.${eventNameLower}.start.excerpt`;
			const contentKey = `news.event.${eventNameLower}.start.content`;
			const slug = `event-${eventNameLower}-${year}`;
			const endMonthStr = range.end.month.toString().padStart(2, '0');
			const endDayStr = range.end.day.toString().padStart(2, '0');
			const params = JSON.stringify({
				eventEndDate: `${endDayStr}/${endMonthStr}`
			});
			try {
				await newsService.createAdminNews({
					slug,
					type: newsType,
					isPublished: true,
					publishedAt: now,
					translations: [
						{
							lang: Language.FR,
							title: titleKey,
							excerpt: excerptKey,
							content: `${contentKey}|${params}`
						},
						{
							lang: Language.EN,
							title: titleKey,
							excerpt: excerptKey,
							content: `${contentKey}|${params}`
						}
					]
				});
				console.log(`[Events] Automatically created start news for ${event.event}`);
			} catch (e) {
				if ((e as Error).message && !(e as Error).message.includes('Unique constraint failed')) {
					console.error(`Failed to create start news for event ${event.event}:`, e);
				}
			}
		}
		/*
		 * Easter only needs its start announcement.
		 *
		 * There is no end ranking/news associated with Madame Urma.
		 */
		if (isEndDay && event.event !== GameEvent.EASTER && event.event !== GameEvent.BIRTHDAY) {
			const titleKey = `news.event.${eventNameLower}.end.title`;
			const excerptKey = `news.event.${eventNameLower}.end.excerpt`;
			const contentKey = `news.event.${eventNameLower}.end.content`;
			const slug = `event-end-${eventNameLower}-${year}`;
			try {
				let params = '{}';
				try {
					const { getPlayerEventRanking, getClanEventRanking } =
						await import('../../Ranking/Controller/getEventRanking.controller.js');
					const userRanking = await getPlayerEventRanking(event.event, 1, 3);
					const clanRanking = await getClanEventRanking(event.event, 1, 3);
					const topPlayers = userRanking.ranking
						.map((u: any) => `${u.position}. ${u.user.name} (${u.totalKills} monstres)`)
						.join('\n\n');
					const topClans = clanRanking.ranking
						.map((c: any) => `${c.position}. ${c.clanName} (${c.totalKills} monstres)`)
						.join('\n\n');
					params = JSON.stringify({
						topPlayers,
						topClans
					});
				} catch (e) {
					console.error('Failed to get rankings for news', e);
				}
				try {
					await newsService.createAdminNews({
						slug,
						type: newsType,
						isPublished: true,
						publishedAt: now,
						translations: [
							{
								lang: Language.FR,
								title: titleKey,
								excerpt: excerptKey,
								content: `${contentKey}|${params}`
							},
							{
								lang: Language.EN,
								title: titleKey,
								excerpt: excerptKey,
								content: `${contentKey}|${params}`
							}
						]
					});
					console.log(`[Events] Automatically created end news for ${event.event}`);
				} catch (e) {
					if ((e as Error).message && !(e as Error).message.includes('Unique constraint failed')) {
						console.error(`Failed to create end news for event ${event.event}:`, e);
					}
				}
				if (event.event === GameEvent.CHRISTMAS) {
					await distributeChristmasRewards(year);
				}
			} catch (e) {
				if ((e as Error).message && !(e as Error).message.includes('Unique constraint failed')) {
					console.error(`Failed to create end news for event ${event.event}:`, e);
				}
			}
		}
	}
}
