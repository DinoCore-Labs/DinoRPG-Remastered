/**
 * Read-only guardian visual projection for the authenticated, fog-redacted scene.
 * View.hx draws door guardians using a seeded choice from DATA._monsters.
 * This module MUST NOT select the fight team or change dungeon state.
 */
import { selectMtGuardianSprite } from '@dinorpg/core/models/dungeon/dungeon.originalEvidence.js';
import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';

export interface MtDungeonGuardianVisual {
	x: number;
	y: number;
	gfx: string;
	source: 'door' | 'scenario';
}

// Verified exported identifiers in smonsters.swf for the Cavernes Magnétiques.
// Do not let the library render its "unknown monster" fallback as real MT art.
const MAGNETIC_MONSTER_GFX = new Set(['worm2', 'worm', 'scorp', 'cactus', 'brig1', 'brig2', 'brig3']);

/** The caller must first call redactMtDungeonViewport; never pass the full map scene. */
export function getVisibleMtDungeonGuardianVisuals(
	visibleScene: Pick<MtDungeonScene, 'features'>,
	mapWidth: number,
	mapHeight: number,
	canonicalMonsterSprites: readonly string[]
): MtDungeonGuardianVisual[] {
	const visuals: MtDungeonGuardianVisual[] = [];
	for (const feature of visibleScene.features) {
		if (feature.kind !== 'guardian') continue;
		let gfx: string;
		if (feature.source === 'scenario') {
			gfx = feature.gfx;
		} else {
			gfx = selectMtGuardianSprite({
				x: feature.x,
				y: feature.y,
				width: mapWidth,
				height: mapHeight,
				serverMonsterSprites: canonicalMonsterSprites
			}).sprite;
		}
		if (!MAGNETIC_MONSTER_GFX.has(gfx)) continue;
		visuals.push({ x: feature.x, y: feature.y, gfx, source: feature.source });
	}
	return visuals;
}
