import { GameTheme } from '@dinorpg/core/models/game/gameEvents.js';

import bgSky from '../assets/background/bg_ciel.webp';
import aprilFoolsBgHeader from '../assets/background/events/april-fools/full_bg_fish.webp';
import aprilFoolsBgCore from '../assets/background/events/april-fools/full_core_bg_fish.webp';
import aprilFoolsBgFooter from '../assets/background/events/april-fools/full_footer_fish.webp';
import bgHeader from '../assets/background/full_bg.webp';
import bgCore from '../assets/background/full_core_bg.webp';
import bgFooter from '../assets/background/full_footer.webp';

export const DEFAULT_GAME_THEME = {
	sky: bgSky,
	header: bgHeader,
	core: bgCore,
	footer: bgFooter
};

export const GAME_THEMES: Partial<Record<GameTheme, typeof DEFAULT_GAME_THEME>> = {
	[GameTheme.DEFAULT]: DEFAULT_GAME_THEME,
	[GameTheme.APRIL_FOOLS]: {
		sky: bgSky,
		header: aprilFoolsBgHeader,
		core: aprilFoolsBgCore,
		footer: aprilFoolsBgFooter
	}
};
