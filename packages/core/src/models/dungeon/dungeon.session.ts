import type { MtCellEvent, MtDirection, MtExplorerState } from './dungeon.exploration.js';
import {
	applyMtDungeonArrival,
	createMtDungeonFog,
	decideMtDungeonMove,
	revealMtDungeonFog
} from './dungeon.exploration.js';
import { getMtFlagIndex } from './dungeon.scene.js';
import type { DungeonCommand, DungeonIcon, DungeonPoint, DungeonStructure } from './dungeon.types.js';

export type MtPendingKind = 'guardian' | 'gold' | 'heal' | 'scenario' | 'boundary-start' | 'boundary-exit' | 'interact';

export interface MtPendingInteraction {
	kind: MtPendingKind;
	/** Position before the command; never advance a fight until it resolves. */
	from: DungeonPoint;
	/** Destination after a successful server-side interaction. */
	to: DungeonPoint;
	/** Actual MT item/guardian flag; no client may choose this index. */
	flag: number | null;
	itemValue: number | null;
}

export interface MtDungeonSession {
	/** Immutable server-issued dungeon identity (e.g. 'stepp_0'). */
	mapId: string;
	position: DungeonPoint;
	keys: boolean[];
	flags: number[];
	fog: number[] | null;
	/** MT _lock. A locked non-pending session only accepts interaction. */
	locked: boolean;
	/** Server-managed pending event; never supplied by the client. */
	pending: MtPendingInteraction | null;
	/** To support optimistic storage compare-and-swap. */
	revision: number;
}

export type MtSessionRejection =
	| 'invalid-command'
	| 'invalid-batch'
	| 'stale-position'
	| 'pending-interaction'
	| 'invalid-state'
	| 'blocked'
	| 'locked-door'
	| 'scenario-blocked';

export type MtSessionBatchResult =
	| { ok: false; reason: MtSessionRejection; commandIndex: number; session: MtDungeonSession }
	| { ok: true; session: MtDungeonSession; accepted: number; pending: MtPendingInteraction | null };

export interface MtSessionConfiguration {
	map: DungeonStructure;
	mapId: string;
	scenarioIcons?: readonly DungeonIcon[];
	tower?: boolean;
}

function samePoint(a: DungeonPoint, b: DungeonPoint): boolean {
	return a.x === b.x && a.y === b.y && a.l === b.l;
}
function validPoint(p: DungeonPoint, map: DungeonStructure): boolean {
	return (
		Number.isInteger(p.x) &&
		Number.isInteger(p.y) &&
		Number.isInteger(p.l) &&
		p.l >= 0 &&
		p.l < map.levels.length &&
		p.x >= 0 &&
		p.x < map.width &&
		p.y >= 0 &&
		p.y < map.height
	);
}
function validVector(c: DungeonCommand): boolean {
	return (
		[c.x, c.y, c.l, c.dx, c.dy, c.dl].every(Number.isInteger) &&
		Math.abs(c.dx) + Math.abs(c.dy) + Math.abs(c.dl) <= 1 &&
		Math.abs(c.dx) <= 1 &&
		Math.abs(c.dy) <= 1 &&
		Math.abs(c.dl) <= 1
	);
}
function directionFor(c: DungeonCommand, tower: boolean): MtDirection {
	if (c.dx === 1) return 'east';
	if (c.dx === -1) return 'west';
	if (c.dy === 1) return 'south';
	if (c.dy === -1) return 'north';
	if (c.dl === 1) return tower ? 'up' : 'down';
	if (c.dl === -1) return tower ? 'down' : 'up';
	return 'interact';
}
function copy(session: MtDungeonSession): MtDungeonSession {
	return {
		...session,
		position: { ...session.position },
		keys: [...session.keys],
		flags: [...session.flags],
		fog: session.fog === null ? null : [...session.fog],
		pending:
			session.pending === null
				? null
				: {
						...session.pending,
						from: { ...session.pending.from },
						to: { ...session.pending.to }
					}
	};
}
function validSession(session: MtDungeonSession, cfg: MtSessionConfiguration): boolean {
	const { map } = cfg;
	return (
		session.mapId === cfg.mapId &&
		validPoint(session.position, map) &&
		Number.isSafeInteger(session.revision) &&
		session.revision >= 0 &&
		typeof session.locked === 'boolean' &&
		Array.isArray(session.keys) &&
		session.keys.every(k => typeof k === 'boolean') &&
		Array.isArray(session.flags) &&
		session.flags.every(k => Number.isInteger(k) && k >= 0 && k < map.levels.length * map.width * map.height) &&
		(session.fog === null ||
			(Array.isArray(session.fog) &&
				session.fog.length === createMtDungeonFog(map).length &&
				session.fog.every(b => Number.isInteger(b) && b >= 0 && b <= 255))) &&
		(session.pending === null || (session.locked && samePoint(session.pending.from, session.position)))
	);
}
function withFog(map: DungeonStructure, session: MtDungeonSession): MtDungeonSession {
	if (session.fog === null) return session;
	return {
		...session,
		fog: [...revealMtDungeonFog(map, new Uint8Array(session.fog), session.position)]
	};
}
function asExplorer(session: MtDungeonSession): MtExplorerState {
	return {
		position: session.position,
		keys: session.keys,
		flags: new Set(session.flags),
		locked: session.locked,
		fog: session.fog === null ? null : new Uint8Array(session.fog)
	};
}
function makePending(
	map: DungeonStructure,
	from: DungeonPoint,
	to: DungeonPoint,
	events: readonly MtCellEvent[],
	command: DungeonCommand
): MtPendingInteraction | null {
	if (command.dl !== 0 && samePoint(from, map.start))
		return { kind: 'boundary-start', from, to, flag: null, itemValue: null };
	if (command.dl !== 0 && samePoint(from, map.exit))
		return { kind: 'boundary-exit', from, to, flag: null, itemValue: null };
	if (events.some(e => e.kind === 'guardian')) {
		const event = events.find(e => e.kind === 'guardian')!;
		if (event.kind !== 'guardian') throw new Error('Impossible guardian type');
		return { kind: 'guardian', from, to, flag: getMtFlagIndex(map, from.l, event.x, event.y), itemValue: null };
	}
	for (const event of events) {
		if (event.kind !== 'pickup') continue;
		const item = event.item;
		if (item.kind === 'IGold' || item.kind === 'IHeal' || item.kind === 'IScenario')
			return {
				kind: item.kind === 'IGold' ? 'gold' : item.kind === 'IHeal' ? 'heal' : 'scenario',
				from,
				to,
				flag: item.kind === 'IHeal' ? null : getMtFlagIndex(map, from.l, item.x, item.y),
				itemValue: item.value
			};
	}
	if (command.dx === 0 && command.dy === 0 && command.dl === 0)
		return { kind: 'interact', from, to, flag: null, itemValue: null };
	return null;
}

/** The server alone creates a session. Public start/entry authorization is not part of this module. */
export function createMtDungeonSession(cfg: MtSessionConfiguration, fogEnabled = true): MtDungeonSession {
	const base: MtDungeonSession = {
		mapId: cfg.mapId,
		position: { ...cfg.map.start },
		keys: [],
		flags: [],
		fog: fogEnabled ? [...createMtDungeonFog(cfg.map)] : null,
		locked: false,
		pending: null,
		revision: 0
	};
	return withFog(cfg.map, base);
}

/**
 * Authoritatively replays a maximum of ten View.hx commands, validating every
 * command's claimed _x,_y,_l against the position established by prior steps.
 *
 * Rejections are atomic: the original session is never mutated. Unresolved
 * encounters halt the batch; no reward or guardian flag is assigned here.
 */
export function applyMtDungeonCommandBatch(
	cfg: MtSessionConfiguration,
	original: MtDungeonSession,
	commands: readonly DungeonCommand[]
): MtSessionBatchResult {
	const fail = (reason: MtSessionRejection, commandIndex: number): MtSessionBatchResult => ({
		ok: false,
		reason,
		commandIndex,
		session: copy(original)
	});
	if (!validSession(original, cfg)) return fail('invalid-state', -1);
	if (original.pending) return fail('pending-interaction', -1);
	if (!Array.isArray(commands) || commands.length < 1 || commands.length > 10) return fail('invalid-batch', -1);
	let result = copy(original);
	for (let index = 0; index < commands.length; index++) {
		const command = commands[index]!;
		if (!command || !validVector(command)) return fail('invalid-command', index);
		if (!samePoint(command, result.position)) return fail('stale-position', index);
		let decision;
		try {
			decision = decideMtDungeonMove({
				map: cfg.map,
				state: asExplorer(result),
				direction: directionFor(command, !!cfg.tower),
				scenarioIcons: cfg.scenarioIcons,
				tower: cfg.tower,
				pendingCommands: index
			});
		} catch {
			return fail('invalid-state', index);
		}
		if (decision.kind !== 'command')
			return fail(decision.reason === 'scenario-block' ? 'scenario-blocked' : 'blocked', index);
		if (
			!samePoint(command, decision.command) ||
			command.dx !== decision.command.dx ||
			command.dy !== decision.command.dy ||
			command.dl !== decision.command.dl
		)
			return fail('invalid-command', index);
		// View.move() flushes its queue upon entering a door or item. A request
		// cannot contain commands entered AFTER that synchronization point.
		if (decision.sendNow && index !== commands.length - 1) return fail('invalid-batch', index + 1);
		if (!decision.moved) {
			// MT View.move sends this command for a locked door, but does not move.
			// No key/flag is created by an unsuccessful crossing.
			if (index !== commands.length - 1) return fail('invalid-batch', index + 1);
			result.revision++;
			return { ok: true, session: result, accepted: index + 1, pending: null };
		}
		const pending = makePending(cfg.map, result.position, decision.position, decision.events, command);
		if (pending) {
			if (index !== commands.length - 1) return fail('invalid-batch', index + 1);
			result.pending = pending;
			result.locked = true;
			result.revision++;
			return { ok: true, session: result, accepted: index + 1, pending };
		}
		result.position = { ...decision.position };
		const accepted = applyMtDungeonArrival(cfg.map, asExplorer(result));
		result.keys = [...accepted.keys];
		result.flags = [...accepted.flags].sort((a, b) => a - b);
		result = withFog(cfg.map, result);
		result.revision++;
	}
	return { ok: true, session: result, accepted: commands.length, pending: null };
}

/**
 * Called ONLY by trusted server code after the existing fight, scenario,
 * inventory or exit handler has committed its result. `succeeded` is never
 * accepted from public HTTP request bodies.
 */
export function settleMtDungeonInteraction(
	cfg: MtSessionConfiguration,
	original: MtDungeonSession,
	succeeded: boolean
): MtDungeonSession {
	if (!validSession(original, cfg) || !original.pending) throw new Error('No valid pending MT dungeon interaction.');
	const result = copy(original);
	const event = result.pending!;
	result.pending = null;
	result.locked = false;
	if (succeeded) {
		result.position = { ...event.to };
		if (event.flag !== null) result.flags = [...new Set([...result.flags, event.flag])].sort((a, b) => a - b);
		const arrived = applyMtDungeonArrival(cfg.map, asExplorer(result));
		result.keys = [...arrived.keys];
		result.flags = [...arrived.flags].sort((a, b) => a - b);
		withFogInPlace(cfg.map, result);
	}
	result.revision++;
	return result;
}
function withFogInPlace(map: DungeonStructure, state: MtDungeonSession): void {
	if (state.fog !== null) state.fog = [...revealMtDungeonFog(map, new Uint8Array(state.fog), state.position)];
}
