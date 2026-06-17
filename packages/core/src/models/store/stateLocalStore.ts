import type { Language } from '../config/language.js';

export interface StateLocalStore {
	langue?: Language;
	skipLevelAnimation: boolean;
	skipFightAnimation: boolean;
	bypassGatheringGrid: boolean;
}
