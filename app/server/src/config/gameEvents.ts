import { GameTheme } from '@dinorpg/core/models/game/gameTheme.js';

interface GameEvent {
	theme: GameTheme;
	priority: number;
	isActive: (date: Date) => boolean;
}

const GAME_EVENTS: GameEvent[] = [
	{
		theme: GameTheme.APRIL_FOOLS,
		priority: 100,
		isActive: date => {
			return date.getUTCMonth() === 3 && date.getUTCDate() === 1;
		}
	},

	{
		theme: GameTheme.HALLOWEEN,
		priority: 50,
		isActive: date => {
			return date.getUTCMonth() === 9 && date.getUTCDate() === 31;
		}
	},

	{
		theme: GameTheme.CHRISTMAS,
		priority: 50,
		isActive: date => {
			const month = date.getUTCMonth();
			const day = date.getUTCDate();

			return (month === 11 && day >= 15) || (month === 0 && day <= 5);
		}
	}
];

export function getCurrentGameTheme(date = new Date()): GameTheme {
	const event = GAME_EVENTS.filter(event => event.isActive(date)).sort((a, b) => b.priority - a.priority)[0];

	return event?.theme ?? GameTheme.DEFAULT;
}
