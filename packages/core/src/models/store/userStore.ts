import { UserReward } from '../user/userReward.js';
import { type UserRole } from '../user/userRole.js';

export interface UserStore {
	id: string | null;
	name: string | null;
	role: UserRole | null;
	gold: number;
	treasureTicket: number;
	priest: boolean;
	shopKeeper: boolean;
	sortOption: string;
	rewards: UserReward[];
	// clanId
}
