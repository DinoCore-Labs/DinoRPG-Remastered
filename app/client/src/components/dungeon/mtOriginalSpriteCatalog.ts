/**
 * MT dungeon PNG scene catalog, sourced from the archived original dungeon/gfx PNG exports.
 *
 * This file intentionally does NOT infer missing Flash timeline-symbol mappings,
 * registration points, PRNG results, Perlin pixels or filters. Missing art is
 * reported instead of substituting procedurally drawn or unrelated textures.
 *
 * Original source: DinoRPG/gfx/dungeon/gfx (Motion Twin, CC BY-NC-SA 4.0).
 * Logic reference: gfx/dungeon/View.hx (displayLevel), revision
 * 8b8e2f202e1fa8cdf1d96e4140dad0cba458054e.
 */
import type {
	MtDungeonScene,
	MtFloorTile,
	MtSceneFeature,
	MtWallTile
} from '@dinorpg/core/models/dungeon/dungeon.scene.js';

/** The exact 44 PNGs already held in the user's client.zip archive. */
export const MT_BUNDLED_PNG = [
	'back_cavern_01.png',
	'back_ruin_01.png',
	'corner_cavern_01.png',
	'corner_ruin_01.png',
	'front_cavern_01.png',
	'front_cavern_02.png',
	'front_cavern_03.png',
	'front_cavern_04.png',
	'front_ruin_01.png',
	'front_ruin_02.png',
	'front_ruin_03.png',
	'front_ruin_04.png',
	'front_ruin_05.png',
	'front_ruin_06.png',
	'ground_hell_01.png',
	'ground_hell_02.png',
	'ground_hell_03.png',
	'ground_hell_04.png',
	'ground_hell_05.png',
	'ground_sand_01.png',
	'ground_sand_02.png',
	'ground_sand_03.png',
	'ground_sand_04.png',
	'ground_sand_05.png',
	'ground_sand_06.png',
	'item_chest.png',
	'item_door_h_01.png',
	'item_door_h_open.png',
	'item_door_v_01.png',
	'item_door_v_open.png',
	'item_gold.png',
	'item_key_01.png',
	'item_key_02.png',
	'item_key_03.png',
	'item_key_04.png',
	'item_key_05.png',
	'item_key_06.png',
	'item_key_07.png',
	'item_key_08.png',
	'item_scroll.png',
	'item_skel.png',
	'item_stair_down.png',
	'item_stair_up.png',
	'side_cavern_01.png',
	'side_ruin_01.png'
] as const;
const bundled = new Set<string>(MT_BUNDLED_PNG);

export type MtRandomFrameSource = (tile: MtFloorTile | MtWallTile, availableVariants: number) => number;

/**
 * The absence of a resolver permits an *explicit* first-frame-only diagnostic
 * preview. It must NOT be presented as historical frame-selection fidelity.
 */
export interface MtSpriteOptions {
	frameFor?: MtRandomFrameSource;
	/** URL prefix for public assets, without trailing slash. */
	assetBase?: string;
}

export interface MtSpriteCommand {
	file: string;
	url: string;
	x: number;
	y: number;
	/** Original Flash depth-manager layers 0 / 1 / 3. */
	layer: 0 | 1 | 3;
	/** Stable ordering within one depth. */
	order: number;
	/** Known scene origin; final SWF registration offsets are not yet validated. */
	label: string;
}

export interface MtSpritePlan {
	sprites: MtSpriteCommand[];
	/** Explicit list of the artwork/symbols not yet faithfully resolved. */
	unresolved: string[];
	previewOnly: true;
	/** Fog and guards are deliberately NOT approximated. */
	originalFogSupported: false;
}

const TILE = 40;
const FLOOR_GROUP: Readonly<Record<string, string>> = {
	hell: 'hell',
	desert: 'sand'
};
const WALL_GROUP = new Set(['ruin', 'cavern']);

function frameName(type: string, group: string, frame: number): string {
	return `${type}_${group}_${String(frame).padStart(2, '0')}.png`;
}

function available(type: string, group: string): number {
	// The archived exports have consecutive numbered variants.
	let n = 0;
	while (bundled.has(frameName(type, group, n + 1))) n++;
	return n;
}

/**
 * Returns a texture selection *only* when the original exported PNG is present.
 * The fallback first frame is explicitly annotated as non-faithful preview.
 */
function selectVariant(
	type: string,
	group: string,
	tile: MtFloorTile | MtWallTile,
	frameFor: MtRandomFrameSource | undefined,
	unresolved: Set<string>
): string | null {
	const count = available(type, group);
	if (!count) {
		unresolved.add(`Sprite original absent : ${type}_${group}_*.png`);
		return null;
	}
	if (!frameFor && count > 1) {
		unresolved.add('Sélection des variantes mt.Rand non portée : aperçu avec la première image seulement');
	}
	const frame = frameFor?.(tile, count) ?? 1;
	if (!Number.isInteger(frame) || frame < 1 || frame > count) {
		throw new Error(`Frame MT invalide (${frame}) pour ${type}_${group} (1..${count})`);
	}
	return frameName(type, group, frame);
}

function selectWall(
	tile: MtWallTile,
	frameFor: MtRandomFrameSource | undefined,
	unresolved: Set<string>
): string | null {
	if (!WALL_GROUP.has(tile.symbol)) {
		unresolved.add(`Mur original sans sprite vérifié pour le symbole Flash « ${tile.symbol} »`);
		return null;
	}
	const kind =
		tile.part === 'front' ? 'front' : tile.part === 'back' ? 'back' : tile.part.startsWith('side') ? 'side' : 'corner';
	if (tile.part === 'side-right') {
		unresolved.add('Orientation du symbole wall_side_right à comparer au SWF original');
	}
	if (tile.part.startsWith('corner') && tile.part.endsWith('right')) {
		unresolved.add('Enregistrement et orientation des coins droits à comparer au SWF original');
	}
	return selectVariant(kind, tile.symbol, tile, frameFor, unresolved);
}

/** Build visible *original-PNG-only* draw commands; no generated textures. */
export function createMtSpritePlan(scene: MtDungeonScene, options: MtSpriteOptions = {}): MtSpritePlan {
	const unresolved = new Set<string>();
	const sprites: MtSpriteCommand[] = [];
	const assetBase = (options.assetBase ?? '/dungeon/mt').replace(/\/$/, '');
	let order = 0;
	const push = (file: string | null, x: number, y: number, layer: 0 | 1 | 3, label: string) => {
		if (!file) return;
		if (!bundled.has(file)) {
			unresolved.add(`PNG original non inclus : ${file}`);
			return;
		}
		sprites.push({ file, url: `${assetBase}/${file}`, x, y, layer, order: order++, label });
	};

	for (const tile of scene.floor) {
		const group = FLOOR_GROUP[tile.ground];
		if (!group) {
			unresolved.add(`Sol Flash non résolu vers le PNG original : « ${tile.ground} »`);
			continue;
		}
		push(
			selectVariant('ground', group, tile, options.frameFor, unresolved),
			tile.x * TILE,
			tile.y * TILE,
			0,
			`ground:${tile.ground}`
		);
	}

	// The 2 bitmap overground layers in View.hx require a verified symbol-to-PNG
	// correspondence (ruinPurple/square/dirt/etc). None is invented here.
	for (const overlay of scene.overlays) {
		unresolved.add(`Overground Flash non résolu : « ${overlay.symbol} »`);
	}

	for (const tile of scene.walls) {
		push(
			selectWall(tile, options.frameFor, unresolved),
			tile.x * TILE + tile.offsetX,
			tile.y * TILE + tile.offsetY,
			tile.depth,
			`wall:${tile.part}`
		);
	}

	for (const feature of scene.features) {
		const { file, note } = selectItem(feature);
		if (note) unresolved.add(note);
		push(file, feature.x * TILE, feature.y * TILE, 1, `item:${feature.kind}`);
	}

	if (scene.fog.length > 0) {
		unresolved.add('Brouillard Flash original : sprites fog + BlurFilter 32 px non encore portés');
	}
	// The archived PNG exports do not represent the native monster / Dinoz SWFs.
	sprites.sort((a, b) => a.layer - b.layer || a.order - b.order);
	return {
		sprites,
		unresolved: [...unresolved],
		previewOnly: true,
		originalFogSupported: false
	};
}

function selectItem(feature: MtSceneFeature): { file: string | null; note?: string } {
	switch (feature.kind) {
		case 'gold':
			return { file: 'item_gold.png' };
		case 'key': {
			const frame = 1 + (feature.keyId % 8);
			return { file: frameName('item', 'key', frame) };
		}
		case 'heal':
			return {
				file: null,
				note: 'Symbole item de soin : frames 7/8 du SWF non encore associés aux PNG originaux'
			};
		case 'door':
			return {
				file: null,
				note: 'Orientation et frame d’une porte : correspondance SWF non encore vérifiée'
			};
		case 'stair':
			return {
				file: null,
				note: 'Orientation et frame d’un escalier : correspondance SWF non encore vérifiée'
			};
		case 'scenario-icon':
			return {
				file: null,
				note: `Icône scénario Flash non portée : ${feature.icon}`
			};
		case 'guardian':
			return {
				file: null,
				note: 'Gardien original : symbole SWF _smonster non disponible au format PNG'
			};
	}
}

/** Exposed for the local-file provenance test. */
export function isBundledMtPng(name: string): boolean {
	return bundled.has(name);
}
