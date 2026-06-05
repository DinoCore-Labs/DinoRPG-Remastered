import { z } from 'zod';

export const convertTreasureTicketsBodySchema = z.object({
	quantity: z.coerce.number().int().positive()
});

export const createBankSavingBodySchema = z.object({
	amount: z.coerce.number().int().positive(),
	durationDays: z.coerce.number().int()
});

export const claimBankSavingParamsSchema = z.object({
	id: z.string().uuid()
});
