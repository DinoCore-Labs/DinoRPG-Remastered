import { GameEventConfig } from './gameEvents.js';

export interface DinozConfig {
	maxLevel: number;
	maxQuantity: number;
	initialMaxLevel: number;
	maxKeepSeedReincarnations: number;
}

export interface ShopConfig {
	dinozNumber: number;
}

export interface WorldConfig {
	disableSwampMovementBlock: boolean;
	disableSwampFightRules: boolean;
	activeFeatures: string[];
}

export interface StarterItem {
	itemId: number;
	quantity: number;
}

export interface GeneralConfig {
	initialMoney: number;
	initialTreasureTicket: number;
	starterPack: StarterItem[];
	gameTimeZone: string;
}

export interface GameConfig {
	dinoz: DinozConfig;
	shop: ShopConfig;
	world: WorldConfig;
	general: GeneralConfig;
	events: GameEventConfig[];
}
