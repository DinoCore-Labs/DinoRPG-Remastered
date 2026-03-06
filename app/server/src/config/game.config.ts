import { GLOBAL } from '../context.js';

type GameEnv = 'development' | 'production';

interface DinozConfig {
	maxLevel: number;
	maxQuantity: number;
	leaderBonus: number;
	initialMaxLevel: number;
}

interface ShopConfig {
	dinozNumber: number;
	//buyableQuetzu: number;
}

interface GeneralConfig {
	initialMoney: number;
	initialTreasureTicket: number;
	starterPack: StarterItem[];
}

interface StarterItem {
	itemId: number;
	quantity: number;
}

export interface GameConfig {
	dinoz: DinozConfig;
	shop: ShopConfig;
	general: GeneralConfig;
}

const gameConfig: Record<GameEnv, GameConfig> = {
	development: {
		dinoz: {
			maxLevel: 80,
			maxQuantity: 30,
			leaderBonus: 3,
			initialMaxLevel: 50
		},
		shop: {
			dinozNumber: 30
			//buyableQuetzu: 6
		},
		general: {
			initialMoney: 1_000_000,
			initialTreasureTicket: 500,
			starterPack: [
				{ itemId: 1, quantity: 999 }, // potion irma
				{ itemId: 2, quantity: 10 }, // potion d'ange
				{ itemId: 3, quantity: 10 }, // nuage burger
				{ itemId: 4, quantity: 10 }, // pain chaud
				{ itemId: 5, quantity: 10 }, // tarte
				{ itemId: 997, quantity: 50 } // daily ticket
			]
		}
	},

	production: {
		dinoz: {
			maxLevel: 80,
			maxQuantity: 18,
			leaderBonus: 3,
			initialMaxLevel: 50
		},
		shop: {
			dinozNumber: 20
			//buyableQuetzu: 6
		},
		general: {
			initialMoney: 100_000,
			initialTreasureTicket: 30,
			starterPack: [
				{ itemId: 1, quantity: 20 }, // potion irma
				{ itemId: 2, quantity: 5 }, // potion d'ange
				{ itemId: 3, quantity: 5 }, // nuage burger
				{ itemId: 4, quantity: 1 }, // pain chaud
				{ itemId: 5, quantity: 2 }, // tarte
				{ itemId: 997, quantity: 2 } // daily ticket
			]
		}
	}
};

const env: GameEnv = GLOBAL.config.isProduction ? 'production' : 'development';

export default gameConfig[env];
