import {
	Dinoz,
	DinozItems,
	DinozSkills,
	DinozStatus,
	Ranking,
	User,
	UserIngredients,
	UserItems,
	UserRewards,
	UserTracking
} from '../../../../prisma/index.js';

export type UserForConditionCheck = Pick<User, 'id'> & {
	isAdmin?: boolean;
	leader?: boolean;
	messie?: boolean;
	items: Pick<UserItems, 'itemId' | 'quantity'>[];
	rewards: Pick<UserRewards, 'rewardId'>[];
	quests?: {
		questKey: string;
		progression: number;
		updatedAt?: Date | null;
	}[];
	ingredients?: Pick<UserIngredients, 'ingredientId' | 'quantity'>[];
	ranking: Pick<Ranking, 'dinozCount' | 'points'> | null;
	tracking?: Pick<UserTracking, 'stat' | 'quantity'>[];
	gvars?: Record<string, number> | { key: string; value: number }[];
	sessionTags?: string[];
	currentTab?: string;
	dinoz: (Pick<Dinoz, 'level' | 'placeId' | 'life' | 'id'> & {
		raceId?: string | number | null;
		friendId?: string | number | null;
		status: Pick<DinozStatus, 'statusId'>[];
		missions?: {
			missionKey: string;
			progression: number;
			tracking: number;
			isCompleted: boolean;
		}[];
		items: Pick<DinozItems, 'itemId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
	})[];
};
