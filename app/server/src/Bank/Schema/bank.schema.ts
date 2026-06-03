import { z } from 'zod';

export const convertTreasureTicketsBodySchema = z.object({
	quantity: z.coerce.number().int().positive()
});
