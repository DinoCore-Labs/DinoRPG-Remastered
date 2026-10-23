#!/usr/bin/env node
/** Step 20L: visual-only upgrade for the current MT dungeon client. */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const script = fileURLToPath(import.meta.url);
const artifactRoot = resolve(dirname(script), '../..');
const checkOnly = process.argv.includes('--check');
const edits = new Map();

function required(path) {
	const absolute = resolve(root, path);
	if (!existsSync(absolute)) throw new Error(`${path}: fichier absent`);
	return readFileSync(absolute, 'utf8');
}
function replacement(path, input, fn) {
	const eol = input.includes('\r\n') ? '\r\n' : '\n';
	const normalized = input.replace(/\r\n/g, '\n');
	const result = fn(normalized, path);
	if (typeof result !== 'string') throw new Error(`${path}: transformation invalide`);
	const output = eol === '\r\n' ? result.replace(/\n/g, '\r\n') : result;
	if (output !== input) edits.set(path, output);
}
function exactlyOne(text, oldValue, path) {
	const n = text.split(oldValue).length - 1;
	if (n !== 1) throw new Error(`${path}: ancrage manquant ou ambigu (${n}): ${oldValue.slice(0, 90)}`);
}
function patch(path, fn) { replacement(path, required(path), fn); }

const placementPath = 'app/client/src/components/dungeon/mtDungeonItemPlacement.ts';
patch(placementPath, (s, path) => {
	if (s.includes('// Step 20L: native-size original treasure artwork.')) return s;
	const start = "\tif (file === 'item_stair_up.png') {";
	exactlyOne(s, start, path);
	const native = [
		'\t// Step 20L: native-size original treasure artwork.',
		"\tif (file === 'item_gold.png' || file === 'item_chest.png') {",
		'\t\treturn { x: x + cell / 2, y: y + cell / 2, anchorX: 0.5, anchorY: 0.5, scale: 1 };',
		'\t}',
		start
	].join('\n');
	s = s.replace(start, native);
	const old = "file === 'item_gold.png' || file === 'item_chest.png' || file === 'item_skel.png'";
	exactlyOne(s, old, path);
	return s.replace(old, "file === 'item_skel.png'");
});

const atlasPath = 'app/client/src/components/dungeon/mtOriginalSpriteCatalog.ts';
patch(atlasPath, (s, path) => {
	if (s.includes('resolveMtDungeonOverlayArt(tile.symbol, tile.mask)')) return s;
	const imp = "import { mtDungeonTileFrame } from '@dinorpg/core/models/dungeon/dungeon.rand.js';";
	exactlyOne(s, imp, path);
	s = s.replace(imp, `${imp}\nimport { resolveMtDungeonOverlayArt } from './mtDungeonOverlayAtlas.js';`);
	const start = '\tfor (const tile of scene.overlays) {';
	const end = '\n\tfor (const tile of scene.walls) {';
	exactlyOne(s, start, path);
	exactlyOne(s, end, path);
	const i = s.indexOf(start);
	const j = s.indexOf(end, i);
	if (j < i || !s.slice(i, j).includes('showUnverifiedSameNameOverlays') ||
		!s.slice(i, j).includes('Recouvrement Flash'))
		throw new Error(`${path}: ancien traitement des recouvrements différent de 20A`);
	const body = [
		'\tfor (const tile of scene.overlays) {',
		'\t\t// These are the ORIGINAL MT scene masks, generated before this point.',
		'\t\t// The archived Flash labels do not all match PNG family names.',
		'\t\t// Mappings stay opt-in, visibly documented as unverified.',
		'\t\tif (!options.showUnverifiedSameNameOverlays) {',
		'\t\t\tunresolved.add(`Recouvrement Flash « ${tile.symbol} » : correspondance PNG/timeline non vérifiée`);',
		'\t\t\tcontinue;',
		'\t\t}',
		'\t\tconst visual = resolveMtDungeonOverlayArt(tile.symbol, tile.mask);',
		'\t\tif (!visual) {',
		'\t\t\tunresolved.add(`Recouvrement Flash « ${tile.symbol} » sans texture de prévisualisation`);',
		'\t\t\tcontinue;',
		'\t\t}',
		'\t\tunresolved.add(`Correspondance Flash ${tile.symbol} → PNG ${visual.family} non vérifiée (20L)`);',
		'\t\tpush(visual.file, tile.x * TILE, tile.y * TILE, 0, `overground:${tile.symbol}:${tile.layer}`);',
		'\t}',
		''
	].join('\n');
	return s.slice(0,i) + body + s.slice(j);
});

const testsPath = 'app/client/test/unit/dungeon/mtDungeonItemPlacement.test.ts';
patch(testsPath, (s, path) => {
	for (const type of ['item_gold.png', 'item_chest.png']) {
		const old = `['${type}', 0.8]`;
		const next = `['${type}', 1]`;
		if (s.includes(next)) continue;
		exactlyOne(s, old, path);
		s = s.replace(old, next);
	}
	// Step 20K supplied item_heal.png and a placement profile. Do not change
	// unrelated tests if 20K is not yet installed on this local branch.
	if (s.includes("expect(at('item_heal.png')).toBeNull();") &&
		required(placementPath).includes("file === 'item_heal.png'")) {
		s = s.replace("expect(at('item_heal.png')).toBeNull(); // archived exported texture absent",
			"expect(at('item_heal.png')).toMatchObject({ scale: 0.9 }); // recovered in step 20K");
	}
	return s;
});

const copyFiles = [
	'app/client/src/components/dungeon/mtDungeonOverlayAtlas.ts',
	'app/client/test/unit/dungeon/mtDungeonOverlayAtlas.test.ts'
];
for (const path of copyFiles) {
	const source = resolve(artifactRoot, path);
	if (!existsSync(source)) throw new Error(`Archive incomplete: ${path}`);
	const data = readFileSync(source, 'utf8');
	const dest = resolve(root, path);
	if (existsSync(dest)) {
		if (readFileSync(dest, 'utf8') !== data) throw new Error(`${path}: fichier deja present mais different`);
	} else {
		edits.set(path, data);
	}
}

console.log(`${checkOnly ? 'Précontrôle' : 'Installation'} 20L: ${edits.size} fichier(s) à ${checkOnly ? 'modifier/créer' : 'écrire'}.`);
if (!checkOnly) {
	for (const [path,data] of edits) {
		const dest = resolve(root,path);
		mkdirSync(dirname(dest), { recursive:true });
		writeFileSync(dest,data);
		console.log(`  OK ${path}`);
	}
}
console.log('20L : OK. Aucun commit ni push effectué.');
