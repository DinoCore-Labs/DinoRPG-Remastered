export enum GameEvent {
	APRIL_FOOLS = 'APRIL_FOOLS',
	BIRTHDAY = 'BIRTHDAY',
	CHRISTMAS = 'CHRISTMAS',
	EASTER = 'EASTER',
	HALLOWEEN = 'HALLOWEEN',
	VALENTINE = 'VALENTINE'
}

export enum GameTheme {
	DEFAULT = 'default',
	APRIL_FOOLS = 'april_fools',
	BIRTHDAY = 'birthday',
	CHRISTMAS = 'christmas',
	EASTER = 'easter',
	HALLOWEEN = 'halloween',
	VALENTINE = 'valentine'
}

export enum GameEventSchedule {
	FIXED = 'FIXED',
	EASTER = 'EASTER'
}

export interface GameEventDate {
	month: number;
	day: number;
}

export interface GameEventConfig {
	event: GameEvent;
	start?: GameEventDate;
	end?: GameEventDate;
	schedule?: GameEventSchedule;
	softCap?: number;
	theme?: GameTheme;
}

export interface ActiveGameEvent {
	event: GameEvent;
	softCap?: number;
	theme?: GameTheme;
}
