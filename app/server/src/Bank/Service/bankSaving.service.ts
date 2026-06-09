import { FastifyReply, FastifyRequest } from 'fastify';

import { claimBankSaving, createBankSaving, getBankSavings } from '../Controller/bankSaving.controller.js';

type CreateBankSavingBody = {
	amount: number;
	durationDays: number;
};

type ClaimBankSavingParams = {
	id: string;
};

export async function getBankSavingsController(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user?.id;
	if (!userId) {
		return reply.status(401).send({ error: 'Unauthorized' });
	}
	const result = await getBankSavings(userId);
	return reply.send(result);
}

export async function createBankSavingController(
	req: FastifyRequest<{ Body: CreateBankSavingBody }>,
	reply: FastifyReply
) {
	const userId = req.user?.id;
	if (!userId) {
		return reply.status(401).send({ error: 'Unauthorized' });
	}
	const result = await createBankSaving(userId, req.body.amount, req.body.durationDays);
	return reply.send(result);
}

export async function claimBankSavingController(
	req: FastifyRequest<{ Params: ClaimBankSavingParams }>,
	reply: FastifyReply
) {
	const userId = req.user?.id;
	if (!userId) {
		return reply.status(401).send({ error: 'Unauthorized' });
	}
	const result = await claimBankSaving(userId, req.params.id);
	return reply.send(result);
}
