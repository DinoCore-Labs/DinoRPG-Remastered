import { ActiveGameEvent, GameEventConfig, GameEventDate, GameTheme } from '@dinorpg/core/models/game/gameEvents.js';

import gameConfig from '../../config/game.config.js';

interface CalendarDate {
	month: number;
	day: number;
}

function getCalendarDate(date: Date, timeZone: string): CalendarDate {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		month: 'numeric',
		day: 'numeric'
	}).formatToParts(date);
	const month = Number(parts.find(part => part.type === 'month')?.value);
	const day = Number(parts.find(part => part.type === 'day')?.value);
	return {
		month,
		day
	};
}

function toDayOfYearComparable(date: GameEventDate): number {
	return date.month * 100 + date.day;
}

function isGameEventActive(event: GameEventConfig, currentDate: CalendarDate): boolean {
	const current = toDayOfYearComparable(currentDate);
	const start = toDayOfYearComparable(event.start);
	const end = toDayOfYearComparable(event.end);
	/*
	 * Event contained in the same calendar year.
	 *
	 * Example:
	 * 01/12 -> 26/12
	 */
	if (start <= end) {
		return current >= start && current <= end;
	}
	/*
	 * Event crossing New Year.
	 *
	 * Example:
	 * 20/12 -> 05/01
	 */
	return current >= start || current <= end;
}

export function getActiveGameEvents(date = new Date()): ActiveGameEvent[] {
	const currentDate = getCalendarDate(date, gameConfig.general.gameTimeZone);
	return gameConfig.events
		.filter(event => isGameEventActive(event, currentDate))
		.map(event => ({
			event: event.event,
			softCap: event.softCap,
			theme: event.theme
		}));
}

export function getCurrentGameTheme(date = new Date()): GameTheme {
	const eventWithTheme = getActiveGameEvents(date).find(event => event.theme !== undefined);
	return eventWithTheme?.theme ?? GameTheme.DEFAULT;
}
