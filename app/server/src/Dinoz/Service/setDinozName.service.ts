import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { canDinozRename } from '../Controller/canDinozRename.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

export const regexName = /^(?=.{1,32}$)[A-Za-zÀ-ÿ0-9]+( [A-Za-zÀ-ÿ0-9]+)*$/;

type Params = { id: string };
type Body = { newName: string };

export async function setDinozName(req: FastifyRequest<{ Params: Params; Body: Body }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('Invalid dinoz id');
	}

	// newName (trim important pour éviter " Dino" / "Dino ")
	const name = (req.body?.newName ?? '').trim();

	const authedUserId = req.user.id;

	const dinoz = await canDinozRename(dinozId);

	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { params: { dinozId } });
	}

	// Vérifie ownership
	if (!dinoz.user || dinoz.user.id !== authedUserId) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to user ${authedUserId}`);
	}

	// Vérifie droit rename
	if (!dinoz.canRename) {
		throw new ExpectedError(`Can't update dinoz name`);
	}

	// Vérifie regex
	if (!regexName.test(name)) {
		throw new ExpectedError('OnlyLettersAndNumbers');
	}

	await updateDinoz(+req.params.id, {
		name: req.body.newName,
		canRename: false
	});

	return reply.send({ ok: true });
}
