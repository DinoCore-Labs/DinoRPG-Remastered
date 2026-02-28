import { IngredientFiche } from './ingredientFiche.js';

export enum Ingredient {
	MEROU_LUJIDANE = 1,
	POISSON_VENGEUR = 2,
	AN_GUILI_GUILILLE = 3,
	GLOBULOS = 4,
	SUPER_POISSON = 5,
	TOUFFE_DE_FOURRURE = 6,
	GRIFFES_ACEREES = 7,
	CORNE_EN_CHOCOLAT = 8,
	OEIL_VISQUEUX = 9,
	LANGUE_MONSTRUEUSE = 10,
	DENT_DE_DOROGON = 11,
	ROCHE_RADIO_ACTIVE = 12,
	ENERGIE_FOUDRE = 13,
	ENERGIE_AIR = 14,
	ENERGIE_EAU = 15,
	ENERGIE_FEU = 16,
	ENERGIE_BOIS = 17,
	SILEX_TAILLE = 18,
	FRAGMENT_DE_TEXTE_ANCIEN = 19,
	VIEIL_ANNEAU_PRECIEUX = 20,
	CALICE_CISELE = 21,
	COLLIER_KARAT = 22,
	BROCHE_EN_PARFAIT_ETAT = 23,
	SUPERBE_COURONNE_ROYALE = 24,
	BRAS_MECANIQUE = 25,
	FEUILLES_DE_PELINAE = 26,
	BOLET_PHALISK_BLANC = 27,
	ORCHIDEE_FANTASQUE = 28,
	RACINE_DE_FIGONICIA = 29,
	SADIQUAE_MORDICUS = 30,
	FLAUREOLE = 31,
	SPORE_ETHERAL = 32,
	POUSSE_SOMBRE = 33,
	GRAINE_DE_DEVOREUSE = 34
}

export const IngredientNames = [
	'MEROU_LUJIDANE',
	'POISSON_VENGEUR',
	'AN_GUILI_GUILILLE',
	'GLOBULOS',
	'SUPER_POISSON',
	'TOUFFE_DE_FOURRURE',
	'GRIFFES_ACEREES',
	'CORNE_EN_CHOCOLAT',
	'OEIL_VISQUEUX',
	'LANGUE_MONSTRUEUSE',
	'DENT_DE_DOROGON',
	'ROCHE_RADIO_ACTIVE',
	'ENERGIE_FOUDRE',
	'ENERGIE_AIR',
	'ENERGIE_EAU',
	'ENERGIE_FEU',
	'ENERGIE_BOIS',
	'SILEX_TAILLE',
	'FRAGMENT_DE_TEXTE_ANCIEN',
	'VIEIL_ANNEAU_PRECIEUX',
	'CALICE_CISELE',
	'COLLIER_KARAT',
	'BROCHE_EN_PARFAIT_ETAT',
	'SUPERBE_COURONNE_ROYALE',
	'BRAS_MECANIQUE',
	'FEUILLES_DE_PELINAE',
	'BOLET_PHALISK_BLANC',
	'ORCHIDEE_FANTASQUE',
	'RACINE_DE_FIGONICIA',
	'SADIQUAE_MORDICUS',
	'FLAUREOLE',
	'SPORE_ETHERAL',
	'POUSSE_SOMBRE',
	'GRAINE_DE_DEVOREUSE'
] as const;

export type IngredientName = (typeof IngredientNames)[number];

export const ingredientList: Readonly<Record<Ingredient, IngredientFiche>> = {
	[Ingredient.MEROU_LUJIDANE]: {
		name: 'merou_lujidane',
		ingredientId: 1,
		price: 100,
		maxQuantity: 50
	},
	[Ingredient.POISSON_VENGEUR]: {
		name: 'poisson_vengeur',
		ingredientId: 2,
		price: 300,
		maxQuantity: 20
	},
	[Ingredient.AN_GUILI_GUILILLE]: {
		name: 'an_guili_guilille',
		ingredientId: 3,
		price: 1500,
		maxQuantity: 5
	},
	[Ingredient.GLOBULOS]: {
		name: 'globulos',
		ingredientId: 4,
		price: 1500,
		maxQuantity: 5
	},
	[Ingredient.SUPER_POISSON]: {
		name: 'super_poisson',
		ingredientId: 5,
		price: 1500,
		maxQuantity: 5
	},
	[Ingredient.TOUFFE_DE_FOURRURE]: {
		name: 'touffe_de_fourrure',
		ingredientId: 6,
		price: 350,
		maxQuantity: 50
	},
	[Ingredient.GRIFFES_ACEREES]: {
		name: 'griffes_acerees',
		ingredientId: 7,
		price: 750,
		maxQuantity: 20
	},
	[Ingredient.CORNE_EN_CHOCOLAT]: {
		name: 'corne_en_chocolat',
		ingredientId: 8,
		price: 1000,
		maxQuantity: 5
	},
	[Ingredient.OEIL_VISQUEUX]: {
		name: 'oeil_visqueux',
		ingredientId: 9,
		price: 1300,
		maxQuantity: 5
	},
	[Ingredient.LANGUE_MONSTRUEUSE]: {
		name: 'langue_monstrueuse',
		ingredientId: 10,
		price: 10000,
		maxQuantity: 5
	},
	[Ingredient.DENT_DE_DOROGON]: {
		name: 'dent_de_dorogon',
		ingredientId: 11,
		price: 12000,
		maxQuantity: 5
	},
	[Ingredient.ROCHE_RADIO_ACTIVE]: {
		name: 'roche_radio_active',
		ingredientId: 12,
		price: 500,
		maxQuantity: 20
	},
	[Ingredient.ENERGIE_FOUDRE]: {
		name: 'energie_foudre',
		ingredientId: 13,
		price: 300,
		maxQuantity: 50
	},
	[Ingredient.ENERGIE_AIR]: {
		name: 'energie_air',
		ingredientId: 14,
		price: 1000,
		maxQuantity: 20
	},
	[Ingredient.ENERGIE_EAU]: {
		name: 'energie_eau',
		ingredientId: 15,
		price: 4000,
		maxQuantity: 5
	},
	[Ingredient.ENERGIE_FEU]: {
		name: 'energie_feu',
		ingredientId: 16,
		price: 4000,
		maxQuantity: 5
	},
	[Ingredient.ENERGIE_BOIS]: {
		name: 'energie_bois',
		ingredientId: 17,
		price: 4000,
		maxQuantity: 5
	},
	[Ingredient.SILEX_TAILLE]: {
		name: 'silex_taille',
		ingredientId: 18,
		price: 150,
		maxQuantity: 50
	},
	[Ingredient.FRAGMENT_DE_TEXTE_ANCIEN]: {
		name: 'fragment_de_texte_ancien',
		ingredientId: 19,
		price: 1000,
		maxQuantity: 20
	},
	[Ingredient.VIEIL_ANNEAU_PRECIEUX]: {
		name: 'vieil_anneau_precieux',
		ingredientId: 20,
		price: 8000,
		maxQuantity: 5
	},
	[Ingredient.CALICE_CISELE]: {
		name: 'calice_cisele',
		ingredientId: 21,
		price: 8000,
		maxQuantity: 5
	},
	[Ingredient.COLLIER_KARAT]: {
		name: 'collier_karat',
		ingredientId: 22,
		price: 8000,
		maxQuantity: 5
	},
	[Ingredient.BROCHE_EN_PARFAIT_ETAT]: {
		name: 'broche_en_parfait_etat',
		ingredientId: 23,
		price: 30000,
		maxQuantity: 5
	},
	[Ingredient.SUPERBE_COURONNE_ROYALE]: {
		name: 'superbe_couronne_royale',
		ingredientId: 24,
		price: 40000,
		maxQuantity: 5
	},
	[Ingredient.BRAS_MECANIQUE]: {
		name: 'bras_mecanique',
		ingredientId: 25,
		price: 23000,
		maxQuantity: 5
	},
	[Ingredient.FEUILLES_DE_PELINAE]: {
		name: 'feuilles_de_pelinae',
		ingredientId: 26,
		price: 75,
		maxQuantity: 50
	},
	[Ingredient.BOLET_PHALISK_BLANC]: {
		name: 'bolet_phalisk_blanc',
		ingredientId: 27,
		price: 130,
		maxQuantity: 20
	},
	[Ingredient.ORCHIDEE_FANTASQUE]: {
		name: 'orchidee_fantasque',
		ingredientId: 28,
		price: 230,
		maxQuantity: 5
	},
	[Ingredient.RACINE_DE_FIGONICIA]: {
		name: 'racine_de_figonicia',
		ingredientId: 29,
		price: 230,
		maxQuantity: 5
	},
	[Ingredient.SADIQUAE_MORDICUS]: {
		name: 'sadiquae_mordicus',
		ingredientId: 30,
		price: 230,
		maxQuantity: 5
	},
	[Ingredient.FLAUREOLE]: {
		name: 'flaureole',
		ingredientId: 31,
		price: 500,
		maxQuantity: 5
	},
	[Ingredient.SPORE_ETHERAL]: {
		name: 'spore_etheral',
		ingredientId: 32,
		price: 150,
		maxQuantity: 20
	},
	[Ingredient.POUSSE_SOMBRE]: {
		name: 'pousse_sombre',
		ingredientId: 33,
		price: 300,
		maxQuantity: 20
	},
	[Ingredient.GRAINE_DE_DEVOREUSE]: {
		name: 'graine_de_devoreuse',
		ingredientId: 34,
		price: 15000,
		maxQuantity: 100
	}
};
