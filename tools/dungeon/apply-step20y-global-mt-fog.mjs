#!/usr/bin/env node
/**
 * MT 20Y: exact per-map frame indexing, SWF skin metadata, original mask.
 * Compatible with 20V alone, or 20V + optional 20W/20X local changes.
 * Transactional preflight: stage ALL target files, write only after validation.
 * Does not modify Prisma, gameplay, discovery bitsets or GitHub.
 */
import fs from 'node:fs';
import path from 'node:path';

if (process.argv.slice(2).some(arg => arg !== '--check')) {
	throw new Error('Usage: node tools/dungeon/apply-step20y-global-mt-fog.mjs [--check]');
}
const check = process.argv.includes('--check');
const root = process.cwd();
const payload = 'tools/dungeon/step20y-global-fog';
const scenePath = 'packages/core/src/models/dungeon/dungeon.scene.ts';
const rendererPath = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
const staged = new Map();
const absolute = relative => path.join(root, relative);

function originalBytes(relative) {
	const p = absolute(relative);
	if (!fs.existsSync(p)) throw new Error(`Fichier requis absent : ${relative}`);
	return fs.readFileSync(p);
}
function stage(relative, bytes) {
	const old = fs.existsSync(absolute(relative)) ? fs.readFileSync(absolute(relative)) : null;
	if (!old || !old.equals(bytes)) staged.set(relative, bytes);
}
function edit(relative, transform) {
	const original = originalBytes(relative);
	const crlf = original.includes(Buffer.from('\r\n'));
	const before = original.toString('utf8').replace(/\r\n/g, '\n');
	const after = transform(before);
	if (typeof after !== 'string' || !after) throw new Error(`${relative}: résultat invalide`);
	stage(relative, Buffer.from(crlf ? after.replace(/\n/g, '\r\n') : after, 'utf8'));
}
function replaceExactly(code, needle, replacement, relative) {
	const n = code.split(needle).length - 1;
	if (n !== 1) throw new Error(`${relative}: ancrage manquant ou ambigu (${n}) : ${needle.slice(0,100)}`);
	return code.replace(needle, replacement);
}
function replaceRegex(code, re, replacement, relative, description) {
	const matches = [...code.matchAll(re)];
	if (matches.length !== 1) throw new Error(`${relative}: ${description} manquant ou ambigu (${matches.length})`);
	return code.replace(re, replacement);
}
function stagePayload(destination, filename, { allowExistingCode = false } = {}) {
	const next = originalBytes(`${payload}/${filename}`);
	if (fs.existsSync(absolute(destination))) {
		const old = fs.readFileSync(absolute(destination));
		if (old.equals(next)) return;
		if (allowExistingCode) {
			const content = old.toString('utf8');
			if (content.includes('MT_DUNGEON_MASK_URL') && content.includes('mtDungeonMaskTint') && content.includes('mtDungeonMaskAlpha')) return;
		}
		throw new Error(`${destination}: fichier existant différent ; annulation pour éviter d'écraser du travail local.`);
	}
	stage(destination, next);
}

// A. Core scene metadata. Width and height are safe for the client;
//    roomIds and secret map data continue to be redacted separately.
edit(scenePath, source => {
	if (!source.includes('skinKey: string;') || !source.includes('fogMask: number;')) {
		source = replaceExactly(source, '\tfogColor: number;\n\tfloor: MtFloorTile[];',
			'\t/** Non-secret dimensions required by View.hx X-major frame selection. */\n\tmapWidth: number;\n\tmapHeight: number;\n\t/** Resolved from MT_DUNGEON_DEFINITIONS stage skin, never inferred from the map name. */\n\tskinKey: string;\n\t/** Original skin.mask opacity 0..100; a separate fixed overlay from fog. */\n\tfogMask: number;\n\tfogColor: number;\n\tfloor: MtFloorTile[];', scenePath);
	}
	if (!source.includes('mapWidth: map.width, mapHeight: map.height, skinKey: skin.key, fogMask: skin.mask')) {
		source = replaceExactly(source,
			'return { viewport, level: levelIndex, fogColor: skin.fog, floor, overlays, walls, features, fog, roomIds };',
			'return { viewport, level: levelIndex, mapWidth: map.width, mapHeight: map.height, skinKey: skin.key, fogMask: skin.mask, fogColor: skin.fog, floor, overlays, walls, features, fog, roomIds };', scenePath);
	}
	for (const required of ['mapWidth: number;', 'mapHeight: number;', 'skinKey: string;', 'fogMask: number;', 'fogColor: skin.fog', 'mapHeight: map.height']) {
		if (!source.includes(required)) throw new Error(`${scenePath}: champ attendu absent: ${required}`);
	}
	return source;
});

// B. Frame helper: replaces 20V's unsafe roomIds.length fallback.
const fogFile = 'app/client/src/components/dungeon/mtDungeonOriginalFog.ts';
const helper = originalBytes(`${payload}/mtDungeonOriginalFog.ts`);
stage(fogFile, helper);

// C. Shared renderer; stage-fixed MT mask (49) + original fog 404.
edit(rendererPath, source => {
	if (!source.includes('mtOriginalFogSprites(scene)') || !source.includes('paintFog(scene);')) {
		throw new Error(`${rendererPath}: la base 20V (vrai fog) est absente ou incomplète. Aucun fichier modifié.`);
	}
	if (!source.includes("from './mtDungeonMask.js'")) {
		source = replaceExactly(source,
			"import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';",
			"import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';\nimport { MT_DUNGEON_MASK_URL, mtDungeonMaskAlpha, mtDungeonMaskTint } from './mtDungeonMask.js';", rendererPath);
	}
	if (!source.includes('let originalMask: Sprite | null = null;')) {
		source = replaceExactly(source, 'let fogLayer: Container;',
			'let fogLayer: Container;\n\n/** SWF symbol 49: stage-fixed overlay, independent of camera scroll and fog tiles. */\nlet originalMask: Sprite | null = null;', rendererPath);
	}
	// 20V only: include mask texture. 20W: switch from page prop to canonical scene metadata.
	if (source.includes('...(props.maskStrength ? [MT_DUNGEON_MASK_URL] : [])')) {
		source = source.replace('...(props.maskStrength ? [MT_DUNGEON_MASK_URL] : [])',
			'...(scene.fogMask > 0 ? [MT_DUNGEON_MASK_URL] : [])');
	} else if (!source.includes('...(scene.fogMask > 0 ? [MT_DUNGEON_MASK_URL] : [])')) {
		source = replaceExactly(source,
			'...(scene.fog.length ? MT_ORIGINAL_FOG_URLS : [])',
			'...(scene.fog.length ? MT_ORIGINAL_FOG_URLS : []), ...(scene.fogMask > 0 ? [MT_DUNGEON_MASK_URL] : [])', rendererPath);
	}
	if (source.includes('mtDungeonMaskAlpha(props.maskStrength ?? 0)')) {
		source = source.replace('mtDungeonMaskAlpha(props.maskStrength ?? 0)', 'mtDungeonMaskAlpha(scene.fogMask)');
	}
	if (!source.includes('function paintMtDungeonOriginalMask(scene: MtDungeonScene): void {')) {
		source = replaceExactly(source, 'async function repaint(): Promise<void> {',
			`/** View.displayLevel() attaches mask 49 to the root, never to the scrolling levelMC. */
function paintMtDungeonOriginalMask(scene: MtDungeonScene): void {
	if (!app) return;
	const opacity = mtDungeonMaskAlpha(scene.fogMask);
	const texture = textures.get(MT_DUNGEON_MASK_URL);
	if (opacity <= 0 || !texture) {
		if (originalMask) originalMask.visible = false;
		return;
	}
	if (!originalMask) {
		originalMask = new Sprite(texture);
		originalMask.position.set(0, 0);
		app.stage.addChild(originalMask);
	}
	originalMask.tint = mtDungeonMaskTint(scene.fogColor);
	originalMask.alpha = opacity;
	originalMask.visible = true;
}

async function repaint(): Promise<void> {`, rendererPath);
	}
	if (!source.includes('paintMtDungeonOriginalMask(scene);')) {
		source = replaceRegex(source, /^([ \t]*)paintFog\(scene\);(\n[ \t]*\n)([ \t]*)diagnostics\.value = \[\.\.\.errors\];/gm,
			'$1paintFog(scene);\n$1paintMtDungeonOriginalMask(scene);$2$3diagnostics.value = [...errors];', rendererPath, 'Appel fog suivi des diagnostics');
	}
	if (!source.includes('\toriginalMask = null;\n});')) {
		source = replaceExactly(source, '\tapp = null;\n});', '\tapp = null;\n\toriginalMask = null;\n});', rendererPath);
	}
	for (const required of ["from './mtDungeonMask.js'", 'mtDungeonMaskAlpha(scene.fogMask)', 'paintMtDungeonOriginalMask(scene);', 'scene.fogMask > 0', 'originalMask.tint = mtDungeonMaskTint(scene.fogColor)']) {
		if (!source.includes(required)) throw new Error(`${rendererPath}: vérification finale impossible (${required}).`);
	}
	return source;
});

stagePayload('app/client/src/components/dungeon/mtDungeonMask.ts', 'mtDungeonMask.ts', { allowExistingCode: true });
stagePayload('app/client/public/dungeon/mt/mask_mt_49.png', 'mask_mt_49.png');

// Replace regression test from 20V; add all-skins coverage from SWF CSV.
for (const [destination, file] of [
	['app/client/test/unit/dungeon/mtDungeonOriginalFog.test.ts', 'mtDungeonOriginalFog.test.ts'],
	['packages/core/test/unit/dungeon/dungeon.fogSkins.test.ts', 'dungeon.fogSkins.test.ts'],
	['packages/core/test/unit/dungeon/dungeon.fogScene.test.ts', 'dungeon.fogScene.test.ts']
]) {
	const bytes = originalBytes(`${payload}/${file}`);
	if (file !== 'mtDungeonOriginalFog.test.ts' && fs.existsSync(absolute(destination)) && !fs.readFileSync(absolute(destination)).equals(bytes)) {
		throw new Error(`${destination}: déjà présent et différent. Conserver le fichier local et résoudre manuellement.`);
	}
	stage(destination, bytes);
}

if (check) {
	console.log(`[20Y] Vérification OK (${staged.size} fichier(s) à mettre à jour). Aucune écriture.`);
} else {
	for (const [relative, bytes] of staged) {
		fs.mkdirSync(path.dirname(absolute(relative)), { recursive: true });
		fs.writeFileSync(absolute(relative), bytes);
		console.log(`[20Y] ${relative}`);
	}
	console.log(`[20Y] Installation terminée (${staged.size} fichier(s)).`);
}
