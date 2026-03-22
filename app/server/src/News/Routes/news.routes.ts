import type { FastifyInstance } from 'fastify';

import {
	newsIdParamsSchema,
	newsPageParamsSchema,
	pollVoteParamsSchema,
	toggleNewsLikeResponseSchema,
	votePollResponseSchema
} from '../Schema/news.schema.js';
import {
	getNewsImageHandler,
	getNewsListHandler,
	toggleNewsLikeHandler,
	votePollHandler
} from '../Service/newsHandler.service.js';

export async function newsRoutes(app: FastifyInstance) {
	app.get(
		'/page/:page',
		{
			preHandler: [app.noAuth],
			schema: {
				tags: ['News'],
				params: newsPageParamsSchema
			}
		},
		getNewsListHandler
	);
	app.get(
		'/:id/image',
		{
			schema: {
				tags: ['News'],
				params: newsIdParamsSchema
			}
		},
		getNewsImageHandler
	);
	app.post(
		'/:id/like',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['News'],
				params: newsIdParamsSchema,
				response: {
					200: toggleNewsLikeResponseSchema
				}
			}
		},
		toggleNewsLikeHandler
	);
	app.post(
		'/polls/:id/vote/:optionId',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['News'],
				params: pollVoteParamsSchema,
				response: {
					200: votePollResponseSchema
				}
			}
		},
		votePollHandler
	);
}
