import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import bcrypt from 'bcrypt';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { SALT_ROUNDS } from '../Controller/createUser.controller.js';
import { ChangeUserPasswordInput } from '../Schema/user.schema.js';

export async function changeUserPassword(
	request: FastifyRequest<{ Body: ChangeUserPasswordInput }>,
	reply: FastifyReply
) {
	const userId = request.user.id;
	const { oldPassword, newPassword } = request.body;
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			password: true
		}
	});
	if (!user) {
		throw new ExpectedError('Utilisateur introuvable');
	}
	const isCurrentPasswordValid = await bcrypt.compare(oldPassword, user.password);
	if (!isCurrentPasswordValid) {
		throw new ExpectedError('Ancien mot de passe incorrect');
	}
	const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
	await prisma.user.update({
		where: { id: userId },
		data: {
			password: hashedPassword
		}
	});
	return reply.status(204).send();
}
