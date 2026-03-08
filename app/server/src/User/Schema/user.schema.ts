import { Language } from '@dinorpg/core/models/config/language.js';
import { Gender } from '@dinorpg/core/models/user/userGender.js';
import { z } from 'zod';

// Data needed to register a user
export const createUserSchema = z.object({
	name: z.string().min(3).max(20),
	password: z.string().min(6)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

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
