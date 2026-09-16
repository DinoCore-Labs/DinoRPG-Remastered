import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { handleTutorialEvent } from '../../Tutorial/Controller/tutorial.controller.js';
import { canDinozRename } from '../Controller/canDinozRename.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

export const regexName = /^(?=.{1,32}$)[A-Za-zÀ-ÿ0-9'-]+( [A-Za-zÀ-ÿ0-9'-]+)*$/;

type Params = { id: string };
type Body = { name: string };

export async function setDinozName(req: FastifyRequest<{ Params: Params; Body: Body }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId');
	}
	// newName (trim important pour éviter " Dino" / "Dino ")
	const name = (req.body?.name ?? '').trim();
	const authedUserId = req.user.id;
	const dinoz = await canDinozRename(dinozId);
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { params: { dinozId } });
	}
	// Check ownership
	if (!dinoz.user || dinoz.user.id !== authedUserId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId: dinoz.id,
				userId: authedUserId
			}
		});
	}
	// Check rename rights
	if (!dinoz.canRename) {
		throw new ExpectedError(`Can't update dinoz name`);
	}
	// Check regex
	if (!regexName.test(name)) {
		throw new ExpectedError('OnlyLettersAndNumbers');
	}
	await updateDinoz(+req.params.id, {
		name: req.body.name,
		canRename: false
	});
	// Tutorial
	await handleTutorialEvent({
		userId: authedUserId,
		dinozId,
		event: 'DINOZ_ADOPTED'
	});
	return reply.send({ ok: true });
}
