import { UserRole } from '../user/userRole.js';

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
