import { type UserRole } from '@dinorpg/core/models/user/userRole.js';

const ROLE_ORDER: UserRole[] = ['PLAYER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];

export function is_granted(required: UserRole, userRole: UserRole): boolean {
	return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(required);
}
