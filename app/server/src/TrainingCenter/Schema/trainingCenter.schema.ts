import { z } from 'zod';

import { dinozIdParamsSchema } from '../../Dinoz/Schema/dinoz.schema.js';

export const trainingCenterBodySchema = z.object({
	program: z.enum(['easy', 'intermediate', 'advanced']),
	autoReequip: z.boolean().optional()
});

export type TrainingCenterBodyInput = z.infer<typeof trainingCenterBodySchema>;

export type TrainingCenterParams = z.infer<typeof dinozIdParamsSchema>;
