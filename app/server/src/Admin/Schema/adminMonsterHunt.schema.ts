import { MonsterHuntPresetKey } from '@dinorpg/core/models/monsterHunt/monsterHunt.js';
import z from 'zod';

export const adminMonsterHuntIdParamsSchema = z.object({
	id: z.string().uuid()
});

export const adminCreateMonsterHuntBodySchema = z
	.object({
		presetKey: z.nativeEnum(MonsterHuntPresetKey),

		startAt: z.string().datetime({
			offset: true
		}),

		endAt: z.string().datetime({
			offset: true
		})
	})
	.superRefine((data, ctx) => {
		if (new Date(data.endAt).getTime() <= new Date(data.startAt).getTime()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['endAt'],
				message: 'La date de fin doit être postérieure à la date de début.'
			});
		}
	});
