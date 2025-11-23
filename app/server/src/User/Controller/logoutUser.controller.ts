import { FastifyReply, FastifyRequest } from 'fastify';

export async function logoutUser(req: FastifyRequest, reply: FastifyReply) {
	reply.clearCookie('access_token');

	return reply.send({ message: 'Logout successful' });
}
