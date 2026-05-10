import { z } from 'zod';

export const versionResponseSchema = z.object({
	version: z.string()
});
