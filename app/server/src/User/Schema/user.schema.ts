import { Language } from '@dinorpg/core/models/config/language.js';
import { GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';
import { Gender } from '@dinorpg/core/models/user/userGender.js';
import { z } from 'zod';

// Data needed to register a user
export const createUserSchema = z.object({
	name: z.string().min(3).max(20),
	password: z.string().min(6),
	gameRulesVersion: z.literal(GAME_RULES_VERSION)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const acceptGameRulesSchema = z.object({
	version: z.literal(GAME_RULES_VERSION)
});

export type AcceptGameRulesInput = z.infer<typeof acceptGameRulesSchema>;

// Response schema for registering a user
export const createUserResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string()
});

export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;

// Data needed to log in a user
export const loginSchema = z.object({
	name: z.string(),
	password: z.string().min(6)
});

export type LoginUserInput = z.infer<typeof loginSchema>;

// Response schema for login
export const loginResponseSchema = z.object({
	accessToken: z.string()
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// User profile update
export const updateUserProfileSchema = z.object({
	description: z.string().max(500).optional(),
	customText: z.string().max(1000).optional(),
	language: z.nativeEnum(Language).nullable().optional(),
	gender: z.nativeEnum(Gender).nullable().optional(),
	age: z.number().int().min(1).max(120).nullable().optional()
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

// User profile update response
export const updateUserProfileResponseSchema = z.object({
	success: z.literal(true),
	profile: z.object({
		description: z.string().max(500).nullable().optional(),
		customText: z.string().max(1000).nullable().optional(),
		language: z.nativeEnum(Language).nullable().optional(),
		gender: z.nativeEnum(Gender).nullable().optional(),
		age: z.number().int().min(1).max(120).nullable().optional()
	})
});

export type UpdateUserProfileResponse = z.infer<typeof updateUserProfileResponseSchema>;

export const userNameParamSchema = z.object({
	name: z.string().min(1)
});

export type UserNameParamInput = z.infer<typeof userNameParamSchema>;

export const userIdParamSchema = z.object({
	id: z.string().uuid()
});

export type UserIdParamInput = z.infer<typeof userIdParamSchema>;

export const changeUserPasswordSchema = z
	.object({
		oldPassword: z.string().min(6),
		newPassword: z.string().min(6),
		confirmPassword: z.string().min(6)
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword']
	});

export type ChangeUserPasswordInput = z.infer<typeof changeUserPasswordSchema>;
