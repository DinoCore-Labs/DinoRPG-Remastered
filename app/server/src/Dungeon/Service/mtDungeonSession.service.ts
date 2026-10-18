/**
 * Remastered server integration boundary for MT dungeon command replay.
 *
 * Unlike `View.hx`, the original server handler and its DB schema are NOT
 * contained in the archived sources; this file deliberately does not invent
 * either. The repository, map registry, entry authorization, rewards and
 * battle settlement must be supplied by the existing game services.
 *
 * The `withLock` dependency must use the app's existing gameplay lock.
 * `compareAndSwap` MUST be atomic (WHERE revision = expectedRevision).
 * No HTTP route exposes settleInteraction; only trusted server code calls it.
 */
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	type MtDungeonSession,
	type MtSessionBatchResult,
	type MtSessionConfiguration,
	settleMtDungeonInteraction
} from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonCommand } from '@dinorpg/core/models/dungeon/dungeon.types.js';

export interface MtSessionIdentity {
	userId: string;
	leaderDinozId: number;
}

export interface MtDungeonSessionRepository {
	/** Must return ONLY this user's run for this Dinoz; never a global id lookup. */
	load(identity: MtSessionIdentity): Promise<MtDungeonSession | null>;
	/** Atomically replace only if the database still has expectedRevision. */
	compareAndSwap(identity: MtSessionIdentity, expectedRevision: number, value: MtDungeonSession): Promise<boolean>;
	/** Atomically create only if no run exists for the user+leader. */
	createIfAbsent(identity: MtSessionIdentity, value: MtDungeonSession): Promise<boolean>;
}

export interface MtDungeonSessionDependencies {
	repository: MtDungeonSessionRepository;
	/** Map and metadata must originate from trusted, versioned source files. */
	getConfiguration(mapId: string): MtSessionConfiguration;
	/** Bind this to withUserGameplayLock(userId, callback). */
	withLock<T>(userId: string, fn: () => Promise<T>): Promise<T>;
	/** Optional entry gate executed UNDER gameplay lock, before creation. Public routes MUST supply it. */
	beforeOpen?(identity: MtSessionIdentity, mapId: string): Promise<void>;
}

export class MtDungeonSessionError extends Error {
	constructor(public readonly code: 'not-found' | 'already-exists' | 'conflict' | 'invalid-run' | 'invalid-identity') {
		super(`MT dungeon session: ${code}`);
	}
}
function checkIdentity(identity: MtSessionIdentity): void {
	if (!identity.userId || !Number.isSafeInteger(identity.leaderDinozId) || identity.leaderDinozId <= 0)
		throw new MtDungeonSessionError('invalid-identity');
}

/** NEVER call from an unauthenticated public route: caller verifies entry condition, place, Dinoz ownership, and group. */
export async function openMtDungeonSession(
	deps: MtDungeonSessionDependencies,
	identity: MtSessionIdentity,
	mapId: string,
	fogEnabled = true
): Promise<MtDungeonSession> {
	checkIdentity(identity);
	return deps.withLock(identity.userId, async () => {
		if (deps.beforeOpen) await deps.beforeOpen(identity, mapId);
		const cfg = deps.getConfiguration(mapId);
		if (cfg.mapId !== mapId) throw new MtDungeonSessionError('invalid-run');
		const run = createMtDungeonSession(cfg, fogEnabled);
		if (!(await deps.repository.createIfAbsent(identity, run))) throw new MtDungeonSessionError('already-exists');
		return run;
	});
}

export async function submitMtDungeonCommands(
	deps: MtDungeonSessionDependencies,
	identity: MtSessionIdentity,
	commands: readonly DungeonCommand[],
	expectedRevision?: number
): Promise<MtSessionBatchResult> {
	checkIdentity(identity);
	return deps.withLock(identity.userId, async () => {
		const run = await deps.repository.load(identity);
		if (!run) throw new MtDungeonSessionError('not-found');
		if (expectedRevision !== undefined && run.revision !== expectedRevision)
			throw new MtDungeonSessionError('conflict');
		const cfg = deps.getConfiguration(run.mapId);
		const result = applyMtDungeonCommandBatch(cfg, run, commands);
		if (!result.ok) return result;
		if (!(await deps.repository.compareAndSwap(identity, run.revision, result.session)))
			throw new MtDungeonSessionError('conflict');
		return result;
	});
}

/** This function MUST be called after a trusted, committed reward/fight/mission result; NEVER from client input. */
export async function resolveMtDungeonInteraction(
	deps: MtDungeonSessionDependencies,
	identity: MtSessionIdentity,
	succeeded: boolean
): Promise<MtDungeonSession> {
	checkIdentity(identity);
	return deps.withLock(identity.userId, async () => {
		const run = await deps.repository.load(identity);
		if (!run) throw new MtDungeonSessionError('not-found');
		const cfg = deps.getConfiguration(run.mapId);
		const result = settleMtDungeonInteraction(cfg, run, succeeded);
		if (!(await deps.repository.compareAndSwap(identity, run.revision, result)))
			throw new MtDungeonSessionError('conflict');
		return result;
	});
}
