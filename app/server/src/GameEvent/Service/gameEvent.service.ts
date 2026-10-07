import {
	ActiveGameEvent,
	GameEventConfig,
	GameEventDate,
	GameEventSchedule,
	GameTheme
} from '@dinorpg/core/models/game/gameEvents.js';

import gameConfig from '../../config/game.config.js';

interface CalendarDate {
	year: number;
	month: number;
	day: number;
}

interface EventDateRange {
	start: CalendarDate;
	end: CalendarDate;
}

function getCalendarDate(date: Date, timeZone: string): CalendarDate {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	}).formatToParts(date);
	const year = Number(parts.find(part => part.type === 'year')?.value);
	const month = Number(parts.find(part => part.type === 'month')?.value);
	const day = Number(parts.find(part => part.type === 'day')?.value);
	return {
		year,
		month,
		day
	};
}

export function getGameCalendarYear(date = new Date()): number {
	return getCalendarDate(date, gameConfig.general.gameTimeZone).year;
}

function toCalendarComparable(date: CalendarDate): number {
	return date.year * 10000 + date.month * 100 + date.day;
}

function toFixedDateComparable(date: GameEventDate): number {
	return date.month * 100 + date.day;
}

/**
 * Returns Easter Sunday for the Gregorian calendar.
 * Meeus/Jones/Butcher algorithm.
 */
function getEasterSunday(year: number): CalendarDate {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return {
		year,
		month,
		day
	};
}

function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
	const value = new Date(Date.UTC(date.year, date.month - 1, date.day));
	value.setUTCDate(value.getUTCDate() + days);
	return {
		year: value.getUTCFullYear(),
		month: value.getUTCMonth() + 1,
		day: value.getUTCDate()
	};
}

function getDynamicEventRange(event: GameEventConfig, year: number): EventDateRange | null {
	switch (event.schedule) {
		case GameEventSchedule.EASTER: {
			const easterSunday = getEasterSunday(year);
			return {
				// Good Friday
				start: addCalendarDays(easterSunday, -2),
				// Easter Monday
				end: addCalendarDays(easterSunday, 1)
			};
		}
		default:
			return null;
	}
}

export function getGameEventDateRange(event: GameEventConfig, date = new Date()): EventDateRange | null {
	const currentDate = getCalendarDate(date, gameConfig.general.gameTimeZone);
	if (event.schedule && event.schedule !== GameEventSchedule.FIXED) {
		return getDynamicEventRange(event, currentDate.year);
	}
	if (!event.start || !event.end) {
		return null;
	}
	const crossesNewYear = toFixedDateComparable(event.start) > toFixedDateComparable(event.end);
	let startYear = currentDate.year;
	let endYear = currentDate.year;
	if (crossesNewYear) {
		const currentComparable = toFixedDateComparable(currentDate);
		const startComparable = toFixedDateComparable(event.start);
		if (currentComparable < startComparable) {
			startYear -= 1;
		} else {
			endYear += 1;
		}
	}
	return {
		start: {
			year: startYear,
			month: event.start.month,
			day: event.start.day
		},
		end: {
			year: endYear,
			month: event.end.month,
			day: event.end.day
		}
	};
}

function isFixedGameEventActive(event: GameEventConfig, currentDate: CalendarDate): boolean {
	if (!event.start || !event.end) {
		return false;
	}
	const current = toFixedDateComparable(currentDate);
	const start = toFixedDateComparable(event.start);
	const end = toFixedDateComparable(event.end);
	/*
	 * Event contained in the same calendar year.
	 *
	 * Example:
	 * 01/12 -> 25/12
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

function isDynamicGameEventActive(event: GameEventConfig, currentDate: CalendarDate): boolean {
	const range = getDynamicEventRange(event, currentDate.year);

	if (!range) {
		return false;
	}
	const current = toCalendarComparable(currentDate);
	const start = toCalendarComparable(range.start);
	const end = toCalendarComparable(range.end);
	return current >= start && current <= end;
}

function isGameEventActive(event: GameEventConfig, currentDate: CalendarDate): boolean {
	if (event.schedule && event.schedule !== GameEventSchedule.FIXED) {
		return isDynamicGameEventActive(event, currentDate);
	}
	return isFixedGameEventActive(event, currentDate);
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

export function isEventEndingInDays(days: number, date = new Date()): boolean {
	const currentDate = getCalendarDate(date, gameConfig.general.gameTimeZone);
	const activeEvents = gameConfig.events.filter(event => isGameEventActive(event, currentDate));
	if (activeEvents.length === 0) {
		return false;
	}
	for (const event of activeEvents) {
		const futureDate = new Date(date);
		futureDate.setDate(futureDate.getDate() + days);
		const futureCalendarDate = getCalendarDate(futureDate, gameConfig.general.gameTimeZone);
		if (!isGameEventActive(event, futureCalendarDate)) {
			return true;
		}
	}
	return false;
}
