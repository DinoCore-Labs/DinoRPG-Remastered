import { Condition } from '@dinorpg/core/models/conditions/conditions.js';
import { DigTreasure } from '@dinorpg/core/models/dinoz/digTreasure.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { parseCondition } from '@dinorpg/core/models/utils/conditions/parseConditions.js';

const c = (source: string): Condition => parseCondition(source);

export const digTreasures: DigTreasure[] = [
	{
		id: 'basalt',
		place: PlaceEnum.PENTES_DE_BASALTE,
		cond: c('!fx(basalt)+!fx(gant)'),
		rewards: [{ type: 'status', statusId: DinozStatusId.BASALT_SHARD }]
	},
	{
		id: 'pure_water',
		place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
		cond: c('!fx(wpure)+!fx(gant)'),
		rewards: [{ type: 'status', statusId: DinozStatusId.PURE_WATER }]
	},
	{
		id: 'swamp_mud',
		place: PlaceEnum.MARAIS_COLLANT,
		cond: c('!fx(swmud)+!fx(gant)'),
		rewards: [{ type: 'status', statusId: DinozStatusId.SWAMP_MUD }]
	},
	{
		id: 'old_stone',
		place: PlaceEnum.RUINES_ASHPOUK,
		cond: c('!fx(astone)+!fx(totem)'),
		rewards: [{ type: 'status', statusId: DinozStatusId.OLD_STONE }]
	},
	{
		id: 'fourth_star',
		place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
		cond: c('scenario(star,4)'),
		rewards: [
			{ type: 'scenario', scenarioKey: 'star', progression: 5 },
			{ type: 'item', itemId: itemList[Item.MAGIC_STAR].itemId, quantity: 1 }
		]
	}
];
