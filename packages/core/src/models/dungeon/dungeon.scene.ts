import { DUNGEON_TILE_SIZE, DUNGEON_VIEW_COLUMNS, DUNGEON_VIEW_ROWS, type DungeonSkin } from './dungeon.skins.js';
import type { DungeonDoor, DungeonIcon, DungeonItem, DungeonPoint, DungeonStructure } from './dungeon.types.js';

export type MtWallPart =
	| 'front'
	| 'side-left'
	| 'corner-top-left'
	| 'side-right'
	| 'back'
	| 'corner-top-right'
	| 'corner-bottom-left'
	| 'corner-bottom-right';

export interface MtTilePosition {
	x: number;
	y: number;
}
export interface MtViewport {
	/** Position at the top-left of the clipped 9x9 viewport, in tiles. */
	ix: number;
	iy: number;
	/** Overscan starts at (ix-2, iy-1) and has exactly 12x12 tiles. */
	minX: number;
	minY: number;
	maxXExclusive: number;
	maxYExclusive: number;
	overscanPixels: number;
	visiblePixels: number;
}

export interface MtFloorTile extends MtTilePosition {
	/** Flash block parent label (skin.g). */
	ground: string;
	/** Original mt.Rand initSeed(py*height+px). NOT a guessed frame number. */
	frameSeed: number;
	/** The first mt.Rand.random() call at this tile, after initSeed. */
	randomDrawIndex: 0;
	/** Original zonesIds[BitmapData.getPixel32(x,y)&0xFF]. */
	noiseId: 0 | 1 | 2;
}

export interface MtOverlayTile extends MtTilePosition {
	/** Original overground parent timeline label, not a PNG filename. */
	symbol: string;
	/** Original Flash subclip frame, 1..15; 0 is not drawn. */
	mask: number;
	/** Original overlay layer, 1 before 2. */
	layer: 1 | 2;
}

export interface MtWallTile extends MtTilePosition {
	part: MtWallPart;
	/** Original wall parent timeline label (skin.w). */
	symbol: string;
	/** Original mt.Rand initSeed(py*height+px). */
	frameSeed: number;
	/** Draw index in mt.Rand after the ground draw, preserving tile RNG order. */
	randomDrawIndex: number;
	/** Offset from tile registration origin, in historical pixels. */
	offsetX: number;
	offsetY: number;
	/** Original depth-manager layer: front/top 0, side/back/bottom 3. */
	depth: 0 | 3;
}

export type MtSceneFeature =
	| (MtTilePosition & { kind: 'key'; keyId: number })
	| (MtTilePosition & { kind: 'gold' })
	| (MtTilePosition & { kind: 'heal'; consumed: boolean })
	| (MtTilePosition & { kind: 'scenario-icon'; icon: string })
	| (MtTilePosition & {
			kind: 'stair';
			up: boolean;
			/** View.hx item timeline frame. */ frame: 5 | 6;
			orientation: 1 | 2;
	  })
	| (MtTilePosition & { kind: 'door'; opened: boolean; orientation: 1 | 2 })
	| (MtTilePosition & { kind: 'guardian'; source: 'door'; randomSeed: number })
	| (MtTilePosition & { kind: 'guardian'; source: 'scenario'; gfx: string });

export interface MtFogTile extends MtTilePosition {
	/** Original BitmapData fog is tinted skin.fog and filtered with 32px blur. */
	color: number;
	blur: 32;
}

export interface MtDungeonScene {
	viewport: MtViewport;
	level: number;
	/** Non-secret dimensions required by View.hx X-major frame selection. */
	mapWidth: number;
	mapHeight: number;
	/** Resolved from MT_DUNGEON_DEFINITIONS stage skin, never inferred from the map name. */
	skinKey: string;
	/** Original skin.mask opacity 0..100; a separate fixed overlay from fog. */
	fogMask: number;
	fogColor: number;
	floor: MtFloorTile[];
	overlays: MtOverlayTile[];
	/** Chronological attachment order inside Flash depth 0 or 3. */
	walls: MtWallTile[];
	/** Item timeline/depth 1, plus guardian requests on depth 2. */
	features: MtSceneFeature[];
	fog: MtFogTile[];
	/** Original roomIds[x][y] (sparse positions use null). */
	roomIds: (number | null)[][];
}

export interface MtSceneInput {
	map: DungeonStructure;
	level: number;
	/** Integral top-left viewport tile, corresponding to View.view.ix/iy. */
	viewX: number;
	viewY: number;
	skin: DungeonSkin;
	/** Original pixel's blue channel from Flash perlinNoise, 0..255. */
	noiseAt: (x: number, y: number) => number;
	/** Original _flags, linear index: level*width*height + x*height + y. */
	flags?: ReadonlySet<number>;
	/** DATA._sicons, indexed by IScenario.value. */
	scenarioIcons?: readonly DungeonIcon[];
	/** Original DATA._tower reverses the item timeline stair frames. */
	tower?: boolean;
	/** Original DATA._fog; null disables fog entirely. */
	fog?: Uint8Array | null;
}

export function getMtFlagIndex(map: DungeonStructure, level: number, x: number, y: number): number {
	return level * map.width * map.height + x * map.height + y;
}

/** In View.hx the fog bytes use ((pos + 7) >> 3), NOT (pos >> 3). */
export function isMtFogRevealed(fog: Uint8Array, map: DungeonStructure, level: number, x: number, y: number): boolean {
	if (level < 0 || level >= map.levels.length || x < 0 || x >= map.width || y < 0 || y >= map.height) return false;
	const pos = getMtFlagIndex(map, level, x, y);
	return ((fog[(pos + 7) >> 3] ?? 0) & (1 << (pos & 7))) !== 0;
}

export function getMtViewport(ix: number, iy: number): MtViewport {
	if (!Number.isInteger(ix) || !Number.isInteger(iy)) throw new Error('Dungeon viewport coordinates must be integers.');
	return {
		ix,
		iy,
		minX: ix - 2,
		minY: iy - 1,
		maxXExclusive: ix + DUNGEON_VIEW_COLUMNS + 1,
		maxYExclusive: iy + DUNGEON_VIEW_ROWS + 2,
		overscanPixels: (DUNGEON_VIEW_COLUMNS + 3) * DUNGEON_TILE_SIZE,
		visiblePixels: DUNGEON_VIEW_COLUMNS * DUNGEON_TILE_SIZE
	};
}

/** Original room coverage and door ownership from View.initZones. */
export function getMtRoomIds(map: DungeonStructure, levelIndex: number): (number | null)[][] {
	const level = map.levels[levelIndex];
	if (!level) throw new Error(`Dungeon level ${levelIndex} is missing.`);
	const ids: (number | null)[][] = Array.from({ length: map.width }, () => Array<number | null>(map.height).fill(null));
	for (const [roomIndex, room] of level.rooms.entries()) {
		for (let x = room.x; x < room.x + room.w; x++)
			for (let y = room.y; y < room.y + room.h; y++) if (ids[x]) ids[x]![y] = room.id;
		for (const door of room.doors) if (ids[door.x]) ids[door.x]![door.y] = room.id;
		// View.setupLevel() pushes synthetic stairs into the first room
		// BEFORE initZones() builds room ownership.
		if (roomIndex === 0) {
			if (map.start.l === levelIndex && ids[map.start.x]) ids[map.start.x]![map.start.y] = room.id;
			if (map.exit.l === levelIndex && ids[map.exit.x]) ids[map.exit.x]![map.exit.y] = room.id;
		}
	}
	return ids;
}

function isInside(map: DungeonStructure, x: number, y: number): boolean {
	return x >= 0 && x < map.width && y >= 0 && y < map.height;
}

/** Original View.setupLevel inserts entrance and exit stairs into room zero. */
function allDoors(map: DungeonStructure, levelIndex: number): DungeonDoor[] {
	const level = map.levels[levelIndex]!;
	const doors: DungeonDoor[] = [];
	for (const [roomIndex, room] of level.rooms.entries()) {
		doors.push(...room.doors);
		if (roomIndex === 0) {
			if (map.start.l === levelIndex) doors.push({ x: map.start.x, y: map.start.y, up: false, key: null });
			if (map.exit.l === levelIndex) doors.push({ x: map.exit.x, y: map.exit.y, up: true, key: null });
		}
	}
	return doors;
}

function scenarioIconFor(item: DungeonItem, input: MtSceneInput): DungeonIcon {
	const icon = input.scenarioIcons?.[item.value];
	if (!icon) throw new Error(`Missing original _sicons entry ${item.value} for scenario at ${item.x},${item.y}.`);
	return icon;
}

export function buildMtDungeonScene(input: MtSceneInput): MtDungeonScene {
	const { map, level: levelIndex, skin, noiseAt } = input;
	const level = map.levels[levelIndex];
	if (!level) throw new Error(`Dungeon level ${levelIndex} is missing.`);
	if (level.table.length !== map.width || level.table.some(column => column.length !== map.height))
		throw new Error('Invalid dungeon tile grid dimensions.');
	const viewport = getMtViewport(input.viewX, input.viewY);
	const flags = input.flags ?? new Set<number>();
	const roomIds = getMtRoomIds(map, levelIndex);
	const floor: MtFloorTile[] = [],
		overlays: MtOverlayTile[] = [],
		walls: MtWallTile[] = [];
	const features: MtSceneFeature[] = [],
		fog: MtFogTile[] = [];
	const blocked = new Set<number>();
	for (const room of level.rooms) {
		if (room.item?.kind === 'IScenario' && scenarioIconFor(room.item, input).kind === 'DIBlock')
			blocked.add(getMtFlagIndex(map, levelIndex, room.item.x, room.item.y));
	}
	const walkable = (x: number, y: number) =>
		isInside(map, x, y) && level.table[x]![y] && !blocked.has(getMtFlagIndex(map, levelIndex, x, y));
	const noiseCache = new Map<number, 0 | 1 | 2>();
	function noiseId(x: number, y: number): 0 | 1 | 2 {
		// Flash BitmapData.getPixel32 returns 0 for coordinates outside the bitmap.
		const source = isInside(map, x, y) ? noiseAt(x, y) : 0;
		if (!Number.isInteger(source) || source < 0 || source > 255)
			throw new Error(`Invalid perlinNoise byte at ${x},${y}; expected an original Flash blue channel in 0..255.`);
		const key = x * map.height + y;
		const prior = noiseCache.get(key);
		if (prior !== undefined) return prior;
		const threshold = skin.perlin === 'PFew' ? [60, 75] : [85, 115];
		const result: 0 | 1 | 2 = source < threshold[0]! ? 2 : source < threshold[1]! ? 1 : 0;
		noiseCache.set(key, result);
		return result;
	}
	function overMask(mid: 1 | 2, x: number, y: number): number {
		if (!skin.over[mid - 1]) return 0;
		if (noiseId(x, y) >= mid) return 15;
		let value = 0;
		// Source: View.getOverMap(), including deliberately overlapping bitmasks.
		if (noiseId(x - 1, y - 1) >= mid) value |= 8;
		if (noiseId(x, y - 1) >= mid) value |= 12;
		if (noiseId(x + 1, y - 1) >= mid) value |= 4;
		if (noiseId(x - 1, y) >= mid) value |= 10;
		if (noiseId(x + 1, y) >= mid) value |= 5;
		if (noiseId(x - 1, y + 1) >= mid) value |= 2;
		if (noiseId(x, y + 1) >= mid) value |= 3;
		if (noiseId(x + 1, y + 1) >= mid) value |= 1;
		return value;
	}
	function wall(
		part: MtWallPart,
		x: number,
		y: number,
		frameSeed: number,
		randomDrawIndex: number,
		depth: 0 | 3,
		offsetX = 0,
		offsetY = 0
	): void {
		walls.push({ part, symbol: skin.wall, x, y, frameSeed, randomDrawIndex, depth, offsetX, offsetY });
	}
	// Original nested order is py-major then px-major. The three backing
	// bitmap/symbol layers are reconstructed from separate arrays below.
	for (let py = viewport.minY; py < viewport.maxYExclusive; py++) {
		for (let px = viewport.minX; px < viewport.maxXExclusive; px++) {
			if (!walkable(px, py)) continue;
			const frameSeed = py * map.height + px;
			floor.push({ x: px, y: py, ground: skin.ground, frameSeed, randomDrawIndex: 0, noiseId: noiseId(px, py) });
			for (const mid of [1, 2] as const) {
				const mask = overMask(mid, px, py);
				const symbol = skin.over[mid - 1];
				if (mask > 0 && symbol) overlays.push({ x: px, y: py, layer: mid, mask, symbol });
			}
			const north = walkable(px, py - 1);
			const west = walkable(px - 1, py);
			const east = walkable(px + 1, py);
			const south = walkable(px, py + 1);
			let randomDrawIndex = 0;
			if (!north) wall('front', px, py, frameSeed, ++randomDrawIndex, 0);
			if (!west) wall('side-left', px, py, frameSeed, ++randomDrawIndex, 3);
			if (!north && !west) wall('corner-top-left', px, py, frameSeed, ++randomDrawIndex, 0);
			if (!east) wall('side-right', px, py, frameSeed, ++randomDrawIndex, 3);
			if (!south) wall('back', px, py, frameSeed, ++randomDrawIndex, 3);
			if (!north && !east) wall('corner-top-right', px, py, frameSeed, ++randomDrawIndex, 0, DUNGEON_TILE_SIZE + 8);
			if (!south && !west)
				wall('corner-bottom-left', px, py, frameSeed, ++randomDrawIndex, 3, 0, DUNGEON_TILE_SIZE + 8);
			if (!south && !east)
				wall(
					'corner-bottom-right',
					px,
					py,
					frameSeed,
					++randomDrawIndex,
					3,
					DUNGEON_TILE_SIZE + 8,
					DUNGEON_TILE_SIZE + 8
				);
		}
	}
	const withinViewport = (p: MtTilePosition) =>
		p.x >= viewport.minX && p.x < viewport.maxXExclusive && p.y >= viewport.minY && p.y < viewport.maxYExclusive;
	for (const room of level.rooms) {
		const item = room.item;
		if (!item || !withinViewport(item)) continue;
		const consumed = flags.has(getMtFlagIndex(map, levelIndex, item.x, item.y));
		switch (item.kind) {
			case 'IKey':
				if (!consumed) features.push({ kind: 'key', x: item.x, y: item.y, keyId: item.value });
				break;
			case 'IGold':
				if (!consumed) features.push({ kind: 'gold', x: item.x, y: item.y });
				break;
			case 'IHeal':
				features.push({ kind: 'heal', x: item.x, y: item.y, consumed });
				break;
			case 'IScenario': {
				const icon = scenarioIconFor(item, input);
				if (icon.kind === 'DIIcon' && !consumed)
					features.push({ kind: 'scenario-icon', x: item.x, y: item.y, icon: icon.icon });
				if (icon.kind === 'DIMonster' && !consumed)
					features.push({ kind: 'guardian', source: 'scenario', x: item.x, y: item.y, gfx: icon.monster });
				break;
			}
		}
	}
	for (const door of allDoors(map, levelIndex)) {
		if (!withinViewport(door)) continue;
		const opened = flags.has(getMtFlagIndex(map, levelIndex, door.x, door.y));
		if (door.up !== null) {
			// Exact item.gotoAndStop(DATA._tower ? (up?6:5) : (up?5:6)).
			const frame = (input.tower ? (door.up ? 6 : 5) : door.up ? 5 : 6) as 5 | 6;
			features.push({
				kind: 'stair',
				x: door.x,
				y: door.y,
				up: door.up,
				frame,
				orientation: walkable(door.x + 1, door.y) ? 1 : 2
			});
		} else if (door.key !== null) {
			features.push({ kind: 'door', x: door.x, y: door.y, opened, orientation: walkable(door.x, door.y - 1) ? 1 : 2 });
		} else if (!opened) {
			features.push({
				kind: 'guardian',
				source: 'door',
				x: door.x,
				y: door.y,
				randomSeed: door.x * map.height + door.y
			});
		}
	}
	if (input.fog) {
		for (let px = viewport.minX; px < viewport.maxXExclusive; px++)
			for (let py = viewport.minY; py < viewport.maxYExclusive; py++)
				if (!isMtFogRevealed(input.fog, map, levelIndex, px, py)) fog.push({ x: px, y: py, color: skin.fog, blur: 32 });
	}
	return {
		viewport,
		level: levelIndex,
		mapWidth: map.width,
		mapHeight: map.height,
		skinKey: skin.key,
		fogMask: skin.mask,
		fogColor: skin.fog,
		floor,
		overlays,
		walls,
		features,
		fog,
		roomIds
	};
}
