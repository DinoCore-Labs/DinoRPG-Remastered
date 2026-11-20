/**
 * This file defines the categories of ingredients and their mapping to itinerant merchant days.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Ingredient } from './ingredientList.js';

export type IngredientCategoryKey = 'energies' | 'plants' | 'rocks' | 'hunt' | 'fish' | 'special';
export type ItinerantDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface IngredientCategoryDefinition {
	key: IngredientCategoryKey;
	day?: ItinerantDayKey;
	ingredientIds: Ingredient[];
}

export const ingredientCategoryList: IngredientCategoryDefinition[] = [
	{
		key: 'energies',
		day: 'monday',
		ingredientIds: [
			Ingredient.ENERGIE_FOUDRE,
			Ingredient.ENERGIE_AIR,
			Ingredient.ENERGIE_EAU,
			Ingredient.ENERGIE_FEU,
			Ingredient.ENERGIE_BOIS
		]
	},
	{
		key: 'plants',
		day: 'tuesday',
		ingredientIds: [
			Ingredient.FEUILLES_DE_PELINAE,
			Ingredient.BOLET_PHALISK_BLANC,
			Ingredient.ORCHIDEE_FANTASQUE,
			Ingredient.RACINE_DE_FIGONICIA,
			Ingredient.SADIQUAE_MORDICUS,
			Ingredient.FLAUREOLE,
			Ingredient.SPORE_ETHERAL,
			Ingredient.POUSSE_SOMBRE
		]
	},
	{
		key: 'rocks',
		day: 'wednesday',
		ingredientIds: [
			Ingredient.SILEX_TAILLE,
			Ingredient.FRAGMENT_DE_TEXTE_ANCIEN,
			Ingredient.VIEIL_ANNEAU_PRECIEUX,
			Ingredient.CALICE_CISELE,
			Ingredient.COLLIER_KARAT,
			Ingredient.BROCHE_EN_PARFAIT_ETAT,
			Ingredient.SUPERBE_COURONNE_ROYALE,
			Ingredient.BRAS_MECANIQUE
		]
	},
	{
		key: 'hunt',
		day: 'thursday',
		ingredientIds: [
			Ingredient.TOUFFE_DE_FOURRURE,
			Ingredient.ROCHE_RADIO_ACTIVE,
			Ingredient.GRIFFES_ACEREES,
			Ingredient.CORNE_EN_CHOCOLAT,
			Ingredient.OEIL_VISQUEUX,
			Ingredient.LANGUE_MONSTRUEUSE,
			Ingredient.DENT_DE_DOROGON
		]
	},
	{
		key: 'fish',
		day: 'friday',
		ingredientIds: [
			Ingredient.MEROU_LUJIDANE,
			Ingredient.POISSON_VENGEUR,
			Ingredient.AN_GUILI_GUILILLE,
			Ingredient.GLOBULOS,
			Ingredient.SUPER_POISSON
		]
	},
	{
		key: 'special',
		ingredientIds: [Ingredient.GRAINE_DE_DEVOREUSE]
	}
];

export const orderedIngredientIds: Ingredient[] = ingredientCategoryList.flatMap(c => c.ingredientIds);
