import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { handleTutorialEvent } from '../../Tutorial/Controller/tutorial.controller.js';
import { canDinozRename } from '../Controller/canDinozRename.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

export const regexName = /^(?=.{1,32}$)[A-Za-zÀ-ÿ0-9'-]+( [A-Za-zÀ-ÿ0-9'-]+)*$/;

type Params = { id: string };
type Body = { name: string };

type RenameDinozInput = {
	userId: string;
	dinozId: number;
	name: string;
};

export async function renameDinoz({ userId, dinozId, name }: RenameDinozInput) {
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId');
	}

	const trimmedName = name.trim();
	const dinoz = await canDinozRename(dinozId);
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { params: { dinozId } });
	}

	if (!dinoz.user || dinoz.user.id !== userId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId: dinoz.id,
				userId
			}
		});
	}

	if (!dinoz.canRename) {
		throw new ExpectedError(`Can't update dinoz name`);
	}

	if (!regexName.test(trimmedName)) {
		throw new ExpectedError('OnlyLettersAndNumbers');
	}

	await updateDinoz(dinozId, {
		name: trimmedName,
		canRename: false
	});

	await handleTutorialEvent({
		userId,
		dinozId,
		event: 'DINOZ_ADOPTED'
	});
}

export async function setDinozName(req: FastifyRequest<{ Params: Params; Body: Body }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	await renameDinoz({
		userId: req.user.id,
		dinozId,
		name: req.body?.name ?? ''
	});
	return reply.send({ ok: true });
}
