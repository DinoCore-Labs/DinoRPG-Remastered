/** Persistent MT discoveries, deliberately independent from a live MtDungeonRun. */
import { snapshotMtDungeonProgress } from '@dinorpg/core/models/dungeon/dungeon.progress.js';
import {
	isValidMtDungeonSession,
	type MtDungeonSession,
	type MtSessionConfiguration
} from '@dinorpg/core/models/dungeon/dungeon.session.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

function dungeonIdFor(mapId: string): string {
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(mapId);
	if (!match) throw new Error('Invalid MT dungeon stage ID');
	return match[1]!;
}

export async function loadMtDungeonProgress(identity: MtSessionIdentity, mapId: string): Promise<unknown | null> {
	const dungeonId = dungeonIdFor(mapId);
	const row = await prisma.mtDungeonProgress.findFirst({
		where: {
			userId: identity.userId,
			leaderDinozId: identity.leaderDinozId,
			dungeonId,
			leaderDinoz: { userId: identity.userId }
		},
		select: { stageStates: true }
	});
	return row?.stageStates ?? null;
}

/** Call INSIDE the same transaction that removes the live run. */
export async function saveMtDungeonProgress(
	tx: Pick<Prisma.TransactionClient, 'mtDungeonProgress'>,
	identity: MtSessionIdentity,
	run: MtDungeonSession,
	cfg: MtSessionConfiguration
): Promise<void> {
	const dungeonId = dungeonIdFor(run.mapId);
	if (!isValidMtDungeonSession(run, cfg)) throw new Error('Invalid MT run: cannot persist progress');
	const stageStates = snapshotMtDungeonProgress(run) as unknown as Prisma.InputJsonValue;
	await tx.mtDungeonProgress.upsert({
		where: {
			userId_leaderDinozId_dungeonId: {
				userId: identity.userId,
				leaderDinozId: identity.leaderDinozId,
				dungeonId
			}
		},
		create: { userId: identity.userId, leaderDinozId: identity.leaderDinozId, dungeonId, stageStates },
		update: { stageStates }
	});
}
