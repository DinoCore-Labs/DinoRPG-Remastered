import {
	Dinoz,
	DinozItems,
	DinozSkills,
	DinozStatus,
	Ranking,
	User,
	UserIngredients,
	UserItems,
	UserRewards
} from '../../../../prisma/index.js';

export type PlayerForConditionCheck = Pick<User, 'id'> & {
	items: Pick<UserItems, 'itemId' | 'quantity'>[];
	rewards: Pick<UserRewards, 'rewardId'>[];
	//quests: Pick<UserQuests, 'questId' | 'progression'>[];
	ingredients?: Pick<UserIngredients, 'ingredientId' | 'quantity'>[];
	ranking: Pick<Ranking, 'dinozCount' | 'points'> | null;
	dinoz: (Pick<Dinoz, 'level' | 'placeId' | 'life' | 'id'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		//missions: Pick<DinozMission, 'missionId' | 'isFinished' | 'step'>[];
		items: Pick<DinozItems, 'itemId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
	})[];
};
