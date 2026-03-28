import { ingredientList } from '../ingredients/ingredientList.js';
import { itemList } from '../items/itemList.js';
import { placeListv2 } from '../place/placeListv2.js';
import { rewardList } from '../rewards/rewardList.js';
import { skillList } from '../skills/skillList.js';
//import { missionList } from '../../models/missions/missionList.js';

export type ConditionKeyMaps = {
	itemKeyById?: Partial<Record<number, string>>;
	skillKeyById?: Partial<Record<number, string>>;
	ingredientKeyById?: Partial<Record<number, string>>;
	rewardKeyById?: Partial<Record<number, string>>;
	placeKeyById?: Partial<Record<number, string>>;
	missionKeyById?: Partial<Record<number, string>>;
	getRaceKey?: (raceId: string | number | null | undefined) => string | undefined;
	getFriendKey?: (friendId: string | number | null | undefined) => string | undefined;
};

export const defaultConditionKeyMaps: ConditionKeyMaps = {
	placeKeyById: Object.fromEntries(Object.values(placeListv2).map(place => [place.placeId, place.name])),
	skillKeyById: Object.fromEntries(Object.values(skillList).map(skill => [skill.id, skill.name])),
	itemKeyById: Object.fromEntries(Object.values(itemList).map(item => [item.itemId, item.name])),
	rewardKeyById: Object.fromEntries(Object.values(rewardList).map(reward => [reward.id, reward.name])),
	ingredientKeyById: Object.fromEntries(
		Object.values(ingredientList).map(ingredient => [ingredient.ingredientId, ingredient.name])
	)
	/*missionKeyById: Object.fromEntries(
		Object.values(missionList).map(mission => [mission.id, mission.key])
	)*/
};
