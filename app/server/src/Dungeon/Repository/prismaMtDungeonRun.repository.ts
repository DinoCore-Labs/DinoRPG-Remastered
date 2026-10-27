/** PostgreSQL implementation of the stage-6 compare-and-swap contract. */
import { randomUUID } from 'node:crypto';

import type { MtDungeonSession, MtPendingInteraction } from '@dinorpg/core/models/dungeon/dungeon.session.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import type { MtDungeonSessionRepository, MtSessionIdentity } from '../Service/mtDungeonSession.service.js';

type Row = Awaited<ReturnType<typeof prisma.mtDungeonRun.findFirst>>;

function readPending(value: unknown): MtPendingInteraction | null {
	if (value === null) return null;
	if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Corrupt MT dungeon pending interaction.');
	const v = value as Record<string, unknown>;
	const validPoint = (p: unknown): p is { x: number; y: number; l: number } =>
		typeof p === 'object' &&
		p !== null &&
		['x', 'y', 'l'].every(k => Number.isSafeInteger((p as Record<string, unknown>)[k]));
	const kinds = ['guardian', 'gold', 'heal', 'scenario', 'boundary-start', 'boundary-exit', 'interact'];
	if (
		!kinds.includes(String(v.kind)) ||
		!validPoint(v.from) ||
		!validPoint(v.to) ||
		!(v.flag === null || Number.isSafeInteger(v.flag)) ||
		!(v.itemValue === null || Number.isSafeInteger(v.itemValue))
	)
		throw new Error('Corrupt MT dungeon pending interaction.');
	return {
		kind: v.kind as MtPendingInteraction['kind'],
		from: { ...v.from },
		to: { ...v.to },
		flag: v.flag as number | null,
		itemValue: v.itemValue as number | null
	};
}

function readStageStates(value: unknown): MtDungeonSession['stageStates'] {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Corrupt MT dungeon stageStates.');
	const result: MtDungeonSession['stageStates'] = {};
	for (const [mapId, state] of Object.entries(value)) {
		if (!/^[a-z][a-z0-9]*_(0|[1-9][0-9]*)$/.test(mapId) || !state || typeof state !== 'object' || Array.isArray(state))
			throw new Error('Corrupt MT dungeon stage snapshot.');
		const v = state as Record<string, unknown>;
		if (
			!Array.isArray(v.keys) ||
			!v.keys.every(k => typeof k === 'boolean') ||
			!Array.isArray(v.flags) ||
			!v.flags.every(k => Number.isSafeInteger(k) && k >= 0) ||
			!(v.fog === null || (Array.isArray(v.fog) && v.fog.every(b => Number.isSafeInteger(b) && b >= 0 && b <= 255)))
		)
			throw new Error('Corrupt MT dungeon stage snapshot.');
		result[mapId] = {
			keys: [...v.keys] as boolean[],
			flags: [...v.flags] as number[],
			fog: v.fog === null ? null : [...(v.fog as number[])]
		};
	}
	return result;
}

function readRow(row: NonNullable<Row>): MtDungeonSession {
	const pending = readPending(row.pending);
	const fog = row.fog === null ? null : [...row.fog];
	return {
		mapId: row.mapId,
		revision: row.revision,
		position: { x: row.x, y: row.y, l: row.l },
		keys: [...row.keys],
		flags: [...row.flags],
		fog,
		locked: row.locked,
		pending,
		stageStates: readStageStates(row.stageStates)
	};
}

function data(session: MtDungeonSession) {
	return {
		mapId: session.mapId,
		revision: session.revision,
		x: session.position.x,
		y: session.position.y,
		l: session.position.l,
		keys: [...session.keys],
		flags: [...session.flags],
		fog: session.fog === null ? null : Uint8Array.from(session.fog),
		locked: session.locked,
		stageStates: session.stageStates as unknown as Prisma.InputJsonValue,
		pending:
			session.pending === null
				? Prisma.DbNull
				: {
						kind: session.pending.kind,
						from: { ...session.pending.from },
						to: { ...session.pending.to },
						flag: session.pending.flag,
						itemValue: session.pending.itemValue
					}
	};
}

/** No implicit fight/item/scenario settlement; database holds only navigation state. */
export const prismaMtDungeonRunRepository: MtDungeonSessionRepository = {
	async load(identity: MtSessionIdentity) {
		const row = await prisma.mtDungeonRun.findFirst({
			where: {
				userId: identity.userId,
				leaderDinozId: identity.leaderDinozId,
				leaderDinoz: { userId: identity.userId }
			}
		});
		return row === null ? null : readRow(row);
	},

	async compareAndSwap(identity: MtSessionIdentity, expectedRevision: number, session: MtDungeonSession) {
		if (session.revision <= expectedRevision) throw new Error('MT revision must increase.');
		const result = await prisma.mtDungeonRun.updateMany({
			where: { userId: identity.userId, leaderDinozId: identity.leaderDinozId, revision: expectedRevision },
			data: data(session)
		});
		return result.count === 1;
	},

	async createIfAbsent(identity: MtSessionIdentity, session: MtDungeonSession) {
		const owner = await prisma.dinoz.findFirst({
			where: { id: identity.leaderDinozId, userId: identity.userId, leaderId: null },
			select: { id: true }
		});
		if (!owner) return false;
		try {
			await prisma.mtDungeonRun.create({
				data: { id: randomUUID(), userId: identity.userId, leaderDinozId: identity.leaderDinozId, ...data(session) }
			});
			return true;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return false;
			throw error;
		}
	}
};
