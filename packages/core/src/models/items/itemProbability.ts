import { BoxOpening, BoxType } from './boxOpening.js';
import { Item, itemList } from './itemList.js';

export const boxProbabilities: BoxOpening[] = [
	{
		boxType: BoxType.COMMON,
		items: [
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
				item: itemList[Item.VOID_SPHERE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.AMNESIC_RICE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.HOT_BREAD],
				quantity: 3,
				odds: 7
			},
			{
				item: itemList[Item.POTION_IRMA],
				quantity: 20,
				odds: 8
			},
			{
				item: itemList[Item.BOX_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.DAILY_TICKET],
				quantity: 2,
				odds: 2
			}
		]
	},
	{
		boxType: BoxType.RARE,
		items: [
			{
				item: itemList[Item.FEROSS_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.FIRE_SPHERE],
				quantity: 1,
				odds: 6
			},
			{
				item: itemList[Item.WOOD_SPHERE],
				quantity: 1,
				odds: 6
			},
			{
				item: itemList[Item.WATER_SPHERE],
				quantity: 1,
				odds: 6
			},
			{
				item: itemList[Item.LIGHTNING_SPHERE],
				quantity: 1,
				odds: 6
			},
			{
				item: itemList[Item.AIR_SPHERE],
				quantity: 1,
				odds: 6
			},
			{
				item: itemList[Item.VOID_SPHERE],
				quantity: 1,
				odds: 6
			},
			{
				item: itemList[Item.HOT_BREAD],
				quantity: 3,
				odds: 5
			},
			{
				item: itemList[Item.POTION_IRMA],
				quantity: 20,
				odds: 8
			},
			{
				item: itemList[Item.BOX_EPIC],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.DAILY_TICKET],
				quantity: 2,
				odds: 3
			},
			{
				item: itemList[Item.TIK_BRACELET],
				quantity: 1,
				odds: 2
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
				item: itemList[Item.FEROSS_EGG],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.FIRE_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.WOOD_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.WATER_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.LIGHTNING_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.AIR_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.VOID_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.POTION_IRMA],
				quantity: 20,
				odds: 1
			},
			{
				item: itemList[Item.BOX_LEGENDARY],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.TIK_BRACELET],
				quantity: 1,
				odds: 2
			}
		]
	},
	{
		boxType: BoxType.LEGENDARY,
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
				item: itemList[Item.FEROSS_EGG_RARE],
				quantity: 1,
				odds: 1
			},
			{
				item: itemList[Item.FIRE_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.WOOD_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.WATER_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.LIGHTNING_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.AIR_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.VOID_SPHERE],
				quantity: 1,
				odds: 8
			},
			{
				item: itemList[Item.GOLDEN_NAPODINO],
				quantity: 1,
				odds: 5
			}
		]
	}
];
