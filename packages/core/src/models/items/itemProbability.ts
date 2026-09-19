/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/item/itemProbability.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-02-15.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { BoxOpening, BoxType } from './boxOpening.js';
import { Item, itemList } from './itemList.js';

export const boxProbabilities: BoxOpening[] = [
	{
		boxType: BoxType.COMMON,
		items: [
			{
				item: itemList[Item.POTION_IRMA],
				quantity: 10,
				odds: 3
			},
			{
				item: itemList[Item.POTION_ANGEL],
				quantity: 1,
				odds: 2
			},
			{
				item: itemList[Item.CLOUD_BURGER],
				quantity: 3,
				odds: 3
			},
			{
				item: itemList[Item.MEAT_PIE],
				quantity: 1,
				odds: 3
			},
			{
				item: itemList[Item.HOT_BREAD],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.FIGHT_RATION],
				quantity: 1,
				odds: 2
			}
		]
	},
	{
		boxType: BoxType.RARE,
		items: [
			{
				item: itemList[Item.POTION_IRMA],
				quantity: 20,
				odds: 3
			},
			{
				item: itemList[Item.POTION_ANGEL],
				quantity: 3,
				odds: 3
			},
			{
				item: itemList[Item.CLOUD_BURGER],
				quantity: 6,
				odds: 3
			},
			{
				item: itemList[Item.MEAT_PIE],
				quantity: 3,
				odds: 3
			},
			{
				item: itemList[Item.HOT_BREAD],
				quantity: 2,
				odds: 2
			},
			{
				item: itemList[Item.FIGHT_RATION],
				quantity: 3,
				odds: 2
			},
			{
				item: itemList[Item.TIK_BRACELET],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.MOUEFFE_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.PIGMOU_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.WINKS_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.PLANAILLE_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.CASTIVORE_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.NUAGOZ_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.SIRAIN_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.GORILLOZ_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.WANWAN_EGG],
				quantity: 1,
				odds: 1
			}
		]
	},
	{
		boxType: BoxType.EPIC,
		items: [
			{
				item: itemList[Item.MOUEFFE_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.PIGMOU_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.WINKS_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.PLANAILLE_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.CASTIVORE_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.NUAGOZ_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.SIRAIN_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.GORILLOZ_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.WANWAN_BABY_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.ROCKY_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.TIK_BRACELET],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.ELIXIR],
				quantity: 2,
				odds: 2
			},
			{
				item: itemList[Item.POISONITE_SHOT],
				quantity: 10,
				odds: 2
			},
			{
				item: itemList[Item.MONOCHROMATIC],
				quantity: 2,
				odds: 2
			},
			{
				item: itemList[Item.LORIS_COSTUME],
				quantity: 8,
				odds: 2
			},
			{
				item: itemList[Item.FUCA_PILL],
				quantity: 5,
				odds: 2
			}
		]
	},
	{
		boxType: BoxType.LEGENDARY,
		items: [
			{
				item: itemList[Item.FEROSS_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.FIRE_SPHERE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.WOOD_SPHERE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.WATER_SPHERE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.LIGHTNING_SPHERE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.AIR_SPHERE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.GOLDEN_NAPODINO],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.DEMON_TICKET],
				quantity: 150,
				odds: 1
			}
		]
	}
];
