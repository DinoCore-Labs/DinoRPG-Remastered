import { GatherType } from '../enums/GatherType.js';
import { GroundEnum } from '../enums/GroundEnum.js';
import { MapZone } from '../enums/MapZone.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { definePlaces } from './definePlaces.js';
import { PlaceDefinitionInput } from './placeDefinition.js';

/** Sticky Swamp - No movement on Thursday and Saturday. */
export const SWAMP_FLOODED_DAYS = [4, 6];
/** Sticky Swamp - No fights on Wednesday and Sunday. */
export const SWAMP_FOG_DAYS = [0, 3];

export const placeListv2 = definePlaces({
	[PlaceEnum.ANYWHERE]: {
		placeId: PlaceEnum.ANYWHERE,
		name: 'anywhere',
		map: MapZone.ALL,
		moves: []
	},
	/* -------------------------------------------------
	 * DINOVILLE
	 * ------------------------------------------------- */

	[PlaceEnum.DINOVILLE]: {
		placeId: PlaceEnum.DINOVILLE,
		name: 'dnv',
		map: MapZone.DINOLAND,
		moves: [
			{ target: PlaceEnum.UNIVERSITE, condition: 'uvar(tuto,0)|!uvar(ptuto,186861)' },
			{ target: PlaceEnum.FOUTAINE_DE_JOUVENCE },
			{ target: PlaceEnum.GO_TO_DINOPLAZA, condition: 'fx(plaza)' }
		],
		gathers: [GatherType.SEEK, GatherType.XMAS],
		ground: GroundEnum.NONE,
		background: 's_dnv',
		top: 155,
		itinerant: true
	},

	[PlaceEnum.UNIVERSITE]: {
		placeId: PlaceEnum.UNIVERSITE,
		name: 'univ',
		map: MapZone.DINOLAND,
		moves: [{ target: PlaceEnum.DINOVILLE }, { target: PlaceEnum.PAPY_JOE }, { target: PlaceEnum.COLLINES_ESCARPEES }],
		gathers: [GatherType.CUEILLE1, GatherType.DAILY],
		ground: GroundEnum.NONE,
		background: 's_univ',
		itinerant: true
	},

	[PlaceEnum.FOUTAINE_DE_JOUVENCE]: {
		placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
		name: 'fountj',
		map: MapZone.DINOLAND,
		moves: [
			{ target: PlaceEnum.DINOVILLE, condition: 'uvar(tuto,0)|!uvar(ptuto,674288)' },
			{ target: PlaceEnum.PAPY_JOE, condition: 'uvar(tuto,0)|!uvar(ptuto,674288)' },
			{ target: PlaceEnum.FORCEBRUT, condition: 'uvar(tuto,0)|!uvar(ptuto,674288)' },
			{ target: PlaceEnum.PORT_DE_PRECHE }
		],
		gathers: [GatherType.CUEILLE1],
		ground: GroundEnum.NONE,
		background: 's_fountj',
		top: 170,
		itinerant: true
	},

	[PlaceEnum.PAPY_JOE]: {
		placeId: PlaceEnum.PAPY_JOE,
		name: 'papy',
		map: MapZone.DINOLAND,
		moves: [
			{ target: PlaceEnum.UNIVERSITE },
			{ target: PlaceEnum.FOUTAINE_DE_JOUVENCE },
			{ target: PlaceEnum.FORCEBRUT }
		],
		gathers: [GatherType.HUNT],
		ground: GroundEnum.DIRT,
		background: 's_papy',
		top: 165,
		itinerant: true
	},

	[PlaceEnum.FORCEBRUT]: {
		placeId: PlaceEnum.FORCEBRUT,
		name: 'frcbrt',
		map: MapZone.DINOLAND,
		moves: [
			{ target: PlaceEnum.PAPY_JOE },
			{ target: PlaceEnum.FOUTAINE_DE_JOUVENCE },
			{ target: PlaceEnum.PLACE_DU_MARCHE }
		],
		gathers: [GatherType.ENERGY1],
		ground: GroundEnum.DIRT,
		background: 's_frcbrt',
		top: 120,
		itinerant: true
	},

	[PlaceEnum.PLACE_DU_MARCHE]: {
		placeId: PlaceEnum.PLACE_DU_MARCHE,
		name: 'marche',
		map: MapZone.DINOLAND,
		moves: [{ target: PlaceEnum.FORCEBRUT }],
		ground: GroundEnum.DIRT,
		background: 'city2',
		top: 155,
		itinerant: true
	},

	[PlaceEnum.COLLINES_ESCARPEES]: {
		placeId: PlaceEnum.COLLINES_ESCARPEES,
		name: 'colesc',
		map: MapZone.DINOLAND,
		moves: [{ target: PlaceEnum.UNIVERSITE }, { target: PlaceEnum.GO_TO_GRAND_TOUT_CHAUD, condition: 'fx(matesc)' }],
		gathers: [GatherType.HUNT],
		ground: GroundEnum.DIRT,
		background: 's_colesc',
		top: 130,
		itinerant: true
	},

	[PlaceEnum.PORT_DE_PRECHE]: {
		placeId: PlaceEnum.PORT_DE_PRECHE,
		name: 'port',
		map: MapZone.DINOLAND,
		moves: [
			{ target: PlaceEnum.FOUTAINE_DE_JOUVENCE },
			{ target: PlaceEnum.GO_TO_ATLANTEINES_ISLAND, condition: 'fx(bouee)' },
			{ target: PlaceEnum.CIMETIERE, condition: '(life(10-)|fx(skull))+active(skull)' },
			{ target: PlaceEnum.GO_TO_MONSTER_ISLAND, condition: 'fx(monisl)' }
		],
		gathers: [GatherType.FISH, GatherType.ANNIV],
		ground: GroundEnum.DIRT,
		background: 's_port',
		top: 140,
		itinerant: true
	},

	[PlaceEnum.GO_TO_GRAND_TOUT_CHAUD]: {
		placeId: PlaceEnum.GO_TO_GRAND_TOUT_CHAUD,
		name: 'gogtc',
		map: MapZone.GTOUTCHAUD,
		moves: [],
		gotoPlaceId: PlaceEnum.PENTES_DE_BASALTE,
		background: 'bslt'
	},

	[PlaceEnum.GO_TO_ATLANTEINES_ISLAND]: {
		placeId: PlaceEnum.GO_TO_ATLANTEINES_ISLAND,
		name: 'goiles',
		map: MapZone.ILES,
		moves: [],
		gotoPlaceId: PlaceEnum.ILE_WAIKIKI,
		background: 's_ilewkk'
	},

	[PlaceEnum.CIMETIERE]: {
		placeId: PlaceEnum.CIMETIERE,
		name: 'skull',
		map: MapZone.DINOLAND,
		moves: [{ target: PlaceEnum.PORT_DE_PRECHE }],
		hide: true,
		ground: GroundEnum.DIRT,
		background: 's_graveyard',
		top: 110
	},

	[PlaceEnum.GO_TO_DINOPLAZA]: {
		placeId: PlaceEnum.GO_TO_DINOPLAZA,
		name: 'goplaz',
		map: MapZone.DINOWEST,
		moves: [],
		gotoPlaceId: PlaceEnum.DINOPLAZA,
		background: 'dw_plaza'
	},

	[PlaceEnum.GO_TO_MONSTER_ISLAND]: {
		placeId: PlaceEnum.GO_TO_MONSTER_ISLAND,
		name: 'gomisl',
		map: MapZone.ILEMONSTRE,
		moves: [],
		gotoPlaceId: PlaceEnum.PORT_MONSTRUEUX,
		background: 'go_swim'
	},

	/* -------------------------------------------------
	 * GRAND TOUT CHAUD
	 * ------------------------------------------------- */

	[PlaceEnum.PENTES_DE_BASALTE]: {
		placeId: PlaceEnum.PENTES_DE_BASALTE,
		name: 'bslt',
		map: MapZone.GTOUTCHAUD,
		moves: [{ target: PlaceEnum.GO_TO_COLLINES_ESCARPEES }, { target: PlaceEnum.FORGES_DU_GTC }],
		gathers: [GatherType.ENERGY1],
		ground: GroundEnum.NONE,
		background: 's_pentes',
		top: 130,
		itinerant: true
	},

	[PlaceEnum.FORGES_DU_GTC]: {
		placeId: PlaceEnum.FORGES_DU_GTC,
		name: 'forges',
		map: MapZone.GTOUTCHAUD,
		moves: [
			{ target: PlaceEnum.PENTES_DE_BASALTE },
			{ target: PlaceEnum.RUINES_ASHPOUK, difficulty: 2 },
			{ target: PlaceEnum.FOSSELAVE },
			{ target: PlaceEnum.REPAIRE_DU_VENERABLE, difficulty: 2 }
		],
		gathers: [GatherType.CUEILLE1],
		ground: GroundEnum.NONE,
		background: 's_forges',
		top: 110,
		itinerant: true
	},

	[PlaceEnum.RUINES_ASHPOUK]: {
		placeId: PlaceEnum.RUINES_ASHPOUK,
		name: 'rashpk',
		map: MapZone.GTOUTCHAUD,
		moves: [{ target: PlaceEnum.FORGES_DU_GTC }],
		gathers: [GatherType.SEEK],
		ground: GroundEnum.DIRT,
		background: 's_rashpk',
		top: 160,
		itinerant: true
	},

	[PlaceEnum.FOSSELAVE]: {
		placeId: PlaceEnum.FOSSELAVE,
		name: 'fosslv',
		map: MapZone.GTOUTCHAUD,
		moves: [{ target: PlaceEnum.FORGES_DU_GTC }, { target: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE }],
		gathers: [GatherType.SEEK],
		ground: GroundEnum.NONE,
		background: 's_fosslv',
		top: 110,
		itinerant: true
	},

	[PlaceEnum.REPAIRE_DU_VENERABLE]: {
		placeId: PlaceEnum.REPAIRE_DU_VENERABLE,
		name: 'vener',
		map: MapZone.GTOUTCHAUD,
		moves: [
			{ target: PlaceEnum.FORGES_DU_GTC },
			{ target: PlaceEnum.GO_TO_KARINBAO_TOWER, condition: 'scenario(nimba2,42+)' }
		],
		gathers: [GatherType.HUNT],
		ground: GroundEnum.NONE,
		background: 's_vener',
		top: 130,
		itinerant: true
	},

	[PlaceEnum.TUNNEL_SOUS_LA_BRANCHE]: {
		placeId: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
		name: 'tunel',
		map: MapZone.GTOUTCHAUD,
		moves: [
			{ target: PlaceEnum.FOSSELAVE },
			{ target: PlaceEnum.ETUNEL, condition: '!fx(lantrn)' },
			{ target: PlaceEnum.GO_TO_TUNNEL, condition: 'fx(lantrn)' }
		],
		ground: GroundEnum.DIRT,
		background: 's_tunel',
		top: 130,
		itinerant: true
	},

	[PlaceEnum.ETUNEL]: {
		placeId: PlaceEnum.ETUNEL,
		name: 'etunel',
		map: MapZone.GTOUTCHAUD,
		moves: [],
		gotoPlaceId: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
		background: 'gorges_fail'
	},

	[PlaceEnum.GO_TO_TUNNEL]: {
		placeId: PlaceEnum.GO_TO_TUNNEL,
		name: 'stunel',
		map: MapZone.GTOUTCHAUD,
		moves: [],
		gotoPlaceId: PlaceEnum.GORGES_PROFONDES,
		background: 'gorges'
	},

	[PlaceEnum.GORGES_PROFONDES]: {
		placeId: PlaceEnum.GORGES_PROFONDES,
		name: 'gorges',
		map: MapZone.GTOUTCHAUD,
		moves: [{ target: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE }, { target: PlaceEnum.GO_TO_CAMP_KORGON, difficulty: 2 }],
		ground: GroundEnum.WATER,
		background: 'cavern2',
		top: 110
	},

	[PlaceEnum.GO_TO_COLLINES_ESCARPEES]: {
		placeId: PlaceEnum.GO_TO_COLLINES_ESCARPEES,
		name: 'gocol',
		map: MapZone.DINOLAND,
		moves: [],
		gotoPlaceId: PlaceEnum.COLLINES_ESCARPEES,
		background: 'colesc'
	},

	[PlaceEnum.GO_TO_CAMP_KORGON]: {
		placeId: PlaceEnum.GO_TO_CAMP_KORGON,
		name: 'gocamp',
		map: MapZone.JUNGLE,
		moves: [],
		gotoPlaceId: PlaceEnum.CAMP_KORGON,
		background: 'camp'
	},

	[PlaceEnum.GO_TO_KARINBAO_TOWER]: {
		placeId: PlaceEnum.GO_TO_KARINBAO_TOWER,
		name: 'tourbt',
		map: MapZone.GTOUTCHAUD,
		moves: [
			{ target: PlaceEnum.REPAIRE_DU_VENERABLE, difficulty: 2 },
			{ target: PlaceEnum.GO_TO_CELESTIAL_ISLAND, condition: 'scenario(nimba2,43+)' }
		],
		hide: true,
		background: 'tourbt'
	},

	[PlaceEnum.GO_TO_CELESTIAL_ISLAND]: {
		placeId: PlaceEnum.GO_TO_CELESTIAL_ISLAND,
		name: 'toursk',
		map: MapZone.NIMBAO,
		moves: [{ target: PlaceEnum.GO_TO_KARINBAO_TOWER }],
		hide: true,
		gotoPlaceId: PlaceEnum.CHEMIN_OBSERVATOIRE,
		background: 'toursk'
	},

	/* -------------------------------------------------
	 * ILES ATLANTEINEES
	 * ------------------------------------------------- */

	[PlaceEnum.ILE_WAIKIKI]: {
		placeId: PlaceEnum.ILE_WAIKIKI,
		name: 'ilewkk',
		map: MapZone.ILES,
		moves: [
			{ target: PlaceEnum.GO_TO_PORT_DE_PRECHE },
			{ target: PlaceEnum.MARAIS_COLLANT },
			{ target: PlaceEnum.MINES_DE_CORAIL, condition: 'fx(bouee)' }
		],
		gathers: [GatherType.FISH],
		ground: GroundEnum.DIRT,
		background: 's_ilewkk',
		top: 110,
		itinerant: true
	},

	[PlaceEnum.MARAIS_COLLANT]: {
		placeId: PlaceEnum.MARAIS_COLLANT,
		name: 'marais',
		map: MapZone.ILES,
		moves: [
			{ target: PlaceEnum.ILE_WAIKIKI },
			{ target: PlaceEnum.MINES_DE_CORAIL, condition: 'fx(bouee)' },
			{ target: PlaceEnum.CHUTES_MUTANTES },
			{ target: PlaceEnum.ATELIER_BROC, condition: 'scenario(nimba2,38-)|scenario(nimba2,50+)' },
			{ target: PlaceEnum.CHBRO2, condition: 'scenario(nimba2,38+)+scenario(nimba2,49-)' }
		],
		gathers: [GatherType.CUEILLE1],
		ground: GroundEnum.WATER,
		background: 'swp_clear',
		top: 160,
		itinerant: true
	},
	[PlaceEnum.MAROK]: {
		placeId: PlaceEnum.MAROK,
		name: 'marok',
		map: MapZone.ILES,
		moves: [],
		gotoPlaceId: PlaceEnum.MARAIS_COLLANT,
		realPlaceId: PlaceEnum.MARAIS_COLLANT,
		background: 'swp_clear'
	},
	[PlaceEnum.MARFOG]: {
		placeId: PlaceEnum.MARFOG,
		name: 'marfog',
		map: MapZone.ALL,
		moves: [],
		gotoPlaceId: PlaceEnum.MARAIS_COLLANT,
		realPlaceId: PlaceEnum.MARAIS_COLLANT,
		background: 'swamp_fog'
	},

	[PlaceEnum.MARFLD]: {
		placeId: PlaceEnum.MARFLD,
		name: 'marfld',
		map: MapZone.ILES,
		moves: [],
		gotoPlaceId: PlaceEnum.MARAIS_COLLANT,
		realPlaceId: PlaceEnum.MARAIS_COLLANT,
		background: 'swamp_flood'
	},

	[PlaceEnum.MINES_DE_CORAIL]: {
		placeId: PlaceEnum.MINES_DE_CORAIL,
		name: 'corail',
		map: MapZone.ILES,
		moves: [
			{ target: PlaceEnum.ILE_WAIKIKI },
			{ target: PlaceEnum.MARAIS_COLLANT },
			{ target: PlaceEnum.ITLOST, condition: 'scenario(kabuki,19)' },
			{ target: PlaceEnum.ITOTEM, condition: 'collec(kaura)|scenario(kabuki,20)|curmission(leakjb)', difficulty: 3 },
			{ target: PlaceEnum.ICEISL, condition: 'scenario(smog,8+)+scenario(smog,14-)' },
			{ target: PlaceEnum.ICEIS2, condition: 'scenario(smog,14+)' }
		],
		gathers: [GatherType.SEEK],
		ground: GroundEnum.DIRT,
		background: 's_corail',
		top: 150,
		itinerant: true
	},

	[PlaceEnum.ITLOST]: {
		placeId: PlaceEnum.ITLOST,
		name: 'itlost',
		map: MapZone.ILES,
		moves: [],
		gotoPlaceId: PlaceEnum.MINES_DE_CORAIL
	},

	[PlaceEnum.BAO_BOB]: {
		placeId: PlaceEnum.BAO_BOB,
		name: 'baobob',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.CHUTES_MUTANTES }],
		gathers: [GatherType.HUNT],
		ground: GroundEnum.DIRT,
		background: 's_baobob',
		top: 130,
		itinerant: true
	},

	[PlaceEnum.CHUTES_MUTANTES]: {
		placeId: PlaceEnum.CHUTES_MUTANTES,
		name: 'chutes',
		map: MapZone.ILES,
		moves: [
			{ target: PlaceEnum.GO_TO_DOME_SOULAFLOTTE, condition: 'fx(rasca)', difficulty: 2 },
			{ target: PlaceEnum.BAO_BOB, condition: 'fx(bouee)' },
			{ target: PlaceEnum.MARAIS_COLLANT },
			{ target: PlaceEnum.GO_TO_FOREST, condition: 'fx(chutes)' },
			{ target: PlaceEnum.GOSOMB, condition: 'fx(morsso)' }
		],
		gathers: [GatherType.FISH],
		ground: GroundEnum.DIRT,
		background: 's_chutes',
		top: 110,
		itinerant: true
	},

	[PlaceEnum.GO_TO_DOME_SOULAFLOTTE]: {
		placeId: PlaceEnum.GO_TO_DOME_SOULAFLOTTE,
		name: 'rasca',
		map: MapZone.ILES,
		moves: [],
		gotoPlaceId: PlaceEnum.DOME_SOULAFLOTTE,
		background: 's_dome'
	},

	[PlaceEnum.DOME_SOULAFLOTTE]: {
		placeId: PlaceEnum.DOME_SOULAFLOTTE,
		name: 'dome',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.CHUTES_MUTANTES }],
		gathers: [GatherType.ENERGY1],
		ground: GroundEnum.NONE,
		background: 's_dome',
		top: 110
	},

	[PlaceEnum.ITOTEM]: {
		placeId: PlaceEnum.ITOTEM,
		name: 'itotem',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.MINES_DE_CORAIL }]
	},

	[PlaceEnum.GO_TO_PORT_DE_PRECHE]: {
		placeId: PlaceEnum.GO_TO_PORT_DE_PRECHE,
		name: 'goport',
		map: MapZone.DINOLAND,
		moves: [],
		gotoPlaceId: PlaceEnum.PORT_DE_PRECHE,
		background: 's_port'
	},

	[PlaceEnum.GO_TO_FOREST]: {
		placeId: PlaceEnum.GO_TO_FOREST,
		name: 'gogrum',
		map: MapZone.JUNGLE,
		moves: [],
		gotoPlaceId: PlaceEnum.AUREE_DE_LA_FORET,
		background: 'go_auree'
	},

	[PlaceEnum.GOSOMB]: {
		placeId: PlaceEnum.GOSOMB,
		name: 'gosomb',
		map: MapZone.DARKWORLD,
		moves: [],
		gotoPlaceId: PlaceEnum.GOUFFRE,
		background: 'dk_baobob'
	},

	[PlaceEnum.ATELIER_BROC]: {
		placeId: PlaceEnum.ATELIER_BROC,
		name: 'chbroc',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.MARAIS_COLLANT }],
		hide: true,
		ground: GroundEnum.DIRT,
		background: 'atelier'
	},

	[PlaceEnum.CHBRO2]: {
		placeId: PlaceEnum.CHBRO2,
		name: 'chbro2',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.MARAIS_COLLANT }],
		hide: true,
		ground: GroundEnum.DIRT,
		background: 'atelier2'
	},

	[PlaceEnum.ICEISL]: {
		placeId: PlaceEnum.ICEISL,
		name: 'iceisl',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.MINES_DE_CORAIL }, { target: PlaceEnum.LABO, condition: 'scenario(smog,14)' }],
		hide: true
	},

	[PlaceEnum.ICEIS2]: {
		placeId: PlaceEnum.ICEIS2,
		name: 'iceis2',
		map: MapZone.ILES,
		moves: [
			{ target: PlaceEnum.MINES_DE_CORAIL },
			{ target: PlaceEnum.LABO, condition: 'scenario(smog,14+)+scenario(smog,17-)' },
			{ target: PlaceEnum.LABO2, condition: 'scenario(smog,19+)' }
		],
		hide: true
	},

	[PlaceEnum.LABO]: {
		placeId: PlaceEnum.LABO,
		name: 'labo',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.ICEIS2 }],
		hide: true
	},

	[PlaceEnum.LABO2]: {
		placeId: PlaceEnum.LABO2,
		name: 'labo2',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.ICEIS2 }],
		hide: true
	},

	[PlaceEnum.LABO3]: {
		placeId: PlaceEnum.LABO3,
		name: 'labo3',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.LABO2, condition: '!hasobject(pile)' }],
		hide: true
	},

	/* -------------------------------------------------
	 * FORET DE GRUMHEL
	 * ------------------------------------------------- */

	[PlaceEnum.AUREE_DE_LA_FORET]: {
		placeId: PlaceEnum.AUREE_DE_LA_FORET,
		name: 'auree',
		map: MapZone.JUNGLE,
		moves: [{ target: PlaceEnum.GO_TO_CHUTES }, { target: PlaceEnum.CHEMIN_GLAUQUE }],
		gathers: [GatherType.CUEILLE1],
		ground: GroundEnum.DIRT,
		background: 's_auree',
		top: 120
	},

	[PlaceEnum.CHEMIN_GLAUQUE]: {
		placeId: PlaceEnum.CHEMIN_GLAUQUE,
		name: 'chemin',
		map: MapZone.JUNGLE,
		moves: [
			{ target: PlaceEnum.AUREE_DE_LA_FORET },
			{ target: PlaceEnum.COLLINES_HANTEES, difficulty: 3 },
			{ target: PlaceEnum.FLEUVE_JUMIN }
		],
		gathers: [GatherType.CUEILLE1],
		ground: GroundEnum.DIRT,
		background: 's_chemin',
		top: 175
	},

	[PlaceEnum.COLLINES_HANTEES]: {
		placeId: PlaceEnum.COLLINES_HANTEES,
		name: 'collin',
		map: MapZone.JUNGLE,
		moves: [{ target: PlaceEnum.FLEUVE_JUMIN }, { target: PlaceEnum.CHEMIN_GLAUQUE }],
		gathers: [GatherType.SEEK],
		ground: GroundEnum.DIRT,
		background: 's_collin',
		top: 175
	},

	[PlaceEnum.FLEUVE_JUMIN]: {
		placeId: PlaceEnum.FLEUVE_JUMIN,
		name: 'fleuve',
		map: MapZone.JUNGLE,
		moves: [
			{ target: PlaceEnum.CAMP_KORGON, condition: 'fx(palmes)' },
			{ target: PlaceEnum.JUNGLE_SAUVAGE, condition: 'fx(palmes)' },
			{ target: PlaceEnum.COLLINES_HANTEES, difficulty: 3 },
			{ target: PlaceEnum.CHEMIN_GLAUQUE }
		],
		gathers: [GatherType.FISH],
		ground: GroundEnum.NONE,
		background: 's_fleuve',
		top: 140
	},

	[PlaceEnum.CAMP_KORGON]: {
		placeId: PlaceEnum.CAMP_KORGON,
		name: 'camp',
		map: MapZone.JUNGLE,
		moves: [{ target: PlaceEnum.GO_TO_GORGES_PROFONDES }, { target: PlaceEnum.FLEUVE_JUMIN, condition: 'fx(palmes)' }],
		gathers: [GatherType.HUNT],
		ground: GroundEnum.ROCK,
		background: 's_camp',
		top: 150
	},

	[PlaceEnum.JUNGLE_SAUVAGE]: {
		placeId: PlaceEnum.JUNGLE_SAUVAGE,
		name: 'jungle',
		map: MapZone.JUNGLE,
		moves: [{ target: PlaceEnum.FLEUVE_JUMIN }, { target: PlaceEnum.PORTE_DE_SYLVENOIRE, difficulty: 2 }],
		gathers: [GatherType.HUNT],
		ground: GroundEnum.NONE,
		background: 's_jungle',
		top: 120
	},

	[PlaceEnum.PORTE_DE_SYLVENOIRE]: {
		placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
		name: 'garde',
		map: MapZone.JUNGLE,
		moves: [
			{ target: PlaceEnum.JUNGLE_SAUVAGE, difficulty: 2 },
			{ target: PlaceEnum.GO_TO_STEPPES, condition: 'fx(sylkey)' }
		],
		gathers: [GatherType.ENERGY1],
		ground: GroundEnum.DIRT,
		background: 's_garde',
		top: 120
	},

	[PlaceEnum.GO_TO_CHUTES]: {
		placeId: PlaceEnum.GO_TO_CHUTES,
		name: 'gochut',
		map: MapZone.ILES,
		moves: [],
		gotoPlaceId: PlaceEnum.CHUTES_MUTANTES,
		background: 'go_swim'
	},

	[PlaceEnum.GO_TO_GORGES_PROFONDES]: {
		placeId: PlaceEnum.GO_TO_GORGES_PROFONDES,
		name: 'gogorg',
		map: MapZone.GTOUTCHAUD,
		moves: [],
		gotoPlaceId: PlaceEnum.GORGES_PROFONDES,
		background: 'gorges'
	},

	[PlaceEnum.GO_TO_STEPPES]: {
		placeId: PlaceEnum.GO_TO_STEPPES,
		name: 'gostep',
		map: MapZone.STEPPE,
		moves: [],
		gotoPlaceId: PlaceEnum.FRONTIERE_CREPITANTE,
		background: 'st_enter'
	},

	/* -------------------------------------------------
	 * MONDE SOMBRE
	 * ------------------------------------------------- */

	[PlaceEnum.PORTAIL]: {
		placeId: PlaceEnum.PORTAIL,
		name: 'dkbao',
		map: MapZone.DARKWORLD,
		moves: [
			{ target: PlaceEnum.GOUFFRE },
			{ target: PlaceEnum.DARK_FAKE_2, condition: 'curmission(roid)|mission(roid)' }
		],
		background: 'dk_baobob'
	},

	[PlaceEnum.GOUFFRE]: {
		placeId: PlaceEnum.GOUFFRE,
		name: 'dkchut',
		map: MapZone.DARKWORLD,
		moves: [
			{ target: PlaceEnum.PORTAIL },
			{ target: PlaceEnum.TOUR_SOMBRE },
			{ target: PlaceEnum.RETOUR_SURFACE, condition: 'active(gulom)' },
			{ target: PlaceEnum.DARK_FAKE, condition: 'curmission(ouestu)|curmission(lumi)|curmission(truci2)|fx(morsso)' }
		],
		background: 'dk_chutes'
	},

	[PlaceEnum.TOUR_SOMBRE]: {
		placeId: PlaceEnum.TOUR_SOMBRE,
		name: 'dktow',
		map: MapZone.DARKWORLD,
		moves: [
			{ target: PlaceEnum.GOUFFRE },
			{ target: PlaceEnum.TOUR_SOMBRE_ENTREE, condition: '!curmission(monte)|!curmission(roif)|!scenario(smog,15)' },
			{
				target: PlaceEnum.TOUR_SOMBRE_1,
				condition: 'curmission(monte)|curmission(roif)|scenario(smog,15)|scenario(smog,16)'
			}
		],
		background: 'dk_tower'
	},

	[PlaceEnum.TOUR_SOMBRE_1]: {
		placeId: PlaceEnum.TOUR_SOMBRE_1,
		name: 'dktow2',
		map: MapZone.DARKWORLD,
		moves: [{ target: PlaceEnum.TOUR_SOMBRE }, { target: PlaceEnum.TOUR_SOMBRE_2 }],
		hide: true,
		background: 'dk_toweret'
	},

	[PlaceEnum.TOUR_SOMBRE_2]: {
		placeId: PlaceEnum.TOUR_SOMBRE_2,
		name: 'dktow3',
		map: MapZone.DARKWORLD,
		moves: [{ target: PlaceEnum.TOUR_SOMBRE_1 }, { target: PlaceEnum.TOUR_SOMBRE_DONJON_1 }],
		hide: true,
		background: 'dk_toweret'
	},

	[PlaceEnum.TOUR_SOMBRE_DONJON_1]: {
		placeId: PlaceEnum.TOUR_SOMBRE_DONJON_1,
		name: 'dktow4',
		map: MapZone.DARKWORLD,
		moves: [
			{ target: PlaceEnum.TOUR_SOMBRE_2 },
			{ target: PlaceEnum.TOUR_SOMBRE_DONJON_2 },
			{ target: PlaceEnum.TOUR_SOMBRE_DONJON_3 }
		],
		hide: true,
		background: 'dk_towerIn'
	},

	[PlaceEnum.TOUR_SOMBRE_DONJON_2]: {
		placeId: PlaceEnum.TOUR_SOMBRE_DONJON_2,
		name: 'dktowa',
		map: MapZone.DARKWORLD,
		moves: [{ target: PlaceEnum.TOUR_SOMBRE_DONJON_1 }, { target: PlaceEnum.TOUR_SOMBRE_DONJON_LAST }],
		hide: true,
		background: 'dk_towerIn'
	},

	[PlaceEnum.TOUR_SOMBRE_DONJON_3]: {
		placeId: PlaceEnum.TOUR_SOMBRE_DONJON_3,
		name: 'dktowb',
		map: MapZone.DARKWORLD,
		moves: [{ target: PlaceEnum.TOUR_SOMBRE_DONJON_1 }, { target: PlaceEnum.TOUR_SOMBRE_DONJON_LAST }],
		hide: true,
		background: 'dk_towerIn'
	},

	[PlaceEnum.TOUR_SOMBRE_DONJON_LAST]: {
		placeId: PlaceEnum.TOUR_SOMBRE_DONJON_LAST,
		name: 'dktows',
		map: MapZone.DARKWORLD,
		moves: [{ target: PlaceEnum.TOUR_SOMBRE_DONJON_2 }, { target: PlaceEnum.TOUR_SOMBRE_DONJON_3 }],
		hide: true,
		background: 'dk_towerIn'
	},

	[PlaceEnum.DARK_FAKE]: {
		placeId: PlaceEnum.DARK_FAKE,
		name: 'fake',
		map: MapZone.DARKWORLD,
		moves: [{ target: PlaceEnum.GOUFFRE }],
		background: 'dk_damne'
	},

	[PlaceEnum.DARK_FAKE_2]: {
		placeId: PlaceEnum.DARK_FAKE_2,
		name: 'fake2',
		map: MapZone.DARKWORLD,
		moves: [{ target: PlaceEnum.PORTAIL }],
		background: 'dk_damne'
	},

	[PlaceEnum.TOUR_SOMBRE_ENTREE]: {
		placeId: PlaceEnum.TOUR_SOMBRE_ENTREE,
		name: 'gotow',
		map: MapZone.DARKWORLD,
		moves: [],
		gotoPlaceId: PlaceEnum.TOUR_SOMBRE,
		background: 'dk_towerIn'
	},

	[PlaceEnum.RETOUR_SURFACE]: {
		placeId: PlaceEnum.RETOUR_SURFACE,
		name: 'rechut',
		map: MapZone.ILES,
		moves: [{ target: PlaceEnum.CHUTES_MUTANTES, condition: 'fx(morsso)' }],
		gotoPlaceId: PlaceEnum.CHUTES_MUTANTES,
		background: 'go_swim'
	},

	/* -------------------------------------------------
	 * STEPPES MAGNETIQUES
	 * ------------------------------------------------- */

	[PlaceEnum.GO_TO_SYLVENOIRE_DOOR]: {
		placeId: PlaceEnum.GO_TO_SYLVENOIRE_DOOR,
		name: 'gosylv',
		map: MapZone.JUNGLE,
		moves: [],
		gotoPlaceId: PlaceEnum.PORTE_DE_SYLVENOIRE,
		background: 'garde'
	},

	[PlaceEnum.FRONTIERE_CREPITANTE]: {
		placeId: PlaceEnum.FRONTIERE_CREPITANTE,
		name: 'senter',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.CROISEE_DES_NOMADES, difficulty: 2 },
			{ target: PlaceEnum.AVANT_POSTE_ROCKY },
			{ target: PlaceEnum.GO_TO_SYLVENOIRE_DOOR }
		],
		gathers: [GatherType.CUEILLE1],
		background: 'st_enter'
	},

	[PlaceEnum.CROISEE_DES_NOMADES]: {
		placeId: PlaceEnum.CROISEE_DES_NOMADES,
		name: 'scross',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.FRONTIERE_CREPITANTE, difficulty: 2 },
			{ target: PlaceEnum.CITADELLE_DU_ROI, difficulty: 2 },
			{ target: PlaceEnum.SENTIER_DE_TOUTEMBA, difficulty: 2 }
		],
		background: 'st_cross'
	},

	[PlaceEnum.AVANT_POSTE_ROCKY]: {
		placeId: PlaceEnum.AVANT_POSTE_ROCKY,
		name: 'svillg',
		map: MapZone.STEPPE,
		moves: [{ target: PlaceEnum.FRONTIERE_CREPITANTE }, { target: PlaceEnum.CITADELLE_DU_ROI }],
		gathers: [GatherType.HUNT],
		background: 'st_todo'
	},

	[PlaceEnum.CITADELLE_DU_ROI]: {
		placeId: PlaceEnum.CITADELLE_DU_ROI,
		name: 'sking',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.CROISEE_DES_NOMADES, difficulty: 2 },
			{ target: PlaceEnum.DEVOREUSE_DE_L_EST },
			{ target: PlaceEnum.AVANT_POSTE_ROCKY },
			{ target: PlaceEnum.PYLONES_DE_MAGNETITES }
		],
		gathers: [GatherType.SEEK],
		background: 'st_king'
	},

	[PlaceEnum.PYLONES_DE_MAGNETITES]: {
		placeId: PlaceEnum.PYLONES_DE_MAGNETITES,
		name: 'spylon',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.CITADELLE_DU_ROI },
			{ target: PlaceEnum.SYPHON_SIFFLEUR },
			{ target: PlaceEnum.DEVOREUSE_DU_NORD }
		],
		gathers: [GatherType.ENERGY1],
		background: 'st_pylon'
	},

	[PlaceEnum.SYPHON_SIFFLEUR]: {
		placeId: PlaceEnum.SYPHON_SIFFLEUR,
		name: 'slake',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.PYLONES_DE_MAGNETITES },
			{ target: PlaceEnum.SENTIER_DE_TOUTEMBA },
			{ target: PlaceEnum.DEVOREUSE_DE_L_OUEST },
			{ target: PlaceEnum.TAUDIS_DES_ZAXA, condition: 'scenario(magnet,2+)', difficulty: 2 },
			{ target: PlaceEnum.APPROCHER_SYPHON, condition: '!collec(magnet)' },
			{ target: PlaceEnum.APPROCHER_SYPHON2, condition: 'collec(magnet)' }
		],
		gathers: [GatherType.FISH],
		background: 'st_syphon'
	},

	[PlaceEnum.SENTIER_DE_TOUTEMBA]: {
		placeId: PlaceEnum.SENTIER_DE_TOUTEMBA,
		name: 'scanyo',
		map: MapZone.STEPPE,
		moves: [{ target: PlaceEnum.CROISEE_DES_NOMADES, difficulty: 2 }, { target: PlaceEnum.SYPHON_SIFFLEUR }],
		gathers: [GatherType.ENERGY1],
		background: 'st_canyon'
	},

	[PlaceEnum.DEVOREUSE_DE_L_EST]: {
		placeId: PlaceEnum.DEVOREUSE_DE_L_EST,
		name: 'stowr1',
		map: MapZone.STEPPE,
		moves: [{ target: PlaceEnum.CITADELLE_DU_ROI }],
		background: 'st_devor'
	},

	[PlaceEnum.DEVOREUSE_DU_NORD]: {
		placeId: PlaceEnum.DEVOREUSE_DU_NORD,
		name: 'stowr2',
		map: MapZone.STEPPE,
		moves: [{ target: PlaceEnum.PYLONES_DE_MAGNETITES }],
		background: 'st_devor'
	},

	[PlaceEnum.DEVOREUSE_DE_L_OUEST]: {
		placeId: PlaceEnum.DEVOREUSE_DE_L_OUEST,
		name: 'stowr3',
		map: MapZone.STEPPE,
		moves: [{ target: PlaceEnum.SYPHON_SIFFLEUR }],
		background: 'st_devor'
	},

	[PlaceEnum.TAUDIS_DES_ZAXA]: {
		placeId: PlaceEnum.TAUDIS_DES_ZAXA,
		name: 'sband1',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.SYPHON_SIFFLEUR, difficulty: 2 },
			{ target: PlaceEnum.CAMP_DES_EMMEMMA },
			{ target: PlaceEnum.CAMPEMENT_DES_MATTMUT, difficulty: 3 }
		],
		background: 'st_camp'
	},

	[PlaceEnum.CAMP_DES_EMMEMMA]: {
		placeId: PlaceEnum.CAMP_DES_EMMEMMA,
		name: 'sband2',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.CAMPEMENT_DES_MATTMUT },
			{ target: PlaceEnum.TAUDIS_DES_ZAXA },
			{ target: PlaceEnum.PORTES_DE_CAUSHEMESH, condition: 'active(caush)+scenario(caush,6+)+clanact(pompe)' }
		],
		background: 'st_camp'
	},

	[PlaceEnum.CAMPEMENT_DES_MATTMUT]: {
		placeId: PlaceEnum.CAMPEMENT_DES_MATTMUT,
		name: 'sband3',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.TAUDIS_DES_ZAXA, difficulty: 3 },
			{ target: PlaceEnum.CAMP_DES_EMMEMMA },
			{ target: PlaceEnum.REPAIRE_DE_LA_TEAM_W, condition: 'scenario(magnet,5+)' }
		],
		background: 'st_camp'
	},

	[PlaceEnum.REPAIRE_DE_LA_TEAM_W]: {
		placeId: PlaceEnum.REPAIRE_DE_LA_TEAM_W,
		name: 'scampw',
		map: MapZone.STEPPE,
		moves: [{ target: PlaceEnum.CAMPEMENT_DES_MATTMUT }],
		gathers: [GatherType.SEEK],
		background: 'st_campw'
	},

	[PlaceEnum.APPROCHER_SYPHON]: {
		placeId: PlaceEnum.APPROCHER_SYPHON,
		name: 'sinto1',
		map: MapZone.STEPPE,
		moves: [],
		gotoPlaceId: PlaceEnum.SYPHON_SIFFLEUR,
		background: 'st_syphon'
	},

	[PlaceEnum.APPROCHER_SYPHON2]: {
		placeId: PlaceEnum.APPROCHER_SYPHON2,
		name: 'sinto2',
		map: MapZone.STEPPE,
		moves: [],
		gotoPlaceId: PlaceEnum.CONFINS_DES_STEPPES,
		background: 'st_syphon'
	},

	[PlaceEnum.CONFINS_DES_STEPPES]: {
		placeId: PlaceEnum.CONFINS_DES_STEPPES,
		name: 'scaush',
		map: MapZone.STEPPE,
		moves: [
			{ target: PlaceEnum.SYPHON_SIFFLEUR, condition: 'collec(magnet)' },
			{ target: PlaceEnum.PORTES_DE_CAUSHEMESH, condition: 'active(caush)+scenario(caush,6+)+clanact(pompe)' }
		],
		gathers: [GatherType.CUEILLE1],
		background: 'st_caush'
	},

	[PlaceEnum.PORTES_DE_CAUSHEMESH]: {
		placeId: PlaceEnum.PORTES_DE_CAUSHEMESH,
		name: 'sporte',
		map: MapZone.STEPPE,
		activeKey: 'caush',
		moves: [
			{ target: PlaceEnum.GOTOCA, condition: 'scenario(caush,17+)' },
			{ target: PlaceEnum.CAMP_DES_EMMEMMA },
			{ target: PlaceEnum.CONFINS_DES_STEPPES }
		],
		gathers: [GatherType.SEEK],
		background: 'sporte'
	},

	[PlaceEnum.GOTOCA]: {
		placeId: PlaceEnum.GOTOCA,
		name: 'gotoca',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [],
		gotoPlaceId: PlaceEnum.CPORTE,
		background: 'cporte'
	},

	/* -------------------------------------------------
	 * DINOVILLE OUEST
	 * ------------------------------------------------- */

	[PlaceEnum.DINOPLAZA]: {
		placeId: PlaceEnum.DINOPLAZA,
		name: 'dplaza',
		map: MapZone.DINOWEST,
		moves: [
			{ target: PlaceEnum.GO_TO_DINOVILLE },
			{ target: PlaceEnum.CINEMA_PARADINO, condition: 'active(cinema)' },
			{ target: PlaceEnum.CLINIQUE, condition: 'scenario(clinik,5+)' },
			{ target: PlaceEnum.VILLA, condition: 'scenario(nimbao,3+)' }
		],
		ground: GroundEnum.DIRT,
		background: 'dw_plaza',
		top: 110
	},

	[PlaceEnum.VILLA]: {
		placeId: PlaceEnum.VILLA,
		name: 'villa',
		map: MapZone.DINOWEST,
		moves: [
			{ target: PlaceEnum.CINEMA_PARADINO, condition: 'active(cinema)+!scenario(nimbao,4)' },
			{ target: PlaceEnum.DINOPLAZA, condition: '!scenario(nimbao,4)' }
		],
		ground: GroundEnum.NONE,
		background: 'villa',
		top: 110
	},

	[PlaceEnum.CINEMA_PARADINO]: {
		placeId: PlaceEnum.CINEMA_PARADINO,
		name: 'dcine',
		map: MapZone.DINOWEST,
		moves: [
			{ target: PlaceEnum.DINOPLAZA },
			{ target: PlaceEnum.CLINIQUE, condition: 'scenario(clinik,5+)' },
			{ target: PlaceEnum.VILLA, condition: 'scenario(nimbao,3+)' },
			{ target: PlaceEnum.POSTE_DE_GARDE, condition: 'scenario(king,1+)' }
		],
		ground: GroundEnum.NONE,
		background: 'dw_cine',
		top: 110
	},

	[PlaceEnum.CLINIQUE]: {
		placeId: PlaceEnum.CLINIQUE,
		name: 'clinik',
		map: MapZone.DINOWEST,
		moves: [{ target: PlaceEnum.DINOPLAZA }, { target: PlaceEnum.CINEMA_PARADINO, condition: 'active(cinema)' }],
		ground: GroundEnum.NONE,
		background: 'dw_clini1',
		top: 110
	},

	[PlaceEnum.CLINI2]: {
		placeId: PlaceEnum.CLINI2,
		name: 'clini2',
		map: MapZone.DINOWEST,
		moves: [],
		gotoPlaceId: PlaceEnum.CLINIQUE,
		realPlaceId: PlaceEnum.CLINIQUE,
		background: 'dw_clini2'
	},

	[PlaceEnum.GO_TO_DINOVILLE]: {
		placeId: PlaceEnum.GO_TO_DINOVILLE,
		name: 'godnv',
		map: MapZone.DINOLAND,
		moves: [],
		gotoPlaceId: PlaceEnum.DINOVILLE,
		background: 'dnv'
	},

	[PlaceEnum.POSTE_DE_GARDE]: {
		placeId: PlaceEnum.POSTE_DE_GARDE,
		name: 'poste',
		map: MapZone.DINOWEST,
		moves: [
			{ target: PlaceEnum.CINEMA_PARADINO },
			{ target: PlaceEnum.CHATEAU_DE_DINOVILLE, condition: 'scenario(king,6+)' },
			{ target: PlaceEnum.GO_TO_VOIE_TEMPLE_CELESTE, condition: 'scenario(fmedal,13+)' }
		],
		ground: GroundEnum.DIRT,
		background: 'dw_chato',
		top: 130
	},

	[PlaceEnum.CHATEAU_DE_DINOVILLE]: {
		placeId: PlaceEnum.CHATEAU_DE_DINOVILLE,
		name: 'chato',
		map: MapZone.DINOWEST,
		moves: [{ target: PlaceEnum.POSTE_DE_GARDE }],
		ground: GroundEnum.DIRT,
		background: 'dw_trone',
		top: 140
	},

	[PlaceEnum.GO_TO_VOIE_TEMPLE_CELESTE]: {
		placeId: PlaceEnum.GO_TO_VOIE_TEMPLE_CELESTE,
		name: 'portal',
		map: MapZone.DINOWEST,
		condition: 'scenario(fmedal,13+)',
		moves: [{ target: PlaceEnum.POSTE_DE_GARDE }],
		hide: true,
		background: 'dw_portal'
	},

	/* -------------------------------------------------
	 * ILE DES MONSTRES
	 * ------------------------------------------------- */

	[PlaceEnum.PORT_MONSTRUEUX]: {
		placeId: PlaceEnum.PORT_MONSTRUEUX,
		name: 'mport',
		map: MapZone.ILEMONSTRE,
		moves: [
			{ target: PlaceEnum.GO_TO_PORT_DE_PRECHE_THROUGHT_MONSTER_ISLAND },
			{ target: PlaceEnum.AVANT_POSTE_FRUTOX, condition: 'dungeon(mbegin)' },
			{ target: PlaceEnum.AVANT_POSTE_VEGETOX }
		],
		background: 'm_port'
	},

	[PlaceEnum.AVANT_POSTE_FRUTOX]: {
		placeId: PlaceEnum.AVANT_POSTE_FRUTOX,
		name: 'mfoutp',
		map: MapZone.ILEMONSTRE,
		moves: [
			{ target: PlaceEnum.PORT_MONSTRUEUX },
			{ target: PlaceEnum.PALAIS_DU_GROTOX },
			{ target: PlaceEnum.FORET_KAZE_KAMI },
			{ target: PlaceEnum.AVANT_POSTE_VEGETOX }
		],
		background: 'm_outfrutox'
	},

	[PlaceEnum.PALAIS_DU_GROTOX]: {
		placeId: PlaceEnum.PALAIS_DU_GROTOX,
		name: 'mfpalc',
		map: MapZone.ILEMONSTRE,
		moves: [{ target: PlaceEnum.AVANT_POSTE_FRUTOX }, { target: PlaceEnum.FORET_KAZE_KAMI }],
		background: 'm_grotox'
	},

	[PlaceEnum.FORET_KAZE_KAMI]: {
		placeId: PlaceEnum.FORET_KAZE_KAMI,
		name: 'mforst',
		map: MapZone.ILEMONSTRE,
		moves: [
			{ target: PlaceEnum.PALAIS_DU_GROTOX },
			{ target: PlaceEnum.AVANT_POSTE_FRUTOX },
			{ target: PlaceEnum.RUINES_DE_CUSCOUZ, condition: 'dungeon(mquetz)' }
		],
		background: 'm_forest'
	},

	[PlaceEnum.GO_TO_PORT_DE_PRECHE_THROUGHT_MONSTER_ISLAND]: {
		placeId: PlaceEnum.GO_TO_PORT_DE_PRECHE_THROUGHT_MONSTER_ISLAND,
		name: 'bkport',
		map: MapZone.DINOLAND,
		moves: [],
		gotoPlaceId: PlaceEnum.PORT_DE_PRECHE,
		background: 'go_swim'
	},

	[PlaceEnum.AVANT_POSTE_VEGETOX]: {
		placeId: PlaceEnum.AVANT_POSTE_VEGETOX,
		name: 'mvoutp',
		map: MapZone.ILEMONSTRE,
		moves: [
			{ target: PlaceEnum.PORT_MONSTRUEUX },
			{ target: PlaceEnum.PALAIX_D_ANTRAXOV },
			{ target: PlaceEnum.AVANT_POSTE_FRUTOX }
		],
		background: 'm_outvegetox'
	},

	[PlaceEnum.PALAIX_D_ANTRAXOV]: {
		placeId: PlaceEnum.PALAIX_D_ANTRAXOV,
		name: 'mvpalc',
		map: MapZone.ILEMONSTRE,
		moves: [{ target: PlaceEnum.AVANT_POSTE_VEGETOX }, { target: PlaceEnum.CAMP_D_ELITE }],
		background: 'm_antraxov'
	},

	[PlaceEnum.RUINES_DE_CUSCOUZ]: {
		placeId: PlaceEnum.RUINES_DE_CUSCOUZ,
		name: 'mcuzco',
		map: MapZone.ILEMONSTRE,
		moves: [
			{ target: PlaceEnum.FORET_KAZE_KAMI },
			{ target: PlaceEnum.CAMP_D_ELITE, condition: 'scenario(monisl,10+)' }
		],
		hide: true,
		background: 'm_cuzcous'
	},

	[PlaceEnum.CAMP_D_ELITE]: {
		placeId: PlaceEnum.CAMP_D_ELITE,
		name: 'mcelit',
		map: MapZone.ILEMONSTRE,
		moves: [{ target: PlaceEnum.RUINES_DE_CUSCOUZ }, { target: PlaceEnum.PALAIX_D_ANTRAXOV }],
		hide: true,
		background: 'm_elit'
	},

	/* -------------------------------------------------
	 * NIMBAO
	 * ------------------------------------------------- */

	[PlaceEnum.TETE_DE_L_ILE]: {
		placeId: PlaceEnum.TETE_DE_L_ILE,
		name: 'iroche',
		map: MapZone.NIMBAO,
		moves: [{ target: PlaceEnum.PONT }],
		gathers: [GatherType.SEEK],
		background: 'i_rocher'
	},

	[PlaceEnum.PONT]: {
		placeId: PlaceEnum.PONT,
		name: 'ipont',
		map: MapZone.NIMBAO,
		moves: [
			{ target: PlaceEnum.TETE_DE_L_ILE },
			{ target: PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR, condition: 'scenario(nimbao,27+)' }
		],
		background: 'i_pont'
	},

	[PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR]: {
		placeId: PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR,
		name: 'iporte',
		map: MapZone.NIMBAO,
		moves: [
			{ target: PlaceEnum.PONT },
			{ target: PlaceEnum.CITE_ARBORIS, condition: 'scenario(nimbao,28+)' },
			{ target: PlaceEnum.PLAINES_ENNEIGEES, condition: 'scenario(nimbao,37+)' },
			{ target: PlaceEnum.CHUTES_DE_NIRVANA, condition: 'scenario(nimbao,33+)' },
			{ target: PlaceEnum.QUARTIER_LUXURIANT, condition: 'scenario(nimba2,27+)' }
		],
		background: 'i_porte'
	},

	[PlaceEnum.CITE_ARBORIS]: {
		placeId: PlaceEnum.CITE_ARBORIS,
		name: 'icite',
		map: MapZone.NIMBAO,
		moves: [
			{
				target: PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR,
				condition: '!(scenario(nimbao,30)|scenario(nimbao,31)|scenario(nimbao,32))'
			},
			{ target: PlaceEnum.LAC_CELESTE, condition: 'scenario(nimbao,31+)' },
			{ target: PlaceEnum.PRIRANESE, condition: 'scenario(nimba2,26+)' },
			{ target: PlaceEnum.CHEMIN_OBSERVATOIRE, condition: 'scenario(nimba2,43+)' }
		],
		background: 'i_cite'
	},

	[PlaceEnum.LAC_CELESTE]: {
		placeId: PlaceEnum.LAC_CELESTE,
		name: 'ilacro',
		map: MapZone.NIMBAO,
		moves: [
			{ target: PlaceEnum.CITE_ARBORIS },
			{ target: PlaceEnum.CHUTES_DE_NIRVANA, condition: 'scenario(nimbao,32+)' },
			{ target: PlaceEnum.AILE_OUEST_DU_DRAGON, condition: 'curmission(sos)|curmission(sos2)|scenario(nimba2,24+)' }
		],
		gathers: [GatherType.HUNT],
		background: 'i_lacroc'
	},

	[PlaceEnum.CHUTES_DE_NIRVANA]: {
		placeId: PlaceEnum.CHUTES_DE_NIRVANA,
		name: 'ilac',
		map: MapZone.NIMBAO,
		moves: [
			{ target: PlaceEnum.LAC_CELESTE },
			{ target: PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR, condition: 'scenario(nimbao,33+)' }
		],
		gathers: [GatherType.ENERGY2],
		background: 'i_lac'
	},

	[PlaceEnum.PLAINES_ENNEIGEES]: {
		placeId: PlaceEnum.PLAINES_ENNEIGEES,
		name: 'iplain',
		map: MapZone.NIMBAO,
		moves: [
			{ target: PlaceEnum.BOIS_GIVRES, condition: 'scenario(nimbao,38+)' },
			{ target: PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR }
		],
		background: 'i_plaine'
	},

	[PlaceEnum.BOIS_GIVRES]: {
		placeId: PlaceEnum.BOIS_GIVRES,
		name: 'isnow2',
		map: MapZone.NIMBAO,
		moves: [
			{ target: PlaceEnum.PLAINES_ENNEIGEES },
			{ target: PlaceEnum.MONT_SACRE_D_EVEROUEST, condition: 'scenario(nimbao,39+)' }
		],
		gathers: [GatherType.CUEILLE2],
		background: 'snow2'
	},

	[PlaceEnum.MONT_SACRE_D_EVEROUEST]: {
		placeId: PlaceEnum.MONT_SACRE_D_EVEROUEST,
		name: 'imont',
		map: MapZone.NIMBAO,
		moves: [{ target: PlaceEnum.BOIS_GIVRES }, { target: PlaceEnum.SOMMET_DU_MONT_SACRE }],
		background: 'i_mont'
	},

	[PlaceEnum.SOMMET_DU_MONT_SACRE]: {
		placeId: PlaceEnum.SOMMET_DU_MONT_SACRE,
		name: 'ihaut',
		map: MapZone.NIMBAO,
		moves: [{ target: PlaceEnum.MONT_SACRE_D_EVEROUEST }],
		background: 'snow4'
	},

	[PlaceEnum.AILE_OUEST_DU_DRAGON]: {
		placeId: PlaceEnum.AILE_OUEST_DU_DRAGON,
		name: 'ilac2',
		map: MapZone.NIMBAO,
		moves: [{ target: PlaceEnum.PRIRANESE }, { target: PlaceEnum.LAC_CELESTE }],
		hide: true,
		background: 'i_lac2'
	},

	[PlaceEnum.PRIRANESE]: {
		placeId: PlaceEnum.PRIRANESE,
		name: 'prison',
		map: MapZone.NIMBAO,
		moves: [
			{
				target: PlaceEnum.AILE_OUEST_DU_DRAGON,
				condition: '!(scenario(nimba2,22+)+scenario(nimba2,25-))|scenario(nimba2,26+)'
			},
			{ target: PlaceEnum.CITE_ARBORIS, condition: '!(scenario(nimba2,22+)+scenario(nimba2,25-))|scenario(nimba2,26+)' }
		],
		hide: true,
		background: 'i_prison'
	},

	[PlaceEnum.CHEMIN_OBSERVATOIRE]: {
		placeId: PlaceEnum.CHEMIN_OBSERVATOIRE,
		name: 'voie',
		map: MapZone.NIMBAO,
		activeKey: 'nimba2',
		moves: [
			{ target: PlaceEnum.CITE_ARBORIS },
			{ target: PlaceEnum.OBSERVATOIRE },
			{ target: PlaceEnum.TOURUP, condition: 'clanact(tour)' }
		],
		background: 'i_voie'
	},

	[PlaceEnum.TOURUP]: {
		placeId: PlaceEnum.TOURUP,
		name: 'tourup',
		map: MapZone.NIMBAO,
		activeKey: 'nimba2',
		moves: [{ target: PlaceEnum.CHEMIN_OBSERVATOIRE }],
		gotoPlaceId: PlaceEnum.GO_TO_KARINBAO_TOWER,
		background: 'toursk'
	},

	[PlaceEnum.OBSERVATOIRE]: {
		placeId: PlaceEnum.OBSERVATOIRE,
		name: 'observ',
		map: MapZone.NIMBAO,
		activeKey: 'nimba2',
		moves: [{ target: PlaceEnum.CHEMIN_OBSERVATOIRE }],
		background: 'i_observ'
	},

	[PlaceEnum.QUARTIER_LUXURIANT]: {
		placeId: PlaceEnum.QUARTIER_LUXURIANT,
		name: 'ville1',
		map: MapZone.NIMBAO,
		activeKey: 'nimba2',
		moves: [
			{ target: PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR },
			{ target: PlaceEnum.QUARTIER_EXUBERANT },
			{ target: PlaceEnum.EGOUTS_DU_PALAIS, condition: 'scenario(nimba2,45+)' }
		],
		background: 'i_ville1'
	},

	[PlaceEnum.QUARTIER_EXUBERANT]: {
		placeId: PlaceEnum.QUARTIER_EXUBERANT,
		name: 'ville2',
		map: MapZone.NIMBAO,
		activeKey: 'nimba2',
		moves: [
			{ target: PlaceEnum.QUARTIER_LUXURIANT },
			{
				target: PlaceEnum.CHEMIN_VERS_PALAIS,
				condition: 'scenario(nimba2,35+)+scenario(nimba2,38-)|scenario(nimba2,49+)'
			}
		],
		background: 'i_ville2'
	},

	[PlaceEnum.CHEMIN_VERS_PALAIS]: {
		placeId: PlaceEnum.CHEMIN_VERS_PALAIS,
		name: 'sommet',
		map: MapZone.NIMBAO,
		activeKey: 'nimba2',
		moves: [
			{ target: PlaceEnum.QUARTIER_EXUBERANT, condition: '!scenario(nimba2,46)' },
			{ target: PlaceEnum.PALAIS_DE_L_ARCHIDOROGON },
			{ target: PlaceEnum.EGOUTS_DU_PALAIS, condition: 'scenario(nimba2,46+)' }
		],
		background: 'i_sommet'
	},

	[PlaceEnum.PALAIS_DE_L_ARCHIDOROGON]: {
		placeId: PlaceEnum.PALAIS_DE_L_ARCHIDOROGON,
		name: 'palais',
		map: MapZone.NIMBAO,
		activeKey: 'nimba2',
		moves: [{ target: PlaceEnum.CHEMIN_VERS_PALAIS }],
		background: 'i_palais'
	},

	[PlaceEnum.EGOUTS_DU_PALAIS]: {
		placeId: PlaceEnum.EGOUTS_DU_PALAIS,
		name: 'egout',
		map: MapZone.NIMBAO,
		activeKey: 'nimba2',
		moves: [
			{ target: PlaceEnum.CHEMIN_VERS_PALAIS, condition: 'scenario(nimba2,46+)' },
			{ target: PlaceEnum.QUARTIER_LUXURIANT }
		],
		hide: true,
		background: 'i_egout'
	},

	[PlaceEnum.TEMPLE]: {
		placeId: PlaceEnum.TEMPLE,
		name: 'temple',
		map: MapZone.NIMBAO,
		condition: 'scenario(fmedal,12)',
		moves: [{ target: PlaceEnum.GODW }],
		hide: true,
		background: 'i_temple'
	},

	[PlaceEnum.GODW]: {
		placeId: PlaceEnum.GODW,
		name: 'godw',
		map: MapZone.DINOWEST,
		moves: [],
		gotoPlaceId: PlaceEnum.GO_TO_VOIE_TEMPLE_CELESTE,
		background: 'dw_portal'
	},

	/* -------------------------------------------------
	 * CAUSHEMESH
	 * ------------------------------------------------- */

	[PlaceEnum.GOTOST]: {
		placeId: PlaceEnum.GOTOST,
		name: 'gotost',
		map: MapZone.STEPPE,
		activeKey: 'caush',
		moves: [],
		gotoPlaceId: PlaceEnum.PORTES_DE_CAUSHEMESH,
		background: 'sporte'
	},

	[PlaceEnum.CPORTE]: {
		placeId: PlaceEnum.CPORTE,
		name: 'cporte',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [{ target: PlaceEnum.CACROP }, { target: PlaceEnum.GOTOST, condition: 'scenario(caush,17+)' }],
		background: 'cporte'
	},

	[PlaceEnum.CACROP]: {
		placeId: PlaceEnum.CACROP,
		name: 'cacrop',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [{ target: PlaceEnum.CPORTE }, { target: PlaceEnum.CGRAV, condition: 'caushrock(3)|admin()' }],
		background: 'cacrop'
	},

	[PlaceEnum.CGRAV]: {
		placeId: PlaceEnum.CGRAV,
		name: 'cgrav',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [
			{ target: PlaceEnum.CTECNO, condition: 'caushrock(0)' },
			{ target: PlaceEnum.CPUITS, condition: 'caushrock(1)' },
			{ target: PlaceEnum.CPYRA1, condition: 'caushrock(2)' },
			{ target: PlaceEnum.CACROP, condition: 'caushrock(3)' }
		],
		background: 'cgrav'
	},

	[PlaceEnum.CPUITS]: {
		placeId: PlaceEnum.CPUITS,
		name: 'cpuits',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [{ target: PlaceEnum.CGRAV, condition: 'caushrock(1)|admin()' }],
		background: 'cpuits'
	},

	[PlaceEnum.CTECNO]: {
		placeId: PlaceEnum.CTECNO,
		name: 'ctecno',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [{ target: PlaceEnum.CGRAV, condition: 'caushrock(0)|admin()' }, { target: PlaceEnum.CCRANE }],
		background: 'ctecno'
	},

	[PlaceEnum.CCRANE]: {
		placeId: PlaceEnum.CCRANE,
		name: 'ccrane',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [{ target: PlaceEnum.CTECNO }, { target: PlaceEnum.CEXTRA }],
		background: 'ccrane'
	},

	[PlaceEnum.CEXTRA]: {
		placeId: PlaceEnum.CEXTRA,
		name: 'cextra',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [{ target: PlaceEnum.CCRANE }],
		background: 'cextra'
	},

	[PlaceEnum.CPYRA1]: {
		placeId: PlaceEnum.CPYRA1,
		name: 'cpyra1',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [
			{ target: PlaceEnum.CGRAV, condition: 'caushrock(2)|admin()' },
			{ target: PlaceEnum.CPYRA2, condition: 'scenario(caush,22+)' }
		],
		background: 'cpyra1'
	},

	[PlaceEnum.CPYRA2]: {
		placeId: PlaceEnum.CPYRA2,
		name: 'cpyra2',
		map: MapZone.ALL,
		activeKey: 'caush',
		moves: [{ target: PlaceEnum.CPYRA1 }],
		background: 'cpyra2'
	},
	[PlaceEnum.NOWHERE]: {
		placeId: PlaceEnum.NOWHERE,
		name: 'nowhere',
		map: MapZone.ALL,
		moves: []
	}
} satisfies Partial<Record<PlaceEnum, PlaceDefinitionInput>>);

export const PlacesByMap = Object.values(placeListv2).reduce(
	(acc, place) => {
		const currentMap = acc[place.map];

		if (currentMap) {
			currentMap.push(place.placeId);
		} else {
			acc[place.map] = [place.placeId];
		}

		return acc;
	},
	{} as Partial<Record<MapZone, PlaceEnum[]>>
);
