#!/usr/bin/env node
/**
 * Standalone step 20V: original MT fog PNG frames on the clean feat/mt-dungeons renderer.
 * No step 20S / 20T / 20U dependency. Works with LF or CRLF and is idempotent.
 * --check validates everything and NEVER writes. Only edits the client renderer.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check'))
  throw new Error('Usage: node tools/dungeon/apply-step20v-standalone-fog.mjs [--check]');
const dryRun = args.includes('--check');
const root = process.cwd();
const componentPath = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
const payload = 'tools/dungeon/step20v-standalone';
const staged = new Map();

function pathTo(relative) { return path.resolve(root, relative); }
function readRequired(relative) {
  if (!fs.existsSync(pathTo(relative))) throw new Error(`Fichier requis introuvable: ${relative} (racine du monorepo ?)`);
  return fs.readFileSync(pathTo(relative));
}
function stage(relative, bytes) {
  const old = fs.existsSync(pathTo(relative)) ? fs.readFileSync(pathTo(relative)) : null;
  if (!old || !old.equals(bytes)) staged.set(relative, bytes);
}
function count(source, phrase) { return source.split(phrase).length - 1; }
function exactlyOnce(source, anchor, file = componentPath) {
  const number = count(source, anchor);
  if (number !== 1) throw new Error(`${file}: point d'insertion absent ou ambigu (${number}): ${anchor.slice(0,90)}`);
}
function replaceOnce(source, before, after) {
  exactlyOnce(source, before);
  return source.replace(before, after);
}
function replaceFogFunction(code) {
  const startMarker = 'function paintFog(scene: MtDungeonScene): void {';
  exactlyOnce(code, startMarker);
  const start = code.indexOf(startMarker);
  const firstBrace = start + startMarker.length - 1;
  let depth = 0;
  let end = -1;
  for (let i = firstBrace; i < code.length; i++) {
    const char = code[i];
    if (char === '{') depth++;
    if (char === '}' && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) throw new Error(`${componentPath}: fin de paintFog introuvable.`);
  const old = code.slice(start, end);
  // Keep this installer strictly scoped to the untouched baseline.
  if (!old.includes('marks.rect(x, y, 40, 40)') || !old.includes('marks.filters'))
    throw new Error(`${componentPath}: paintFog ne correspond pas au renderer de base; aucun fichier modifié.`);
  const next = `function paintFog(scene: MtDungeonScene): void {
	// Original Motion Twin fog sprites: gfx.swf / DefineSprite 404.
	// Compose the tinted alpha shapes first, then blur the whole fog plane once.
	// No artificial global atmosphere layer or client-side discovery.
	fogLayer.filters = [];
	if (!scene.fog.length) return;

	for (const placement of mtOriginalFogSprites(scene)) {
		const texture = textures.get(MT_ORIGINAL_FOG_URLS[placement.frame]);
		if (!texture) continue;
		const sprite = new Sprite(texture);
		sprite.position.set(placement.x, placement.y);
		sprite.tint = palette(scene.fogColor);
		fogLayer.addChild(sprite);
	}
	if (fogLayer.children.length) {
		fogLayer.filters = [
			new BlurFilter({ strength: MT_ORIGINAL_FOG_BLUR_PX, quality: MT_ORIGINAL_FOG_BLUR_QUALITY })
		];
	}
}`;
  return code.slice(0, start) + next + code.slice(end);
}

const original = readRequired(componentPath);
const crlf = original.includes(Buffer.from('\r\n'));
let code = original.toString('utf8').replace(/\r\n/g, '\n');
const alreadyInstalled = code.includes('mtOriginalFogSprites(scene)');
if (alreadyInstalled) {
  for (const required of ["from './mtDungeonOriginalFog.js'", 'MT_ORIGINAL_FOG_URLS', 'fogLayer.filters'])
    if (!code.includes(required)) throw new Error(`${componentPath}: brouillard MT partiellement installé (${required}).`);
} else {
  // Refuse modifying experimental branches partially containing steps 20S / 20T / 20U.
  const experimental = ['mtEtRevealedScene(', 'mtDungeonFogEdgeRectangles(', 'mtEtFogCircle(', 'mtDungeonSoftFog.js'];
  if (experimental.some(x => code.includes(x)))
    throw new Error(`${componentPath}: renderer expérimental détecté. Cet installateur cible la version de base (sans 20S/20T/20U).`);

  const importAnchor = "import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';";
  code = replaceOnce(code, importAnchor, `${importAnchor}\nimport {\n\tMT_ORIGINAL_FOG_BLUR_PX,\n\tMT_ORIGINAL_FOG_BLUR_QUALITY,\n\tMT_ORIGINAL_FOG_URLS,\n\tmtOriginalFogSprites\n} from './mtDungeonOriginalFog.js';`);

  const oldPaths = 'const paths = [...new Set(plan.sprites.map(sprite => sprite.url))];';
  code = replaceOnce(code, oldPaths, `// Load the SWF-derived fog frames together with the already required MT sprites.\n\tconst paths = [\n\t\t...new Set([\n\t\t\t...plan.sprites.map(sprite => sprite.url),\n\t\t\t...(scene.fog.length ? MT_ORIGINAL_FOG_URLS : [])\n\t\t])\n\t];`);

  code = replaceFogFunction(code);

  // The old sprite catalog diagnoses original fog as missing. The actual fog is now
  // rendered by this component rather than the floor/wall sprite-plan builder.
  const oldErrors = 'const errors = new Set(plan.unresolved);';
  code = replaceOnce(code, oldErrors,
    "const errors = new Set(plan.unresolved.filter(message => !message.startsWith('Brouillard original fog + BlurFilter')));");

  for (const required of ['mtOriginalFogSprites(scene)', 'MT_ORIGINAL_FOG_URLS', 'fogLayer.filters', 'paintFog(scene);'])
    if (!code.includes(required)) throw new Error(`${componentPath}: validation finale échouée (${required}).`);
  stage(componentPath, Buffer.from(crlf ? code.replace(/\n/g, '\r\n') : code, 'utf8'));
}

// Validate ALL payload paths and existing conflicts before committing any edit.
const copies = [
  ['app/client/src/components/dungeon/mtDungeonOriginalFog.ts', `${payload}/mtDungeonOriginalFog.ts`],
  ['app/client/test/unit/dungeon/mtDungeonOriginalFog.test.ts', `${payload}/mtDungeonOriginalFog.test.ts`],
  ...[1, 2, 3, 4].map(i => [
    `app/client/public/dungeon/mt/fog_mt_${i}_mask.png`,
    `${payload}/assets/fog_mt_${i}_mask.png`
  ])
];
for (const [target, source] of copies) {
  const bytes = readRequired(source);
  if (fs.existsSync(pathTo(target)) && !fs.readFileSync(pathTo(target)).equals(bytes))
    throw new Error(`${target}: fichier existant différent; refus d'écraser les modifications locales.`);
  stage(target, bytes);
}

if (dryRun) {
  console.log(`[20V autonome] Vérification OK : ${staged.size} fichier(s) à installer. Aucune écriture.`);
  process.exit(0);
}
for (const [relative, bytes] of staged) {
  fs.mkdirSync(path.dirname(pathTo(relative)), { recursive: true });
  fs.writeFileSync(pathTo(relative), bytes);
  console.log(`[20V autonome] ${relative}`);
}
console.log(`[20V autonome] Installation terminée : ${staged.size} fichier(s) modifié(s).`);
