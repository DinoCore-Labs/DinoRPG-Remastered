import { ScenarioKey } from '../scenarios/scenarioList.js';
import { UserRole } from '../user/userRole.js';
import { AdminUserUniqueSkills } from './adminUser.js';

export interface UpdateAdminUserProfilePayload {
	role: UserRole;
	description: string | null;
	removeAvatar: boolean;
}
export interface UpdateAdminUserWalletPayload {
	type: 'GOLD' | 'TREASURE_TICKET';
	amount: number;
	operation: 'add' | 'remove';
}

export const MoneyTypes = ['GOLD', 'TREASURE_TICKET'] as const;

export type MoneyType = (typeof MoneyTypes)[number];

export interface UpdateAdminUserUniqueSkillsPayload {
	uniqueSkills: AdminUserUniqueSkills;
}

export type InventoryType = 'items' | 'ingredients';

export interface UpdateAdminUserInventoryPayload {
	id: number;
	quantity: number;
	operation: 'add' | 'remove';
}

export interface UpdateAdminUserRewardsPayload {
	rewardId: number;
	operation: 'add' | 'remove';
}

export interface UpdateAdminUserPasswordPayload {
	newPassword: string;
	confirmPassword: string;
}

export interface UpdateAdminUserScenarioPayload {
	scenarioKey: ScenarioKey;
	progression: number;
	tracking: number;
}
