import { Clan } from './clan.js';

export interface ClanIngredient {
	id: number;
	ingredientId: number;
	quantity: number;
	clanId: number;

	clan?: Clan;
}
