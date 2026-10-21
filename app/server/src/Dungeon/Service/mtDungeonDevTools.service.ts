/**
 * LOCAL DEVELOPMENT ONLY. The original MT guardian resolver is not yet ported.
 * These operations exist solely for manual layout/navigation tests, never
 * for production gameplay, economy, rankings or real dungeon victories.
 */
import { describeMtDungeonPendingEncounter } from '@dinorpg/core/models/dungeon/dungeon.encounter.js';
import {
	isValidMtDungeonSession,
	type MtDungeonSession,
	settleMtDungeonInteraction
} from '@dinorpg/core/models/dungeon/dungeon.session.js';

import { GLOBAL } from '../../context.js';
import { prisma } from '../../prisma.js';
import { saveMtDungeonProgress } from './mtDungeonProgress.service.js';
import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

export class MtDungeonDevToolsError extends Error {
	constructor(public readonly code: 'disabled' | 'not-found' | 'wrong-interaction' | 'conflict') {
		super(`MT dungeon development action: ${code}`);
	}
}

/** A positive opt-in AND non-production environment are both mandatory. */
export function mtDungeonDevToolsEnabled(): boolean {
	return (
		GLOBAL.config.env === 'development' && !GLOBAL.config.isProduction && process.env.MT_DUNGEON_DEV_TOOLS === 'true'
	);
}

function ensureEnabled(): void {
	if (!mtDungeonDevToolsEnabled()) throw new MtDungeonDevToolsError('disabled');
}
function samePoint(a: { x: number; y: number; l: number }, b: { x: number; y: number; l: number }): boolean {
	return a.x === b.x && a.y === b.y && a.l === b.l;
}

/**
 * Commit ONLY navigation/guardian flag. Does not create a FightResult, a fight
 * attempt, an inventory reward, XP, gold, achievements or monster-hunt credit.
 */
export async function skipMtGuardianInDevelopment(
	identity: MtSessionIdentity,
	revision: number
): Promise<MtDungeonSession> {
	ensureEnabled();
	const deps = mtDungeonDependencies();
	return deps.withLock(identity.userId, async () => {
		ensureEnabled();
		const session = await deps.repository.load(identity);
		if (!session) throw new MtDungeonDevToolsError('not-found');
		if (session.revision !== revision) throw new MtDungeonDevToolsError('conflict');
		if (!/^stepp_[0-3]$/.test(session.mapId) || session.pending?.kind !== 'guardian' || !session.locked)
			throw new MtDungeonDevToolsError('wrong-interaction');
		const archive = getMtDungeonArchive();
		const cfg = deps.getConfiguration(session.mapId);
		// Verify actual canonical MT door + flag: a forged pending is NOT a free teleport.
		const canonical = archive.definition('stepp');
		const encounter = describeMtDungeonPendingEncounter({
			configuration: cfg,
			session,
			definition: canonical,
			localized: canonical,
			languageUsed: 'FR'
		});
		if (encounter?.kind !== 'guardian') throw new MtDungeonDevToolsError('wrong-interaction');
		const next = settleMtDungeonInteraction(cfg, session, true);
		if (!(await deps.repository.compareAndSwap(identity, session.revision, next)))
			throw new MtDungeonDevToolsError('conflict');
		return next;
	});
}

/**
 * Local test reset, NOT the future historical over-world dungeon exit.
 * The Dinoz stay at their pre-existing overworld place (spylon).
 * Deletes only the authenticated player's own stepp_0 run; no rewards.
 */
export async function leaveMtCavernsInDevelopment(identity: MtSessionIdentity, revision: number): Promise<void> {
	ensureEnabled();
	const deps = mtDungeonDependencies();
	await deps.withLock(identity.userId, async () => {
		ensureEnabled();
		const session = await deps.repository.load(identity);
		if (!session) throw new MtDungeonDevToolsError('not-found');
		if (session.revision !== revision) throw new MtDungeonDevToolsError('conflict');
		const cfg = deps.getConfiguration(session.mapId);
		const pending = session.pending;
		if (
			session.mapId !== 'stepp_0' ||
			!isValidMtDungeonSession(session, cfg) ||
			!session.locked ||
			pending?.kind !== 'boundary-start' ||
			!samePoint(session.position, cfg.map.start) ||
			!samePoint(pending.from, cfg.map.start) ||
			!samePoint(pending.to, cfg.map.start) ||
			pending.flag !== null ||
			pending.itemValue !== null
		)
			throw new MtDungeonDevToolsError('wrong-interaction');
		// A single transaction must either preserve discoveries AND delete the run, or do neither.
		await prisma.$transaction(async tx => {
			await saveMtDungeonProgress(tx, identity, session, cfg);
			const removed = await tx.mtDungeonRun.deleteMany({
				where: { userId: identity.userId, leaderDinozId: identity.leaderDinozId, mapId: 'stepp_0', revision }
			});
			if (removed.count !== 1) throw new MtDungeonDevToolsError('conflict');
		});
	});
}
