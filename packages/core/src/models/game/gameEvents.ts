export enum GameEvent {
	APRIL_FOOLS = 'APRIL_FOOLS',
	CHRISTMAS = 'CHRISTMAS',
	HALLOWEEN = 'HALLOWEEN',
	VALENTINE = 'VALENTINE'
}

export enum GameTheme {
	DEFAULT = 'default',
	APRIL_FOOLS = 'april_fools',
	CHRISTMAS = 'christmas',
	HALLOWEEN = 'halloween'
}

export interface GameEventDate {
	month: number;
	day: number;
}

export interface GameEventConfig {
	event: GameEvent;
	start: GameEventDate;
	end: GameEventDate;
	softCap: number;
	theme?: GameTheme;
}

export interface ActiveGameEvent {
	event: GameEvent;
	softCap: number;
	theme?: GameTheme;
}
