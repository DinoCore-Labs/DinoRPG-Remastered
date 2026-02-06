//import { DinozStatusId } from '../dinoz/statusList.js';
//import { GatherType } from '../enums/GatherType.mjs';
import { GroundEnum } from '../enums/GroundEnum.js';
import { MapZone } from '../enums/MapZone.js';
//import { Comparator, ConditionEnum, Operator } from '../enums/Parser.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
//import { Scenario } from '../enums/Scenario.mjs';
//import { MissionID } from '../missions/missionList.mjs';
//import { Condition } from '../npc/NpcConditions.mjs';

/** Sticky Swamp - No movement on Thursday and Saturday. */
export const SWAMP_FLOODED_DAYS = [4, 6];
/** Sticky Swamp - No fights on Wednesday and Sunday. */
export const SWAMP_FOG_DAYS = [0, 3];

export const placeList: Record<
	PlaceEnum,
	{
		placeId: PlaceEnum;
		name: string;
		borderPlace: number[];
		map: MapZone;
		//conditions?: Condition;
		alias?: number;
		//gather?: GatherType;
		//specialGather?: GatherType;
		ground?: GroundEnum;
		background?: string;
		top?: number;
		bottom?: number;
		itinerant?: boolean;
	}
> = {
	// Useful for the few things accessible from any where like the flying shop
	[PlaceEnum.ANYWHERE]: {
		placeId: PlaceEnum.ANYWHERE,
		name: 'anywhere',
		borderPlace: [],
		map: MapZone.ALL
	},
	[PlaceEnum.PORT_DE_PRECHE]: {
		placeId: PlaceEnum.PORT_DE_PRECHE,
		name: 'port',
		borderPlace: [7, 10, 11, 13],
		map: MapZone.DINOLAND,
		//gather: GatherType.FISH,
		//specialGather: GatherType.ANNIV,
		ground: GroundEnum.DIRT,
		background: 's_port',
		top: 140,
		itinerant: true
	},
	[PlaceEnum.PLACE_DU_MARCHE]: {
		placeId: PlaceEnum.PLACE_DU_MARCHE,
		name: 'market',
		borderPlace: [4],
		map: MapZone.DINOLAND,
		ground: GroundEnum.DIRT,
		background: 'city2',
		top: 155,
		itinerant: true
	},
	[PlaceEnum.PAPY_JOE]: {
		placeId: PlaceEnum.PAPY_JOE,
		name: 'papy',
		borderPlace: [4, 6, 7],
		map: MapZone.DINOLAND,
		//gather: GatherType.HUNT,
		ground: GroundEnum.DIRT,
		background: 's_papy',
		top: 165,
		itinerant: true
	},
	[PlaceEnum.FORCEBRUT]: {
		placeId: PlaceEnum.FORCEBRUT,
		name: 'forcebrut',
		borderPlace: [2, 3, 7],
		map: MapZone.DINOLAND,
		//gather: GatherType.ENERGY1,
		ground: GroundEnum.DIRT,
		background: 's_frcbrt',
		top: 120,
		itinerant: true
	},
	[PlaceEnum.DINOVILLE]: {
		placeId: PlaceEnum.DINOVILLE,
		name: 'dnv',
		borderPlace: [6, 7, 12],
		map: MapZone.DINOLAND,
		//gather: GatherType.SEEK,
		//specialGather: GatherType.XMAS,
		ground: GroundEnum.NONE,
		background: 's_dnv',
		top: 155,
		itinerant: true
	},
	[PlaceEnum.UNIVERSITE]: {
		placeId: PlaceEnum.UNIVERSITE,
		name: 'universite',
		borderPlace: [3, 5, 8],
		map: MapZone.DINOLAND,
		//gather: GatherType.CUEILLE1,
		//specialGather: GatherType.DAILY,
		ground: GroundEnum.NONE,
		background: 's_univ',
		itinerant: true
	},
	[PlaceEnum.FOUTAINE_DE_JOUVENCE]: {
		placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
		name: 'fountj',
		borderPlace: [1, 3, 4, 5],
		map: MapZone.DINOLAND,
		//gather: GatherType.CUEILLE1,
		ground: GroundEnum.NONE,
		background: 's_fountj',
		top: 170,
		itinerant: true
	},
	[PlaceEnum.COLLINES_ESCARPEES]: {
		placeId: PlaceEnum.COLLINES_ESCARPEES,
		name: 'colesc',
		borderPlace: [6, 9],
		map: MapZone.DINOLAND,
		//gather: GatherType.HUNT,
		ground: GroundEnum.DIRT,
		background: 's_colesc',
		top: 130,
		itinerant: true
	},
	[PlaceEnum.GO_TO_GRAND_TOUT_CHAUD]: {
		placeId: PlaceEnum.GO_TO_GRAND_TOUT_CHAUD,
		name: 'gogtc',
		borderPlace: [8],
		alias: 43,
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.CLIMBING_GEAR
		},*/
		map: MapZone.GTOUTCHAUD
	},
	[PlaceEnum.GO_TO_ATLANTEINES_ISLAND]: {
		placeId: PlaceEnum.GO_TO_ATLANTEINES_ISLAND,
		name: 'goiles',
		borderPlace: [1],
		alias: 31,
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.BUOY
		},*/
		map: MapZone.ILES
	},
	[PlaceEnum.CIMETIERE]: {
		placeId: PlaceEnum.CIMETIERE,
		name: 'skull',
		borderPlace: [1],
		/*conditions: {
			[Operator.OR]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.SKULLY_MEMORY },
				{ [ConditionEnum.DINOZ_LIFE]: [Comparator.LESSER_EQUAL, 10] }
			]
		},*/
		map: MapZone.DINOLAND,
		ground: GroundEnum.DIRT,
		background: 's_graveyard',
		top: 110
	},
	[PlaceEnum.GO_TO_DINOPLAZA]: {
		placeId: PlaceEnum.GO_TO_DINOPLAZA,
		name: 'goplaz',
		borderPlace: [5],
		alias: 35,
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.DINOPLAZA
		},*/
		map: MapZone.DINOWEST
	},
	[PlaceEnum.GO_TO_MONSTER_ISLAND]: {
		placeId: PlaceEnum.GO_TO_MONSTER_ISLAND,
		name: 'gomisl',
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.JOVEBOZE,
			[ConditionEnum.ACTIVE]: false
		},*/
		borderPlace: [1],
		alias: 92,
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.AUREE_DE_LA_FORET]: {
		placeId: PlaceEnum.AUREE_DE_LA_FORET,
		name: 'auree',
		borderPlace: [15, 23],
		map: MapZone.JUNGLE,
		//gather: GatherType.CUEILLE1,
		ground: GroundEnum.DIRT,
		background: 's_auree',
		top: 120
	},
	[PlaceEnum.CHEMIN_GLAUQUE]: {
		placeId: PlaceEnum.CHEMIN_GLAUQUE,
		name: 'chemin',
		borderPlace: [14, 16, 17],
		map: MapZone.JUNGLE,
		//gather: GatherType.CUEILLE1,
		ground: GroundEnum.DIRT,
		background: 's_chemin',
		top: 175
	},
	[PlaceEnum.COLLINES_HANTEES]: {
		placeId: PlaceEnum.COLLINES_HANTEES,
		name: 'collin',
		borderPlace: [15, 17],
		map: MapZone.JUNGLE,
		//gather: GatherType.SEEK,
		ground: GroundEnum.DIRT,
		background: 's_collin',
		top: 175
	},
	[PlaceEnum.FLEUVE_JUMIN]: {
		placeId: PlaceEnum.FLEUVE_JUMIN,
		name: 'fleuve',
		borderPlace: [15, 16, 19, 18],
		map: MapZone.JUNGLE,
		//gather: GatherType.FISH,
		ground: GroundEnum.NONE,
		background: 's_fleuve',
		top: 140
	},
	[PlaceEnum.FLEUVE_JUMIN_BIS]: {
		placeId: PlaceEnum.FLEUVE_JUMIN_BIS,
		name: 'fleuve',
		borderPlace: [18],
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.FLIPPERS
		},*/
		alias: 17,
		map: MapZone.JUNGLE,
		ground: GroundEnum.NONE,
		background: 's_fleuve',
		top: 140
	},
	[PlaceEnum.CAMP_KORGON]: {
		placeId: PlaceEnum.CAMP_KORGON,
		name: 'camp',
		borderPlace: [22, 102],
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.FLIPPERS
		},*/
		map: MapZone.JUNGLE,
		//gather: GatherType.HUNT,
		ground: GroundEnum.ROCK,
		background: 's_camp',
		top: 150
	},
	[PlaceEnum.JUNGLE_SAUVAGE]: {
		placeId: PlaceEnum.JUNGLE_SAUVAGE,
		name: 'jungle',
		borderPlace: [17, 20],
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.FLIPPERS
		},*/
		map: MapZone.JUNGLE,
		//gather: GatherType.HUNT,
		ground: GroundEnum.NONE,
		background: 's_jungle',
		top: 120
	},
	[PlaceEnum.PORTE_DE_SYLVENOIRE]: {
		placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
		name: 'garde',
		borderPlace: [19, 21],
		map: MapZone.JUNGLE,
		//gather: GatherType.ENERGY1,
		ground: GroundEnum.DIRT,
		background: 's_garde',
		top: 120
	},
	[PlaceEnum.GO_TO_STEPPES]: {
		placeId: PlaceEnum.GO_TO_STEPPES,
		name: 'gostep',
		borderPlace: [20],
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.SYLVENOIRE_KEY,
			[ConditionEnum.ACTIVE]: false
		},*/
		alias: 55,
		map: MapZone.STEPPE
	},
	[PlaceEnum.GO_TO_GORGES_PROFONDES]: {
		placeId: PlaceEnum.GO_TO_GORGES_PROFONDES,
		name: 'goorg',
		borderPlace: [18],
		alias: 49,
		map: MapZone.GTOUTCHAUD
	},
	[PlaceEnum.GO_TO_CHUTES]: {
		placeId: PlaceEnum.GO_TO_CHUTES,
		name: 'gochut',
		borderPlace: [14],
		alias: 25,
		map: MapZone.ILES
	},
	[PlaceEnum.GO_TO_FOREST]: {
		placeId: PlaceEnum.GO_TO_FOREST,
		name: 'gogrum',
		borderPlace: [25],
		/*conditions: {
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.NENUPHAR_LEAF },
				{ [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE }
			]
		},*/
		alias: 14,
		map: MapZone.JUNGLE
	},
	[PlaceEnum.CHUTES_MUTANTES]: {
		placeId: PlaceEnum.CHUTES_MUTANTES,
		name: 'chutes',
		borderPlace: [24, 26, 27, 29],
		map: MapZone.ILES,
		//gather: GatherType.FISH,
		ground: GroundEnum.DIRT,
		background: 's_chutes',
		top: 110,
		itinerant: true
	},
	[PlaceEnum.GO_TO_DOME_SOULAFLOTTE]: {
		placeId: PlaceEnum.GO_TO_DOME_SOULAFLOTTE,
		name: 'rasca',
		borderPlace: [25],
		alias: 28,
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.RASCAPHANDRE_DECOY
		},*/
		map: MapZone.ILES
	},
	[PlaceEnum.BAO_BOB]: {
		placeId: PlaceEnum.BAO_BOB,
		name: 'baobob',
		borderPlace: [25],
		map: MapZone.ILES,
		//gather: GatherType.HUNT,
		ground: GroundEnum.DIRT,
		background: 's_baobob',
		top: 130,
		itinerant: true
	},
	[PlaceEnum.DOME_SOULAFLOTTE]: {
		placeId: PlaceEnum.DOME_SOULAFLOTTE,
		name: 'dome',
		borderPlace: [25],
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.RASCAPHANDRE_DECOY
		},*/
		map: MapZone.ILES,
		//gather: GatherType.ENERGY1,
		ground: GroundEnum.NONE,
		background: 's_dome',
		top: 110
	},
	[PlaceEnum.MARAIS_COLLANT]: {
		placeId: PlaceEnum.MARAIS_COLLANT,
		name: 'marais',
		borderPlace: [25, 30, 31, 33],
		map: MapZone.ILES,
		//gather: GatherType.CUEILLE1,
		ground: GroundEnum.WATER,
		background: 'swp_clear',
		top: 160,
		itinerant: true
	},
	[PlaceEnum.MINES_DE_CORAIL]: {
		placeId: PlaceEnum.MINES_DE_CORAIL,
		name: 'corail',
		borderPlace: [29, 31],
		map: MapZone.ILES,
		//gather: GatherType.SEEK,
		ground: GroundEnum.DIRT,
		background: 's_corail',
		top: 150,
		itinerant: true
	},
	[PlaceEnum.ILE_WAIKIKI]: {
		placeId: PlaceEnum.ILE_WAIKIKI,
		name: 'ilewkk',
		borderPlace: [29, 30, 32],
		map: MapZone.ILES,
		//gather: GatherType.FISH,
		ground: GroundEnum.DIRT,
		background: 's_ilewkk',
		top: 110,
		itinerant: true
	},
	[PlaceEnum.GO_TO_PORT_DE_PRECHE]: {
		placeId: PlaceEnum.GO_TO_PORT_DE_PRECHE,
		name: 'goport',
		borderPlace: [31],
		alias: 1,
		map: MapZone.DINOLAND
	},
	[PlaceEnum.ATELIER_BROC]: {
		placeId: PlaceEnum.ATELIER_BROC,
		name: 'chbroc',
		borderPlace: [29],
		map: MapZone.ILES,
		ground: GroundEnum.DIRT,
		background: 'broc',
		top: 110 /*,
		conditions: {
			[ConditionEnum.ACTIVE]: false //'roid'
		}*/
	},
	[PlaceEnum.GO_TO_DINOVILLE]: {
		placeId: PlaceEnum.GO_TO_DINOVILLE,
		name: 'godnv',
		borderPlace: [35],
		alias: 5,
		map: MapZone.DINOLAND
	},
	[PlaceEnum.DINOPLAZA]: {
		placeId: PlaceEnum.DINOPLAZA,
		name: 'dplaza',
		borderPlace: [36, 37, 38, 34],
		map: MapZone.DINOWEST,
		ground: GroundEnum.DIRT,
		background: 's_plaza',
		top: 110
	},
	[PlaceEnum.VILLA]: {
		placeId: PlaceEnum.VILLA,
		name: 'villa',
		borderPlace: [35, 37],
		map: MapZone.DINOWEST,
		ground: GroundEnum.NONE,
		background: 'villa',
		top: 110
	},
	[PlaceEnum.CINEMA_PARADINO]: {
		placeId: PlaceEnum.CINEMA_PARADINO,
		name: 'dcine',
		borderPlace: [36, 35, 38, 40],
		map: MapZone.DINOWEST,
		ground: GroundEnum.NONE,
		background: 's_cinema',
		top: 110
	},
	[PlaceEnum.CLINIQUE]: {
		placeId: PlaceEnum.CLINIQUE,
		name: 'clinik',
		borderPlace: [35, 37],
		map: MapZone.DINOWEST,
		ground: GroundEnum.NONE,
		background: 'clinique1',
		top: 110
	},
	[PlaceEnum.CHATEAU_DE_DINOVILLE]: {
		placeId: PlaceEnum.CHATEAU_DE_DINOVILLE,
		name: 'chato',
		borderPlace: [40],
		map: MapZone.DINOWEST,
		ground: GroundEnum.DIRT,
		background: 'dnv_throne',
		top: 140
	},
	[PlaceEnum.POSTE_DE_GARDE]: {
		placeId: PlaceEnum.POSTE_DE_GARDE,
		name: 'poste',
		borderPlace: [39, 41, 37],
		map: MapZone.DINOWEST,
		ground: GroundEnum.DIRT,
		background: 'dnv_chato',
		top: 130
	},
	[PlaceEnum.GO_TO_VOIE_TEMPLE_CELESTE]: {
		placeId: PlaceEnum.GO_TO_VOIE_TEMPLE_CELESTE,
		name: 'portal',
		borderPlace: [40],
		map: MapZone.DINOWEST
	},
	[PlaceEnum.GO_TO_COLLINES_ESCARPEES]: {
		placeId: PlaceEnum.GO_TO_COLLINES_ESCARPEES,
		name: 'gocol',
		borderPlace: [43],
		alias: 8,
		map: MapZone.DINOLAND
	},
	[PlaceEnum.PENTES_DE_BASALTE]: {
		placeId: PlaceEnum.PENTES_DE_BASALTE,
		name: 'bslt',
		borderPlace: [42, 44],
		map: MapZone.GTOUTCHAUD,
		//gather: GatherType.ENERGY1,
		ground: GroundEnum.NONE,
		background: 's_pentes',
		top: 130,
		itinerant: true
	},
	[PlaceEnum.FORGES_DU_GTC]: {
		placeId: PlaceEnum.FORGES_DU_GTC,
		name: 'forges',
		borderPlace: [43, 45, 46, 47],
		map: MapZone.GTOUTCHAUD,
		//gather: GatherType.CUEILLE1,
		ground: GroundEnum.NONE,
		background: 's_forges',
		top: 110,
		itinerant: true
	},
	[PlaceEnum.RUINES_ASHPOUK]: {
		placeId: PlaceEnum.RUINES_ASHPOUK,
		name: 'rashpk',
		borderPlace: [44],
		map: MapZone.GTOUTCHAUD,
		//gather: GatherType.SEEK,
		ground: GroundEnum.DIRT,
		background: 's_rashpk',
		top: 160,
		itinerant: true
	},
	[PlaceEnum.FOSSELAVE]: {
		placeId: PlaceEnum.FOSSELAVE,
		name: 'fosslv',
		borderPlace: [44, 48],
		map: MapZone.GTOUTCHAUD,
		//gather: GatherType.SEEK,
		ground: GroundEnum.NONE,
		background: 's_fosslv',
		top: 110,
		itinerant: true
	},
	[PlaceEnum.REPAIRE_DU_VENERABLE]: {
		placeId: PlaceEnum.REPAIRE_DU_VENERABLE,
		name: 'vener',
		borderPlace: [44, 52],
		map: MapZone.GTOUTCHAUD,
		//gather: GatherType.HUNT,
		ground: GroundEnum.NONE,
		background: 's_vener',
		top: 130,
		itinerant: true
	},
	[PlaceEnum.TUNNEL_SOUS_LA_BRANCHE]: {
		placeId: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
		name: 'tunel',
		borderPlace: [46, 50],
		map: MapZone.GTOUTCHAUD,
		ground: GroundEnum.DIRT,
		background: 's_tunel',
		top: 130,
		itinerant: true
	},
	[PlaceEnum.GORGES_PROFONDES]: {
		placeId: PlaceEnum.GORGES_PROFONDES,
		name: 'gorges',
		borderPlace: [48, 51],
		map: MapZone.GTOUTCHAUD,
		ground: GroundEnum.WATER,
		background: 'cavern2',
		top: 110
	},
	[PlaceEnum.GO_TO_TUNNEL]: {
		placeId: PlaceEnum.GO_TO_TUNNEL,
		name: 'stunel',
		borderPlace: [48],
		/*conditions: {
			[ConditionEnum.STATUS]: DinozStatusId.LANTERN
		},*/
		alias: 49,
		map: MapZone.GTOUTCHAUD
	},
	[PlaceEnum.GO_TO_CAMP_KORGON]: {
		placeId: PlaceEnum.GO_TO_CAMP_KORGON,
		name: 'gocamp',
		borderPlace: [50],
		alias: 18,
		map: MapZone.JUNGLE
	},
	[PlaceEnum.GO_TO_KARINBAO_TOWER]: {
		placeId: PlaceEnum.GO_TO_KARINBAO_TOWER,
		name: 'tourbt',
		borderPlace: [47, 53],
		map: MapZone.GTOUTCHAUD /*,
		conditions: {
			[ConditionEnum.ACTIVE]: false //'roid'
		}*/
	},
	[PlaceEnum.GO_TO_CELESTIAL_ISLAND]: {
		placeId: PlaceEnum.GO_TO_CELESTIAL_ISLAND,
		name: 'toursk',
		borderPlace: [52],
		alias: 81,
		map: MapZone.NIMBAO
	},
	[PlaceEnum.GO_TO_SYLVENOIRE_DOOR]: {
		placeId: PlaceEnum.GO_TO_SYLVENOIRE_DOOR,
		name: 'gosylv',
		borderPlace: [55],
		alias: 20,
		map: MapZone.JUNGLE
	},
	[PlaceEnum.FRONTIERE_CREPITANTE]: {
		placeId: PlaceEnum.FRONTIERE_CREPITANTE,
		name: 'senter',
		borderPlace: [54, 56, 57],
		map: MapZone.STEPPE
		//gather: GatherType.CUEILLE1
	},
	[PlaceEnum.CROISEE_DES_NOMADES]: {
		placeId: PlaceEnum.CROISEE_DES_NOMADES,
		name: 'scross',
		borderPlace: [58, 55, 61],
		map: MapZone.STEPPE
	},
	[PlaceEnum.AVANT_POSTE_ROCKY]: {
		placeId: PlaceEnum.AVANT_POSTE_ROCKY,
		name: 'svillg',
		borderPlace: [55, 58],
		map: MapZone.STEPPE
		//gather: GatherType.HUNT
	},
	[PlaceEnum.CITADELLE_DU_ROI]: {
		placeId: PlaceEnum.CITADELLE_DU_ROI,
		name: 'sking',
		borderPlace: [56, 57, 59, 62],
		map: MapZone.STEPPE
		//gather: GatherType.SEEK
	},
	[PlaceEnum.PYLONES_DE_MAGNETITES]: {
		placeId: PlaceEnum.PYLONES_DE_MAGNETITES,
		name: 'spylon',
		borderPlace: [58, 60, 63],
		map: MapZone.STEPPE
		//gather: GatherType.ENERGY1
	},
	[PlaceEnum.SYPHON_SIFFLEUR]: {
		placeId: PlaceEnum.SYPHON_SIFFLEUR,
		name: 'slake',
		borderPlace: [59, 61, 64, 65, 101],
		map: MapZone.STEPPE
		//gather: GatherType.FISH
	},
	[PlaceEnum.SENTIER_DE_TOUTEMBA]: {
		placeId: PlaceEnum.SENTIER_DE_TOUTEMBA,
		name: 'scanyo',
		borderPlace: [56, 60],
		map: MapZone.STEPPE
		//gather: GatherType.ENERGY1
	},
	[PlaceEnum.DEVOREUSE_DE_L_EST]: {
		placeId: PlaceEnum.DEVOREUSE_DE_L_EST,
		name: 'stowr1',
		borderPlace: [58],
		map: MapZone.STEPPE
	},
	[PlaceEnum.DEVOREUSE_DU_NORD]: {
		placeId: PlaceEnum.DEVOREUSE_DU_NORD,
		name: 'stowr2',
		borderPlace: [59],
		map: MapZone.STEPPE
	},
	[PlaceEnum.DEVOREUSE_DE_L_OUEST]: {
		placeId: PlaceEnum.DEVOREUSE_DE_L_OUEST,
		name: 'stowr3',
		borderPlace: [60],
		map: MapZone.STEPPE
	},
	[PlaceEnum.TAUDIS_DES_ZAXA]: {
		placeId: PlaceEnum.TAUDIS_DES_ZAXA,
		name: 'sband1',
		borderPlace: [60, 66, 67],
		map: MapZone.STEPPE
	},
	[PlaceEnum.CAMP_DES_EMMEMMA]: {
		placeId: PlaceEnum.CAMP_DES_EMMEMMA,
		name: 'sband2',
		borderPlace: [65, 67, 70],
		map: MapZone.STEPPE
	},
	[PlaceEnum.CAMPEMENT_DES_MATTMUT]: {
		placeId: PlaceEnum.CAMPEMENT_DES_MATTMUT,
		name: 'sband3',
		borderPlace: [65, 66, 68],
		map: MapZone.STEPPE
	},
	[PlaceEnum.REPAIRE_DE_LA_TEAM_W]: {
		placeId: PlaceEnum.REPAIRE_DE_LA_TEAM_W,
		name: 'scampw',
		borderPlace: [67],
		map: MapZone.STEPPE
		//gather: GatherType.SEEK
	},
	[PlaceEnum.CONFINS_DES_STEPPES]: {
		placeId: PlaceEnum.CONFINS_DES_STEPPES,
		name: 'scaush',
		borderPlace: [66, 70, 71],
		map: MapZone.STEPPE
		//gather: GatherType.CUEILLE1
	},
	[PlaceEnum.PORTES_DE_CAUSHEMESH]: {
		placeId: PlaceEnum.PORTES_DE_CAUSHEMESH,
		name: 'sport',
		borderPlace: [66, 69],
		map: MapZone.STEPPE
		//gather: GatherType.CUEILLE1
	},
	[PlaceEnum.APPROCHER_SYPHON]: {
		placeId: PlaceEnum.APPROCHER_SYPHON,
		name: 'sinto1',
		borderPlace: [69],
		alias: 60,
		map: MapZone.STEPPE
	},
	[PlaceEnum.TETE_DE_L_ILE]: {
		placeId: PlaceEnum.TETE_DE_L_ILE,
		name: 'iroche',
		borderPlace: [73],
		map: MapZone.NIMBAO
		//gather: GatherType.SEEK
	},
	[PlaceEnum.PONT]: {
		placeId: PlaceEnum.PONT,
		name: 'ipont',
		borderPlace: [72, 74],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR]: {
		placeId: PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR,
		name: 'iporte',
		borderPlace: [73, 77, 83, 75, 88],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.CITE_ARBORIS]: {
		placeId: PlaceEnum.CITE_ARBORIS,
		name: 'icite',
		borderPlace: [74, 76, 81, 89],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.LAC_CELESTE]: {
		placeId: PlaceEnum.LAC_CELESTE,
		name: 'ilacro',
		borderPlace: [75, 88, 90],
		map: MapZone.NIMBAO
		//gather: GatherType.HUNT
	},
	[PlaceEnum.PLAINES_ENNEIGEES]: {
		placeId: PlaceEnum.PLAINES_ENNEIGEES,
		name: 'iplain',
		borderPlace: [74, 78],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.BOIS_GIVRES]: {
		placeId: PlaceEnum.BOIS_GIVRES,
		name: 'isnow2',
		borderPlace: [77, 79],
		map: MapZone.NIMBAO
		//gather: GatherType.CUEILLE2
	},
	[PlaceEnum.MONT_SACRE_D_EVEROUEST]: {
		placeId: PlaceEnum.MONT_SACRE_D_EVEROUEST,
		name: 'imont',
		borderPlace: [78, 80],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.SOMMET_DU_MONT_SACRE]: {
		placeId: PlaceEnum.SOMMET_DU_MONT_SACRE,
		name: 'ihaut',
		borderPlace: [79],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.CHEMIN_OBSERVATOIRE]: {
		placeId: PlaceEnum.CHEMIN_OBSERVATOIRE,
		name: 'voie',
		borderPlace: [75, 82, 91],
		map: MapZone.NIMBAO //Redescente tout chaud
	},
	[PlaceEnum.OBSERVATOIRE]: {
		placeId: PlaceEnum.OBSERVATOIRE,
		name: 'observ',
		borderPlace: [81],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.QUARTIER_LUXURIANT]: {
		placeId: PlaceEnum.QUARTIER_LUXURIANT,
		name: 'ville1',
		borderPlace: [74, 84, 87],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.QUARTIER_EXUBERANT]: {
		placeId: PlaceEnum.QUARTIER_EXUBERANT,
		name: 'ville2',
		borderPlace: [83, 85],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.CHEMIN_VERS_PALAIS]: {
		placeId: PlaceEnum.CHEMIN_VERS_PALAIS,
		name: 'sommet',
		borderPlace: [84, 86, 87],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.PALAIS_DE_L_ARCHIDOROGON]: {
		placeId: PlaceEnum.PALAIS_DE_L_ARCHIDOROGON,
		name: 'palais',
		borderPlace: [85],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.EGOUTS_DU_PALAIS]: {
		placeId: PlaceEnum.EGOUTS_DU_PALAIS,
		name: 'egout',
		borderPlace: [83, 85],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.CHUTES_DE_NIRVANA]: {
		placeId: PlaceEnum.CHUTES_DE_NIRVANA,
		name: 'ilac',
		borderPlace: [74, 76],
		map: MapZone.NIMBAO
		//gather: GatherType.ENERGY2
	},
	[PlaceEnum.PRIRANESE]: {
		placeId: PlaceEnum.PRIRANESE,
		name: 'prison',
		borderPlace: [75, 90],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.AILE_OUEST_DU_DRAGON]: {
		placeId: PlaceEnum.AILE_OUEST_DU_DRAGON,
		name: 'ilac2',
		borderPlace: [89, 76],
		map: MapZone.NIMBAO
	},
	[PlaceEnum.TOURUP]: {
		placeId: PlaceEnum.TOURUP,
		name: 'tourup',
		borderPlace: [89, 76, 81],
		alias: 52,
		map: MapZone.NIMBAO
	},
	[PlaceEnum.PORT_MONSTRUEUX]: {
		placeId: PlaceEnum.PORT_MONSTRUEUX,
		name: 'mport',
		borderPlace: [98, 96, 93],
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.AVANT_POSTE_FRUTOX]: {
		placeId: PlaceEnum.AVANT_POSTE_FRUTOX,
		name: 'mfoutp',
		borderPlace: [92, 96, 95, 94],
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.PALAIS_DU_GROTOX]: {
		placeId: PlaceEnum.PALAIS_DU_GROTOX,
		name: 'mfpalc',
		borderPlace: [93, 95],
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.FORET_KAZE_KAMI]: {
		placeId: PlaceEnum.FORET_KAZE_KAMI,
		name: 'mforst',
		borderPlace: [93, 94, 99],
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.AVANT_POSTE_VEGETOX]: {
		placeId: PlaceEnum.AVANT_POSTE_VEGETOX,
		name: 'mvoutp',
		borderPlace: [92, 93, 97],
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.PALAIX_D_ANTRAXOV]: {
		placeId: PlaceEnum.PALAIX_D_ANTRAXOV,
		name: 'mvpalc',
		borderPlace: [96, 100],
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.GO_TO_PORT_DE_PRECHE_THROUGHT_MONSTER_ISLAND]: {
		placeId: PlaceEnum.GO_TO_PORT_DE_PRECHE_THROUGHT_MONSTER_ISLAND,
		name: 'bkport',
		borderPlace: [92],
		alias: 1,
		map: MapZone.DINOLAND
	},
	[PlaceEnum.RUINES_DE_CUSCOUZ]: {
		placeId: PlaceEnum.RUINES_DE_CUSCOUZ,
		name: 'mcuzco',
		borderPlace: [95, 100],
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.CAMP_D_ELITE]: {
		placeId: PlaceEnum.CAMP_D_ELITE,
		name: 'mcelit',
		borderPlace: [97, 99],
		map: MapZone.ILEMONSTRE
	},
	[PlaceEnum.APPROCHER_SYPHON2]: {
		placeId: PlaceEnum.APPROCHER_SYPHON2,
		name: 'sinto2',
		borderPlace: [60],
		alias: 69,
		map: MapZone.STEPPE
	},
	//DarkWorld
	[PlaceEnum.GOUFFRE]: {
		placeId: PlaceEnum.GOUFFRE,
		name: 'dkchut',
		borderPlace: [104, 114, 111, 114, 115],
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.TOUR_SOMBRE]: {
		placeId: PlaceEnum.TOUR_SOMBRE,
		name: 'dktow',
		borderPlace: [103, 113, 105],
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.TOUR_SOMBRE_1]: {
		placeId: PlaceEnum.TOUR_SOMBRE_1,
		name: 'dktow2',
		borderPlace: [104, 106],
		/*conditions: {
			[Operator.OR]: [
				{ [ConditionEnum.CURRENT_MISSION]: MissionID.TODO }, //'monte' },
				{ [ConditionEnum.CURRENT_MISSION]: MissionID.TODO }, //'roif' },
				{ [ConditionEnum.SCENARIO]: [Scenario.SMOG, 16, '='] },
				{ [ConditionEnum.SCENARIO]: [Scenario.SMOG, 15, '='] }
			]
		},*/
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.TOUR_SOMBRE_2]: {
		placeId: PlaceEnum.TOUR_SOMBRE_2,
		name: 'dktow3',
		borderPlace: [105, 107],
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.TOUR_SOMBRE_DONJON_1]: {
		placeId: PlaceEnum.TOUR_SOMBRE_DONJON_1,
		name: 'dktow4',
		borderPlace: [106, 108, 109],
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.TOUR_SOMBRE_DONJON_2]: {
		placeId: PlaceEnum.TOUR_SOMBRE_DONJON_2,
		name: 'dktowa',
		borderPlace: [107, 110],
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.TOUR_SOMBRE_DONJON_3]: {
		placeId: PlaceEnum.TOUR_SOMBRE_DONJON_3,
		name: 'dktowb',
		borderPlace: [107, 110],
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.TOUR_SOMBRE_DONJON_LAST]: {
		placeId: PlaceEnum.TOUR_SOMBRE_DONJON_LAST,
		name: 'dktows',
		borderPlace: [108, 109],
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.DARK_FAKE]: {
		placeId: PlaceEnum.DARK_FAKE,
		name: 'fake',
		borderPlace: [103],
		/*conditions: {
			[Operator.OR]: [
				{ [ConditionEnum.CURRENT_MISSION]: MissionID.TODO }, //'ouestu' },
				{ [ConditionEnum.CURRENT_MISSION]: MissionID.TODO }, //'lumi' },
				{ [ConditionEnum.CURRENT_MISSION]: MissionID.TODO }, //'truci2' },
				{ [ConditionEnum.STATUS]: DinozStatusId.DARK_ORB }
			]
		},*/
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.DARK_FAKE_2]: {
		placeId: PlaceEnum.DARK_FAKE_2,
		name: 'fake2',
		borderPlace: [102],
		/*conditions: {
			[ConditionEnum.CURRENT_MISSION]: MissionID.TODO //'roid'
		},*/
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.TOUR_SOMBRE_ENTREE]: {
		placeId: PlaceEnum.TOUR_SOMBRE_ENTREE,
		name: 'gotow',
		borderPlace: [104],
		/*conditions: {
			[Operator.OR]: [
				{ [Operator.NOT]: { [ConditionEnum.CURRENT_MISSION]: MissionID.TODO } }, //'monte' } },
				{ [Operator.NOT]: { [ConditionEnum.CURRENT_MISSION]: MissionID.TODO } }, //'roif' } },
				{ [Operator.NOT]: { [ConditionEnum.SCENARIO]: [Scenario.SMOG, 16, '='] } }
			]
		},*/
		alias: 105,
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.RETOUR_SURFACE]: {
		placeId: PlaceEnum.RETOUR_SURFACE,
		name: 'rechut',
		/*conditions: {
			[ConditionEnum.ACTIVE]: false
		},*/
		borderPlace: [],
		alias: 25,
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.PORTAIL]: {
		placeId: PlaceEnum.PORTAIL,
		name: 'dkbao',
		borderPlace: [103, 112],
		map: MapZone.DARKWORLD
	},
	[PlaceEnum.DOJO]: {
		placeId: PlaceEnum.DOJO,
		name: 'dojo',
		borderPlace: [],
		background: 'dojo_arene',
		map: MapZone.ALL,
		top: 100
	},
	[PlaceEnum.DOJO_WINNER]: {
		placeId: PlaceEnum.DOJO_WINNER,
		name: 'dojo_win',
		borderPlace: [],
		background: 'dojo_champion',
		map: MapZone.ALL
	},
	[PlaceEnum.NOWHERE]: {
		placeId: PlaceEnum.NOWHERE,
		name: 'nowhere',
		borderPlace: [],
		map: MapZone.ALL
	}
};

export const PlacesByMap = Object.values(placeList).reduce(
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
