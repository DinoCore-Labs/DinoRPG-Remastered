import { GameTheme } from './gameEvents.js';

export interface PublicGameAppearanceConfig {
	theme: GameTheme;
}

export interface PublicGameConfig {
	appearance: PublicGameAppearanceConfig;
}
