import { UserRole } from '../user/userRole.js';

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

export interface AdminUserUniqueSkills {
	leader: boolean;
	engineer: boolean;
	cooker: boolean;
	shopKeeper: boolean;
	merchant: boolean;
	priest: boolean;
	teacher: boolean;
	matelasseur: boolean;
	messie: boolean;
}

export interface AdminUserProfile {
	avatar: string | null;
	age: number | null;
	language: string | null;
	description: string | null;
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
	role: UserRole;
	lastLogin: Date;
	profile: AdminUserProfile | null;
	wallets: AdminUserWallet[];
	rewards: AdminUserReward[];
	items: AdminUserItem[];
	ingredients: AdminUserIngredient[];
	uniqueSkills: AdminUserUniqueSkills;
	//quests: AdminUserQuest[];
	//banCase: AdminBanCase | null;
}

export interface AdminDinozSummary {
	id: number;
	name: string;
	level: number;
	raceId: number;
	life: number;
	maxLife: number;
}
