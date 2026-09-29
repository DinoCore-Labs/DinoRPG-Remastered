import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { GameLogType } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import { CreateUserInput } from '../Schema/user.schema.js';
import { createPlayerAccount } from '../Service/createPlayerAccount.service.js';
import { enforceSignupLimits } from '../Service/signupLimiter.service.js';

export { SALT_ROUNDS } from '../Service/createPlayerAccount.service.js';

export async function createUser(
	req: FastifyRequest<{
		Body: CreateUserInput;
	}>,
	reply: FastifyReply
) {
	const { password, name, gameRulesVersion } = req.body;

	try {
		await enforceSignupLimits(req);
	} catch (e: any) {
		if (e instanceof ExpectedError) {
			return reply.code(e.statusCode ?? 400).send({ message: e.message });
		}
		req.log.error(e);
		return reply.code(500).send({ message: 'Internal Server Error' });
	}

	const existingUser = await prisma.user.findUnique({
		where: {
			name
		}
	});
	if (existingUser) {
		return reply.code(401).send({
			message: 'User already exists with this name'
		});
	}

	try {
		const user = await createPlayerAccount({
			name,
			password,
			gameRulesVersion
		});

		safeCreateGameLog(
			{
				type: GameLogType.PlayerCreated,
				userId: user.id,
				userNameSnapshot: user.name,
				metadata: {
					ip: req.ip,
					userAgent: req.headers['user-agent'] ?? null,
					deviceId: (req as FastifyRequest & { deviceId?: string }).deviceId ?? null
				}
			},
			req.log
		);

		return reply.code(201).send(user);
	} catch (e) {
		return reply.code(500).send(e);
	}
}
