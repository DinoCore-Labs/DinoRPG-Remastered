import type { FastifyReply, FastifyRequest } from 'fastify';

import { convertTreasureTicketsToGold, getBankExchangeRate } from '../Controller/bank.controller.js';

type ConvertTreasureTicketsBody = {
	quantity: number;
};

export async function getBankExchangeRateController(_req: FastifyRequest, reply: FastifyReply) {
	const rate = await getBankExchangeRate();
	return reply.send(rate);
}

export async function convertTreasureTicketsController(
	req: FastifyRequest<{ Body: ConvertTreasureTicketsBody }>,
	reply: FastifyReply
) {
	const userId = req.user?.id;
	if (!userId) {
		return reply.status(401).send({ error: 'Unauthorized' });
	}
	const result = await convertTreasureTicketsToGold(userId, req.body.quantity);
	return reply.send(result);
}
