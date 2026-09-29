import type { FastifyReply, FastifyRequest } from 'fastify';

import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';
import { botIdParamsSchema, createBotBodySchema, updateBotBodySchema } from '../Schema/bot.schema.js';
import { createBotPlayer } from './createBotPlayer.service.js';

export async function listBotsHandler() {
	return prisma.botProfile.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					createdDate: true,
					lastLogin: true,
					_count: {
						select: {
							dinoz: true
						}
					}
				}
			}
		}
	});
}

export async function createBotHandler(req: FastifyRequest, reply: FastifyReply) {
	const body = createBotBodySchema.parse(req.body);
	const bot = await createBotPlayer(body);
	return reply.code(201).send(bot);
}

export async function updateBotHandler(req: FastifyRequest, reply: FastifyReply) {
	const { id } = botIdParamsSchema.parse(req.params);
	const body = updateBotBodySchema.parse(req.body);

	const current = await prisma.botProfile.findUnique({
		where: { id }
	});
	if (!current) {
		throw new ExpectedError('botNotFound', { statusCode: 404 });
	}

	const minDelaySeconds = body.minDelaySeconds ?? current.minDelaySeconds;
	const maxDelaySeconds = body.maxDelaySeconds ?? current.maxDelaySeconds;
	if (maxDelaySeconds < minDelaySeconds) {
		throw new ExpectedError('invalidBotDelay');
	}

	const bot = await prisma.botProfile.update({
		where: { id },
		data: {
			...body,
			nextActionAt:
				body.enabled === true && current.enabled === false
					? new Date()
					: undefined
		},
		include: {
			user: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});

	return reply.send(bot);
}
