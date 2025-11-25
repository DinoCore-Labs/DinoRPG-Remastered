import bcrypt from 'bcrypt';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { LoginUserInput } from '../Schema/user.schema.js';

export async function loginUser(
	req: FastifyRequest<{
		Body: LoginUserInput;
	}>,
	reply: FastifyReply
) {
	const { name, password } = req.body;

	const user = await prisma.user.findUnique({ where: { name: name } });

	const isMatch = user && (await bcrypt.compare(password, user.password));

	if (!user || !isMatch) {
		return reply.code(401).send({
			message: 'Invalid email or password'
		});
	}

	const payload = {
		id: user.id,
		name: user.name,
		role: user.role
	};

	const token = req.jwt.sign(payload, { expiresIn: '7d' });

	reply.setCookie('access_token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax'
	});

	return {
		id: user.id,
		name: user.name,
		role: user.role
	};
}
