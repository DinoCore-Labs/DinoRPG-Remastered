/**
 * Remastered transport (JSON). This is NOT MT's historical Haxe Serializer.
 * No untrusted combat/item/scenario resolution endpoint is exposed.
 */
import { normalizeMtDungeonLanguage } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import { MtDungeonEncounterError } from '@dinorpg/core/models/dungeon/dungeon.encounter.js';
import { MtStageTransitionError } from '@dinorpg/core/models/dungeon/dungeon.stageTransition.js';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { getMtDungeonPendingEncounter } from '../Service/mtDungeonEncounter.service.js';
import {
	getMtDungeonArchive,
	mtDungeonDependencies,
	MtDungeonEntryError
} from '../Service/mtDungeonRuntime.service.js';
import {
	moveMtDungeonToAdjacentStage,
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
const transitionSchema = z
	.object({ revision: z.number().int().nonnegative(), action: z.enum(['forward', 'backward']) })
	.strict();
const moveSchema = z
	.object({
		revision: z.number().int().nonnegative(),
		commands: z.array(oneCommandSchema).min(1).max(10)
	})
	.strict();

function handleKnownError(error: unknown): { status: number; code: string } | null {
	if (error instanceof MtDungeonEntryError) return { status: 403, code: error.reason };
	if (error instanceof MtDungeonEncounterError) return { status: 409, code: error.code };
	if (error instanceof MtStageTransitionError) return { status: 409, code: error.code };
	if (error instanceof MtDungeonSessionError) {
		const status =
			error.code === 'not-found' ? 404 : error.code === 'conflict' || error.code === 'already-exists' ? 409 : 400;
		return { status, code: error.code };
	}
	return null;
}

export async function mtDungeonRoutes(app: FastifyInstance) {
	// Public-facing metadata are limited to introduction/exit strings and titles;
	// do not leak reward contents, hidden scenario texts, or map geometry.
	app.get('/catalog', { preHandler: app.authenticate }, async (req, reply) => {
		const query = z
			.object({ lang: z.string().max(12).optional() })
			.strict()
			.safeParse(req.query);
		if (!query.success) return reply.code(400).send({ code: 'invalid-language' });
		const language = normalizeMtDungeonLanguage(query.data.lang);
		const archive = getMtDungeonArchive();
		return reply.send(
			archive.definitions().map(d => {
				const { definition, languageUsed } = archive.localizedDefinition(d.id, language);
				return {
					id: d.id,
					name: definition.name,
					enter: definition.enter,
					exit: definition.exit,
					stageCount: d.stages.length,
					languageUsed
				};
			})
		);
	});
	/** Only inspect the server-owned encounter the leader has just triggered. */
	app.get('/:leaderDinozId/encounter', { preHandler: app.authenticate }, async (req, reply) => {
		const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
		const query = z
			.object({ lang: z.string().max(12).optional() })
			.strict()
			.safeParse(req.query);
		if (!params.success || !query.success) return reply.code(400).send({ code: 'invalid-encounter-request' });
		try {
			const encounter = await getMtDungeonPendingEncounter(
				{
					userId: req.user.id,
					leaderDinozId: params.data
				},
				query.data.lang
			);
			return reply.send({ encounter });
		} catch (error) {
			const known = handleKnownError(error);
			if (known) return reply.code(known.status).send({ code: known.code });
			throw error;
		}
	});
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

	app.post('/:leaderDinozId/transition', { preHandler: app.authenticate }, async (req, reply) => {
		const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
		const body = transitionSchema.safeParse(req.body);
		if (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-transition' });
		try {
			const session = await moveMtDungeonToAdjacentStage(
				mtDungeonDependencies(),
				{
					userId: req.user.id,
					leaderDinozId: params.data
				},
				body.data.action,
				body.data.revision
			);
			return reply.send(session);
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
