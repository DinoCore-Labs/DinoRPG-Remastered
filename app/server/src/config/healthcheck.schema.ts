import { z } from 'zod';

export const healthcheckResponseSchema = z.object({
	status: z.string()
});
