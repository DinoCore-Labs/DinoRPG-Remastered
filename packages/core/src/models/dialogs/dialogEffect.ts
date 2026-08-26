import { PlaceEnum } from '../enums/PlaceEnum.js';
import { TutorialEvent } from '../tutorial/tutorial.js';

export type DialogMoneyType = 'GOLD' | 'TREASURE_TICKET';

export type DialogEffect =
	| { type: 'effect'; effect: string }
	| { type: 'noEffect'; effect: string }
	| { type: 'collection'; collection: string }
	| { type: 'removeCollection'; collection: string }
	| { type: 'skill'; skillid: number }
	| { type: 'url'; url: string }
	| { type: 'scenario'; scenario: string; phase: number }
	| { type: 'scenarioDelta'; scenario: string; delta: number }
	| { type: 'tutorialEvent'; event: TutorialEvent }
	| { type: 'giveItem'; itemId: number; count: number }
	| { type: 'giveRandomItem'; itemIds: number[] }
	| { type: 'unlockMission'; mission: string }
	| { type: 'friend'; monster: string | null }
	| { type: 'moveRandom'; places: PlaceEnum[]; all: boolean }
	| { type: 'heal'; amount: number }
	| { type: 'dialect'; dialect: string }
	| { type: 'tag'; name: string }
	| { type: 'removeTag'; name: string }
	| { type: 'gameVar'; variable: string; qty: number }
	| { type: 'userVar'; variable: string; qty: number }
	| { type: 'giveIngredient'; ingredientId: number; count: number }
	| { type: 'giveMoney'; moneyType: DialogMoneyType; amount: number }
	| { type: 'startConcentration' };
