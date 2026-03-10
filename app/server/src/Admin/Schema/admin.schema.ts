import { z } from 'zod';

import { MoneyType, Role } from '../../../../prisma/index.js';

export const adminJobKeyParamsSchema = z.object({
	key: z.string().min(1)
});

export const adminRunJobResponseSchema = z.object({
	ok: z.literal(true)
});

export const adminErrorResponseSchema = z.object({
	message: z.string()
});

export const adminUserParamsSchema = z.object({
	id: z.string().min(1)
});

export const updateAdminUserProfileSchema = z.object({
	role: z.nativeEnum(Role)
});

export const updateAdminUserWalletSchema = z.object({
	type: z.nativeEnum(MoneyType),
	amount: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});
