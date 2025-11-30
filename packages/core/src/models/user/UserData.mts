import { UserRole } from './UserRole.mjs';

export interface UserData {
	id: string;
	name: string;
	role: UserRole;
	gold: number;
}
