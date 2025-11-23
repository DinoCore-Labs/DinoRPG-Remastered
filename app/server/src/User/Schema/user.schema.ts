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

// to build our JSON schema, we use buildJsonSchemas from fastify-zod
// it returns all the schemas to register and a ref to refer these schemas
export const { schemas: userSchemas, $ref } = buildJsonSchemas({
	createUserSchema,
	createUserResponseSchema,
	loginSchema,
	loginResponseSchema
});
