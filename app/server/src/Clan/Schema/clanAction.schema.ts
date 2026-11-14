import { z } from 'zod';

import { clanIdParamSchema } from './clan.schema.js';

export const clanActionParamsSchema = clanIdParamSchema.extend({
	actionKey: z.string().min(1).max(64)
});

export const clanActionContributionSchema = z.object({
	dinozId: z.coerce.number().int().positive()
});
