import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { mtDungeonDependencies, MtDungeonEntryError } from '../Service/mtDungeonRuntime.service.js';
import {
	MtDungeonSessionError,
	openMtDungeonSession,
	submitMtDungeonCommands
} from '../Service/mtDungeonSession.service.js';

const leaderIdSchema = z.coerce.number().int().positive();
const startSchema = z
	.object({ leaderDinozId: z.number().int().positive(), dungeonId: z.string().regex(/^[a-z][a-z\d]*$/) })
	.strict();
const oneCommandSchema = z
	.object({
		x: z.number().int().nonnegative(),
		y: z.number().int().nonnegative(),
		l: z.number().int().nonnegative(),
		dx: z.number().int().min(-1).max(1),
		dy: z.number().int().min(-1).max(1),
		dl: z.number().int().min(-1).max(1)
	})
	.strict()
	.refine((c: { dx: number; dy: number; dl: number }) => Math.abs(c.dx) + Math.abs(c.dy) + Math.abs(c.dl) <= 1);
const moveSchema = z
	.object({
		revision: z.number().int().nonnegative(),
		commands: z.array(oneCommandSchema).min(1).max(10)
	})
	.strict();

function handleKnownError(error: unknown): { status: number; code: string } | null {
	if (error instanceof MtDungeonEntryError) return { status: 403, code: error.reason };
	if (error instanceof MtDungeonSessionError) {
		const status =
			error.code === 'not-found' ? 404 : error.code === 'conflict' || error.code === 'already-exists' ? 409 : 400;
		return { status, code: error.code };
	}
	return null;
}

export async function mtDungeonRoutes(app: FastifyInstance) {
	app.get('/:leaderDinozId', { preHandler: app.authenticate }, async (req, reply) => {
		const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
		if (!params.success) return reply.code(400).send({ code: 'invalid-leader' });
		const session = await mtDungeonDependencies().repository.load({
			userId: req.user.id,
			leaderDinozId: params.data
		});
		if (!session) return reply.code(404).send({ code: 'not-found' });
		return reply.send(session);
	});

	app.post('/start', { preHandler: app.authenticate }, async (req, reply) => {
		const body = startSchema.safeParse(req.body);
		if (!body.success) return reply.code(400).send({ code: 'invalid-start' });
		const deps = mtDungeonDependencies();
		try {
			const session = await openMtDungeonSession(
				deps,
				{ userId: req.user.id, leaderDinozId: body.data.leaderDinozId },
				`${body.data.dungeonId}_0`
			);
			return reply.code(201).send(session);
		} catch (error) {
			const known = handleKnownError(error);
			if (known) return reply.code(known.status).send({ code: known.code });
			throw error;
		}
	});

	app.post('/:leaderDinozId/commands', { preHandler: app.authenticate }, async (req, reply) => {
		const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
		const body = moveSchema.safeParse(req.body);
		if (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-commands' });
		try {
			const result = await submitMtDungeonCommands(
				mtDungeonDependencies(),
				{
					userId: req.user.id,
					leaderDinozId: params.data
				},
				body.data.commands,
				body.data.revision
			);
			if (!result.ok)
				return reply
					.code(409)
					.send({ code: result.reason, commandIndex: result.commandIndex, session: result.session });
			return reply.send(result);
		} catch (error) {
			const known = handleKnownError(error);
			if (known) return reply.code(known.status).send({ code: known.code });
			throw error;
		}
	});
}
