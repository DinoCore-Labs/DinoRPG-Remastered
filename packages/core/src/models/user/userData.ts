import { DinozFiche } from '../dinoz/dinozFiche.js';
import { UserRole } from './userRole.js';

export interface UserData {
	id: string;
	name: string;
	role: UserRole;
	gold: number;
	dinoz: DinozFiche[];
}
