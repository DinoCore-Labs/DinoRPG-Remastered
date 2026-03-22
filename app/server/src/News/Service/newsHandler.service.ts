import { Language } from '@dinorpg/core/models/config/language.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { newsIdParamsSchema, newsPageParamsSchema, pollVoteParamsSchema } from '../Schema/news.schema.js';
import { newsService } from './news.service.js';

type AuthenticatedRequest = FastifyRequest & {
	user?: {
		id: string;
		profile?: {
			language?: Language | null;
		} | null;
	};
};

export async function getNewsListHandler(req: FastifyRequest, reply: FastifyReply) {
	const { page } = newsPageParamsSchema.parse(req.params);

	const user = (req as AuthenticatedRequest).user;

	const lang = (user?.profile?.language ?? Language.FR) as Language;

	const news = await newsService.getPublicNews(page);

	return reply.send(news.map(item => newsService.mapPublicNewsItem(item, lang, user?.id)));
}

export async function getNewsImageHandler(req: FastifyRequest, reply: FastifyReply) {
	const { id } = newsIdParamsSchema.parse(req.params);

	const image = await newsService.getNewsImage(id);

	reply.header('Content-Type', image.imageMimeType ?? 'application/octet-stream');
	return reply.send(image.image);
}

export async function toggleNewsLikeHandler(req: FastifyRequest, reply: FastifyReply) {
	const { id } = newsIdParamsSchema.parse(req.params);
	const user = (req as FastifyRequest & { user: { id: string } }).user;

	const result = await newsService.toggleNewsLike(id, user.id);
	return reply.send(result);
}

export async function votePollHandler(req: FastifyRequest, reply: FastifyReply) {
	const { id, optionId } = pollVoteParamsSchema.parse(req.params);
	const user = (req as FastifyRequest & { user: { id: string } }).user;

	const result = await newsService.voteToPoll(id, optionId, user.id);
	return reply.send(result);
}
