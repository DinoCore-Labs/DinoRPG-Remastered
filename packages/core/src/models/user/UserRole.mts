export const UserRoles = ['PLAYER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'] as const;

export type UserRole = (typeof UserRoles)[number];
