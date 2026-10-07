import { Item } from '../../items/itemList.js';

export interface WeightedItemReward {
	item: Item;
	weight: number;
}

/**
 * Original Madame Urma Easter egg reward pool.
 *
 * Source: Motion Twin DinoRPG archives.
 * Total weight: 1200.
 */
export const URMA_EGG_REWARDS: readonly WeightedItemReward[] = [
	{ item: Item.POISONITE_SHOT, weight: 40 },
	{ item: Item.FUCA_PILL, weight: 20 },
	{ item: Item.REFRIGERATED_SHIELD, weight: 40 },
	{ item: Item.ZIPPO, weight: 40 },
	{ item: Item.LITTLE_PEPPER, weight: 40 },
	{ item: Item.SOS_FLAME, weight: 60 },
	{ item: Item.SOS_HELMET, weight: 60 },
	{ item: Item.PAMPLEBOUM, weight: 60 },
	{ item: Item.MONOCHROMATIC, weight: 7 },
	{ item: Item.POTION_IRMA, weight: 200 },
	{ item: Item.POTION_ANGEL, weight: 50 },
	{ item: Item.CLOUD_BURGER, weight: 70 },
	{ item: Item.MEAT_PIE, weight: 100 },
	{ item: Item.HOT_BREAD, weight: 30 },
	{ item: Item.FIGHT_RATION, weight: 120 },
	{ item: Item.LORIS_COSTUME, weight: 40 },
	{ item: Item.PORTABLE_LOVE, weight: 40 },
	{ item: Item.LAND_OF_ASHES, weight: 10 },
	{ item: Item.ABYSS, weight: 10 },
	{ item: Item.AMAZON, weight: 10 },
	{ item: Item.ST_ELMAS_FIRE, weight: 10 },
	{ item: Item.UVAVU, weight: 10 },
	{ item: Item.PIRHANOZ_IN_BAG, weight: 30 },
	{ item: Item.VEGETOX_COSTUME, weight: 30 },
	{ item: Item.GOBLIN_COSTUME, weight: 30 },
	{ item: Item.DANGER_DETECTOR, weight: 20 },
	{ item: Item.SURVIVING_RATION, weight: 20 },
	{ item: Item.FEROSS_EGG_RARE, weight: 1 },
	{ item: Item.TOUFUFU_BABY_RARE, weight: 1 },
	{ item: Item.RARE_KABUKI_EGG, weight: 1 }
] as const;

export const URMA_EGG_EXPECTED_TOTAL_WEIGHT = 1200;

export const URMA_EGG_TOTAL_WEIGHT = URMA_EGG_REWARDS.reduce((total, reward) => total + reward.weight, 0);
