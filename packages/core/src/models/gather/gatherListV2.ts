import { Action } from '../dinoz/dinozActions.js';
import { GatherType } from '../enums/GatherType.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { Ingredient, ingredientList } from '../ingredients/ingredientList.js';
import { Item, itemList } from '../items/itemList.js';
import { placeListv2 } from '../place/placeListv2.js';
import { Skill, skillList } from '../skills/skillList.js';
import { GatherDataV2 } from './gatherDataV2.js';
import { GatherFound } from './gatherFound.js';

function ingredientKey(value: Ingredient): string {
	return ingredientList[value].name;
}

function itemKey(value: Item): string {
	return itemList[value].name;
}

function skillKey(value: Skill): string {
	return skillList[value].name;
}

function placeKey(value: PlaceEnum): string {
	const place = Object.values(placeListv2).find(entry => entry.placeId === value);
	if (!place) {
		throw new Error(`Unknown place for gather key mapping: ${String(value)}`);
	}
	return place.name;
}

function ingredients(values: Ingredient | Ingredient[], count: number, condition?: string): GatherFound {
	const list = Array.isArray(values) ? values : [values];

	return {
		reward: {
			kind: 'ingredient',
			keys: list.map(ingredientKey)
		},
		count,
		condition
	};
}

function items(values: Item | Item[], count: number, quantity = 1, condition?: string): GatherFound {
	const list = Array.isArray(values) ? values : [values];

	return {
		reward: {
			kind: 'item',
			keys: list.map(itemKey),
			quantity
		},
		count,
		condition
	};
}

function gold(amount: number, count: number, condition?: string): GatherFound {
	return {
		reward: {
			kind: 'gold',
			amount
		},
		count,
		condition
	};
}

export const gatherListV2: Record<GatherType, GatherDataV2> = {
	[GatherType.FISH]: {
		id: 'pe',
		action: Action.FISH,
		type: GatherType.FISH,
		size: 7,
		minimumClick: 2,
		apparence: 'FISH',
		label: 'Poissons',
		skill: skillKey(Skill.APPRENTI_PECHEUR),
		found: [
			ingredients(Ingredient.MEROU_LUJIDANE, 18),
			ingredients(Ingredient.POISSON_VENGEUR, 5, `skill(${skillKey(Skill.PECHEUR_CONFIRME)})`),
			ingredients(
				Ingredient.AN_GUILI_GUILILLE,
				1,
				`skill(${skillKey(Skill.MAITRE_PECHEUR)})+pos(${placeKey(PlaceEnum.PORT_DE_PRECHE)})`
			),
			ingredients(
				Ingredient.GLOBULOS,
				1,
				`skill(${skillKey(Skill.MAITRE_PECHEUR)})+pos(${placeKey(PlaceEnum.CHUTES_MUTANTES)})`
			),
			ingredients(
				Ingredient.SUPER_POISSON,
				1,
				`skill(${skillKey(Skill.MAITRE_PECHEUR)})+pos(${placeKey(PlaceEnum.FLEUVE_JUMIN)})`
			)
		]
	},

	[GatherType.CUEILLE1]: {
		id: 'cu',
		action: Action.CUEILLE,
		type: GatherType.CUEILLE1,
		size: 8,
		minimumClick: 3,
		apparence: 'CUEILLE',
		label: 'Plantes',
		skill: skillKey(Skill.CUEILLETTE),
		found: [
			ingredients(Ingredient.FEUILLES_DE_PELINAE, 28),
			ingredients(Ingredient.BOLET_PHALISK_BLANC, 11, `skill(${skillKey(Skill.OEIL_DE_LYNX)})`),
			ingredients(
				Ingredient.ORCHIDEE_FANTASQUE,
				3,
				`skill(${skillKey(Skill.OEIL_DE_LYNX)})+pos(${placeKey(PlaceEnum.FORGES_DU_GTC)})`
			),
			ingredients(
				Ingredient.RACINE_DE_FIGONICIA,
				3,
				`skill(${skillKey(Skill.OEIL_DE_LYNX)})+pos(${placeKey(PlaceEnum.CHEMIN_GLAUQUE)})`
			),
			ingredients(
				Ingredient.SADIQUAE_MORDICUS,
				3,
				`skill(${skillKey(Skill.OEIL_DE_LYNX)})+pos(${placeKey(PlaceEnum.MARAIS_COLLANT)})`
			)
		]
	},

	[GatherType.CUEILLE2]: {
		id: 'cu2',
		action: Action.CUEILLE,
		type: GatherType.CUEILLE2,
		size: 8,
		minimumClick: 3,
		apparence: 'CUEILLE',
		label: 'Plantes',
		skill: skillKey(Skill.CUEILLETTE),
		found: [
			ingredients(Ingredient.FEUILLES_DE_PELINAE, 20),
			ingredients(Ingredient.BOLET_PHALISK_BLANC, 5, `skill(${skillKey(Skill.OEIL_DE_LYNX)})`),
			ingredients(Ingredient.ORCHIDEE_FANTASQUE, 1, `skill(${skillKey(Skill.OEIL_DE_LYNX)})+random(4)`),
			ingredients(Ingredient.RACINE_DE_FIGONICIA, 1, `skill(${skillKey(Skill.OEIL_DE_LYNX)})+random(4)`),
			ingredients(Ingredient.SADIQUAE_MORDICUS, 1, `skill(${skillKey(Skill.OEIL_DE_LYNX)})+random(4)`),
			ingredients(
				Ingredient.FLAUREOLE,
				1,
				`skill(${skillKey(Skill.OEIL_DE_LYNX)})+pos(${placeKey(PlaceEnum.BOIS_GIVRES)})`
			)
		]
	},

	[GatherType.CUEILLE3]: {
		id: 'cu3',
		action: Action.CUEILLE,
		type: GatherType.CUEILLE3,
		size: 8,
		minimumClick: 3,
		apparence: 'CUEILLE',
		label: 'Plantes',
		skill: skillKey(Skill.CUEILLETTE),
		found: [
			ingredients(Ingredient.FEUILLES_DE_PELINAE, 5),
			ingredients(Ingredient.BOLET_PHALISK_BLANC, 5, `skill(${skillKey(Skill.OEIL_DE_LYNX)})`),
			ingredients(Ingredient.ORCHIDEE_FANTASQUE, 2, `skill(${skillKey(Skill.OEIL_DE_LYNX)})`),
			ingredients(Ingredient.SPORE_ETHERAL, 5, `skill(${skillKey(Skill.OEIL_DE_LYNX)})+random(4)`)
		]
	},

	[GatherType.CUEILLE4]: {
		id: 'cu4',
		action: Action.CUEILLE,
		type: GatherType.CUEILLE4,
		size: 8,
		minimumClick: 3,
		apparence: 'CUEILLE',
		label: 'Plantes',
		skill: skillKey(Skill.CUEILLETTE),
		found: [
			ingredients(Ingredient.FEUILLES_DE_PELINAE, 8),
			ingredients(Ingredient.BOLET_PHALISK_BLANC, 3),
			ingredients(
				[Ingredient.ORCHIDEE_FANTASQUE, Ingredient.SADIQUAE_MORDICUS],
				2,
				`skill(${skillKey(Skill.OEIL_DE_LYNX)})`
			),
			ingredients(
				Ingredient.POUSSE_SOMBRE,
				1,
				`skill(${skillKey(Skill.OEIL_DE_LYNX)})+pos(${placeKey(PlaceEnum.TOUR_SOMBRE)})`
			)
		]
	},

	[GatherType.ENERGY1]: {
		id: 'en',
		action: Action.ENERGY,
		type: GatherType.ENERGY1,
		size: 6,
		minimumClick: 1,
		apparence: 'ENERGY',
		label: 'Energies',
		skill: skillKey(Skill.PARATONNERRE),
		found: [
			ingredients(Ingredient.ENERGIE_FOUDRE, 6),
			ingredients(
				Ingredient.ENERGIE_AIR,
				3,
				`skill(${skillKey(Skill.FISSION_ELEMENTAIRE)})+pos(${placeKey(PlaceEnum.FORCEBRUT)})`
			),
			ingredients(
				Ingredient.ENERGIE_FEU,
				1,
				`skill(${skillKey(Skill.FISSION_ELEMENTAIRE)})+pos(${placeKey(PlaceEnum.PENTES_DE_BASALTE)})`
			),
			ingredients(
				Ingredient.ENERGIE_BOIS,
				1,
				`skill(${skillKey(Skill.FISSION_ELEMENTAIRE)})+pos(${placeKey(PlaceEnum.PORTE_DE_SYLVENOIRE)})`
			),
			ingredients(
				Ingredient.ENERGIE_EAU,
				1,
				`skill(${skillKey(Skill.FISSION_ELEMENTAIRE)})+pos(${placeKey(PlaceEnum.DOME_SOULAFLOTTE)})`
			)
		]
	},

	[GatherType.ENERGY2]: {
		id: 'en2',
		action: Action.ENERGY,
		type: GatherType.ENERGY2,
		size: 6,
		minimumClick: 1,
		apparence: 'ENERGY',
		label: 'Energies',
		skill: skillKey(Skill.PARATONNERRE),
		found: [
			ingredients(Ingredient.ENERGIE_FOUDRE, 1),
			ingredients(Ingredient.ENERGIE_AIR, 3, `skill(${skillKey(Skill.FISSION_ELEMENTAIRE)})`),
			ingredients(Ingredient.ENERGIE_FEU, 1, `skill(${skillKey(Skill.FISSION_ELEMENTAIRE)})+random(6)`),
			ingredients(Ingredient.ENERGIE_BOIS, 1, `skill(${skillKey(Skill.FISSION_ELEMENTAIRE)})+random(6)`),
			ingredients(Ingredient.ENERGIE_EAU, 1, `skill(${skillKey(Skill.FISSION_ELEMENTAIRE)})+random(6)`)
		]
	},

	[GatherType.HUNT]: {
		id: 'ch',
		action: Action.HUNT,
		type: GatherType.HUNT,
		size: 6,
		minimumClick: 1,
		apparence: 'HUNT',
		label: 'Trophées de chasse',
		skill: skillKey(Skill.CHASSEUR_DE_GOUPIGNON),
		found: [
			ingredients(Ingredient.TOUFFE_DE_FOURRURE, 7),
			ingredients(Ingredient.GRIFFES_ACEREES, 4, `skill(${skillKey(Skill.CHASSEUR_DE_GEANT)})`),
			ingredients(
				[Ingredient.CORNE_EN_CHOCOLAT, Ingredient.OEIL_VISQUEUX],
				1,
				`skill(${skillKey(Skill.CHASSEUR_DE_DRAGON)})`
			),
			ingredients(
				Ingredient.LANGUE_MONSTRUEUSE,
				1,
				`!pos(${placeKey(PlaceEnum.LAC_CELESTE)})+skill(${skillKey(Skill.CHASSEUR_DE_DRAGON)})+random(3)`
			),
			ingredients(
				[Ingredient.LANGUE_MONSTRUEUSE, Ingredient.DENT_DE_DOROGON],
				1,
				`pos(${placeKey(PlaceEnum.LAC_CELESTE)})+skill(${skillKey(Skill.CHASSEUR_DE_DRAGON)})+random(3)`
			),
			ingredients(
				Ingredient.ROCHE_RADIO_ACTIVE,
				1,
				`skill(${skillKey(Skill.CHASSEUR_DE_GEANT)})+pos(${placeKey(PlaceEnum.NOWHERE)})`
			)
		]
	},

	[GatherType.SEEK]: {
		id: 'fo',
		action: Action.SEEK,
		type: GatherType.SEEK,
		size: 10,
		minimumClick: 1,
		apparence: 'SEEK',
		label: 'Artefacts',
		skill: skillKey(Skill.FOUILLE),
		found: [
			ingredients(Ingredient.SILEX_TAILLE, 3),
			ingredients(Ingredient.FRAGMENT_DE_TEXTE_ANCIEN, 1, `skill(${skillKey(Skill.DETECTIVE)})`),
			ingredients(
				[Ingredient.VIEIL_ANNEAU_PRECIEUX, Ingredient.CALICE_CISELE, Ingredient.COLLIER_KARAT],
				2,
				`skill(${skillKey(Skill.ARCHEOLOGUE)})+random(5)`
			),
			ingredients(
				[Ingredient.BROCHE_EN_PARFAIT_ETAT, Ingredient.SUPERBE_COURONNE_ROYALE],
				1,
				`skill(${skillKey(Skill.ARCHEOLOGUE)})+random(15)+!pos(${placeKey(PlaceEnum.DINOVILLE)})`
			),
			ingredients(
				Ingredient.BRAS_MECANIQUE,
				1,
				`skill(${skillKey(Skill.ARCHEOLOGUE)})+random(10)+pos(${placeKey(PlaceEnum.TETE_DE_L_ILE)})`
			)
		]
	},

	[GatherType.ANNIV]: {
		id: 'anniv',
		action: Action.ANNIV,
		type: GatherType.ANNIV,
		size: 10,
		minimumClick: 3,
		apparence: 'ANNIV',
		label: 'Trésors fabuleux',
		object: itemKey(Item.CANDLE_CARD),
		condition: `pos(${placeKey(PlaceEnum.PORT_DE_PRECHE)})`,
		cost: {
			...itemList[Item.CANDLE_CARD],
			quantity: 1
		},
		found: [
			ingredients(Ingredient.MEROU_LUJIDANE, 16),
			ingredients(Ingredient.POISSON_VENGEUR, 5),
			ingredients(Ingredient.AN_GUILI_GUILILLE, 5),
			ingredients(Ingredient.GLOBULOS, 5),
			ingredients(Ingredient.SUPER_POISSON, 4),
			ingredients(Ingredient.SPORE_ETHERAL, 5),
			ingredients(Ingredient.ROCHE_RADIO_ACTIVE, 2),
			ingredients(Ingredient.GRAINE_DE_DEVOREUSE, 1),
			ingredients(Ingredient.SILEX_TAILLE, 10),
			ingredients(Ingredient.FRAGMENT_DE_TEXTE_ANCIEN, 3),
			ingredients(Ingredient.COLLIER_KARAT, 1),
			ingredients(Ingredient.ENERGIE_AIR, 4),
			ingredients(Ingredient.ENERGIE_EAU, 2),
			ingredients(Ingredient.ENERGIE_FOUDRE, 3),
			ingredients(Ingredient.ENERGIE_FEU, 4),
			ingredients(Ingredient.ENERGIE_BOIS, 2),
			gold(1000, 10),
			gold(2000, 8),
			gold(3000, 5),
			gold(20000, 2),
			items(Item.TICTAC_TICKET, 1),
			items(Item.SMOG_EGG_ANNIVERSARY, 2)
		]
	},

	[GatherType.XMAS]: {
		id: 'xmas',
		action: Action.XMAS,
		type: GatherType.XMAS,
		size: 10,
		minimumClick: 3,
		apparence: 'XMAS',
		label: 'Cadeaux de Noël',
		object: itemKey(Item.CHRISTMAS_TICKET),
		condition: `pos(${placeKey(PlaceEnum.DINOVILLE)})+(promo(xmas)|!config(xmas))`,
		cost: {
			...itemList[Item.CHRISTMAS_TICKET],
			quantity: 1
		},
		found: [
			ingredients(Ingredient.SILEX_TAILLE, 8),
			ingredients(Ingredient.FRAGMENT_DE_TEXTE_ANCIEN, 4),
			ingredients(Ingredient.CALICE_CISELE, 1),
			ingredients(Ingredient.COLLIER_KARAT, 1),
			ingredients(Ingredient.TOUFFE_DE_FOURRURE, 13),
			ingredients(Ingredient.FEUILLES_DE_PELINAE, 11),
			ingredients(Ingredient.BOLET_PHALISK_BLANC, 8),
			ingredients(Ingredient.RACINE_DE_FIGONICIA, 1),
			ingredients(Ingredient.FLAUREOLE, 1),
			ingredients(Ingredient.SPORE_ETHERAL, 1),
			ingredients(Ingredient.MEROU_LUJIDANE, 11),
			ingredients(Ingredient.POISSON_VENGEUR, 5),
			ingredients(Ingredient.GRIFFES_ACEREES, 5),
			ingredients(Ingredient.ENERGIE_EAU, 3),
			ingredients(Ingredient.ENERGIE_FEU, 2),
			ingredients(Ingredient.ENERGIE_BOIS, 4),
			ingredients(Ingredient.ENERGIE_AIR, 5),
			ingredients(Ingredient.ENERGIE_FOUDRE, 5),
			ingredients(Ingredient.GRAINE_DE_DEVOREUSE, 3),
			gold(3000, 6),
			items(Item.CHRISTMAS_EGG, 1),
			items(Item.SMOG_EGG_CHRISTMAS_BLUE, 1)
		]
	},

	[GatherType.TICTAC]: {
		id: 'papjar',
		action: Action.DIG,
		type: GatherType.TICTAC,
		size: 10,
		minimumClick: 3,
		apparence: 'TICTAC',
		label: 'Trésors',
		condition: 'false()',
		cost: {
			...itemList[Item.TICTAC_TICKET],
			quantity: 1
		},
		found: []
	},

	[GatherType.LABO]: {
		id: 'labo',
		action: Action.DIG,
		type: GatherType.LABO,
		size: 10,
		minimumClick: 3,
		apparence: 'LABO',
		label: 'Laboratoire',
		condition: 'false()',
		cost: {
			...itemList[Item.TICTAC_TICKET],
			quantity: 1
		},
		found: []
	},

	[GatherType.PARTY]: {
		id: 'party',
		action: Action.DIG,
		type: GatherType.PARTY,
		size: 10,
		minimumClick: 3,
		apparence: 'PARTY',
		label: 'Fête',
		condition: 'false()',
		cost: {
			...itemList[Item.TICTAC_TICKET],
			quantity: 1
		},
		found: []
	},

	[GatherType.DAILY]: {
		id: 'daily',
		action: Action.DAILY,
		type: GatherType.DAILY,
		size: 6,
		minimumClick: 1,
		apparence: 'DAILY',
		label: 'Ticket journalier',
		object: itemKey(Item.DAILY_TICKET),
		condition: `pos(${placeKey(PlaceEnum.UNIVERSITE)})`,
		cost: {
			...itemList[Item.DAILY_TICKET],
			quantity: 1
		},
		found: [gold(2500, 12), gold(5000, 8), gold(10000, 4), gold(20000, 2), gold(50000, 1), items(Item.BOX_HANDLER, 10)]
	}
};
