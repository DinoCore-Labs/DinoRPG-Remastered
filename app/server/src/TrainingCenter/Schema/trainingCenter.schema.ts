import { z } from 'zod';

// ...

export const trainingCenterBodySchema = z.object({
	program: z.enum(['easy', 'intermediate', 'advanced'])
});

export type TrainingCenterBodyInput = z.infer<typeof trainingCenterBodySchema>;
