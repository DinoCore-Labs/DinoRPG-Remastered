import { GameEvent, GameTheme } from '@dinorpg/core/models/game/gameEvents.js';
import { NewsType } from '@dinorpg/core/models/news/news.js';
import { describe, expect, it } from 'vitest';

import gameConfig from '../../src/config/game.config.js';
import { getActiveGameEvents, getCurrentGameTheme } from '../../src/GameEvent/Service/gameEvent.service.js';

describe('Bastille Day (14th of July) server configuration', () => {
	it('configures BASTILLE_DAY from July 14 to July 28 with BASTILLE_DAY theme', () => {
		const bastilleConfig = gameConfig.events.find(e => e.event === GameEvent.BASTILLE_DAY);
		expect(bastilleConfig).toBeDefined();
		expect(bastilleConfig?.start).toEqual({ month: 7, day: 14 });
		expect(bastilleConfig?.end).toEqual({ month: 7, day: 28 });
		expect(bastilleConfig?.theme).toBe(GameTheme.BASTILLE_DAY);
	});

	it('defines NewsType.EVENT_BASTILLE_DAY', () => {
		expect(NewsType.EVENT_BASTILLE_DAY).toBe('event_bastille_day');
	});

	it('activates Bastille Day event and theme strictly between July 14 and July 28', () => {
		const before = new Date('2026-07-13T12:00:00Z');
		const start = new Date('2026-07-14T12:00:00Z');
		const end = new Date('2026-07-28T12:00:00Z');
		const after = new Date('2026-07-29T12:00:00Z');

		expect(getActiveGameEvents(before).some(e => e.event === GameEvent.BASTILLE_DAY)).toBe(false);
		expect(getActiveGameEvents(start).some(e => e.event === GameEvent.BASTILLE_DAY)).toBe(true);
		expect(getActiveGameEvents(end).some(e => e.event === GameEvent.BASTILLE_DAY)).toBe(true);
		expect(getActiveGameEvents(after).some(e => e.event === GameEvent.BASTILLE_DAY)).toBe(false);

		expect(getCurrentGameTheme(start)).toBe(GameTheme.BASTILLE_DAY);
		expect(getCurrentGameTheme(end)).toBe(GameTheme.BASTILLE_DAY);
		expect(getCurrentGameTheme(before)).not.toBe(GameTheme.BASTILLE_DAY);
		expect(getCurrentGameTheme(after)).not.toBe(GameTheme.BASTILLE_DAY);
	});
});
