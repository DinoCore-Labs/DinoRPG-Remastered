import bcrypt from 'bcrypt';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { CreateUserInput } from '../Schema/user.schema.js';

const SALT_ROUNDS = 10;

export async function createUser(
	req: FastifyRequest<{
		Body: CreateUserInput;
	}>,
	reply: FastifyReply
) {
	const { password, name } = req.body;

	const user = await prisma.user.findUnique({
		where: {
			name: name
		}
	});
	if (user) {
		return reply.code(401).send({
			message: 'User already exists with this name'
		});
	}

	try {
		const hash = await bcrypt.hash(password, SALT_ROUNDS);
		const user = await prisma.user.create({
			data: {
				password: hash,
				name
			}
		});

		return reply.code(201).send(user);
	} catch (e) {
		return reply.code(500).send(e);
	}
}
