/**
 * Durable navigation snapshots across separate MT dungeon visits.
 * Remastered storage layer; original MT server persistence format is not archived.
 * The client never sends or chooses these values.
 */
import { revealMtDungeonFog } from './dungeon.exploration.js';
import {
	isValidMtDungeonSession,
	type MtDungeonSession,
	type MtDungeonStageState,
	type MtSessionConfiguration
} from './dungeon.session.js';

function stageDungeonId(mapId: string): string {
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(mapId);
	if (!match) throw new Error(`Invalid MT stage ID: ${mapId}`);
	return match[1]!;
}

function verifyStage(value: unknown, cfg: MtSessionConfiguration): MtDungeonStageState {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid saved MT dungeon stage');
	const state = value as Partial<MtDungeonStageState>;
	const count = cfg.map.width * cfg.map.height * cfg.map.levels.length;
	const fogLength = (count + 7) >> 3;
	if (
		!Array.isArray(state.keys) ||
		!state.keys.every(k => typeof k === 'boolean') ||
		!Array.isArray(state.flags) ||
		!state.flags.every(f => Number.isSafeInteger(f) && f >= 0 && f < count) ||
		!(
			state.fog === null ||
			(Array.isArray(state.fog) &&
				state.fog.length === fogLength &&
				state.fog.every(b => Number.isSafeInteger(b) && b >= 0 && b <= 255))
		)
	)
		throw new Error(`Invalid saved MT dungeon stage state for ${cfg.mapId}`);
	return {
		keys: [...state.keys],
		flags: [...new Set(state.flags)].sort((a, b) => a - b),
		fog: state.fog === null ? null : [...state.fog!]
	};
}

/** Collect current stage and every previously visited stage before a run is deleted. */
export function snapshotMtDungeonProgress(run: MtDungeonSession): Record<string, MtDungeonStageState> {
	const snapshots: Record<string, MtDungeonStageState> = {};
	for (const [stageId, state] of Object.entries(run.stageStates)) {
		snapshots[stageId] = {
			keys: [...state.keys],
			flags: [...state.flags],
			fog: state.fog === null ? null : [...state.fog]
		};
	}
	snapshots[run.mapId] = {
		keys: [...run.keys],
		flags: [...run.flags],
		fog: run.fog === null ? null : [...run.fog]
	};
	return snapshots;
}

/**
 * Start a new visit at the entrance, but preserve flags, keys and revealed fog
 * for every map. In particular a completed guardian remains defeated.
 * Invalid or stale DB snapshots fail closed rather than silently resetting.
 */
export function restoreMtDungeonProgress(
	fresh: MtDungeonSession,
	saved: unknown,
	getConfiguration: (mapId: string) => MtSessionConfiguration
): MtDungeonSession {
	if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Invalid saved MT dungeon progress');
	const dungeonId = stageDungeonId(fresh.mapId);
	const snapshots: Record<string, MtDungeonStageState> = {};
	for (const [mapId, value] of Object.entries(saved)) {
		if (stageDungeonId(mapId) !== dungeonId) throw new Error(`Cross-dungeon MT progress: ${mapId}`);
		const cfg = getConfiguration(mapId);
		if (cfg.mapId !== mapId) throw new Error(`Unknown MT progress stage: ${mapId}`);
		snapshots[mapId] = verifyStage(value, cfg);
	}
	const current = snapshots[fresh.mapId];
	if (!current) return { ...fresh, stageStates: snapshots };
	const cfg = getConfiguration(fresh.mapId);
	const result: MtDungeonSession = {
		...fresh,
		keys: [...current.keys],
		flags: [...current.flags],
		fog: current.fog === null ? null : [...current.fog],
		stageStates: snapshots
	};
	// Entrance is always rediscovered; never replace the fresh entrance position.
	if (result.fog !== null) result.fog = [...revealMtDungeonFog(cfg.map, Uint8Array.from(result.fog), result.position)];
	if (!isValidMtDungeonSession(result, cfg)) throw new Error('Invalid restored MT dungeon session');
	return result;
}
