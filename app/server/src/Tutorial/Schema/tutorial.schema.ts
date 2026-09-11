import type { TutorialEvent } from '@dinorpg/core/models/tutorial/tutorial.js';
import { z } from 'zod';

export const tutorialClientEvents = [
	'CLAN_PAGE_VISITED',
	'ACCOUNT_PAGE_VISITED',
	'TUTORIAL_FINISHED'
] as const satisfies readonly TutorialEvent[];

export const tutorialEventBodySchema = z
	.object({
		event: z.enum(tutorialClientEvents)
	})
	.strict();

export type TutorialEventBody = z.infer<typeof tutorialEventBodySchema>;
