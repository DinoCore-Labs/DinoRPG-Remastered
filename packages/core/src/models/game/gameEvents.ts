export enum GameEvent {
	APRIL_FOOLS = 'APRIL_FOOLS',
	CHRISTMAS = 'CHRISTMAS',
	VALENTINE = 'VALENTINE'
}

export enum GameTheme {
	DEFAULT = 'default',
	APRIL_FOOLS = 'april_fools'
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
