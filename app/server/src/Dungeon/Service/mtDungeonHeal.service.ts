/**
 * Compatibility for a legacy pending IHeal recorded before the 20K rules.
 * Landing on a heal tile never restores HP or consumes it. Future arrivals
 * are normal movement commands and do not generate this pending kind.
 */
import {
	type MtDungeonSession,
	type MtSessionConfiguration,
	settleMtDungeonInteraction
} from '@dinorpg/core/models/dungeon/dungeon.session.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

export class MtDungeonHealError extends Error {
	constructor(public readonly code: 'invalid-heal' | 'stale-run' | 'invalid-party') {
		super(`MT dungeon heal: ${code}`);
	}
}

export async function settleMtDungeonHealArrival(
	identity: MtSessionIdentity,
	expectedRevision: number,
	pendingSession: MtDungeonSession,
	cfg: MtSessionConfiguration
): Promise<MtDungeonSession> {
	const event = pendingSession.pending;
	if (
		event?.kind !== 'heal' ||
		!pendingSession.locked ||
		pendingSession.mapId !== cfg.mapId ||
		event.flag !== null ||
		pendingSession.revision !== expectedRevision + 1
	)
		throw new MtDungeonHealError('invalid-heal');
	const valid = cfg.map.levels[event.to.l]?.rooms.some(
		room => room.item?.kind === 'IHeal' && room.item.x === event.to.x && room.item.y === event.to.y
	);
	if (!valid) throw new MtDungeonHealError('invalid-heal');
	const next = settleMtDungeonInteraction(cfg, pendingSession, true);
	// No life update, no zone consumption on entry.
	const updated = await prisma.mtDungeonRun.updateMany({
		where: {
			userId: identity.userId,
			leaderDinozId: identity.leaderDinozId,
			mapId: cfg.mapId,
			revision: expectedRevision
		},
		data: {
			revision: next.revision,
			x: next.position.x,
			y: next.position.y,
			l: next.position.l,
			keys: [...next.keys],
			flags: [...next.flags],
			fog: next.fog === null ? null : Uint8Array.from(next.fog),
			locked: false,
			pending: Prisma.DbNull,
			stageStates: next.stageStates as unknown as Prisma.InputJsonValue
		}
	});
	if (updated.count !== 1) throw new MtDungeonHealError('stale-run');
	return next;
}
