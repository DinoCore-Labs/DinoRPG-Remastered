import type { FastifyReply, FastifyRequest } from 'fastify';

import { GameLogType } from '../../../../prisma/index.js';
import { CreateGameLogInput, safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import {
	getAdminUserDetails,
	getAdminUserDinoz,
	updateAdminUserIngredients,
	updateAdminUserItems,
	updateAdminUserPassword,
	updateAdminUserProfile,
	updateAdminUserRewards,
	updateAdminUserScenario,
	updateAdminUserUniqueSkills,
	updateAdminUserWallet
} from '../Controller/adminUser.controller.js';
import {
	adminUserParamsSchema,
	updateAdminUserIngredientsSchema,
	updateAdminUserItemsSchema,
	updateAdminUserPasswordSchema,
	updateAdminUserProfileSchema,
	updateAdminUserRewardsSchema,
	updateAdminUserScenarioSchema,
	updateAdminUserUniqueSkillsSchema,
	updateAdminUserWalletSchema
} from '../Schema/admin.schema.js';

async function logAdminUserAction(
	request: FastifyRequest,
	type: GameLogType,
	metadata?: CreateGameLogInput['metadata'],
	values: string[] = []
) {
	const params = request.params as { id: string };
	await safeCreateGameLog(
		{
			type,
			actorUserId: request.user.id,
			userId: params.id,
			values: values.length > 0 ? values : [params.id],
			...(metadata ? { metadata } : {})
		},
		request.log
	);
}

function getAddRemoveLogType(operation: 'add' | 'remove', addType: GameLogType, removeType: GameLogType) {
	return operation === 'add' ? addType : removeType;
}

function asLogMetadata(value: unknown): CreateGameLogInput['metadata'] {
	return JSON.parse(JSON.stringify(value)) as CreateGameLogInput['metadata'];
}

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
	await logAdminUserAction(request, GameLogType.AdminUpdateUser, {
		section: 'profile',
		payload: request.body
	} as CreateGameLogInput['metadata']);
	return reply.status(204).send();
}

export async function updateAdminUserWalletHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserWalletSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserWallet(parsedParams.data.id, parsedBody.data);
	await logAdminUserAction(
		request,
		getAddRemoveLogType(parsedBody.data.operation, GameLogType.AdminAddMoney, GameLogType.AdminRemoveMoney),
		asLogMetadata({
			section: 'wallet',
			payload: parsedBody.data
		}),
		[parsedParams.data.id, parsedBody.data.type, String(parsedBody.data.amount)]
	);
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
	await logAdminUserAction(
		request,
		getAddRemoveLogType(parsedBody.data.operation, GameLogType.AdminAddItem, GameLogType.AdminRemoveItem),
		asLogMetadata({
			itemId: parsedBody.data.id,
			quantity: parsedBody.data.quantity,
			operation: parsedBody.data.operation
		}),
		[parsedParams.data.id, String(parsedBody.data.id), String(parsedBody.data.quantity)]
	);
	return reply.status(204).send();
}

export async function updateAdminUserIngredientsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserIngredientsSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserIngredients(parsedParams.data.id, parsedBody.data);
	await logAdminUserAction(
		request,
		getAddRemoveLogType(parsedBody.data.operation, GameLogType.AdminAddIngredient, GameLogType.AdminRemoveIngredient),
		asLogMetadata({
			ingredientId: parsedBody.data.id,
			quantity: parsedBody.data.quantity,
			operation: parsedBody.data.operation
		}),
		[parsedParams.data.id, String(parsedBody.data.id), String(parsedBody.data.quantity)]
	);
	return reply.status(204).send();
}

export async function updateAdminUserRewardsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserRewardsSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({ message: 'Invalid request payload' });
	}
	await updateAdminUserRewards(parsedParams.data.id, parsedBody.data);
	await logAdminUserAction(
		request,
		getAddRemoveLogType(parsedBody.data.operation, GameLogType.AdminAddReward, GameLogType.AdminRemoveReward),
		asLogMetadata({
			rewardId: parsedBody.data.rewardId,
			operation: parsedBody.data.operation
		}),
		[parsedParams.data.id, String(parsedBody.data.rewardId)]
	);
	return reply.status(204).send();
}

export async function updateAdminUserPasswordHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminUserParamsSchema.safeParse(request.params);
	const body = updateAdminUserPasswordSchema.safeParse(request.body);
	if (!params.success || !body.success) {
		return reply.status(400).send({
			message: 'Invalid request payload'
		});
	}
	const updated = await updateAdminUserPassword(params.data.id, body.data.newPassword);
	if (!updated) {
		return reply.status(404).send({
			message: 'User not found'
		});
	}
	return reply.status(204).send();
}

export async function updateAdminUserScenarioHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsedParams = adminUserParamsSchema.safeParse(request.params);
	const parsedBody = updateAdminUserScenarioSchema.safeParse(request.body);
	if (!parsedParams.success || !parsedBody.success) {
		return reply.status(400).send({
			message: 'Invalid request payload'
		});
	}
	await updateAdminUserScenario(parsedParams.data.id, parsedBody.data);
	await logAdminUserAction(
		request,
		GameLogType.AdminUpdateScenario,
		asLogMetadata({
			scenarioKey: parsedBody.data.scenarioKey,
			payload: parsedBody.data
		}),
		[parsedParams.data.id, parsedBody.data.scenarioKey]
	);
	return reply.status(204).send();
}
