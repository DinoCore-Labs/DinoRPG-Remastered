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
	buyableQuetzu: number;
}

interface GeneralConfig {
	initialMoney: number;
	dailyGridRewards: number;
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
			dinozNumber: 10,
			buyableQuetzu: 6
		},
		general: {
			initialMoney: 1_000_000,
			dailyGridRewards: 10
		}
	},

	production: {
		dinoz: {
			maxLevel: 50,
			maxQuantity: 18,
			leaderBonus: 3,
			initialMaxLevel: 50
		},
		shop: {
			dinozNumber: 30,
			buyableQuetzu: 6
		},
		general: {
			initialMoney: 200_000,
			dailyGridRewards: 5
		}
	}
};

const env: GameEnv = GLOBAL.config.isProduction ? 'production' : 'development';

export default gameConfig[env];
