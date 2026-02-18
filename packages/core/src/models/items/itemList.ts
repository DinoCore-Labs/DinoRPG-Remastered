import { ElementType } from '../enums/ElementType.js';
import { ItemEffect } from '../enums/ItemEffect.js';
import { ItemType } from '../enums/ItemType.js';
import { MathOperator, Operator } from '../enums/Parser.js';
import { RaceEnum } from '../enums/Race.js';
import { Stat } from '../enums/SkillStat.js';
import { FightStatus } from '../fight/fightStatus.js';
import { SkillFightConditionEnum } from '../skills/skillFightCondition.js';
import { BoxType } from './boxOpening.js';
import { ItemFiche } from './itemFiche.js';

export enum Item {
	POTION_IRMA = 1,
	POTION_ANGEL = 2,
	CLOUD_BURGER = 3,
	HOT_BREAD = 4,
	MEAT_PIE = 5,
	FIGHT_RATION = 6,
	SURVIVING_RATION = 7,
	GOBLIN_MERGUEZ = 8,
	PAMPLEBOUM = 9,
	SOS_HELMET = 10,
	LITTLE_PEPPER = 11,
	ZIPPO = 12,
	SOS_FLAME = 13,
	REFRIGERATED_SHIELD = 14,
	FUCA_PILL = 15,
	MONOCHROMATIC = 16,
	POISONITE_SHOT = 17,
	LORIS_COSTUME = 18,
	VEGETOX_COSTUME = 19,
	GOBLIN_COSTUME = 20,
	PAMPLEBOUM_PIT = 21,
	PORTABLE_LOVE = 22,
	DANGER_DETECTOR = 23,
	PIRHANOZ_IN_BAG = 24,
	DEVIL_OINTMENT = 25,
	LAND_OF_ASHES = 26,
	ABYSS = 27,
	AMAZON = 28,
	ST_ELMAS_FIRE = 29,
	UVAVU = 30,
	STRONG_TEA = 31,
	TEMPORAL_STABILISER = 32,
	ELIXIR = 33,
	ELIXIR_OF_LIFE = 34,
	BANISHMENT = 35,
	BATTERING_RAM = 36,
	EMBER = 37,
	SCALE = 38,
	BEER = 39,
	ENCYCLOPEDIA = 40,
	ANTICHROMATIC = 41,
	ANTIDOTE = 42,
	TIME_MANIPULATOR = 43,
	DIMENSIONAL_POWDER = 44,
	SORCERERS_STICK = 45,
	FRIENDLY_WHISTLE = 46,
	DINOZ_CUBE = 47,
	TEMPORAL_REDUCTION = 48,
	TEAR_OF_LIFE = 49,
	CUZCUSSIAN_MASK = 50,
	ANTI_GRAVE_SUIT = 51,
	ENCHANTED_STEROID = 52,
	CURSE_LOCKER = 53,
	FEAR_FACTOR = 54,
	LIFE_STEALER = 55,
	FIRE_SPHERE = 56,
	WOOD_SPHERE = 57,
	WATER_SPHERE = 58,
	LIGHTNING_SPHERE = 59,
	AIR_SPHERE = 60,
	DEMON_TICKET = 61,
	MOUEFFE_EGG = 62,
	MOUEFFE_EGG_RARE = 63,
	PIGMOU_EGG = 64,
	PIGMOU_EGG_RARE = 65,
	WINKS_EGG = 66,
	WINKS_EGG_RARE = 67,
	PLANAILLE_EGG = 68,
	PLANAILLE_EGG_RARE = 69,
	CASTIVORE_EGG = 70,
	CASTIVORE_EGG_RARE = 71,
	ROCKY_EGG = 72,
	ROCKY_EGG_RARE = 73,
	PTEROZ_EGG = 74,
	PTEROZ_EGG_RARE = 75,
	NUAGOZ_EGG = 76,
	NUAGOZ_EGG_RARE = 77,
	SIRAIN_EGG = 78,
	SIRAIN_EGG_RARE = 79,
	HIPPOCLAMP_EGG = 80,
	HIPPOCLAMP_EGG_RARE = 81,
	GORILLOZ_EGG = 82,
	GORILLOZ_EGG_RARE = 83,
	WANWAN_EGG = 84,
	WANWAN_EGG_RARE = 85,
	WANWAN_BABY_RARE = 86,
	SANTAZ_EGG = 87,
	SANTAZ_EGG_RARE = 88,
	FEROSS_EGG = 89,
	FEROSS_EGG_RARE = 90,
	FEROSS_EGG_CHRISTMAS = 91,
	KABUKI_EGG = 92,
	RARE_KABUKI_EGG = 93,
	MAHAMUTI_EGG = 94,
	RARE_MAHAMUTI_EGG = 95,
	SOUFFLET_EGG = 96,
	SOUFFLET_EGG_RARE = 97,
	TOUFUFU_BABY = 98,
	TOUFUFU_BABY_RARE = 99,
	QUETZU_EGG = 100,
	QUETZU_EGG_RARE = 101,
	SMOG_EGG = 102,
	SMOG_EGG_ANNIVERSARY = 103,
	SMOG_EGG_CHRISTMAS_BLUE = 104,
	SMOG_EGG_CHRISTMAS_GREEN = 105,
	TRICERAGNON_BABY = 106,
	TRICERAGNON_EGG_BABY = 107,
	AMNESIC_RICE = 108,
	TIK_BRACELET = 109,
	MAGIC_STAR = 110,
	GOLDEN_NAPODINO = 111,
	BAMBOO_FRIEND = 112,
	CANDLE_CARD = 113,
	CHRISTMAS_TICKET = 114,
	TICTAC_TICKET = 115,
	DOUBLE_NOT_USED = 116,
	EASTER_EGG = 117,
	FIRE_CRACKER = 118,
	SPECIAL_IRMA_POTION = 119,
	GOLD100 = 120,
	GOLD500 = 121,
	GOLD1000 = 122,
	GOLD2000 = 123,
	GOLD2500 = 124,
	GOLD3000 = 125,
	GOLD5000 = 126,
	GOLD10000 = 127,
	GOLD20000 = 128,
	GOLD50000 = 129,
	CHRISTMAS_EGG = 130,
	GODFATHER_TICKET = 131,
	SAGE_POINT = 132,
	FRAGMENT_A = 133,
	FRAGMENT_B = 134,
	FRAGMENT_C = 135,
	FRAGMENT_D = 136,
	FRAGMENT_E = 137,
	FRAGMENT_F = 138,
	FRAGMENT_G = 139,
	STEPPE_METAL = 140,
	ICE_SHRED = 141,
	BATTERY = 142,
	VOID_SPHERE = 143,
	SMOG_EGG_RARE = 144,
	COUPONS_TREASURE_HANDLER = 991,
	BOX_HANDLER = 992,
	BOX_COMMON = 993,
	BOX_RARE = 994,
	BOX_EPIC = 995,
	BOX_LEGENDARY = 996,
	DAILY_TICKET = 997,
	EMPTY = 998,
	UNDEFINED = 999
}

export const itemNames = [
	'POTION_IRMA',
	'POTION_ANGEL',
	'CLOUD_BURGER',
	'HOT_BREAD',
	'MEAT_PIE',
	'FIGHT_RATION',
	'SURVIVING_RATION',
	'GOBLIN_MERGUEZ',
	'PAMPLEBOUM',
	'SOS_HELMET',
	'LITTLE_PEPPER',
	'ZIPPO',
	'SOS_FLAME',
	'REFRIGERATED_SHIELD',
	'FUCA_PILL',
	'MONOCHROMATIC',
	'POISONITE_SHOT',
	'LORIS_COSTUME',
	'VEGETOX_COSTUME',
	'GOBLIN_COSTUME',
	'PAMPLEBOUM_PIT',
	'PORTABLE_LOVE',
	'DANGER_DETECTOR',
	'PIRHANOZ_IN_BAG',
	'DEVIL_OINTMENT',
	'LAND_OF_ASHES',
	'ABYSS',
	'AMAZON',
	'ST_ELMAS_FIRE',
	'UVAVU',
	'STRONG_TEA',
	'TEMPORAL_STABILISER',
	'ELIXIR',
	'ELIXIR_OF_LIFE',
	'BANISHMENT',
	'BATTERING_RAM',
	'EMBER',
	'SCALE',
	'BEER',
	'ENCYCLOPEDIA',
	'ANTICHROMATIC',
	'ANTIDOTE',
	'TIME_MANIPULATOR',
	'DIMENSIONAL_POWDER',
	'SORCERERS_STICK',
	'FRIENDLY_WHISTLE',
	'DINOZ_CUBE',
	'TEMPORAL_REDUCTION',
	'TEAR_OF_LIFE',
	'CUZCUSSIAN_MASK',
	'ANTI_GRAVE_SUIT',
	'ENCHANTED_STEROID',
	'CURSE_LOCKER',
	'FEAR_FACTOR',
	'LIFE_STEALER',
	'FIRE_SPHERE',
	'WOOD_SPHERE',
	'WATER_SPHERE',
	'LIGHTNING_SPHERE',
	'AIR_SPHERE',
	'VOID_SPHERE',
	'DEMON_TICKET',
	'MOUEFFE_EGG',
	'MOUEFFE_EGG_RARE',
	'PIGMOU_EGG',
	'PIGMOU_EGG_RARE',
	'WINKS_EGG',
	'WINKS_EGG_RARE',
	'PLANAILLE_EGG',
	'PLANAILLE_EGG_RARE',
	'CASTIVORE_EGG',
	'CASTIVORE_EGG_RARE',
	'ROCKY_EGG',
	'ROCKY_EGG_RARE',
	'PTEROZ_EGG',
	'PTEROZ_EGG_RARE',
	'NUAGOZ_EGG',
	'NUAGOZ_EGG_RARE',
	'SIRAIN_EGG',
	'SIRAIN_EGG_RARE',
	'HIPPOCLAMP_EGG',
	'HIPPOCLAMP_EGG_RARE',
	'GORILLOZ_EGG',
	'GORILLOZ_EGG_RARE',
	'WANWAN_EGG',
	'WANWAN_EGG_RARE',
	'WANWAN_BABY_RARE',
	'SANTAZ_EGG',
	'SANTAZ_EGG_RARE',
	'FEROSS_EGG',
	'FEROSS_EGG_RARE',
	'FEROSS_EGG_CHRISTMAS',
	'KABUKI_EGG',
	'RARE_KABUKI_EGG',
	'MAHAMUTI_EGG',
	'RARE_MAHAMUTI_EGG',
	'SOUFFLET_EGG',
	'SOUFFLET_EGG_RARE',
	'TOUFUFU_BABY',
	'TOUFUFU_BABY_RARE',
	'QUETZU_EGG',
	'QUETZU_EGG_RARE',
	'SMOG_EGG',
	'SMOG_EGG_RARE',
	'SMOG_EGG_ANNIVERSARY',
	'SMOG_EGG_CHRISTMAS_BLUE',
	'SMOG_EGG_CHRISTMAS_GREEN',
	'TRICERAGNON_BABY',
	'TRICERAGNON_EGG_BABY',
	'AMNESIC_RICE',
	'TIK_BRACELET',
	'MAGIC_STAR',
	'GOLDEN_NAPODINO',
	'BAMBOO_FRIEND',
	'CANDLE_CARD',
	'CHRISTMAS_TICKET',
	'TICTAC_TICKET',
	'DOUBLE_NOT_USED',
	'EASTER_EGG',
	'FIRE_CRACKER',
	'SPECIAL_IRMA_POTION',
	'GOLD100',
	'GOLD500',
	'GOLD1000',
	'GOLD2000',
	'GOLD2500',
	'GOLD3000',
	'GOLD5000',
	'GOLD10000',
	'GOLD20000',
	'GOLD50000',
	'CHRISTMAS_EGG',
	'GODFATHER_TICKET',
	'SAGE_POINT',
	'FRAGMENT_A',
	'FRAGMENT_B',
	'FRAGMENT_C',
	'FRAGMENT_D',
	'FRAGMENT_E',
	'FRAGMENT_F',
	'FRAGMENT_G',
	'STEPPE_METAL',
	'ICE_SHRED',
	'BATTERY',
	'BOX_HANDLER',
	'BOX_COMMON',
	'BOX_RARE',
	'BOX_EPIC',
	'BOX_LEGENDARY',
	'DAILY_TICKET',
	'EMPTY',
	'UNDEFINED'
] as const;

export type ItemName = (typeof itemNames)[number];

// Note:
// Price is for the players' market.
export const itemList: Readonly<Record<Item, ItemFiche>> = {
	// Irma's Potion: new action
	[Item.POTION_IRMA]: {
		itemId: 1,
		name: 'potion_irma',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 999,
		price: 900, // TODO double check
		effect: {
			category: ItemEffect.ACTION,
			value: 1
		},
		sellable: false,
		display: 'irma'
	},
	// Angel potion: resurrects a dino
	[Item.POTION_ANGEL]: {
		itemId: 2,
		name: 'potion_angel',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 100,
		price: 1000, // TODO double check
		effect: {
			category: ItemEffect.RESURRECT,
			value: 1
		},
		sellable: false,
		display: 'angel'
	},
	// Cloud burger: heals 10
	[Item.CLOUD_BURGER]: {
		itemId: 3,
		name: 'cloud_burger',
		canBeEquipped: true,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 300,
		price: 350, // TODO double check
		effect: {
			category: ItemEffect.HEAL,
			value: 10
		},
		priority: 1,
		probability: 50,
		sellable: false,
		display: 'burger',
		fightCondition: {
			[Operator.AND]: [
				{
					[Operator.NOT]: {
						[SkillFightConditionEnum.FULL_HP]: true
					}
				},
				{
					[Operator.OR]: [{ [SkillFightConditionEnum.MAX_HP]: 15 }, { [SkillFightConditionEnum.LOST_HP_0]: 10 }]
				}
			]
		}
	},
	// Authentic hot bread: heals 100
	[Item.HOT_BREAD]: {
		itemId: 4,
		name: 'hot_bread',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 100,
		price: 3000, // TODO double check
		effect: {
			category: ItemEffect.HEAL,
			value: 100
		},
		sellable: false,
		display: 'hotpan'
	},
	// Meat pie: heals 30
	[Item.MEAT_PIE]: {
		itemId: 5,
		name: 'meat_pie',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 200,
		price: 1000, // TODO double check
		effect: {
			category: ItemEffect.HEAL,
			value: 30
		},
		sellable: false,
		display: 'tartev'
	},
	// Fight ration: heals up to 20 during a fight
	[Item.FIGHT_RATION]: {
		itemId: 6,
		name: 'fight_ration',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 100,
		price: 500, // TODO double check
		priority: 1,
		probability: 50,
		fightCondition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [SkillFightConditionEnum.FULL_HP]: true } },
				{ [SkillFightConditionEnum.LOST_HP_1]: 20 }
			]
		},
		sellable: false,
		display: 'ration'
	},
	// Surviving ration: heals between 10 and 40 during a fight
	[Item.SURVIVING_RATION]: {
		itemId: 7,
		name: 'surviving_ration',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 100,
		price: 500, // TODO double check
		priority: 1,
		probability: 50,
		fightCondition: {
			[Operator.AND]: [{ [SkillFightConditionEnum.LOST_HP_0]: 11 }, { [SkillFightConditionEnum.LOST_HP_2]: 50 }]
		},
		sellable: false,
		display: 'surviv'
	},
	// Goblin's Merguez: heals ?? during a fight
	[Item.GOBLIN_MERGUEZ]: {
		itemId: 8,
		name: 'goblin_merguez',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 20,
		price: 500, // TODO double check
		priority: 1,
		probability: 20,
		sellable: false,
		display: 'mergz',
		fightCondition: {
			[Operator.NOT]: {
				[SkillFightConditionEnum.FULL_HP]: true
			}
		}
	},
	// Pampleboum: heals 15
	[Item.PAMPLEBOUM]: {
		itemId: 9,
		name: 'pampleboum',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 20,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'pampleboum'
		},
		sellable: true,
		price: 500, // TODO double check
		display: 'fruit'
	},
	// SOS Helmet: increases armor by 1 in a fight
	[Item.SOS_HELMET]: {
		itemId: 10,
		name: 'sos_helmet',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 50,
		price: 150, // TODO double check
		priority: 1,
		sellable: true,
		probability: 50,
		display: 'hlmsos'
	},
	// Little pepper: increases next assault value by 10
	[Item.LITTLE_PEPPER]: {
		itemId: 11,
		name: 'little_pepper',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150, // TODO double check
		priority: 1,
		sellable: true,
		probability: 50,
		display: 'ppoiv'
	},
	// Zippo: Set dino on fire during a fight
	[Item.ZIPPO]: {
		itemId: 12,
		name: 'zippo',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150, // TODO double check
		priority: 1,
		sellable: true,
		probability: 50,
		display: 'zippo'
	},
	// SOS flame: summons a flame to fight with you
	[Item.SOS_FLAME]: {
		itemId: 13,
		name: 'sos_flame',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150, // TODO double check
		priority: 1,
		sellable: true,
		probability: 50,
		display: 'flamch'
	},
	// Refrigerated Shield: Increases fire defense by 20 during a fight
	[Item.REFRIGERATED_SHIELD]: {
		itemId: 14,
		name: 'refrigerated_shield',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150, // TODO double check
		priority: 1,
		sellable: true,
		probability: 50,
		display: 'combi'
	},
	// Fuca Pill: increases attack speed by 50% during a fight
	[Item.FUCA_PILL]: {
		itemId: 15,
		name: 'fuca_pill',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 20,
		price: 1000,
		priority: 3,
		sellable: true,
		probability: 20,
		display: 'fuca',
		fightCondition: {
			[Operator.AND]: [
				{
					[Operator.NOT]: {
						[SkillFightConditionEnum.ITEM_USED]: Item.FUCA_PILL
					}
				},
				{ [SkillFightConditionEnum.MIN_SPEED]: 0.51 }
			]
		}
	},
	// Monochromatic: all standards assault hit of the highest element of the dino during a fight (but speed follows normal rotation)
	[Item.MONOCHROMATIC]: {
		itemId: 16,
		name: 'monochromatic',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 20,
		price: 5000,
		priority: 5,
		sellable: true,
		probability: 15,
		display: 'monoch',
		fightCondition: {
			[SkillFightConditionEnum.MIN_ELEMENTS]: 2
		}
	},
	// Poisonite Shot: heals poison during a fight / prevents to be poisoned during a fight??
	[Item.POISONITE_SHOT]: {
		itemId: 17,
		name: 'poisonite_shot',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 20,
		sellable: true,
		price: 300,
		display: 'antip'
	},
	// Loris's Costume: makes an enemy attack someone else on his side during a fight
	[Item.LORIS_COSTUME]: {
		itemId: 18,
		name: 'loris_costume',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 400,
		priority: 4,
		sellable: true,
		probability: 30,
		display: 'confus',
		fightCondition: {
			[SkillFightConditionEnum.MIN_OPPONENTS]: [[], 2]
		}
	},
	// Vegetox Guard's Costume: Disguise a dino into a vegetox guard
	[Item.VEGETOX_COSTUME]: {
		itemId: 19,
		name: 'vegetox_costume',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		sellable: true,
		price: 1000,
		display: 'costve'
	},
	// Goblin's Costume: Disguise a dino into a gobelin
	[Item.GOBLIN_COSTUME]: {
		itemId: 20,
		name: 'goblin_costume',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		sellable: true,
		price: 1000,
		display: 'costgb'
	},
	// Pampleboum Pit: give a bonus to an assault (%, fixed valued??)
	[Item.PAMPLEBOUM_PIT]: {
		itemId: 21,
		name: 'pampleboum_pit',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 30,
		price: 1234, // TODO double check
		priority: 1,
		sellable: true,
		probability: 50,
		display: 'noyau'
	},
	// Portable Love: can attack flying dinoz
	[Item.PORTABLE_LOVE]: {
		itemId: 22,
		name: 'portable_love',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 300,
		priority: 1,
		sellable: true,
		probability: 70,
		display: 'amour',
		fightCondition: {
			[Operator.AND]: [
				{ [SkillFightConditionEnum.OPPONENT_STATUS]: FightStatus.FLYING },
				{ [Operator.NOT]: { [SkillFightConditionEnum.CAN_HIT_FLYING]: true } }
			]
		}
	},
	// Danger Detector: protects against an attack that inflicts more than 25 hp
	[Item.DANGER_DETECTOR]: {
		itemId: 23,
		name: 'danger_detector',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		sellable: true,
		price: 4000,
		display: 'danger'
	},
	// Pirhanoz in bag: summons a pirhanoz
	[Item.PIRHANOZ_IN_BAG]: {
		itemId: 24,
		name: 'pirhanoz_in_bag',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CURSED,
		isRare: false,
		maxQuantity: 10,
		price: 1234, // TODO double check
		priority: 1,
		sellable: true,
		probability: 50,
		display: 'piran'
	},
	// Devil Ointment: removes the curse from a dino, and restoring its ability
	// to gain XP during fights.
	[Item.DEVIL_OINTMENT]: {
		itemId: 25,
		name: 'devil_ointment',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CURSED,
		isRare: true,
		maxQuantity: 10, // TODO double check
		price: 5000,
		sellable: true,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'ointment'
		},
		display: 'odemon'
	},
	// Land of Ashes (Ember): turns the combat zone into a suffocating furnace.
	// All Dinoz with a Fire element of less than 10 points will no longer use elements
	// A or E for the next three turns.
	[Item.LAND_OF_ASHES]: {
		itemId: 26,
		name: 'land_of_ashes',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 2000,
		priority: 1,
		sellable: true,
		probability: 100,
		display: 'cendre',
		fightCondition: {
			[SkillFightConditionEnum.ENVIRONMENT]: true
		}
	},
	// Abyss: plunges the combat zone into an abyss.
	// All Dinoz with a Water element of less than 10 points will see the strength
	// of their attacks and assaults drop by 25% for the next three turns.
	[Item.ABYSS]: {
		itemId: 27,
		name: 'abyss',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 2000,
		priority: 1,
		sellable: true,
		probability: 100,
		display: 'abysse',
		fightCondition: {
			[SkillFightConditionEnum.ENVIRONMENT]: true
		}
	},
	// Amazon: transports the combat zone into the middle of a tropical jungle.
	// All Dinoz with a Wood element of less than 10 points will sleep for the
	// next three turns unless they are subjected to an attack which causes them to lose 10 HP.
	[Item.AMAZON]: {
		itemId: 28,
		name: 'amazon',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 2000,
		priority: 1,
		sellable: true,
		probability: 100,
		display: 'amazon',
		fightCondition: {
			[SkillFightConditionEnum.ENVIRONMENT]: true
		}
	},
	// St Elma's Fire: surrounds the combat zone with a powerful magnetic field.
	// All Dinoz with a Lightning element of less than 10 points will lose 5% of
	// their HP for the next three turns.
	[Item.ST_ELMAS_FIRE]: {
		itemId: 29,
		name: 'st_elmas_fire',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 2000,
		priority: 1,
		sellable: true,
		probability: 100,
		display: 'stelme',
		fightCondition: {
			[SkillFightConditionEnum.ENVIRONMENT]: true
		}
	},
	// Uvavu: plunges the combat zone into the middle of a devastating storm.
	// All Dinoz with an Air element of less than 10 points will lose 50% of
	// their speed for the next three turns.
	[Item.UVAVU]: {
		itemId: 30,
		name: 'uvavu',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 2000,
		priority: 1,
		sellable: true,
		probability: 100,
		display: 'ourano',
		fightCondition: {
			[SkillFightConditionEnum.ENVIRONMENT]: true
		}
	},
	// Strong Tea: allows you to cancel the effects of beer on the opposing team.
	[Item.STRONG_TEA]: {
		itemId: 31,
		name: 'strong_tea',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 2000,
		priority: 1,
		sellable: true,
		probability: 60,
		display: 'cofee',
		fightCondition: {
			[Operator.NOT]: {
				[SkillFightConditionEnum.TEAM_STATUS]: FightStatus.BEER
			}
		}
	},
	// Temporal Stabiliser: ??
	[Item.TEMPORAL_STABILISER]: {
		itemId: 32,
		name: 'temporal_stabiliser',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		sellable: true,
		price: 3000,
		display: 'ptime'
	},
	// Elixir: heals 200, Chen's shop
	[Item.ELIXIR]: {
		itemId: 33,
		name: 'elixir',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 20,
		effect: {
			category: ItemEffect.HEAL,
			value: 200
		},
		sellable: true,
		price: 1234, // TODO double check
		display: 'remed2'
	},

	// Elixir of Life: quest item to heal the Venerable Dragon
	[Item.ELIXIR_OF_LIFE]: {
		itemId: 34,
		name: 'elixir_of_life',
		canBeEquipped: false, // TODO double check
		canBeUsedNow: false, // TODO double check
		itemType: ItemType.CLASSIC,
		isRare: false,
		sellable: false,
		maxQuantity: 100, // TODO double check
		price: 1234, // TODO double check
		display: 'remede'
	},
	// Banishement: prevents a dinoz from calling reinforcements during a battle
	[Item.BANISHMENT]: {
		itemId: 35,
		name: 'banishement',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 3, // TODO double check
		display: 'mbann'
	},
	// Battering Ram: dinoz attacks castle twice if victorious
	[Item.BATTERING_RAM]: {
		itemId: 36,
		name: 'battering_ram',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 5, // TODO double check
		display: 'mbeli'
	},
	// Ember (braise): increases fire assault of all fighters by 30%
	[Item.EMBER]: {
		itemId: 37,
		name: 'ember',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 5, // TODO double check
		display: 'mbraise'
	},
	// Scale: an enemy dinoz will be killed if your dinoz dies during a fight
	[Item.SCALE]: {
		itemId: 38,
		name: 'scale',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 7, // TODO double check
		display: 'mbalan'
	},
	// Beer: prevents all dinoz from healing during a fight
	[Item.BEER]: {
		itemId: 39,
		name: 'beer',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 3, // TODO double check
		display: 'mbeer'
	},
	// Encyclopedia: increases experience gain by 15%
	[Item.ENCYCLOPEDIA]: {
		itemId: 40,
		name: 'encyclopedia',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 6, // TODO double check
		display: 'mencly'
	},
	// Antichromatic: cancels the effect of monochromatics used by the enemy
	[Item.ANTICHROMATIC]: {
		itemId: 41,
		name: 'antichromatic',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 4, // TODO double check
		display: 'mantic'
	},
	// Antidote: permanently immunize against poisons
	[Item.ANTIDOTE]: {
		itemId: 42,
		name: 'antidote',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 5, // TODO double check
		display: 'mantip'
	},
	// Time Manipulator (Temporary Manipulator?): prevents all dinoz from using E skills in a fight
	[Item.TIME_MANIPULATOR]: {
		itemId: 43,
		name: 'time_manipulator',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 5, // TODO double check
		display: 'mtime'
	},
	// Dimensional Powder (Parallel Dimension?): if the dinoz HP falls below 10%, it will be engulfed in a black hole
	// and leave the fight
	[Item.DIMENSIONAL_POWDER]: {
		itemId: 44,
		name: 'dimensional_powder',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 6, // TODO double check
		display: 'mpdim'
	},
	// Sorcerer's Stick: reduces the hp of a random (enemy?) dinoz by 30% (It replaces an attack)
	[Item.SORCERERS_STICK]: {
		itemId: 45,
		name: 'sorcerers_stick',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 7, // TODO double check
		display: 'mbaget'
	},
	// Friendly Whistle: when the dinoz launches an assault on another dinoz, the other friendly dinoz (without whistle) will
	// attack it too
	[Item.FRIENDLY_WHISTLE]: {
		itemId: 46,
		name: 'friendly_whistle',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 8, // TODO double check
		display: 'mhelp'
	},
	// Dinoz Cube: allows the dinoz to redraw from the element grid when it levels up until level 10. Like Career Plan
	// (Does not cumulate though with Career Plan though)
	[Item.DINOZ_CUBE]: {
		itemId: 47,
		name: 'dinoz_cube',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 9, // TODO double check
		display: 'plandc'
	},
	// Temporal Reduction: reduces initiative bonuses and penalties by 50% on the equipped dinoz
	[Item.TEMPORAL_REDUCTION]: {
		itemId: 48,
		name: 'temporal_reduction',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 5, // TODO double check
		display: 'dampt'
	},
	// Tear of Life: gives clones 10% of the life of the casting Dinoz
	[Item.TEAR_OF_LIFE]: {
		itemId: 49,
		name: 'tear_of_life',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 6, // TODO double check
		display: 'tearlf'
	},
	// Cuzcussian Mask: makes the wearer's teammates immune to Hypnosis
	[Item.CUZCUSSIAN_MASK]: {
		itemId: 50,
		name: 'cuzcussian_mask',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 8, // TODO double check
		display: 'mindim'
	},
	// Anti-grave Suit: makes the wearer's teammates immune to Black Hole
	[Item.ANTI_GRAVE_SUIT]: {
		itemId: 51,
		name: 'anti_grave_suit',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 6, // TODO double check
		display: 'agrav'
	},
	// Enchanted Steroid: makes the equipped dinoz immune to penalties to max endurance
	[Item.ENCHANTED_STEROID]: {
		itemId: 52,
		name: 'enchanted_steroid',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 6, // TODO double check
		display: 'stero'
	},
	// Curse Locker: restricts a random enemy to using their weakest element for 4 cycles
	[Item.CURSE_LOCKER]: {
		itemId: 53,
		name: 'curse_locker',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 4, // TODO double check
		display: 'loking'
	},
	// Fear Factor (Trouillomètre): a dinoz with the Brave skill but which carries this\
	// object can now form groups with dinoz with the same key element as they do
	[Item.FEAR_FACTOR]: {
		itemId: 54,
		name: 'fear_factor',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 8, // TODO double check
		display: 'trouil'
	},
	// Life Stealer: when the wearer's hp falls below 20, it steals 30 hp to a random enemy
	[Item.LIFE_STEALER]: {
		itemId: 55,
		name: 'life_stealer',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		sellable: false,
		price: 0, // TODO double check
		display: 'vlife'
	},
	// Fire Sphere
	[Item.FIRE_SPHERE]: {
		itemId: 56,
		name: 'fire_sphere',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.FIRE
		},
		sellable: true,
		price: 10000, // TODO double check
		display: 'spher1'
	},
	// Wood Sphere
	[Item.WOOD_SPHERE]: {
		itemId: 57,
		name: 'wood_sphere',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.WOOD
		},
		sellable: true,
		price: 10000, // TODO double check
		display: 'spher2'
	},
	// Water Sphere
	[Item.WATER_SPHERE]: {
		itemId: 58,
		name: 'water_sphere',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.WATER
		},
		sellable: true,
		price: 10000, // TODO double check
		display: 'spher3'
	},
	// Lightning Sphere
	[Item.LIGHTNING_SPHERE]: {
		itemId: 59,
		name: 'lightning_sphere',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.LIGHTNING
		},
		sellable: true,
		price: 10000, // TODO double check
		display: 'spher4'
	},
	// Air Sphere
	[Item.AIR_SPHERE]: {
		itemId: 60,
		name: 'air_sphere',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.AIR
		},
		sellable: true,
		price: 10000, // TODO double check
		display: 'spher5'
	},
	// Demon Ticket
	[Item.DEMON_TICKET]: {
		itemId: 61,
		name: 'demon_ticket',
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 8000,
		sellable: false,
		price: 0,
		display: 'demtix'
	},
	// Some of those eggs may not exist, yet they should be added for consistency
	// The order matches the order in constants/race.ts
	// Moueffe Egg
	[Item.MOUEFFE_EGG]: {
		itemId: 63,
		name: 'moueffe_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.MOUEFFE
		},
		sellable: true,
		maxQuantity: 10,
		price: 10000,
		display: 'mouef1'
	},
	// Rare Moueffe Egg
	[Item.MOUEFFE_EGG_RARE]: {
		itemId: 64,
		name: 'moueffe_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.MOUEFFE
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'mouef2'
	},
	// Pigmou Egg
	[Item.PIGMOU_EGG]: {
		itemId: 65,
		name: 'pigmou_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.PIGMOU
		},
		sellable: true,
		maxQuantity: 10,
		price: 14000,
		display: 'pig'
	},
	// Rare Pigmou Egg
	[Item.PIGMOU_EGG_RARE]: {
		itemId: 66,
		name: 'pigmou_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.PIGMOU
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'pigm'
	},
	// Winks Egg
	[Item.WINKS_EGG]: {
		itemId: 67,
		name: 'winks_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.WINKS
		},
		sellable: true,
		maxQuantity: 10,
		price: 14000,
		display: 'winks'
	},
	// Rare Winks Egg
	[Item.WINKS_EGG_RARE]: {
		itemId: 68,
		name: 'winks_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.WINKS
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'winks2'
	},
	// Planaille Egg
	[Item.PLANAILLE_EGG]: {
		itemId: 69,
		name: 'planaille_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.PLANAILLE
		},
		sellable: true,
		maxQuantity: 10,
		price: 10000,
		display: 'plan'
	},
	// Rare Planaille Egg
	[Item.PLANAILLE_EGG_RARE]: {
		itemId: 70,
		name: 'planaille_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.PLANAILLE
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'plan2'
	},
	// Castivore Egg
	[Item.CASTIVORE_EGG]: {
		itemId: 71,
		name: 'castivore_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.CASTIVORE
		},
		sellable: true,
		maxQuantity: 10,
		price: 10000,
		display: 'casti'
	},
	// Rare Castivore Egg
	[Item.CASTIVORE_EGG_RARE]: {
		itemId: 72,
		name: 'castivore_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.CASTIVORE
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'casti2'
	},
	// Rocky Egg
	[Item.ROCKY_EGG]: {
		itemId: 73,
		name: 'rocky_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.ROCKY
		},
		sellable: true,
		maxQuantity: 10,
		price: 12000,
		display: 'rocky'
	},
	// Rare Rocky Egg
	[Item.ROCKY_EGG_RARE]: {
		itemId: 74,
		name: 'rocky_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.ROCKY
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'rocky2'
	},
	// Pteroz Egg
	[Item.PTEROZ_EGG]: {
		itemId: 75,
		name: 'pteroz_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.PTEROZ
		},
		sellable: true,
		maxQuantity: 10,
		price: 16000,
		display: 'ptero'
	},
	// Rare Pteroz Egg
	[Item.PTEROZ_EGG_RARE]: {
		itemId: 76,
		name: 'pteroz_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.PTEROZ
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'ptero2'
	},
	// Nuagoz Egg
	[Item.NUAGOZ_EGG]: {
		itemId: 77,
		name: 'nuagoz_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.NUAGOZ
		},
		sellable: true,
		maxQuantity: 10,
		price: 10000,
		display: 'nuago'
	},
	// Rare Nuagoz Egg
	[Item.NUAGOZ_EGG_RARE]: {
		itemId: 78,
		name: 'nuagoz_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.NUAGOZ
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'nuago2'
	},
	// Sirain Egg
	[Item.SIRAIN_EGG]: {
		itemId: 79,
		name: 'sirain_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SIRAIN
		},
		sellable: true,
		maxQuantity: 10,
		price: 10000,
		display: 'sirai'
	},
	// Rare Sirain Egg
	[Item.SIRAIN_EGG_RARE]: {
		itemId: 80,
		name: 'sirain_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SIRAIN
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'sirain'
	},
	// Hippoclamp Egg
	[Item.HIPPOCLAMP_EGG]: {
		itemId: 81,
		name: 'hippoclamp_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.HIPPOCLAMP
		},
		sellable: true,
		maxQuantity: 10,
		price: 22000,
		display: 'hippo'
	},
	// Rare Hippoclamp Egg
	[Item.HIPPOCLAMP_EGG_RARE]: {
		itemId: 82,
		name: 'hippoclamp_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.HIPPOCLAMP
		},
		sellable: true,
		maxQuantity: 10, // TODO double check
		price: 30000, // TODO double check
		display: 'hippo2'
	},
	// Gorilloz Egg
	[Item.GORILLOZ_EGG]: {
		itemId: 83,
		name: 'gorilloz_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.GORILLOZ
		},
		sellable: true,
		maxQuantity: 10,
		price: 10000,
		display: 'goegg'
	},
	// Rare Gorilloz Egg
	[Item.GORILLOZ_EGG_RARE]: {
		itemId: 84,
		name: 'gorilloz_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.GORILLOZ
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'goegg1'
	},
	// Wanwan Egg
	[Item.WANWAN_EGG]: {
		itemId: 85,
		name: 'wanwan_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.WANWAN
		},
		sellable: true,
		maxQuantity: 10,
		price: 13000,
		display: 'wan'
	},
	// Rare Wanwan Egg
	[Item.WANWAN_EGG_RARE]: {
		itemId: 86,
		name: 'wanwan_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.WANWAN
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'wan1'
	},
	// Rare Wanwan Baby
	[Item.WANWAN_BABY_RARE]: {
		itemId: 87,
		name: 'wanwan_baby_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.WANWAN
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'wan2'
	},
	// Santaz Egg
	[Item.SANTAZ_EGG]: {
		itemId: 88,
		name: 'santaz_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SANTAZ
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'stzegg'
	},
	// Rare Santaz Egg
	[Item.SANTAZ_EGG_RARE]: {
		itemId: 89,
		name: 'santaz_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SANTAZ
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'stzegg2'
	},
	// Feross Egg
	[Item.FEROSS_EGG]: {
		itemId: 90,
		name: 'feross_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.FEROSS
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'feregg'
	},
	// Rare Feross Egg
	[Item.FEROSS_EGG_RARE]: {
		itemId: 91,
		name: 'feross_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.FEROSS
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'feregg2'
	},
	// Christmas Feross Egg
	[Item.FEROSS_EGG_CHRISTMAS]: {
		itemId: 92,
		name: 'feross_egg_christmas',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.FEROSS
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'feregg3'
	},
	// Kabuki Egg
	[Item.KABUKI_EGG]: {
		itemId: 93,
		name: 'kabuki_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.KABUKI
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'kabegg'
	},
	// Rare Kabuki Egg
	[Item.RARE_KABUKI_EGG]: {
		itemId: 94,
		name: 'kabuki_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.KABUKI
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'kabegg2'
	},
	// Mahamuti Egg
	[Item.MAHAMUTI_EGG]: {
		itemId: 95,
		name: 'mahamuti_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.MAHAMUTI
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'mamegg'
	},
	// Rare Mahamuti Egg
	[Item.RARE_MAHAMUTI_EGG]: {
		itemId: 96,
		name: 'mahamuti_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.MAHAMUTI
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'mamegg2'
	},
	// Soufflet Egg
	[Item.SOUFFLET_EGG]: {
		itemId: 97,
		name: 'souffet_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SOUFFLET
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'soufle'
	},
	// Rare Soufflet Egg
	[Item.SOUFFLET_EGG_RARE]: {
		itemId: 98,
		name: 'soufflet_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SOUFFLET
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000, // TODO double check
		display: 'soufle2'
	},
	// Toufufu Baby
	[Item.TOUFUFU_BABY]: {
		itemId: 99,
		name: 'toufufu_baby',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.TOUFUFU
		},
		sellable: true,
		maxQuantity: 10, // yes it's 2 in game
		price: 30000,
		display: 'tufufu'
	},
	// Rare Toufufu Baby
	[Item.TOUFUFU_BABY_RARE]: {
		itemId: 100,
		name: 'toufufu_baby_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.TOUFUFU
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'tufeg2'
	},
	// Quetzu Egg
	[Item.QUETZU_EGG]: {
		itemId: 101,
		name: 'quetzu_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.QUETZU
		},
		sellable: true,
		maxQuantity: 10, // TODO double check
		price: 30000, // TODO double check
		display: 'quetz'
	},
	// Rare Quetzu Egg
	[Item.QUETZU_EGG_RARE]: {
		itemId: 102,
		name: 'quetzu_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.QUETZU
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'quetzu'
	},
	// Smog Egg
	[Item.SMOG_EGG]: {
		itemId: 103,
		name: 'smog_egg',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SMOG
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'smegg2'
	},
	// Smog Rare Egg
	[Item.SMOG_EGG_RARE]: {
		itemId: 144,
		name: 'smog_egg_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SMOG
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'smegg3'
	},
	// Anniversary Smog Egg
	[Item.SMOG_EGG_ANNIVERSARY]: {
		itemId: 104,
		name: 'smog_egg_anniversary',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SMOG
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'smegg3'
	},
	// Christmas Blue Smog Egg
	[Item.SMOG_EGG_CHRISTMAS_BLUE]: {
		itemId: 105,
		name: 'smog_egg_christmas_blue',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SMOG
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'smegg'
	},
	// Christmas Blue Smog Egg
	[Item.SMOG_EGG_CHRISTMAS_GREEN]: {
		itemId: 106,
		name: 'smog_egg_christmas_green',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SMOG
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'smegg4'
	},
	// Triceragnon Baby
	[Item.TRICERAGNON_BABY]: {
		itemId: 107,
		name: 'triceragnon_baby',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.TRICERAGNON
		},
		sellable: true,
		maxQuantity: 10,
		price: 30000,
		display: 'triceg'
	},
	// Rare Triceragnon Baby
	[Item.TRICERAGNON_EGG_BABY]: {
		itemId: 108,
		name: 'triceragnon_baby_rare',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.TRICERAGNON
		},
		sellable: true,
		maxQuantity: 10, // TODO double check
		price: 30000, // TODO double check
		display: 'triceg2'
	},
	// Amnesic Rice
	[Item.AMNESIC_RICE]: {
		itemId: 109,
		name: 'amnesic_rice',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'rice'
		},
		sellable: true,
		maxQuantity: 25,
		price: 5000,
		display: 'riz'
	},
	// Tik Bracelet: heals 10 to the wearer each day
	[Item.TIK_BRACELET]: {
		itemId: 110,
		name: 'tik_bracelet',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 25,
		sellable: false,
		price: 0,
		display: 'regen'
	},
	// Magic Star: used for the Strange Creature quest
	[Item.MAGIC_STAR]: {
		itemId: 111,
		name: 'magic_star',
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 7,
		sellable: false,
		price: 0,
		display: 'star'
	},
	// Golden Napodino: currency at the Magic Shop
	[Item.GOLDEN_NAPODINO]: {
		itemId: 112,
		name: 'golden_napodino',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 100,
		sellable: false,
		price: 0,
		display: 'cgold',
		passiveEffect: {
			[Stat.CRITICAL_HIT_CHANCE]: { operator: MathOperator.MULTIPLY, value: 1.01 }
		}
	},
	// Brings a little bamboo with you in each fight
	[Item.BAMBOO_FRIEND]: {
		itemId: 113,
		name: 'bamboo_friend',
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 10,
		sellable: false,
		price: 0, // TODO double check
		display: 'bamboo'
	},
	// Anniversary tickets
	[Item.CANDLE_CARD]: {
		itemId: 114,
		name: 'candle_card',
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: true,
		price: 5000,
		display: 'bougie'
	},
	// Tickets to use at the Christmas grid event
	[Item.CHRISTMAS_TICKET]: {
		itemId: 115,
		name: 'christmas_ticket',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: true,
		price: 5000, // TODO double check
		display: 'xmtix'
	},
	// Tickets to use at ??
	[Item.TICTAC_TICKET]: {
		itemId: 116,
		name: 'tictac_ticket',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 36,
		sellable: true,
		price: 5000, // TODO double check
		display: 'tictac'
	},
	// Error
	[Item.DOUBLE_NOT_USED]: {
		itemId: 117,
		name: 'anniversary_ticket',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		sellable: false,
		maxQuantity: 999, // TODO double check
		price: 0, // TODO double check
		display: 'DOUBLE'
	},
	// Use to obtain ??, obtained during Easter event
	[Item.EASTER_EGG]: {
		itemId: 118,
		name: 'easter_egg',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		sellable: true,
		maxQuantity: 999, // TODO double check
		price: 10000, // TODO double check
		display: 'paques'
	},
	// Ticket for Batide day
	[Item.FIRE_CRACKER]: {
		itemId: 119,
		name: 'fire_cracker',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		sellable: true,
		maxQuantity: 5000,
		price: 5000,
		display: 'petard'
	},
	// Like an irma potion, would be obtained daily from the monthly subscription
	[Item.SPECIAL_IRMA_POTION]: {
		itemId: 120,
		name: 'special_potion_irma',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 0, // TODO double check
		display: 'irma2'
	},
	//Used for special gather
	[Item.GOLD100]: {
		itemId: 121,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 100, // TODO double check
		display: 'gold'
	},
	//Used for special gather
	[Item.GOLD500]: {
		itemId: 122,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 500, // TODO double check
		display: 'GOLD500'
	},
	//Used for special gather
	[Item.GOLD1000]: {
		itemId: 123,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 1000, // TODO double check
		display: 'GOLD1000'
	},
	//Used for special gather
	[Item.GOLD2000]: {
		itemId: 124,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 2000, // TODO double check
		display: 'GOLD2000'
	},
	//Used for special gather
	[Item.GOLD2500]: {
		itemId: 125,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 2500, // TODO double check
		display: 'GOLD2500'
	},
	//Used for special gather
	[Item.GOLD3000]: {
		itemId: 126,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 3000, // TODO double check
		display: 'GOLD3000'
	},
	//Used for special gather
	[Item.GOLD5000]: {
		itemId: 127,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 5000, // TODO double check
		display: 'GOLD5000'
	},
	//Used for special gather
	[Item.GOLD10000]: {
		itemId: 128,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 10000, // TODO double check
		display: 'GOLD10000'
	},
	//Used for special gather
	[Item.GOLD20000]: {
		itemId: 129,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 20000, // TODO double check
		display: 'GOLD20000'
	},
	[Item.GOLD50000]: {
		itemId: 129,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		sellable: false,
		price: 50000, // TODO double check
		display: 'GOLD50000'
	},
	// Use to obtain Santaz or Trice, obtained during Christmas event
	[Item.CHRISTMAS_EGG]: {
		itemId: 130,
		name: 'christmas_egg',
		canBeEquipped: false,
		canBeUsedNow: true, // disabled for now
		itemType: ItemType.CLASSIC,
		effect: {
			category: ItemEffect.EGG,
			race: RaceEnum.SANTAZ
		},
		isRare: false,
		sellable: true,
		maxQuantity: 999, // TODO double check
		price: 10000, // TODO double check
		display: 'xmase1'
	},
	// Ticket for Batide day
	[Item.GODFATHER_TICKET]: {
		itemId: 131,
		name: 'godfather_ticket',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: true,
		price: 5000,
		display: 'ptix'
	},
	// Quest item
	[Item.SAGE_POINT]: {
		itemId: 132,
		name: 'sage_point',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'ptsage'
	},
	// Quest item
	[Item.FRAGMENT_A]: {
		itemId: 133,
		name: 'fragment_a',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'fmedaa'
	},
	// Quest item
	[Item.FRAGMENT_B]: {
		itemId: 134,
		name: 'fragment_b',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'fmedab'
	},
	// Quest item
	[Item.FRAGMENT_C]: {
		itemId: 135,
		name: 'fragment_c',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'fmedac'
	},
	// Quest item
	[Item.FRAGMENT_D]: {
		itemId: 136,
		name: 'fragment_d',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'fmedad'
	},
	// Quest item
	[Item.FRAGMENT_E]: {
		itemId: 137,
		name: 'fragment_e',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'fmedae'
	},
	// Quest item
	[Item.FRAGMENT_F]: {
		itemId: 138,
		name: 'fragment_f',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'fmedaf'
	},
	// Quest item
	[Item.FRAGMENT_G]: {
		itemId: 139,
		name: 'fragment_g',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'fmedag'
	},
	// Quest item
	[Item.STEPPE_METAL]: {
		itemId: 140,
		name: 'steppe_metal',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'metal'
	},
	// Quest item
	[Item.ICE_SHRED]: {
		itemId: 141,
		name: 'ice_shred',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'icepie'
	},
	// Quest item
	[Item.BATTERY]: {
		itemId: 142,
		name: 'battery',
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: 'pile'
	},
	[Item.VOID_SPHERE]: {
		itemId: 143,
		name: 'void_sphere',
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.VOID
		},
		sellable: true,
		price: 10000, // TODO double check
		display: 'void_sphere'
	},
	// Handler Box for coupons treasure
	[Item.COUPONS_TREASURE_HANDLER]: {
		itemId: 991,
		name: 'coupons',
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 9999,
		sellable: false,
		price: 0,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'box'
		},
		display: ''
	},
	// Handler Box
	[Item.BOX_HANDLER]: {
		itemId: 992,
		name: 'gold',
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 9999,
		sellable: false,
		price: 0,
		display: ''
	},
	// Common Box
	[Item.BOX_COMMON]: {
		name: BoxType.COMMON,
		itemId: 993,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		price: 0,
		sellable: false,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'box'
		},
		display: ''
	},
	// Rare Box
	[Item.BOX_RARE]: {
		name: BoxType.RARE,
		itemId: 994,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		price: 0,
		sellable: false,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'box'
		},
		display: ''
	},
	// Epic Box
	[Item.BOX_EPIC]: {
		name: BoxType.EPIC,
		itemId: 995,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		price: 0,
		sellable: false,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'box'
		},
		display: ''
	},
	// Legendary Box
	[Item.BOX_LEGENDARY]: {
		name: BoxType.LEGENDARY,
		itemId: 996,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		price: 0,
		sellable: false,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'box'
		},
		display: ''
	},
	// Daily ticket
	[Item.DAILY_TICKET]: {
		itemId: 997,
		name: 'daily_ticket',
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		sellable: false,
		price: 0,
		display: ''
	},
	// Empty item
	[Item.EMPTY]: {
		itemId: 998,
		name: 'empty',
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 123,
		sellable: false,
		price: 1234, // TODO double check
		display: ''
	},
	// Undefined item
	[Item.UNDEFINED]: {
		itemId: 999,
		name: 'undefined',
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 123,
		sellable: false,
		price: 1234, // TODO double check
		display: ''
	}
};
