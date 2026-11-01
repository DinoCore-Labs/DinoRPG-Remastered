import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkEventNews } from '../../src/jobs/handlers/eventNews.js';
import { newsService } from '../../src/News/Service/news.service.js';

vi.mock('../../src/config/game.config.js', () => ({
	default: {
		general: { gameTimeZone: 'UTC' },
		events: [
			{ event: 'APRIL_FOOLS', start: { month: 4, day: 1 }, end: { month: 4, day: 1 } },
			{ event: 'BIRTHDAY', start: { month: 1, day: 7 }, end: { month: 7, day: 11 } },
			{ event: 'CHRISTMAS', start: { month: 12, day: 1 }, end: { month: 12, day: 25 } },
			{ event: 'EASTER', schedule: 'EASTER' },
			{ event: 'HALLOWEEN', start: { month: 10, day: 31 }, end: { month: 10, day: 31 } },
			{ event: 'VALENTINE', start: { month: 2, day: 13 }, end: { month: 2, day: 15 } }
		]
	}
}));

vi.mock('../../src/News/Service/news.service.js', () => ({
	newsService: { createAdminNews: vi.fn().mockResolvedValue({}) }
}));

vi.mock('../../src/Events/Service/eventChristmasRewards.service.js', () => ({
	distributeChristmasRewards: vi.fn()
}));

const createNews = vi.mocked(newsService.createAdminNews);

beforeEach(() => {
	vi.useFakeTimers();
	createNews.mockClear();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('checkEventNews : événements avec ou sans annonces', () => {
	it.each([
		['Halloween (début et fin le même jour)', '2026-10-31T00:01:00.000Z'],
		['Premier avril', '2026-04-01T00:01:00.000Z'],
		['Saint-Valentin (début)', '2026-02-13T00:01:00.000Z'],
		['Saint-Valentin (fin)', '2026-02-15T00:01:00.000Z'],
		['Pâques (fin)', '2026-04-06T00:01:00.000Z'],
		['Anniversaire (fin)', '2026-07-11T00:01:00.000Z']
	])('ne publie rien pour %s', async (_name, date) => {
		vi.setSystemTime(new Date(date));
		await checkEventNews();
		expect(createNews).not.toHaveBeenCalled();
	});

	it.each([
		['Noël', '2026-12-01T00:01:00.000Z', 'event-christmas-2026'],
		['Pâques', '2026-04-03T00:01:00.000Z', 'event-easter-2026'],
		['Anniversaire', '2026-01-07T00:01:00.000Z', 'event-birthday-2026']
	])('conserve la news de début de %s', async (_name, date, slug) => {
		vi.setSystemTime(new Date(date));
		await checkEventNews();
		expect(createNews).toHaveBeenCalledTimes(1);
		expect(createNews).toHaveBeenCalledWith(expect.objectContaining({ slug, isPublished: true }));
	});
});
