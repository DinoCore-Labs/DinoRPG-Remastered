import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyRequest } from 'fastify';

import {
	type CreateNewsBody,
	createNewsBodySchema,
	type UpdateNewsBody,
	updateNewsBodySchema
} from '../Schema/news.schema.js';

export async function parseCreateMultipartNewsPayload(req: FastifyRequest): Promise<{
	payload: CreateNewsBody;
	imageBuffer?: Uint8Array;
	imageMimeType: string | null;
}> {
	const parts = (req as FastifyRequest & { parts: () => AsyncIterable<any> }).parts();

	let payload: unknown;
	let imageBuffer: Uint8Array | undefined;
	let imageMimeType: string | null = null;

	for await (const part of parts) {
		if (part.type === 'file' && part.fieldname === 'image') {
			imageBuffer = new Uint8Array(await part.toBuffer());
			imageMimeType = part.mimetype;
			continue;
		}

		if (part.type === 'field' && part.fieldname === 'payload') {
			payload = JSON.parse(String(part.value));
		}
	}

	const parsed = createNewsBodySchema.safeParse(payload);

	if (!parsed.success) {
		console.log('CREATE NEWS PAYLOAD ERROR');
		console.log(JSON.stringify(parsed.error.flatten(), null, 2));
		console.log('RAW PAYLOAD:', JSON.stringify(payload, null, 2));
		throw new ExpectedError('Invalid news payload');
	}

	return { payload: parsed.data, imageBuffer, imageMimeType };
}

export async function parseUpdateMultipartNewsPayload(req: FastifyRequest): Promise<{
	payload: UpdateNewsBody;
	imageBuffer?: Uint8Array;
	imageMimeType: string | null;
}> {
	const parts = (req as FastifyRequest & { parts: () => AsyncIterable<any> }).parts();

	let payload: unknown;
	let imageBuffer: Uint8Array | undefined;
	let imageMimeType: string | null = null;

	for await (const part of parts) {
		if (part.type === 'file' && part.fieldname === 'image') {
			imageBuffer = new Uint8Array(await part.toBuffer());
			imageMimeType = part.mimetype;
			continue;
		}

		if (part.type === 'field' && part.fieldname === 'payload') {
			payload = JSON.parse(String(part.value));
		}
	}

	const parsed = updateNewsBodySchema.safeParse(payload);

	if (!parsed.success) {
		console.log('UPDATE NEWS PAYLOAD ERROR');
		console.log(JSON.stringify(parsed.error.flatten(), null, 2));
		console.log('RAW PAYLOAD:', JSON.stringify(payload, null, 2));
		throw new ExpectedError('Invalid news payload');
	}

	return { payload: parsed.data, imageBuffer, imageMimeType };
}
