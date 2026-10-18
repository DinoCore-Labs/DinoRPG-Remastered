import { getMtFlagIndex } from './dungeon.scene.js';
import type { DungeonCommand, DungeonIcon, DungeonItem, DungeonPoint, DungeonStructure } from './dungeon.types.js';

export interface MtExplorerState {
	position: DungeonPoint;
	keys: readonly boolean[];
	flags: ReadonlySet<number>;
	locked: boolean;
	/** Null means that the original server disabled fog. */
	fog: Uint8Array | null;
}

export type MtDirection = 'north' | 'south' | 'west' | 'east' | 'up' | 'down' | 'interact';
export type MtMoveBlockedReason =
	| 'busy'
	| 'outside-map'
	| 'solid-wall'
	| 'scenario-block'
	| 'no-stairs'
	| 'wrong-stairs'
	| 'invalid-level'
	| 'invalid-input'
	| 'nothing-to-interact';

export type MtCellEvent =
	| { kind: 'guardian'; x: number; y: number }
	| { kind: 'locked-door'; x: number; y: number; requiredKey: number }
	| { kind: 'open-door'; x: number; y: number; keyId: number }
	| { kind: 'pickup'; item: DungeonItem }
	| { kind: 'stair'; up: boolean }
	| { kind: 'exit' };

export type MtMoveDecision =
	| { kind: 'blocked'; reason: MtMoveBlockedReason }
	| {
			kind: 'command';
			command: DungeonCommand;
			/** Optimistic local position, before the authoritative server response. */
			position: DungeonPoint;
			/** The original client waits for the server on a locked door. */
			moved: boolean;
			/** MT View.move sends on doors/items or at 10 queued commands. */
			sendNow: boolean;
			events: readonly MtCellEvent[];
	  };

const STEPS: Readonly<Record<Exclude<MtDirection, 'up' | 'down' | 'interact'>, readonly [number, number]>> = {
	north: [0, -1],
	south: [0, 1],
	west: [-1, 0],
	east: [1, 0]
};

function samePoint(a: DungeonPoint, b: DungeonPoint): boolean {
	return a.l === b.l && a.x === b.x && a.y === b.y;
}

function inBounds(map: DungeonStructure, p: DungeonPoint): boolean {
	return p.l >= 0 && p.l < map.levels.length && p.x >= 0 && p.y >= 0 && p.x < map.width && p.y < map.height;
}

function scenarioBlocks(
	map: DungeonStructure,
	level: number,
	x: number,
	y: number,
	icons?: readonly DungeonIcon[]
): boolean {
	for (const room of map.levels[level]!.rooms) {
		const item = room.item;
		if (item?.kind !== 'IScenario' || item.x !== x || item.y !== y) continue;
		const icon = icons?.[item.value];
		if (!icon) throw new Error(`Original scenario icon _sicons[${item.value}] is missing (room ${room.id}).`);
		if (icon.kind === 'DIBlock') return true;
	}
	return false;
}

function doorsAt(
	map: DungeonStructure,
	p: DungeonPoint
): { up: boolean | null; key: number | null; x: number; y: number }[] {
	const level = map.levels[p.l]!;
	const doors = level.rooms.flatMap(room => room.doors).filter(door => door.x === p.x && door.y === p.y);
	// MT View.setupLevel() appends synthetic start/exit stairs to room zero.
	if (samePoint(map.start, p)) doors.push({ x: p.x, y: p.y, up: false, key: null });
	if (samePoint(map.exit, p)) doors.push({ x: p.x, y: p.y, up: true, key: null });
	return doors;
}

/** The _cu/_cd indicators are shown only while standing on a staircase. */
export function getMtStairDirections(
	map: DungeonStructure,
	position: DungeonPoint,
	tower = false
): readonly ('up' | 'down')[] {
	if (!inBounds(map, position)) return [];
	const result: ('up' | 'down')[] = [];
	for (const door of doorsAt(map, position)) {
		if (door.up !== null) {
			// View.updateArrows(): DATA._tower swaps the UP/DOWN button roles.
			const direction = tower ? (door.up ? 'up' : 'down') : door.up ? 'down' : 'up';
			if (!result.includes(direction)) result.push(direction);
		}
	}
	return result;
}

/**
 * Returns one client-side move intent. The caller must not grant rewards or
 * commit combat outcomes based on this optimistic calculation.
 * pendingCommands matches the length of View.hx's unsent command array.
 */
export function decideMtDungeonMove(input: {
	map: DungeonStructure;
	state: MtExplorerState;
	direction: MtDirection;
	pendingCommands?: number;
	scenarioIcons?: readonly DungeonIcon[];
	/** The original DATA._tower inverts the visible arrow/level delta mapping. */
	tower?: boolean;
}): MtMoveDecision {
	const { map, state, direction } = input;
	const here = state.position;
	if (!inBounds(map, here)) return { kind: 'blocked', reason: 'outside-map' };
	if (
		!Number.isInteger(input.pendingCommands ?? 0) ||
		(input.pendingCommands ?? 0) < 0 ||
		(input.pendingCommands ?? 0) > 9
	)
		return { kind: 'blocked', reason: 'invalid-input' };

	if (state.locked && direction !== 'interact') return { kind: 'blocked', reason: 'busy' };
	if (!state.locked && direction === 'interact') return { kind: 'blocked', reason: 'nothing-to-interact' };

	const delta = direction in STEPS ? STEPS[direction as keyof typeof STEPS] : [0, 0];
	const dx = delta[0]!,
		dy = delta[1]!;
	let dl = 0;
	if (direction === 'up' || direction === 'down') {
		if (!getMtStairDirections(map, here, input.tower).includes(direction))
			return { kind: 'blocked', reason: 'no-stairs' };
		dl = input.tower ? (direction === 'up' ? 1 : -1) : direction === 'up' ? -1 : 1;
	}
	const destination: DungeonPoint = { x: here.x + dx, y: here.y + dy, l: here.l };
	if (!inBounds(map, destination)) return { kind: 'blocked', reason: 'outside-map' };
	if (!map.levels[here.l]!.table[destination.x]![destination.y]) return { kind: 'blocked', reason: 'solid-wall' };
	if (scenarioBlocks(map, here.l, destination.x, destination.y, input.scenarioIcons))
		return { kind: 'blocked', reason: 'scenario-block' };

	const events: MtCellEvent[] = [];
	let sendNow = (input.pendingCommands ?? 0) + 1 >= 10;
	let moved = true;
	// View.move checks all room doors/items at the destination and sends even
	// when a previously consumed pickup is visited again.
	for (const door of doorsAt(map, destination)) {
		sendNow = true;
		if (door.key !== null) {
			if (!state.keys[door.key]) {
				moved = false;
				events.push({ kind: 'locked-door', x: door.x, y: door.y, requiredKey: door.key });
			} else {
				events.push({ kind: 'open-door', x: door.x, y: door.y, keyId: door.key });
			}
		} else if (door.up === null && !state.flags.has(getMtFlagIndex(map, here.l, door.x, door.y))) {
			events.push({ kind: 'guardian', x: door.x, y: door.y });
		}
	}
	for (const room of map.levels[here.l]!.rooms) {
		const item = room.item;
		if (item && item.x === destination.x && item.y === destination.y) {
			sendNow = true;
			if (!state.flags.has(getMtFlagIndex(map, here.l, item.x, item.y)) || item.kind === 'IHeal')
				events.push({ kind: 'pickup', item });
		}
	}
	const next: DungeonPoint = moved ? { ...destination } : { ...here };
	if (moved && dl !== 0) {
		// At the outside entrance/exit MT View.move leaves the coordinates in
		// place. The server handles entry/exit instead of switching level.
		if (samePoint(map.exit, here)) events.push({ kind: 'exit' });
		if (!samePoint(map.start, here) && !samePoint(map.exit, here)) {
			next.l += dl;
			if (!inBounds(map, next)) return { kind: 'blocked', reason: 'invalid-level' };
		}
		const onStairs = doorsAt(map, here).find(door => door.up !== null && (door.up ? dl === 1 : dl === -1));
		if (onStairs) events.push({ kind: 'stair', up: onStairs.up! });
	}
	return {
		kind: 'command',
		command: { x: here.x, y: here.y, l: here.l, dx, dy, dl },
		position: next,
		moved,
		sendNow,
		events
	};
}

/** The original View.getItem() updates keys/flags locally AFTER scrolling. */
export function applyMtDungeonPickup(map: DungeonStructure, state: MtExplorerState): MtExplorerState {
	const p = state.position;
	if (!inBounds(map, p)) throw new Error('The player is outside the map.');
	const flags = new Set(state.flags);
	const keys = [...state.keys];
	for (const room of map.levels[p.l]!.rooms) {
		const item = room.item;
		if (!item || item.x !== p.x || item.y !== p.y) continue;
		if (item.kind === 'IKey') {
			keys[item.value] = true;
			flags.add(getMtFlagIndex(map, p.l, p.x, p.y));
		} else if (item.kind === 'IGold' || item.kind === 'IScenario') {
			flags.add(getMtFlagIndex(map, p.l, p.x, p.y));
		}
		// IHeal does not set a flag in View.getItem().
	}
	return { ...state, flags, keys };
}

/** Mirror of the original updateFog() 3x3 discovery and nonstandard byte index. */
export function revealMtDungeonFog(map: DungeonStructure, fog: Uint8Array, position: DungeonPoint): Uint8Array {
	if (!inBounds(map, position)) throw new Error('The player is outside the map.');
	const result = new Uint8Array(fog);
	for (let x = position.x - 1; x < position.x + 2; x++) {
		for (let y = position.y - 1; y < position.y + 2; y++) {
			// Deliberately use the original linear indexing, even for out-of-map
			// neighbors. This reproduces View.updateFog() at map boundaries.
			const pos = getMtFlagIndex(map, position.l, x, y);
			const byte = (pos + 7) >> 3;
			if (byte < 0 || byte >= result.length) continue;
			result[byte] = (result[byte] ?? 0) | (1 << (pos & 7));
		}
	}
	return result;
}

export function createMtDungeonFog(map: DungeonStructure): Uint8Array {
	return new Uint8Array((map.levels.length * map.width * map.height + 7) >> 3);
}

/**
 * Mirrors View.move() -> openDoor() -> scrollEnd() -> getItem() after a
 * successful local movement. Call ONLY after the authoritative response has
 * accepted this action when integrating with the Remastered server.
 */
export function applyMtDungeonArrival(map: DungeonStructure, state: MtExplorerState): MtExplorerState {
	const afterPickup = applyMtDungeonPickup(map, state);
	const p = state.position;
	const flags = new Set(afterPickup.flags);
	for (const door of doorsAt(map, p)) {
		if (door.key !== null && afterPickup.keys[door.key]) {
			flags.add(getMtFlagIndex(map, p.l, door.x, door.y));
		}
	}
	return { ...afterPickup, flags };
}
