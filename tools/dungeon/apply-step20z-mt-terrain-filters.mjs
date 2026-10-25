#!/usr/bin/env node
/**
 * Step 20Z — Motion Twin terrain bitmap post-processing. Compatible with 20Y,
 * with or without 20W/20X in the local tree. Only changes client rendering.
 * Transactional preflight; --check never writes. Idempotent.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.some(a => a !== '--check')) throw new Error('Usage: node tools/dungeon/apply-step20z-mt-terrain-filters.mjs [--check]');
const check = args.includes('--check');
const root = process.cwd();
const sourcePath = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
const destHelper = 'app/client/src/components/dungeon/mtDungeonTerrainEffects.ts';
const destTest = 'app/client/test/unit/dungeon/mtDungeonTerrainEffects.test.ts';
const payload = 'tools/dungeon/step20z-terrain';
const changes = new Map();
const resolve = p => path.join(root, p);
const read = p => {
	if (!fs.existsSync(resolve(p))) throw new Error(`20Z : fichier requis absent : ${p}`);
	return fs.readFileSync(resolve(p));
};
function stage(dest, bytes, { newFile = false } = {}) {
	const existing = fs.existsSync(resolve(dest)) ? fs.readFileSync(resolve(dest)) : null;
	if (existing && existing.equals(bytes)) return;
	if (newFile && existing) throw new Error(`20Z : ${dest} existe déjà avec un contenu différent ; aucune modification.`);
	changes.set(dest, bytes);
}
function once(source, before, after, description) {
	const n = source.split(before).length - 1;
	if (n !== 1) throw new Error(`20Z : ${description} introuvable ou ambigu (${n}) ; aucune modification.`);
	return source.replace(before, after);
}

const original = read(sourcePath);
const hasCRLF = original.includes(Buffer.from('\r\n'));
let source = original.toString('utf8').replace(/\r\n/g, '\n');
const finished = source.includes('STEP_20Z_MT_TERRAIN_COMPOSITE');
if (!source.includes('mtOriginalFogSprites(scene)') || !source.includes('paintFog(scene);')) {
	throw new Error(`20Z : ${sourcePath} ne contient pas la base du fog MT 20V/20Y ; installation annulée.`);
}
if (!finished) {
	const pixiImport = /import\s*\{([^}]+)\}\s*from\s*['"]pixi\.js['"];/g;
	const pixiMatches = [...source.matchAll(pixiImport)];
	if (pixiMatches.length !== 1) throw new Error(`20Z : import PixiJS introuvable ou ambigu (${pixiMatches.length}).`);
	const existingImport = pixiMatches[0][0];
	if (!/\btype\s+Texture\b/.test(existingImport)) {
		throw new Error('20Z : import attendu « type Texture » introuvable dans PixiJS ; script non applicable.');
	}
	source = source.replace(existingImport, existingImport.replace(/\btype\s+Texture\b/, 'Texture'));
	source = once(source,
		"import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';",
		"import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';\nimport { composeMtTerrainBitmap, isMtTerrainDraw, type MtTerrainDraw } from './mtDungeonTerrainEffects.js';",
		'import du composite terrain');
	source = once(source,
		'let ground: Container;',
		'let ground: Container;\n\n/** Dynamic Pixi CanvasSource, owned by this renderer (never an Assets texture). */\nlet mtTerrainTexture: Texture | null = null;',
		'texture terrain');

	const paint = `/** STEP_20Z_MT_TERRAIN_COMPOSITE — rasterize native PNG floor and overlay before post-processing. */
function mtCompositeTerrain(
	plan: ReturnType<typeof createMtSpritePlan>,
	scene: MtDungeonScene
): ReturnType<typeof composeMtTerrainBitmap> {
	const terrain = plan.sprites.filter(sprite => isMtTerrainDraw(sprite.label));
	const images: MtTerrainDraw[] = [];
	for (const sprite of terrain) {
		const resource = textures.get(sprite.url)?.source.resource;
		if (!resource) return null;
		images.push({ label: sprite.label, x: sprite.x, y: sprite.y, image: resource as CanvasImageSource });
	}
	return composeMtTerrainBitmap(images, scene.viewport);
}

`;
	source = once(source, 'async function repaint(): Promise<void> {', paint + 'async function repaint(): Promise<void> {', 'fonction repaint');

	source = once(source,
		'worldLayer.position.set(shift.offsetX, shift.offsetY);\n\n\tclearGuardianNodes();',
		`worldLayer.position.set(shift.offsetX, shift.offsetY);

	// A failed Canvas2D or unsupported ImageSource must retain the old Pixi tiles.
	const composedTerrain = mtCompositeTerrain(plan, scene);
	let nextTerrainTexture: Texture | null = null;
	if (composedTerrain) {
		try {
			nextTerrainTexture = Texture.from(composedTerrain.canvas);
		} catch {
			// Preserve original tile renderer as a safe fallback.
		}
	}

	clearGuardianNodes();`,
		'préparation du terrain');

	source = once(source,
		'for (const layer of [ground, northernWalls, items, nearWalls, fogLayer, diagnosticsLayer]) clear(layer);',
		`for (const layer of [ground, northernWalls, items, nearWalls, fogLayer, diagnosticsLayer]) clear(layer);
	mtTerrainTexture?.destroy(true);
	mtTerrainTexture = nextTerrainTexture;`,
		'nettoyage des couches');

	source = once(source,
		'for (const sprite of plan.sprites) paintSprite(sprite, scene);',
		`for (const sprite of plan.sprites) {
		if (mtTerrainTexture && isMtTerrainDraw(sprite.label)) continue;
		paintSprite(sprite, scene);
	}
	if (mtTerrainTexture && composedTerrain) {
		const visual = new Sprite(mtTerrainTexture);
		visual.position.set(composedTerrain.x, composedTerrain.y);
		ground.addChild(visual);
	}`,
		'dessin des sprites');

	source = once(source,
		'\tapp?.destroy(true, { children: true });',
		'\tmtTerrainTexture?.destroy(true);\n\tmtTerrainTexture = null;\n\tapp?.destroy(true, { children: true });',
		'libération des textures au démontage');
}
for (const marker of [
	'STEP_20Z_MT_TERRAIN_COMPOSITE',
	'mtTerrainTexture = nextTerrainTexture;',
	'isMtTerrainDraw(sprite.label)',
	'composeMtTerrainBitmap(images, scene.viewport)',
	'mtTerrainTexture?.destroy(true);'
]) if (!source.includes(marker)) throw new Error(`20Z : validation impossible pour ${marker}`);
stage(sourcePath, Buffer.from(hasCRLF ? source.replace(/\n/g, '\r\n') : source));
for (const [dest, name] of [[destHelper, 'mtDungeonTerrainEffects.ts'], [destTest, 'mtDungeonTerrainEffects.test.ts']]) {
	stage(dest, read(`${payload}/${name}`), { newFile: true });
}
if (check) {
	console.log(`[20Z] Vérification OK : ${changes.size} fichier(s) seraient modifiés. Aucun fichier écrit.`);
} else {
	for (const [dest, data] of changes) {
		fs.mkdirSync(path.dirname(resolve(dest)), { recursive: true });
		fs.writeFileSync(resolve(dest), data);
		console.log(`[20Z] ${dest}`);
	}
	console.log(`[20Z] Installation terminée : ${changes.size} fichier(s) modifié(s).`);
}
