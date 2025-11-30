import { type UserRole } from '../user/UserRole.mjs';

export interface UserStore {
	id: string | null;
	name: string | null;
	role: UserRole | null;
	gold: number;
	// clanId
}
