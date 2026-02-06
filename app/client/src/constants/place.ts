import { MapZone } from '@dinorpg/core/models/enums/MapZone.js';
import { PlaceIcon } from '@dinorpg/core/models/enums/PlaceIcon.js';
import type { PlaceDisplayed } from '@dinorpg/core/models/place/placeDisplayed.js';

export const placeList: Array<PlaceDisplayed> = [
	{
		placeId: 1,
		name: 'port', //OK
		posLeft: 222,
		posTop: 362,
		icon: PlaceIcon.HOUSE,
		map: MapZone.DINOLAND,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 2,
		name: 'market',
		posLeft: 332,
		posTop: 262,
		icon: PlaceIcon.HOUSE,
		map: MapZone.DINOLAND,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 3,
		name: 'papy', //OK
		posLeft: 217,
		posTop: 72,
		icon: PlaceIcon.HOUSE,
		map: MapZone.DINOLAND,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 4,
		name: 'forcebrut', //OK
		posLeft: 272,
		posTop: 207,
		icon: PlaceIcon.CAVERN,
		map: MapZone.DINOLAND,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 5,
		name: 'dnv', //OK
		posLeft: 92,
		posTop: 222,
		icon: PlaceIcon.CASTLE,
		map: MapZone.DINOLAND,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 6,
		name: 'universite', //OK
		posLeft: 112,
		posTop: 142,
		icon: PlaceIcon.CHURCH,
		map: MapZone.DINOLAND,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 7,
		name: 'fountj', //OK
		posLeft: 167,
		posTop: 227,
		icon: PlaceIcon.FOUNT,
		map: MapZone.DINOLAND,
		hidden: false,
		xFactor: 10,
		yFactor: 5
	},
	{
		placeId: 8,
		name: 'colesc', //OK
		posLeft: 102,
		posTop: 87,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DINOLAND,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 9,
		name: 'gogtc',
		posLeft: 62,
		posTop: 32,
		icon: PlaceIcon.NORTH,
		map: MapZone.DINOLAND,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 43
	},
	{
		placeId: 10,
		name: 'goiles',
		posLeft: 182,
		posTop: 402,
		icon: PlaceIcon.SWIM,
		map: MapZone.DINOLAND,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 31
	},
	{
		placeId: 11,
		name: 'skull', //OK
		posLeft: 332,
		posTop: 352,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DINOLAND,
		hidden: true,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 12,
		name: 'goplaz',
		posLeft: 22,
		posTop: 222,
		icon: PlaceIcon.WEST,
		map: MapZone.DINOLAND,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 35
	},
	{
		placeId: 13,
		name: 'gomisl',
		posLeft: 272,
		posTop: 402,
		icon: PlaceIcon.EAST,
		map: MapZone.DINOLAND,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 92
	},
	{
		placeId: 14,
		name: 'auree', //OK
		posLeft: 331,
		posTop: 322,
		icon: PlaceIcon.CAVERN,
		map: MapZone.JUNGLE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 15,
		name: 'chemin', //OK
		posLeft: 312,
		posTop: 240,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.JUNGLE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 16,
		name: 'collin', //OK
		posLeft: 382,
		posTop: 202,
		icon: PlaceIcon.MOUNTAIN,
		map: MapZone.JUNGLE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 17,
		name: 'fleuve', //OK
		posLeft: 327,
		posTop: 110,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.JUNGLE,
		hidden: false,
		xFactor: 1.35,
		yFactor: 5
	},
	{
		placeId: 102,
		name: 'fleuve', //OK
		posLeft: 327,
		posTop: 110,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.JUNGLE,
		hidden: false,
		xFactor: 1.35,
		yFactor: 5
	},
	{
		placeId: 18,
		name: 'camp', //OK
		posLeft: 227,
		posTop: 45,
		icon: PlaceIcon.HOUSE,
		map: MapZone.JUNGLE,
		hidden: true,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 19,
		name: 'jungle', //OK
		posLeft: 75,
		posTop: 166,
		icon: PlaceIcon.FOREST,
		map: MapZone.JUNGLE,
		hidden: true,
		xFactor: 2,
		yFactor: 14
	},
	{
		placeId: 20,
		name: 'garde', //OK
		posLeft: 46,
		posTop: 32,
		icon: PlaceIcon.DOOR,
		map: MapZone.JUNGLE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 21,
		name: 'gostep',
		posLeft: 2,
		posTop: 2,
		icon: PlaceIcon.DOOR,
		map: MapZone.JUNGLE,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 55
	},
	{
		placeId: 22,
		name: 'goorg',
		posLeft: 317,
		posTop: 12,
		icon: PlaceIcon.NORTH,
		map: MapZone.JUNGLE,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 49
	},
	{
		placeId: 23,
		name: 'gochut',
		posLeft: 318,
		posTop: 363,
		icon: PlaceIcon.WATER,
		map: MapZone.JUNGLE,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 25
	},
	{
		placeId: 24,
		name: 'gogrum',
		posLeft: 155,
		posTop: 30,
		icon: PlaceIcon.WATER,
		map: MapZone.ILES,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 14
	},
	{
		placeId: 25,
		name: 'chutes', //OK
		posLeft: 95,
		posTop: 80,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILES,
		hidden: false,
		xFactor: 2.8,
		yFactor: 10
	},
	{
		placeId: 26,
		name: 'rasca',
		posLeft: 102,
		posTop: 119,
		icon: PlaceIcon.RASCA,
		map: MapZone.ILES,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 28
	},
	{
		placeId: 27,
		name: 'baobob', //OK
		posLeft: 199,
		posTop: 72,
		icon: PlaceIcon.HOUSE,
		map: MapZone.ILES,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 28,
		name: 'dome',
		posLeft: 79,
		posTop: 164,
		icon: PlaceIcon.CASTLE,
		map: MapZone.ILES,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 29,
		name: 'marais', //OK
		posLeft: 328,
		posTop: 116,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILES,
		hidden: false,
		xFactor: 1.5,
		yFactor: 10
	},
	{
		placeId: 30,
		name: 'corail', //OK
		posLeft: 471,
		posTop: 137,
		icon: PlaceIcon.CAVERN,
		map: MapZone.ILES,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 31,
		name: 'ilewkk', //OK
		posLeft: 484,
		posTop: 81,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILES,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 32,
		name: 'goport',
		posLeft: 511,
		posTop: 46,
		icon: PlaceIcon.SWIM,
		map: MapZone.ILES,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 1
	},
	{
		placeId: 33,
		name: 'chbroc', //OK
		posLeft: 259,
		posTop: 219,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILES,
		hidden: true,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 34,
		name: 'godnv',
		posLeft: 372,
		posTop: 339,
		icon: PlaceIcon.EAST,
		map: MapZone.DINOWEST,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 5
	},
	{
		placeId: 35,
		name: 'dplaza', //OK
		posLeft: 332,
		posTop: 383,
		icon: PlaceIcon.HOUSE,
		map: MapZone.DINOWEST,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 36,
		name: 'villa', //OK
		posLeft: 177,
		posTop: 377,
		icon: PlaceIcon.HOUSE,
		map: MapZone.DINOWEST,
		hidden: false,
		xFactor: 5,
		yFactor: 10
	},
	{
		placeId: 37,
		name: 'dcine', //OK
		posLeft: 252,
		posTop: 312,
		icon: PlaceIcon.CAVERN,
		map: MapZone.DINOWEST,
		hidden: false,
		xFactor: 10,
		yFactor: 6
	},
	{
		placeId: 38,
		name: 'clinik', //OK
		posLeft: 397,
		posTop: 252,
		icon: PlaceIcon.CLINIK,
		map: MapZone.DINOWEST,
		hidden: false,
		xFactor: 10,
		yFactor: 5
	},
	{
		placeId: 39,
		name: 'chato',
		posLeft: 282,
		posTop: 112,
		icon: PlaceIcon.CASTLE,
		map: MapZone.DINOWEST,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 40,
		name: 'poste',
		posLeft: 282,
		posTop: 172,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DINOWEST,
		hidden: false,
		xFactor: 10,
		yFactor: 3
	},
	{
		placeId: 41,
		name: 'portal',
		posLeft: 330,
		posTop: 162,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DINOWEST,
		hidden: true,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 42,
		name: 'gocol',
		posLeft: 162,
		posTop: 379,
		icon: PlaceIcon.SOUTH,
		map: MapZone.GTOUTCHAUD,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 8
	},
	{
		placeId: 43,
		name: 'bslt', //OK
		posLeft: 114,
		posTop: 336,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.GTOUTCHAUD,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 44,
		name: 'forges', //OK
		posLeft: 225,
		posTop: 237,
		icon: PlaceIcon.CASTLE,
		map: MapZone.GTOUTCHAUD,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 45,
		name: 'rashpk', //OK
		posLeft: 101,
		posTop: 267,
		icon: PlaceIcon.HOUSE,
		map: MapZone.GTOUTCHAUD,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 46,
		name: 'fosslv', //OK
		posLeft: 177,
		posTop: 116,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.GTOUTCHAUD,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 47,
		name: 'vener', //OK
		posLeft: 304,
		posTop: 122,
		icon: PlaceIcon.CAVERN,
		map: MapZone.GTOUTCHAUD,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 48,
		name: 'tunel', //OK
		posLeft: 50,
		posTop: 81,
		icon: PlaceIcon.DOOR,
		map: MapZone.GTOUTCHAUD,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 49,
		name: 'gorges',
		posLeft: 27,
		posTop: 205,
		icon: PlaceIcon.MOUNTAIN,
		map: MapZone.GTOUTCHAUD,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 50,
		name: 'stunel',
		posLeft: 45,
		posTop: 146,
		icon: PlaceIcon.CAVERN,
		map: MapZone.GTOUTCHAUD,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 49
	},
	{
		placeId: 51,
		name: 'gocamp',
		posLeft: 12,
		posTop: 242,
		icon: PlaceIcon.WEST,
		map: MapZone.GTOUTCHAUD,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 18
	},
	{
		placeId: 52,
		name: 'tourbt',
		posLeft: 306,
		posTop: 105,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.GTOUTCHAUD,
		hidden: true,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 53,
		name: 'toursk',
		posLeft: 306,
		posTop: 2,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.GTOUTCHAUD,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 81
	},
	{
		placeId: 54,
		name: 'gosylv',
		posLeft: 842,
		posTop: 477,
		icon: PlaceIcon.FOREST,
		map: MapZone.STEPPE,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 20
	},
	{
		placeId: 55,
		name: 'senter',
		posLeft: 793,
		posTop: 456,
		icon: PlaceIcon.FOREST,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 56,
		name: 'scross',
		posLeft: 787,
		posTop: 317,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 5,
		yFactor: 2.5
	},
	{
		placeId: 57,
		name: 'svillg',
		posLeft: 937,
		posTop: 362,
		icon: PlaceIcon.HOUSE,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 10,
		yFactor: 5
	},
	{
		placeId: 58,
		name: 'sking',
		posLeft: 767,
		posTop: 218,
		icon: PlaceIcon.CASTLE,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 2.5,
		yFactor: 2.5
	},
	{
		placeId: 59,
		name: 'spylon',
		posLeft: 572,
		posTop: 182,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 2.2,
		yFactor: 10
	},
	{
		placeId: 60,
		name: 'slake',
		posLeft: 402,
		posTop: 262,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 1.2,
		yFactor: 3
	},
	{
		placeId: 61,
		name: 'scanyo',
		posLeft: 608,
		posTop: 348,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 2.5,
		yFactor: 10
	},
	{
		placeId: 62,
		name: 'stowr1',
		posLeft: 942,
		posTop: 138,
		icon: PlaceIcon.FOREST,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 63,
		name: 'stowr2',
		posLeft: 488,
		posTop: 62,
		icon: PlaceIcon.FOREST,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 64,
		name: 'stowr3',
		posLeft: 345,
		posTop: 408,
		icon: PlaceIcon.FOREST,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 65,
		name: 'sband1',
		posLeft: 148,
		posTop: 268,
		icon: PlaceIcon.CAVERN,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 1.3,
		yFactor: 10
	},
	{
		placeId: 66,
		name: 'sband2',
		posLeft: 62,
		posTop: 168,
		icon: PlaceIcon.CAVERN,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 5,
		yFactor: 1.5
	},
	{
		placeId: 67,
		name: 'sband3',
		posLeft: 32,
		posTop: 348,
		icon: PlaceIcon.CAVERN,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 10,
		yFactor: 2.2
	},
	{
		placeId: 68,
		name: 'scampw',
		posLeft: 18,
		posTop: 455,
		icon: PlaceIcon.HOUSE,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 69,
		name: 'scaush',
		posLeft: 242,
		posTop: 12,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 5,
		yFactor: 10
	},
	{
		placeId: 70,
		name: 'sport',
		posLeft: 62,
		posTop: 22,
		icon: PlaceIcon.DOOR,
		map: MapZone.STEPPE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 71,
		name: 'sinto1',
		posLeft: 392,
		posTop: 242,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.STEPPE,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 60
	},
	{
		placeId: 101,
		name: 'sinto1',
		posLeft: 392,
		posTop: 242,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.STEPPE,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 69
	},
	{
		placeId: 72,
		name: 'iroche',
		posLeft: 87,
		posTop: 352,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 73,
		name: 'ipont',
		posLeft: 172,
		posTop: 287,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 74,
		name: 'iporte',
		posLeft: 314,
		posTop: 252,
		icon: PlaceIcon.CAVERN,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 3
	},
	{
		placeId: 75,
		name: 'icite',
		posLeft: 452,
		posTop: 202,
		icon: PlaceIcon.CASTLE,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 5
	},
	{
		placeId: 76,
		name: 'ilacro',
		posLeft: 384,
		posTop: 335,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 6,
		yFactor: 10
	},
	{
		placeId: 77,
		name: 'iplain',
		posLeft: 152,
		posTop: 172,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 5,
		yFactor: 10
	},
	{
		placeId: 78,
		name: 'isnow2',
		posLeft: 122,
		posTop: 142,
		icon: PlaceIcon.FOREST,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 79,
		name: 'imont',
		posLeft: 82,
		posTop: 142,
		icon: PlaceIcon.MOUNTAIN,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 80,
		name: 'ihaut',
		posLeft: 82,
		posTop: 92,
		icon: PlaceIcon.CAVERN,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 81,
		name: 'voie',
		posLeft: 457,
		posTop: 124,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 82,
		name: 'observ',
		posLeft: 542,
		posTop: 62,
		icon: PlaceIcon.CHURCH,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 83,
		name: 'ville1',
		posLeft: 314,
		posTop: 192,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 84,
		name: 'ville2',
		posLeft: 332,
		posTop: 132,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 85,
		name: 'sommet',
		posLeft: 262,
		posTop: 82,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 86,
		name: 'palais',
		posLeft: 312,
		posTop: 47,
		icon: PlaceIcon.CASTLE,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 87,
		name: 'egout',
		posLeft: 262,
		posTop: 172,
		icon: PlaceIcon.CAVERN,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 88,
		name: 'ilac',
		posLeft: 302,
		posTop: 402,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 6
	},
	{
		placeId: 89,
		name: 'prison',
		posLeft: 572,
		posTop: 297,
		icon: PlaceIcon.CAVERN,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 90,
		name: 'ilac2',
		posLeft: 542,
		posTop: 372,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 91,
		name: 'tourup',
		posLeft: 418,
		posTop: 112,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.NIMBAO,
		hidden: true,
		alias: 52,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 92,
		name: 'mport',
		posLeft: 94,
		posTop: 77,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILEMONSTRE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 93,
		name: 'mfoutp',
		posLeft: 159,
		posTop: 100,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILEMONSTRE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 94,
		name: 'mfpalc',
		posLeft: 202,
		posTop: 77,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILEMONSTRE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 95,
		name: 'mforst',
		posLeft: 217,
		posTop: 127,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILEMONSTRE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 96,
		name: 'mvoutp',
		posLeft: 137,
		posTop: 137,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILEMONSTRE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 97,
		name: 'mvpalc',
		posLeft: 177,
		posTop: 182,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILEMONSTRE,
		hidden: false,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 98,
		name: 'bkport',
		posLeft: 27,
		posTop: 17,
		icon: PlaceIcon.WEST,
		map: MapZone.ILEMONSTRE,
		hidden: true,
		xFactor: 10,
		yFactor: 10,
		alias: 1
	},
	{
		placeId: 99,
		name: 'mcuzco',
		posLeft: 257,
		posTop: 167,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.ILEMONSTRE,
		hidden: true,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 100,
		name: 'mcelit',
		posLeft: 252,
		posTop: 202,
		icon: PlaceIcon.CAVERN,
		map: MapZone.ILEMONSTRE,
		hidden: true,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 103,
		name: 'dkchut',
		hidden: false,
		posLeft: 105,
		posTop: 70,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 0.5,
		yFactor: 10
	},
	{
		placeId: 104,
		name: 'dktow',
		hidden: false,
		posLeft: 308,
		posTop: 146,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 0.5,
		yFactor: 10
	},
	{
		placeId: 105,
		name: 'dktow2',
		hidden: true,
		posLeft: 328,
		posTop: 126,
		icon: PlaceIcon.DOOR,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 106,
		name: 'dktow3',
		hidden: true,
		posLeft: 332,
		posTop: 92,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 107,
		name: 'dktow4',
		hidden: true,
		posLeft: 334,
		posTop: 67,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 108,
		name: 'dktowa',
		hidden: true,
		posLeft: 317,
		posTop: 52,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 109,
		name: 'dktowb',
		hidden: true,
		posLeft: 357,
		posTop: 52,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 110,
		name: 'dktows',
		hidden: true,
		posLeft: 337,
		posTop: 47,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 111,
		name: 'fake',
		hidden: false,
		posLeft: 111,
		posTop: 182,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 112,
		name: 'fake2',
		hidden: false,
		posLeft: 321,
		posTop: 28,
		icon: PlaceIcon.DEFAULT,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 113,
		name: 'gotow',
		hidden: true,
		posLeft: 328,
		posTop: 126,
		alias: 104,
		icon: PlaceIcon.DOOR,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 114,
		name: 'rechut',
		hidden: true,
		posLeft: 62,
		posTop: 32,
		icon: PlaceIcon.WATER,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	},
	{
		placeId: 115,
		name: 'dkbao',
		hidden: false,
		posLeft: 199,
		posTop: 72,
		icon: PlaceIcon.HOUSE,
		map: MapZone.DARKWORLD,
		xFactor: 10,
		yFactor: 10
	}
];
