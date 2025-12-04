import type { FastifyReply, FastifyRequest } from 'fastify';
import sharp from 'sharp';

import { updateUserProfileSchema } from '../Schema/user.schema.js';
import {
	getOwnProfileService,
	getUserProfileService,
	updateAvatarService,
	updateProfileService
} from '../Service/userProfile.service.js';

export async function getOwnProfileController(req: FastifyRequest, reply: FastifyReply) {
	const profile = await getOwnProfileService(req.user.id);
	if (!profile) return reply.code(404).send({ message: 'Profile not found' });
	reply.send(profile);
}

export async function getUserProfileController(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const { id } = req.params;

	const profile = await getUserProfileService(id);
	if (!profile) return reply.code(404).send({ message: 'User not found' });

	reply.send(profile);
}

export async function updateProfileController(req: FastifyRequest, reply: FastifyReply) {
	const parsed = updateUserProfileSchema.safeParse(req.body);
	if (!parsed.success) return reply.code(400).send(parsed.error);

	const updated = await updateProfileService(req.user.id, parsed.data);

	return reply.send({
		success: true,
		profile: updated
	});
}

export async function uploadAvatarController(req: FastifyRequest, reply: FastifyReply) {
	const file = await req.file();
	if (!file) return reply.code(400).send({ message: 'No file uploaded' });

	const input = await file.toBuffer();

	// Compression WebP
	let quality = 70;
	let output = await sharp(input).resize(300, 300, { fit: 'cover' }).webp({ quality }).toBuffer();

	// Limite 150 KB
	while (output.length > 150 * 1024 && quality > 20) {
		quality -= 10;
		output = await sharp(input).resize(300, 300, { fit: 'cover' }).webp({ quality }).toBuffer();
	}

	await updateAvatarService(req.user.id, output);

	reply.send({ success: true });
}
