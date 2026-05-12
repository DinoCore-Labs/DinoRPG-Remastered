import { ScenarioKey, scenarioList } from '@dinorpg/core/models/scenarios/scenarioList.js';
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
	role: z.nativeEnum(Role),
	description: z.string().max(1000).nullable(),
	removeAvatar: z.boolean().default(false)
});

export const updateAdminUserWalletSchema = z.object({
	type: z.nativeEnum(MoneyType),
	amount: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});

export const updateAdminUserUniqueSkillsSchema = z.object({
	uniqueSkills: z.object({
		leader: z.boolean(),
		engineer: z.boolean(),
		cooker: z.boolean(),
		shopKeeper: z.boolean(),
		merchant: z.boolean(),
		priest: z.boolean(),
		teacher: z.boolean(),
		matelasseur: z.boolean(),
		messie: z.boolean()
	})
});

export const updateAdminUserItemsSchema = z.object({
	id: z.number().int().positive(),
	quantity: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});

export const updateAdminUserIngredientsSchema = z.object({
	id: z.number().int().positive(),
	quantity: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});

export const updateAdminUserRewardsSchema = z.object({
	rewardId: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});

export const updateAdminUserPasswordSchema = z
	.object({
		newPassword: z.string().min(6),
		confirmPassword: z.string().min(6)
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword']
	});

export type UpdateAdminUserPasswordInput = z.infer<typeof updateAdminUserPasswordSchema>;

export const adminSecretSchema = z.object({
	key: z.string(),
	value: z.string()
});

export const adminSecretListSchema = z.array(adminSecretSchema);

export const adminSecretKeyParamsSchema = z.object({
	key: z.string().min(1)
});

export const updateAdminSecretBodySchema = z.object({
	value: z.string()
});

export const notFoundErrorSchema = z.object({
	message: z.string()
});

export type AdminSecret = z.infer<typeof adminSecretSchema>;
export type UpdateAdminSecretBody = z.infer<typeof updateAdminSecretBodySchema>;
export type AdminSecretKeyParams = z.infer<typeof adminSecretKeyParamsSchema>;
export type NotFoundError = z.infer<typeof notFoundErrorSchema>;

export const adminDinozParamsSchema = z.object({
	dinozId: z.coerce.number().int().positive()
});

export const adminDinozQuerySchema = z.object({
	playerId: z.string().uuid()
});

export const updateAdminDinozBodySchema = z.object({
	name: z.string().trim().min(1).max(32).optional(),
	canRename: z.boolean().optional(),
	raceId: z.number().int().positive().optional(),
	display: z.string().trim().min(1).optional(),

	level: z.number().int().min(1).optional(),
	life: z.number().int().min(0).optional(),
	maxLife: z.number().int().min(1).optional(),
	experience: z.number().int().min(0).optional(),

	nbrUpFire: z.number().int().min(0).optional(),
	nbrUpWood: z.number().int().min(0).optional(),
	nbrUpWater: z.number().int().min(0).optional(),
	nbrUpLightning: z.number().int().min(0).optional(),
	nbrUpAir: z.number().int().min(0).optional(),

	nextUpElementId: z.number().int().min(0).optional(),
	nextUpAltElementId: z.number().int().min(0).optional(),

	placeId: z.number().int().positive().optional(),
	remaining: z.number().int().min(0).optional(),
	order: z.number().int().min(0).nullable().optional(),

	seed: z.string().uuid().optional(),

	state: z.string().nullable().optional(),
	stateTimer: z.string().datetime().nullable().optional(),

	fight: z.boolean().optional(),
	gather: z.boolean().optional(),

	leaderId: z.number().int().positive().nullable().optional()
});

const scenarioKeys = Object.keys(scenarioList) as [ScenarioKey, ...ScenarioKey[]];

export const updateAdminUserScenarioSchema = z
	.object({
		scenarioKey: z.enum(scenarioKeys),
		progression: z.number().int().min(0),
		tracking: z.number().int().min(0).default(0)
	})
	.superRefine((data, ctx) => {
		const scenario = scenarioList[data.scenarioKey];
		if (data.progression > scenario.maxProgression) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['progression'],
				message: `La progression ne peut pas dépasser ${scenario.maxProgression}.`
			});
		}
	});

export const adminForcebrutOpponentParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});

export const adminForcebrutOpponentBodySchema = z.object({
	step: z.coerce.number().int().min(1),
	name: z.string().trim().min(1).max(32),
	raceId: z.coerce.number().int().positive(),
	display: z.string().trim().min(1),
	level: z.coerce.number().int().min(1),
	life: z.coerce.number().int().min(0).default(100),
	maxLife: z.coerce.number().int().min(1).default(100),
	nbrUpFire: z.coerce.number().int().min(0).default(0),
	nbrUpWood: z.coerce.number().int().min(0).default(0),
	nbrUpWater: z.coerce.number().int().min(0).default(0),
	nbrUpLightning: z.coerce.number().int().min(0).default(0),
	nbrUpAir: z.coerce.number().int().min(0).default(0),
	skillIds: z.array(z.coerce.number().int().positive()).default([]),
	enabled: z.boolean().default(true)
});

export type AdminForcebrutOpponentParams = z.infer<typeof adminForcebrutOpponentParamsSchema>;
export type AdminForcebrutOpponentBody = z.infer<typeof adminForcebrutOpponentBodySchema>;
