import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { createNewsBodySchema, newsIdParamsSchema, updateNewsBodySchema } from '../../News/Schema/news.schema.js';
import { newsService } from '../../News/Service/news.service.js';
import {
	parseCreateMultipartNewsPayload,
	parseUpdateMultipartNewsPayload
} from '../../News/Service/newsMultipart.service.js';

export async function getAdminNewsListHandler(_req: FastifyRequest, reply: FastifyReply) {
	const newsList = await newsService.getAdminNewsList();
	return reply.send(newsList);
}

export async function getAdminNewsDetailsHandler(req: FastifyRequest, reply: FastifyReply) {
	const { id } = newsIdParamsSchema.parse(req.params);

	const news = await newsService.getAdminNewsDetails(id);
	return reply.send(newsService.mapAdminNews(news));
}

export async function createAdminNewsHandler(req: FastifyRequest, reply: FastifyReply) {
	const contentType = req.headers['content-type'] ?? '';

	if (contentType.includes('multipart/form-data')) {
		const { payload, imageBuffer, imageMimeType } = await parseCreateMultipartNewsPayload(req);
		const created = await newsService.createAdminNews(payload, imageBuffer, imageMimeType);

		return reply.code(201).send(newsService.mapAdminNews(created));
	}

	const parsed = createNewsBodySchema.safeParse(req.body);
	if (!parsed.success) {
		throw new ExpectedError('Invalid news payload');
	}

	const created = await newsService.createAdminNews(parsed.data);
	return reply.code(201).send(newsService.mapAdminNews(created));
}

export async function updateAdminNewsHandler(req: FastifyRequest, reply: FastifyReply) {
	const { id } = newsIdParamsSchema.parse(req.params);
	const contentType = req.headers['content-type'] ?? '';

	if (contentType.includes('multipart/form-data')) {
		const { payload, imageBuffer, imageMimeType } = await parseUpdateMultipartNewsPayload(req);
		const updated = await newsService.updateAdminNews(id, payload, imageBuffer, imageMimeType);

		return reply.send(newsService.mapAdminNews(updated));
	}

	const parsed = updateNewsBodySchema.safeParse(req.body);
	if (!parsed.success) {
		throw new ExpectedError('Invalid news payload');
	}

	const updated = await newsService.updateAdminNews(id, parsed.data);
	return reply.send(newsService.mapAdminNews(updated));
}

export async function deleteNewsHandler(req: FastifyRequest, reply: FastifyReply) {
	const { id } = newsIdParamsSchema.parse(req.params);

	await newsService.deleteAdminNews(id);

	return reply.send({ success: true });
}
