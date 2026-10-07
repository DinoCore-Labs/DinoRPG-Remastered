import { GameTheme } from '@dinorpg/core/models/game/gameEvents.js';

import bgSky from '../assets/background/bg_ciel.webp';
import dinozBg from '../assets/background/dinoz_bg_cut.webp';
import aprilFoolsBgHeader from '../assets/background/events/april-fools/full_bg_fish.webp';
import aprilFoolsBgCore from '../assets/background/events/april-fools/full_core_bg_fish.webp';
import aprilFoolsBgFooter from '../assets/background/events/april-fools/full_footer_fish.webp';
import bgSky2 from '../assets/background/events/christmas/bg_ciel.webp';
import dinozBgNoel from '../assets/background/events/christmas/dinoz_bg_noel.webp';
import christmasBgHeader from '../assets/background/events/christmas/full_bg_noel.webp';
import easterBgHeader from '../assets/background/events/easter/full_bg_easter.webp';
import halloweenBgHeader from '../assets/background/events/halloween/full_bg_halloween.webp';
import bgHeader from '../assets/background/full_bg.webp';
import bgCore from '../assets/background/full_core_bg.webp';
import bgFooter from '../assets/background/full_footer.webp';

export const DEFAULT_GAME_THEME = {
	sky: bgSky,
	header: bgHeader,
	core: bgCore,
	footer: bgFooter,
	dinoz: dinozBg
};

export const GAME_THEMES: Partial<Record<GameTheme, typeof DEFAULT_GAME_THEME>> = {
	[GameTheme.DEFAULT]: DEFAULT_GAME_THEME,
	[GameTheme.APRIL_FOOLS]: {
		sky: bgSky,
		header: aprilFoolsBgHeader,
		core: aprilFoolsBgCore,
		footer: aprilFoolsBgFooter,
		dinoz: dinozBg
	},
	[GameTheme.CHRISTMAS]: {
		sky: bgSky2,
		header: christmasBgHeader,
		core: bgCore,
		footer: bgFooter,
		dinoz: dinozBgNoel
	},
	[GameTheme.EASTER]: {
		sky: bgSky,
		header: easterBgHeader,
		core: bgCore,
		footer: bgFooter,
		dinoz: dinozBg
	},
	// The Valentine-specific image asset has not yet been committed to this base branch.
	[GameTheme.VALENTINE]: DEFAULT_GAME_THEME,
	[GameTheme.HALLOWEEN]: {
		sky: bgSky,
		header: halloweenBgHeader,
		core: bgCore,
		footer: bgFooter,
		dinoz: dinozBg
	}
};

export function getGameTheme(theme: GameTheme) {
	return GAME_THEMES[theme] ?? DEFAULT_GAME_THEME;
}
