import { DinozFiche } from '../dinoz/dinozFiche.js';
import { UserReward } from './userReward.js';
import { UserRole } from './userRole.js';

export interface UserData {
	id: string;
	name: string;
	role: UserRole;
	gold: number;
	treasureTicket: number;
	dinoz: DinozFiche[];
	rewards: UserReward[];
}
