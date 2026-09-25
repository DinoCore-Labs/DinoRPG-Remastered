import { Language } from '@dinorpg/core/models/config/language.js';
import { Events, GameEvent } from '@dinorpg/core/models/events/events.js';
import { NewsType } from '@dinorpg/core/models/news/news.js';

import { newsService } from '../../News/Service/news.service.js';

export async function checkEventNews() {
	const now = new Date();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	for (const event of Object.values(Events)) {
		if (event.start.month === month && event.start.day === day) {
			let newsType = NewsType.ANNOUNCE;
			let titleKey = '';
			let excerptKey = '';
			let contentKey = '';

			if (event.name === GameEvent.CHRISTMAS) {
				newsType = NewsType.EVENT_CHRISTMAS;
				titleKey = 'news.event.christmas.start.title';
				excerptKey = 'news.event.christmas.start.excerpt';
				contentKey = 'news.event.christmas.start.content';
			}

			if (titleKey) {
				const slug = `event-${event.name.toLowerCase()}-${now.getFullYear()}`;

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
								content: contentKey
							},
							{
								lang: Language.EN,
								title: titleKey,
								excerpt: excerptKey,
								content: contentKey
							}
						]
					});
					console.log(`[Events] Automaticaly created start news for ${event.name}`);
				} catch (e) {
					// Ignorer silencieusement si la news existe déjà (contrainte unique sur le slug)
					if ((e as Error).message && !(e as Error).message.includes('Unique constraint failed')) {
						console.error(`Failed to create news for event ${event.name}:`, e);
					}
				}
			}
		}
	}
}
