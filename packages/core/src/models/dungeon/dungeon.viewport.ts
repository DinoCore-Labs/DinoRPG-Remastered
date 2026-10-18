/**
 * Current-viewport-only projection for the MT exploration test.
 * Pure function: a client must not receive undiscovered geometry or roomIds.
 */
import { isMtFogRevealed, type MtDungeonScene } from './dungeon.scene.js';
import type { DungeonStructure } from './dungeon.types.js';

export function redactMtDungeonViewport(
	scene: MtDungeonScene,
	map: DungeonStructure,
	fog: readonly number[] | null
): MtDungeonScene {
	const fogBytes = fog === null ? null : Uint8Array.from(fog);
	const seen = (x: number, y: number): boolean =>
		fogBytes === null || isMtFogRevealed(fogBytes, map, scene.level, x, y);
	return {
		...scene,
		floor: scene.floor.filter(tile => seen(tile.x, tile.y)),
		overlays: scene.overlays.filter(tile => seen(tile.x, tile.y)),
		walls: scene.walls.filter(tile => seen(tile.x, tile.y)),
		features: scene.features.filter(feature => seen(feature.x, feature.y)),
		// roomIds has full-map dimensions; it is never transferred to the browser.
		roomIds: []
	};
}
