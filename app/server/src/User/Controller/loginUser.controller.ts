import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import bcrypt from 'bcrypt';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_COOKIE, authCookieOptions } from '../../config/cookie.js';
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

	if (!user) {
		throw new ExpectedError('Invalid_credentials', { statusCode: 401 });
	}

	const isMatch = user && (await bcrypt.compare(password, user.password));

	if (!user || !isMatch) {
		throw new ExpectedError('Invalid_email_or_password', { statusCode: 401 });
	}

	const payload = {
		id: user.id,
		name: user.name,
		role: user.role
	};

	const token = req.jwt.sign(payload, { expiresIn: '7d' });

	reply.setCookie(ACCESS_TOKEN_COOKIE, token, {
		...authCookieOptions
	});

	return reply.send({ success: true });
}
