export interface AdminUserWallet {
	type: string;
	amount: number;
}

export interface AdminUserReward {
	rewardId: number;
}

export interface AdminUserItem {
	itemId: number;
	quantity: number;
}

export interface AdminUserIngredient {
	ingredientId: number;
	quantity: number;
}

export interface AdminUserUniqueSkill {
	skillId: number;
	state: boolean;
	dinozId: number | null;
}

/*export interface AdminUserQuest {
	questId: number;
	progression: number;
}*/

/*export interface AdminBanCase {
	id: number;
	reason: string;
	sorted: string;
	comment: string | null;
	dinozId: number | null;
	reporterId: string | null;
	banDate: string | null;
	banEndDate: string | null;
}*/

export interface AdminUserDetails {
	id: string;
	name: string;
	role: string;
	wallets: AdminUserWallet[];
	rewards: AdminUserReward[];
	items: AdminUserItem[];
	ingredients: AdminUserIngredient[];
	//quests: AdminUserQuest[];
	//banCase: AdminBanCase | null;
	uniqueSkills: AdminUserUniqueSkill[];
}

export interface AdminDinozSummary {
	id: number;
	name: string;
	level: number;
	raceId: number;
	life: number;
	maxLife: number;
}
