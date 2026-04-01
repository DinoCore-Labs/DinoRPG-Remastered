export type DialogSpecial =
	| { type: 'none' }
	| { type: 'fight'; monsters: string[]; friends: string[]; background?: string }
	| { type: 'fightGroup'; monsters: string[]; friends: string[]; background?: string }
	| { type: 'missions'; group: string }
	| { type: 'useItem'; itemId: number; count: number }
	| { type: 'useIngredient'; ingredientId: number; count: number }
	| { type: 'useGold'; amount: number }
	| { type: 'startFight' }
	| { type: 'popup' }
	| { type: 'status'; status: string };
