import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { getCurrentTutorial, handleTutorialEvent } from '../Controller/tutorial.controller.js';
import { TutorialEventBody } from '../Schema/tutorial.schema.js';

export async function getCurrentTutorialController(req: FastifyRequest, reply: FastifyReply) {
	return reply.send(await getCurrentTutorial(req.user.id));
}

export async function sendTutorialEventController(
	req: FastifyRequest<{ Body: TutorialEventBody }>,
	reply: FastifyReply
) {
	const userId = req.user.id;
	/*
	 * Les objectifs déclenchés depuis le frontend
	 * (clan, compte et fin) n'ont pas besoin d'un Dinoz
	 * particulier.
	 *
	 * Le moteur du tutoriel utilise néanmoins encore
	 * un dinozId pour construire son contexte générique.
	 *
	 * On le résout donc côté serveur plutôt que de faire
	 * confiance à un dinozId envoyé par le client.
	 */
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			userId
		},
		orderBy: {
			id: 'asc'
		},
		select: {
			id: true
		}
	});
	/*
	 * À ce stade du tutoriel un Dinoz existe forcément.
	 *
	 * Sur un compte historique/incohérent sans Dinoz,
	 * l'événement est simplement ignoré.
	 */
	if (!dinoz) {
		return reply.send(await getCurrentTutorial(userId));
	}
	await handleTutorialEvent({
		userId,
		dinozId: dinoz.id,
		event: req.body.event
	});
	/*
	 * On retourne directement l'état à jour afin que
	 * le client n'ait pas besoin d'effectuer ensuite
	 * un second GET /tutorial/current.
	 */
	return reply.send(await getCurrentTutorial(userId));
}
