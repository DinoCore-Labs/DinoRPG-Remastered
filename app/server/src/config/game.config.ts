import { GameConfig } from '@dinorpg/core/models/game/gameConfig.js';
import { GameEvent, GameTheme } from '@dinorpg/core/models/game/gameEvents.js';

import { GLOBAL } from '../context.js';

type GameEnv = 'development' | 'production';

const events = [
	{
		event: GameEvent.APRIL_FOOLS,
		start: {
			month: 4,
			day: 1
		},
		end: {
			month: 4,
			day: 1
		},
		softCap: 100,
		theme: GameTheme.APRIL_FOOLS
	},
	{
		event: GameEvent.CHRISTMAS,
		start: {
			month: 12,
			day: 1
		},
		end: {
			month: 12,
			day: 26
		},
		softCap: 100,
		theme: GameTheme.CHRISTMAS
	},
	{
		event: GameEvent.VALENTINE,
		start: {
			month: 2,
			day: 13
		},
		end: {
			month: 2,
			day: 15
		},
		softCap: 100
	}
] satisfies GameConfig['events'];

const gameConfig: Record<GameEnv, GameConfig> = {
	development: {
		dinoz: {
			maxLevel: 80,
			maxQuantity: 18,
			initialMaxLevel: 50,
			maxKeepSeedReincarnations: 5
		},
		shop: {
			dinozNumber: 30
			//buyableQuetzu: 6
		},
		world: {
			disableSwampMovementBlock: true,
			disableSwampFightRules: false,
			activeFeatures: ['starquest', 'dojo', 'intro']
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
			],
			gameTimeZone: 'Europe/Paris'
		},
		events
	},
	production: {
		dinoz: {
			maxLevel: 80,
			maxQuantity: 18,
			initialMaxLevel: 50,
			maxKeepSeedReincarnations: 5
		},
		shop: {
			dinozNumber: 30
			//buyableQuetzu: 6
		},
		world: {
			disableSwampMovementBlock: false,
			disableSwampFightRules: true,
			activeFeatures: ['starquest', 'dojo', 'intro']
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
			],
			gameTimeZone: 'UTC'
		},
		events
	}
};

const env: GameEnv = GLOBAL.config.isProduction ? 'production' : 'development';

export default gameConfig[env];
