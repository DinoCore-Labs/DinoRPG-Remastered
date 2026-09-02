import type { FastifyReply, FastifyRequest } from 'fastify';

import { getAdminRoadmap, updateAdminRoadmap } from '../../Roadmap/Controller/roadmap.controller.js';
import { updateRoadmapBodySchema } from '../../Roadmap/Schema/roadmap.schema.js';

export async function getAdminRoadmapHandler(_req: FastifyRequest, reply: FastifyReply) {
	const roadmap = await getAdminRoadmap();
	return reply.send(roadmap);
}

export async function updateAdminRoadmapHandler(req: FastifyRequest, reply: FastifyReply) {
	const { roadmap } = updateRoadmapBodySchema.parse(req.body);
	const updatedRoadmap = await updateAdminRoadmap(roadmap);
	return reply.send(updatedRoadmap);
}
