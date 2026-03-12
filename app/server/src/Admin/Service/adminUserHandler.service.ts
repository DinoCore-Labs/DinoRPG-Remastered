import type { FastifyReply, FastifyRequest } from 'fastify';

import {
	getAdminUserDetails,
	getAdminUserDinoz,
	updateAdminUserIngredients,
	updateAdminUserItems,
	updateAdminUserProfile,
	updateAdminUserRewards,
	updateAdminUserUniqueSkills,
	updateAdminUserWallet
} from '../Controller/adminUser.controller.js';
import {
	adminUserParamsSchema,
	updateAdminUserIngredientsSchema,
	updateAdminUserItemsSchema,
	updateAdminUserProfileSchema,
	updateAdminUserRewardsSchema,
	updateAdminUserUniqueSkillsSchema,
	updateAdminUserWalletSchema
} from '../Schema/admin.schema.js';

export async function getAdminUserDetailsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	if (!parsedParams.success) {
		return reply.status(400).send({ message: 'Invalid user id' });
	}
	const user = await getAdminUserDetails(parsedParams.data.id);
	if (!user) {
		return reply.status(404).send({ message: 'User not found' });
	}
	return reply.status(200).send(user);
}

export async function getAdminUserDinozHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	if (!parsedParams.success) {
		return reply.status(400).send({ message: 'Invalid user id' });
	}
	const dinoz = await getAdminUserDinoz(parsedParams.data.id);
	return reply.status(200).send(dinoz);
}

export async function updateAdminUserProfileHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserProfileSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserProfile(parsedParams.data.id, parsedBody.data);
	return reply.status(204).send();
}

export async function updateAdminUserWalletHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserWalletSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserWallet(parsedParams.data.id, parsedBody.data);
	return reply.status(204).send();
}

export async function updateAdminUserUniqueSkillsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserUniqueSkillsSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserUniqueSkills(parsedParams.data.id, parsedBody.data);
	return reply.status(204).send();
}

export async function updateAdminUserItemsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserItemsSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserItems(parsedParams.data.id, parsedBody.data);
	return reply.status(204).send();
}

export async function updateAdminUserIngredientsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserIngredientsSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserIngredients(parsedParams.data.id, parsedBody.data);
	return reply.status(204).send();
}

export async function updateAdminUserRewardsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserRewardsSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserRewards(parsedParams.data.id, parsedBody.data);
	return reply.status(204).send();
}
