import { Language } from '@dinorpg/core/models/config/language.js';
import { Gender } from '@dinorpg/core/models/user/userGender.js';
import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

// data that we need from user to register
const createUserSchema = z.object({
	name: z.string().min(3).max(20),
	password: z.string().min(6)
});

//exporting the type to provide to the request Body
export type CreateUserInput = z.infer<typeof createUserSchema>;

// response schema for registering user
const createUserResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string()
});

// same for login route
const loginSchema = z.object({
	name: z.string(),
	password: z.string().min(6)
});
export type LoginUserInput = z.infer<typeof loginSchema>;

const loginResponseSchema = z.object({
	accessToken: z.string()
});

// user profile
export const updateUserProfileSchema = z.object({
	description: z.string().max(500).optional(),
	language: z.nativeEnum(Language).nullable().optional(),
	gender: z.nativeEnum(Gender).nullable().optional(),
	age: z.number().int().min(1).max(120).nullable().optional()
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

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

// to build our JSON schema, we use buildJsonSchemas from fastify-zod
// it returns all the schemas to register and a ref to refer these schemas
export const { schemas: userSchemas, $ref: $userRef } = buildJsonSchemas(
	{
		createUserSchema,
		createUserResponseSchema,
		loginSchema,
		loginResponseSchema,
		updateUserProfileSchema,
		updateUserProfileResponseSchema
	},
	{ $id: 'userSchema' } // this will prefix all the schema $id with userSchema to avoid conflicts with other schemas);
);
