/**
 * MT IHeal settlement. Remastered policy (not a recovered MT server formula):
 * restore living party members to maxLife, one use per zone per run.
 * All writes occur atomically, under the caller's user gameplay lock.
 */
import { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
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

/**
 * Takes a replay-validated, *server-owned* pending IHeal interaction; never accepts
 * a client-provided zone, destination, target Dinoz, heal amount or result.
 */
export async function settleMtDungeonHealArrival(
	identity: MtSessionIdentity,
	expectedRevision: number,
	pendingSession: MtDungeonSession,
	cfg: MtSessionConfiguration
): Promise<MtDungeonSession> {
	const event = pendingSession.pending;
	if (event?.kind !== 'heal' || !pendingSession.locked || pendingSession.mapId !== cfg.mapId || event.flag !== null)
		throw new MtDungeonHealError('invalid-heal');
	const zone = cfg.map.levels[event.to.l]?.rooms.some(
		room => room.item?.kind === 'IHeal' && room.item.x === event.to.x && room.item.y === event.to.y
	);
	if (!zone || event.to.l !== event.from.l || (event.to.x === event.from.x && event.to.y === event.from.y))
		throw new MtDungeonHealError('invalid-heal');
	const flag = getMtFlagIndex(cfg.map, event.to.l, event.to.x, event.to.y);
	if (pendingSession.flags.includes(flag) || pendingSession.revision !== expectedRevision + 1)
		throw new MtDungeonHealError('invalid-heal');

	// Settlement marks the IHeal zone as consumed, without inventing new map data.
	const next = settleMtDungeonInteraction(cfg, pendingSession, true);
	if (!next.flags.includes(flag) || next.pending || next.locked) throw new MtDungeonHealError('invalid-heal');

	await prisma.$transaction(async tx => {
		const party = await tx.dinoz.findMany({
			where: {
				userId: identity.userId,
				OR: [{ id: identity.leaderDinozId }, { leaderId: identity.leaderDinozId }]
			},
			select: { id: true, leaderId: true, life: true, maxLife: true }
		});
		if (!party.length || !party.some(d => d.id === identity.leaderDinozId && d.leaderId === null))
			throw new MtDungeonHealError('invalid-party');

		// Keep the well lit when nobody benefits; visiting a full-HP party
		// should not waste the zone. An actual restore consumes the zone.
		const healedAny = party.some(d => d.life > 0 && d.life < d.maxLife);
		if (!healedAny) next.flags = [...pendingSession.flags];

		const updated = await tx.mtDungeonRun.updateMany({
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

		for (const dinoz of party) {
			// No resurrection: 0 HP remains 0 HP. No healing beyond maxLife.
			if (dinoz.life <= 0 || dinoz.life >= dinoz.maxLife) continue;
			const result = await tx.dinoz.updateMany({
				where: { id: dinoz.id, userId: identity.userId, life: dinoz.life },
				data: { life: dinoz.maxLife }
			});
			if (result.count !== 1) throw new MtDungeonHealError('invalid-party');
		}
	});
	return next;
}
