import { mtDungeonTileFrame } from '@dinorpg/core/models/dungeon/dungeon.rand.js';
import type {
	MtDungeonScene,
	MtFloorTile,
	MtSceneFeature,
	MtWallTile
} from '@dinorpg/core/models/dungeon/dungeon.scene.js';

import { resolveMtDungeonOverlayArt } from './mtDungeonOverlayAtlas.js';
import originalPngList from './mtOriginalGfxManifest.json';

/** All 201 PNG filenames present in the archived gfx/dungeon/gfx directory. */

export const MT_ORIGINAL_PNG: readonly string[] = Object.freeze([...originalPngList]);

// The additional 40×29 sprite was recovered later by the project.
// Keep the historical 201-PNG manifest and its tests unchanged.
const originals = new Set([...MT_ORIGINAL_PNG, 'item_heal.png']);

/** Kept only for compatibility with the step-3 test/consumers. */

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

export type MtRandomFrameSource = (tile: MtFloorTile | MtWallTile, availableVariants: number) => number;

export interface MtSpriteOptions {
	/** Overrides the built-in port of mt.Rand for verification/debugging. */

	frameFor?: MtRandomFrameSource;

	/** Vite public asset URL prefix. Defaults to /dungeon/mt. */

	assetBase?: string;

	/**

   * EXPLICIT opt-in. These same-named PNG groups are archived, but the exact

   * Flash subclip timeline order for masks 1..15 is not proven from gfx.swf.

   * Leave false for archive-faithful conservative rendering.

   */

	showUnverifiedSameNameOverlays?: boolean;
}

export interface MtSpriteCommand {
	file: string;

	url: string;

	x: number;

	y: number;

	layer: 0 | 1 | 3;

	order: number;

	label: string;
}

export interface MtSpritePlan {
	sprites: MtSpriteCommand[];

	unresolved: string[];

	previewOnly: true;

	originalFogSupported: false;
}

const TILE = 40;

/** View.hx skin.g -> archived graphic frame export family. */

const GROUND_GROUP: Readonly<Record<string, string>> = {
	cavern: 'cavern',

	crypt: 'crypt',

	desert: 'sand',

	grass: 'grass',

	hell: 'hell',

	sewer: 'sewer'
};

const WALL_GROUP = new Set(['cavern', 'crypt', 'egypt', 'forest', 'hell', 'ruin', 'sewer']);

function frameName(type: string, group: string, frame: number): string {
	return `${type}\_${group}\_${String(frame).padStart(2, '0')}.png`;
}

function frames(type: string, group: string): number {
	let n = 0;

	while (originals.has(frameName(type, group, n + 1))) n++;

	return n;
}

function wallType(part: MtWallTile['part']): string {
	if (part === 'front') return 'front';

	if (part === 'back') return 'back';

	if (part.startsWith('side')) return 'side';

	return 'corner';
}

interface NumberedFrame {
	tile: MtFloorTile | MtWallTile;

	kind: string;

	group: string;

	count: number;
}

/**

 * Original View.hx calls rseed.initSeed(py * height + px), then draws ONE

 * ground random and one random for EACH wall in attach order. A later frame

 * therefore depends on the preceding *groups' actual frame counts*.

 */

function originalFrameSelection(
	scene: MtDungeonScene,

	unresolved: Set<string>
): (tile: MtFloorTile | MtWallTile, count: number) => number | null {
	const tiles = new Map<number, Map<number, NumberedFrame>>();

	const add = (tile: MtFloorTile | MtWallTile, kind: string, group: string) => {
		const count = frames(kind, group);

		let draws = tiles.get(tile.frameSeed);

		if (!draws) {
			draws = new Map();

			tiles.set(tile.frameSeed, draws);
		}

		draws.set(tile.randomDrawIndex, { tile, kind, group, count });
	};

	for (const floor of scene.floor) add(floor, 'ground', GROUND_GROUP[floor.ground] ?? 'unresolved');

	for (const wall of scene.walls) add(wall, wallType(wall.part), wall.symbol);

	const cache = new Map<string, number | null>();

	return (tile, count) => {
		const key = `${tile.frameSeed}:${tile.randomDrawIndex}`;

		if (cache.has(key)) return cache.get(key)!;

		const draws = tiles.get(tile.frameSeed);

		const counts: number[] = [];

		for (let i = 0; i <= tile.randomDrawIndex; i++) {
			const previous = draws?.get(i);

			if (!previous || previous.count < 1) {
				unresolved.add(`Séquence mt.Rand incomplète à seed ${tile.frameSeed} (tirage ${i}) : frame Flash manquante`);

				cache.set(key, null);

				return null;
			}

			counts.push(previous.count);
		}

		const selected = mtDungeonTileFrame(tile.frameSeed, counts);

		if (selected > count) {
			unresolved.add(`Frame mt.Rand non exportée : ${key}, frame ${selected}/${count}`);

			cache.set(key, null);

			return null;
		}

		cache.set(key, selected);

		return selected;
	};
}

function itemArt(feature: MtSceneFeature, unresolved: Set<string>): string | null {
	switch (feature.kind) {
		case 'gold':
			return 'item_gold.png';

		case 'key':
			return frameName('item', 'key', 1 + (feature.keyId % 8));

		case 'door': {
			// View.hx: smc frame 1 if north passable, 2 otherwise.

			// h/v naming corresponds to the archived PNG groups. Registration

			// inside SWF still needs measurement against the original timeline.

			const dir = feature.orientation === 1 ? 'h' : 'v';

			unresolved.add('Ancrage des objets de porte (PNG 40×54) encore à comparer à gfx.swf');

			return `item_door\_${dir}\_${feature.opened ? 'open' : '01'}.png`;
		}

		case 'stair':
			// View.hx assigns timeline frame 5 or 6. The historical exports name

			// the corresponding images stair_up / stair_down (direction from frame).

			unresolved.add('Orientation/ancrage de l’escalier à vérifier avec gfx.swf (frame 5/6)');

			return feature.frame === 6 ? 'item_stair_up.png' : 'item_stair_down.png';

		case 'heal':
			return 'item_heal.png';

		case 'scenario-icon': {
			// The canonical MT definitions use exactly chest, scroll and skel.
			// These exact PNG files exist in the original export.
			if (feature.icon === 'chest' || feature.icon === 'scroll' || feature.icon === 'skel') {
				return `item_${feature.icon}.png`;
			}
			unresolved.add(`Scénario : symbole Flash DIIcon « ${feature.icon} » à extraire de gfx.swf`);
			return null;
		}

		case 'guardian':
			// Animated smonster guardians are drawn on the actor plane, not the item plane.
			return null;
	}
}

export function createMtSpritePlan(scene: MtDungeonScene, options: MtSpriteOptions = {}): MtSpritePlan {
	const unresolved = new Set<string>();

	const assetBase = (options.assetBase ?? '/dungeon/mt').replace(/\/+$/, '');

	const sprites: MtSpriteCommand[] = [];

	let order = 0;

	const push = (file: string | null, x: number, y: number, layer: 0 | 1 | 3, label: string) => {
		if (!file) return;

		if (!originals.has(file)) {
			unresolved.add(`PNG absent de l'archive Motion Twin : ${file}`);

			return;
		}

		sprites.push({ file, url: `${assetBase}/${file}`, x, y, layer, order: order++, label });
	};

	const select = originalFrameSelection(scene, unresolved);

	const resolveFrame = (tile: MtFloorTile | MtWallTile, kind: string, group: string): string | null => {
		const count = frames(kind, group);

		if (!count) {
			unresolved.add(`Aucun PNG exporté pour le symbole ${kind}\_${group} (présent éventuellement dans gfx.swf)`);

			return null;
		}

		const index = options.frameFor ? options.frameFor(tile, count) : select(tile, count);

		if (index == null) return null;

		if (!Number.isInteger(index) || index < 1 || index > count) {
			throw new Error(`Frame MT invalide (${index}) pour ${kind}\_${group} (1..${count})`);
		}

		return frameName(kind, group, index);
	};

	for (const tile of scene.floor) {
		const group = GROUND_GROUP[tile.ground];

		if (!group) {
			unresolved.add(`Sol Flash « ${tile.ground} » non exporté en PNG (gfx.swf à examiner)`);

			continue;
		}

		push(resolveFrame(tile, 'ground', group), tile.x * TILE, tile.y * TILE, 0, `ground:${tile.ground}`);
	}

	for (const tile of scene.overlays) {
		// These are the ORIGINAL MT scene masks, generated before this point.
		// The archived Flash labels do not all match PNG family names.
		// Mappings stay opt-in, visibly documented as unverified.
		if (!options.showUnverifiedSameNameOverlays) {
			unresolved.add(`Recouvrement Flash « ${tile.symbol} » : correspondance PNG/timeline non vérifiée`);
			continue;
		}
		const visual = resolveMtDungeonOverlayArt(tile.symbol, tile.mask);
		if (!visual) {
			unresolved.add(`Recouvrement Flash « ${tile.symbol} » sans texture de prévisualisation`);
			continue;
		}
		unresolved.add(`Correspondance Flash ${tile.symbol} → PNG ${visual.family} non vérifiée (20L)`);
		push(visual.file, tile.x * TILE, tile.y * TILE, 0, `overground:${tile.symbol}:${tile.layer}`);
	}

	for (const tile of scene.walls) {
		if (!WALL_GROUP.has(tile.symbol)) {
			unresolved.add(`Mur Flash « ${tile.symbol} » sans PNG exporté dans l'archive`);

			continue;
		}

		if (tile.part === 'side-right') unresolved.add('Orientation du mur latéral droit encore à confirmer dans gfx.swf');

		if (tile.part.includes('right') && tile.part.startsWith('corner')) {
			unresolved.add('Orientation/enregistrement du coin droit encore à confirmer dans gfx.swf');
		}

		push(
			resolveFrame(tile, wallType(tile.part), tile.symbol),

			tile.x * TILE + tile.offsetX,

			tile.y * TILE + tile.offsetY,

			tile.depth,

			`wall:${tile.part}`
		);
	}

	for (const feature of scene.features) {
		const file = itemArt(feature, unresolved);
		push(file, feature.x * TILE, feature.y * TILE, 1, `item:${feature.kind}:${file ?? 'missing'}`);
	}

	if (scene.fog.length) unresolved.add('Brouillard original fog + BlurFilter(32,32) non encore porté');

	// Native Flash depth layers. The floor/overground bitmap and front walls

	// occupy depth 0; items depth 1; sides/back walls depth 3.

	sprites.sort((a, b) => a.layer - b.layer || a.order - b.order);

	return { sprites, unresolved: [...unresolved], previewOnly: true, originalFogSupported: false };
}

export function isOriginalMtPng(name: string): boolean {
	return originals.has(name);
}

/** Compatibility with step 3's initial bundled subset. */

export function isBundledMtPng(name: string): boolean {
	return (MT_BUNDLED_PNG as readonly string[]).includes(name);
}
