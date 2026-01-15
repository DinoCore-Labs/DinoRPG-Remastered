import { StatTracking } from '../enums/StatsTracking.js';

declare const Languages: readonly ['EN', 'FR', 'DE', 'ES'];
type Language = (typeof Languages)[number];
export interface Goal {
	id: StatTracking;
	name: Record<Language, string>;
	description?: Record<Language, string>;
	rare: number;
	hidden?: boolean;
	unlocks: Unlock[];
}
export interface Unlock {
	count: number;
	points: number;
	icon?: string;
	title?: Record<Language, string>;
	description?: Record<Language, string>;
	prefix?: boolean;
	suffix?: boolean;
}
