/**
 * Pure, fail-closed stage-to-stage movement for Motion Twin dungeon maps.
 *
 * Historical behavior: View.hx leaves the Dinoz on the exterior staircase
 * and waits for a server response. The original server controller and storage
 * are not archived; the per-map snapshots and CAS are Remastered adaptations.
 * The world entrance/exit remain intentionally outside this module.
 */
import { revealMtDungeonFog } from './dungeon.exploration.js';
import {
	createMtDungeonSession,
	isValidMtDungeonSession,
	type MtDungeonSession,
	type MtDungeonStageState,
	type MtSessionConfiguration
} from './dungeon.session.js';

export type MtStageTransitionDirection = 'forward' | 'backward';
export type MtStageTransitionRejection =
	'invalid-run' | 'wrong-boundary' | 'world-boundary' | 'invalid-destination' | 'invalid-snapshot';

export class MtStageTransitionError extends Error {
	constructor(public readonly code: MtStageTransitionRejection) {
		super(`MT dungeon stage transition: ${code}`);
	}
}

function samePoint(a: { x: number; y: number; l: number }, b: { x: number; y: number; l: number }): boolean {
	return a.x === b.x && a.y === b.y && a.l === b.l;
}
function parseStageId(mapId: string): { dungeon: string; index: number } {
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(mapId);
	if (!match || !Number.isSafeInteger(Number(match[2]))) throw new MtStageTransitionError('invalid-run');
	return { dungeon: match[1]!, index: Number(match[2]) };
}
function isStageState(state: unknown, cfg: MtSessionConfiguration): state is MtDungeonStageState {
	if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
	const snap = state as MtDungeonStageState;
	const fogSize = createMtDungeonSession(cfg).fog!.length;
	return (
		Array.isArray(snap.keys) &&
		snap.keys.every(k => typeof k === 'boolean') &&
		Array.isArray(snap.flags) &&
		snap.flags.every(
			f => Number.isSafeInteger(f) && f >= 0 && f < cfg.map.width * cfg.map.height * cfg.map.levels.length
		) &&
		(snap.fog === null ||
			(Array.isArray(snap.fog) &&
				snap.fog.length === fogSize &&
				snap.fog.every(b => Number.isSafeInteger(b) && b >= 0 && b <= 255)))
	);
}

/**
 * Caller must check stage count from the original FR definition, load both
 * original maps, and save via atomic compareAndSwap under user gameplay lock.
 */
export function transitionMtDungeonStage(
	current: MtSessionConfiguration,
	next: MtSessionConfiguration,
	original: MtDungeonSession,
	direction: MtStageTransitionDirection,
	stageCount: number
): MtDungeonSession {
	if (!isValidMtDungeonSession(original, current) || !Number.isSafeInteger(stageCount) || stageCount < 1)
		throw new MtStageTransitionError('invalid-run');
	const from = parseStageId(current.mapId),
		to = parseStageId(next.mapId);
	if (
		original.mapId !== current.mapId ||
		from.index >= stageCount ||
		from.dungeon !== to.dungeon ||
		to.index !== from.index + (direction === 'forward' ? 1 : -1)
	)
		throw new MtStageTransitionError('invalid-run');
	if (to.index < 0 || to.index >= stageCount) throw new MtStageTransitionError('world-boundary');
	const expectedKind = direction === 'forward' ? 'boundary-exit' : 'boundary-start';
	const expectedPosition = direction === 'forward' ? current.map.exit : current.map.start;
	const pending = original.pending;
	if (
		!pending ||
		!original.locked ||
		pending.kind !== expectedKind ||
		!samePoint(original.position, expectedPosition) ||
		!samePoint(pending.from, expectedPosition) ||
		!samePoint(pending.to, expectedPosition) ||
		pending.flag !== null ||
		pending.itemValue !== null
	)
		throw new MtStageTransitionError('wrong-boundary');
	const destination = direction === 'forward' ? next.map.start : next.map.exit;
	if (!next.map.levels[destination.l]?.table[destination.x]?.[destination.y])
		throw new MtStageTransitionError('invalid-destination');

	const stageStates: MtDungeonSession['stageStates'] = {
		...original.stageStates
	};
	stageStates[current.mapId] = {
		keys: [...original.keys],
		flags: [...original.flags],
		fog: original.fog === null ? null : [...original.fog]
	};
	const previous = stageStates[next.mapId];
	if (previous !== undefined && !isStageState(previous, next)) throw new MtStageTransitionError('invalid-snapshot');
	const fresh = createMtDungeonSession(next, original.fog !== null);
	const destinationState = previous ?? { keys: fresh.keys, flags: fresh.flags, fog: fresh.fog };
	const result: MtDungeonSession = {
		...fresh,
		position: { ...destination },
		keys: [...destinationState.keys],
		flags: [...destinationState.flags],
		fog: destinationState.fog === null ? null : [...destinationState.fog],
		stageStates,
		revision: original.revision + 1,
		pending: null,
		locked: false
	};
	// The renderer's updateFog() reveals 3x3 on arrival and on re-entry.
	// No pickup/reward is replayed at the destination.
	if (result.fog !== null) result.fog = [...revealMtDungeonFog(next.map, Uint8Array.from(result.fog), destination)];
	if (!isValidMtDungeonSession(result, next)) throw new MtStageTransitionError('invalid-snapshot');
	return result;
}
