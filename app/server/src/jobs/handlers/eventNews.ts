import { Language } from '@dinorpg/core/models/config/language.js';
import { GameEvent } from '@dinorpg/core/models/game/gameEvents.js';
import { NewsType } from '@dinorpg/core/models/news/news.js';

import gameConfig from '../../config/game.config.js';
import { distributeChristmasRewards } from '../../Events/Service/eventChristmasRewards.service.js';
import { newsService } from '../../News/Service/news.service.js';

export async function checkEventNews() {
	const now = new Date();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	for (const event of gameConfig.events) {
		const eventNameLower = event.event.toLowerCase();

		if (event.start.month === month && event.start.day === day) {
			const newsType = (NewsType as any)[`EVENT_${event.event}`] || NewsType.ANNOUNCE;
			const titleKey = `news.event.${eventNameLower}.start.title`;
			const excerptKey = `news.event.${eventNameLower}.start.excerpt`;
			const contentKey = `news.event.${eventNameLower}.start.content`;
			const slug = `event-${eventNameLower}-${now.getFullYear()}`;

			const endMonthStr = event.end.month.toString().padStart(2, '0');
			const endDayStr = event.end.day.toString().padStart(2, '0');
			const params = JSON.stringify({ endDate: `${endDayStr}/${endMonthStr}` });

			try {
				await newsService.createAdminNews({
					slug,
					type: newsType,
					isPublished: true,
					publishedAt: now,
					translations: [
						{ lang: Language.FR, title: titleKey, excerpt: excerptKey, content: `${contentKey}|${params}` },
						{ lang: Language.EN, title: titleKey, excerpt: excerptKey, content: `${contentKey}|${params}` }
					]
				});
				console.log(`[Events] Automaticaly created start news for ${event.event}`);
			} catch (e) {
				if ((e as Error).message && !(e as Error).message.includes('Unique constraint failed')) {
					console.error(`Failed to create start news for event ${event.event}:`, e);
				}
			}

			// Reset the scores for this event (runs even if news already existed)
			try {
				const { prisma } = await import('../../prisma.js');
				await prisma.userEventTracking.deleteMany({
					where: { eventId: event.event }
				});
				console.log(`[Events] Cleared previous tracking for ${event.event}`);
			} catch (e) {
				console.error(`Failed to clear tracking for event ${event.event}:`, e);
			}
		} else if (event.end.month === month && event.end.day === day) {
			const newsType = (NewsType as any)[`EVENT_${event.event}`] || NewsType.ANNOUNCE;
			const titleKey = `news.event.${eventNameLower}.end.title`;
			const excerptKey = `news.event.${eventNameLower}.end.excerpt`;
			const contentKey = `news.event.${eventNameLower}.end.content`;
			const slug = `event-end-${eventNameLower}-${now.getFullYear()}`;

			try {
				let params = '{}';
				try {
					const { getPlayerEventRanking, getClanEventRanking } =
						await import('../../Ranking/Controller/getEventRanking.controller.js');
					const userRanking = await getPlayerEventRanking(event.event, 1, 3);
					const clanRanking = await getClanEventRanking(event.event, 1, 3);

					const topPlayers = userRanking.ranking
						.map((u: any) => `${u.position}. **${u.user.name}** (${u.totalKills} monstres)`)
						.join('\n\n');
					const topClans = clanRanking.ranking
						.map((c: any) => `${c.position}. **${c.clanName}** (${c.totalKills} monstres)`)
						.join('\n\n');

					params = JSON.stringify({ topPlayers, topClans });
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
							{ lang: Language.FR, title: titleKey, excerpt: excerptKey, content: `${contentKey}|${params}` },
							{ lang: Language.EN, title: titleKey, excerpt: excerptKey, content: `${contentKey}|${params}` }
						]
					});
					console.log(`[Events] Automaticaly created end news for ${event.event}`);
				} catch (e) {
					if ((e as Error).message && !(e as Error).message.includes('Unique constraint failed')) {
						console.error(`Failed to create end news for event ${event.event}:`, e);
					}
				}

				// Routeur de récompenses pour n'importe quel event
				if (event.event === GameEvent.CHRISTMAS) {
					await distributeChristmasRewards();
				}
				// else if (event.event === GameEvent.VALENTINE) { ... }
			} catch (e) {
				if ((e as Error).message && !(e as Error).message.includes('Unique constraint failed')) {
					console.error(`Failed to create end news for event ${event.event}:`, e);
				}
			}
		}
	}
}
