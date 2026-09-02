import { Language } from '@dinorpg/core/models/config/language.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { getRoadmap } from '../Controller/roadmap.controller.js';
import { roadmapLanguageQuerySchema } from '../Schema/roadmap.schema.js';

export async function getRoadmapHandler(req: FastifyRequest, reply: FastifyReply) {
	const { lang = Language.FR } = roadmapLanguageQuerySchema.parse(req.query);
	const roadmap = await getRoadmap(lang);
	return reply.send(roadmap);
}
