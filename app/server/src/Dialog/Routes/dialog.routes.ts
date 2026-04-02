import type { FastifyInstance } from 'fastify';

import {
	dialogIdParamsSchema,
	dialogLinkParamsSchema,
	dialogPhaseBodySchema,
	dialogQuerySchema
} from '../Schema/dialog.schema.js';
import { getAvailableDialogsHandler } from '../Service/getAvailableDialogs.service.js';
import { selectDialogLinkHandler } from '../Service/selectDialogLink.service.js';
import { startDialogHandler } from '../Service/startDialog.service.js';

export async function dialogRoutes(app: FastifyInstance) {
	app.get(
		'/',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dialog'],
				querystring: dialogQuerySchema
			}
		},
		getAvailableDialogsHandler
	);

	app.post(
		'/:dialogId/start',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dialog'],
				params: dialogIdParamsSchema,
				querystring: dialogQuerySchema
			}
		},
		startDialogHandler
	);

	app.post(
		'/:dialogId/links/:linkId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dialog'],
				params: dialogLinkParamsSchema,
				querystring: dialogQuerySchema,
				body: dialogPhaseBodySchema
			}
		},
		selectDialogLinkHandler
	);
}
