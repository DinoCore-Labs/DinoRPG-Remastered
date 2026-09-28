import { type ActiveGameEvent, GameTheme } from './gameEvents.js';

export interface PublicGameAppearanceConfig {
	theme: GameTheme;
}

export interface PublicGameConfig {
	appearance: PublicGameAppearanceConfig;
	activeEvents: ActiveGameEvent[];
	isEventLockActive: boolean;
}
