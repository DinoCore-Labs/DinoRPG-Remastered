#!/usr/bin/env node
/** Replace 20U's approximate Pixi fog with the actual MT SWF fog alpha frames.
 * The only UI edit is in MtOriginalDungeonCanvas.vue; authoritative server
 * discovery, combat and state are untouched. '--check' never writes.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check')) {
  throw new Error('Usage: node tools/dungeon/apply-step20v-original-mt-fog.mjs [--check]');
}
const check = args.includes('--check');
const root = process.cwd();
const src = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
const payload = 'tools/dungeon/step20v-payload';
const marker = 'mtOriginalFogSprites(scene)';
const staged = new Map();

function read(relative) {
  const dest = path.join(root, relative);
  if (!fs.existsSync(dest)) throw new Error(`Fichier requis absent : ${relative}. Lancer depuis la racine du monorepo.`);
  const data = fs.readFileSync(dest);
  return { raw: data.toString('utf8'), normalized: data.toString('utf8').replace(/\r\n/g, '\n'), crlf: data.includes(Buffer.from('\r\n')) };
}
function stage(relative, content, original = null) {
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(original?.crlf ? content.replace(/\n/g, '\r\n') : content, 'utf8');
  const dest = path.join(root, relative);
  if (!fs.existsSync(dest) || !fs.readFileSync(dest).equals(bytes)) staged.set(relative, bytes);
}
function replaceOnce(input, regex, output, description) {
  const matches = [...input.matchAll(regex)];
  if (matches.length !== 1) throw new Error(`${src}: ${description} absent/ambigu (${matches.length}), aucun fichier modifié.`);
  return input.slice(0, matches[0].index) + output + input.slice(matches[0].index + matches[0][0].length);
}
function replaceFunction(input, name, content) {
  const start = input.indexOf(name);
  if (start === -1 || input.indexOf(name, start + name.length) !== -1)
    throw new Error(`${src}: fonction paintFog absente/ambiguë, aucun fichier modifié.`);
  const brace = input.indexOf('{', start + name.length - 1);
  if (brace === -1) throw new Error(`${src}: accolade initiale de paintFog absente.`);
  let depth = 0, end = -1;
  for (let i = brace; i < input.length; i++) {
    if (input[i] === '{') depth++;
    else if (input[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) throw new Error(`${src}: accolades de paintFog mal formées.`);
  return input.slice(0, start) + content + input.slice(end);
}

const original = read(src);
let code = original.normalized;
if (!code.includes('mtEtRevealedScene(scene)') || !code.includes('fogRevealLayer')) {
  throw new Error(`${src}: 20T/20U absent ou partiel ; annulation sans modification.`);
}
if (!code.includes(marker)) {
  if (!code.includes('mtDungeonFogEdgeRectangles(scene)'))
    throw new Error(`${src}: l'étape 20U est requise. La version actuelle de paintFog ne correspond pas.`);

  const replacementImport = `import {
	MT_ORIGINAL_FOG_BLUR_PX,
	MT_ORIGINAL_FOG_BLUR_QUALITY,
	MT_ORIGINAL_FOG_REVEAL_ALPHA,
	MT_ORIGINAL_FOG_REVEAL_BLUR_PX,
	MT_ORIGINAL_FOG_URLS,
	mtOriginalFogSprites
} from './mtDungeonOriginalFog.js';`;
  code = replaceOnce(code,
    /import\s*\{[^{}]*\}\s*from\s*['"]\.\/mtDungeonSoftFog\.js['"];?/g,
    replacementImport,
    'import mtDungeonSoftFog.js'
  );

  code = replaceOnce(code,
    /const\s+paths\s*=\s*\[\.\.\.new Set\(plan\.sprites\.map\(\(?sprite\)?\s*=>\s*sprite\.url\)\)\];/g,
    `// Preload the genuine MT frames along with the floor/wall textures.
	// A missing image must be reported before drawing the authoritative scene.
	const paths = [
		...new Set([
			...plan.sprites.map(sprite => sprite.url),
			...(scene.fog.length ? MT_ORIGINAL_FOG_URLS : [])
		])
	];`,
    'chargement des textures du plan'
  );

  const paintFog = `function paintFog(scene: MtDungeonScene): void {
	// Motion Twin 'fog' (gfx.swf DefineSprite 404), not a circle or a rectangle.
	// All four original 68x68 masks overlap in one Pixi container, tinted to
	// skin.fog; the composite gets ONE BlurFilter(32,32,1), like View.hx.
	// No atmospheric wash: discovered floors and Dinoz remain brightly visible.
	fogLayer.filters = [];
	if (scene.fog.length) {
		for (const placement of mtOriginalFogSprites(scene)) {
			const texture = textures.get(MT_ORIGINAL_FOG_URLS[placement.frame]);
			if (!texture) continue;
			const sprite = new Sprite(texture);
			sprite.position.set(placement.x, placement.y);
			// Original black silhouettes are provided as white-alpha masks because
			// Pixi's multiplicative tint cannot recolor black source pixels.
			sprite.tint = palette(scene.fogColor);
			fogLayer.addChild(sprite);
		}
		if (fogLayer.children.length) {
			fogLayer.filters = [
				new BlurFilter({ strength: MT_ORIGINAL_FOG_BLUR_PX, quality: MT_ORIGINAL_FOG_BLUR_QUALITY })
			];
		}
	}

	// The original fx_reveal is a SEPARATE SWF symbol and was not supplied.
	// Keep the existing subtle server-confirmed fade; do not fake discoveries.
	const previous = renderedViewport?.mapId === (props.stageKey ?? '') ? renderedScene : null;
	const revealed = mtDungeonNewlyRevealedFog(previous, scene);
	fogReveals = [];
	clear(fogRevealLayer);
	if (revealed.length) {
		const fade = new Graphics();
		for (const tile of revealed)
			fade.rect((tile.x - scene.viewport.ix) * 40, (tile.y - scene.viewport.iy) * 40, 40, 40);
		fade.fill({ color: palette(scene.fogColor), alpha: MT_ORIGINAL_FOG_REVEAL_ALPHA });
		fade.filters = [new BlurFilter({ strength: MT_ORIGINAL_FOG_REVEAL_BLUR_PX, quality: 2 })];
		fogRevealLayer.addChild(fade);
		fogReveals.push({ graphics: fade, elapsed: 0 });
	}
}`;
  code = replaceFunction(code, 'function paintFog(scene: MtDungeonScene): void {', paintFog);

  if (!code.includes(marker) || code.includes('mtDungeonFogEdgeRectangles(scene)') || code.includes('MT_SOFT_FOG_') || code.includes('mtEtFogCircle(tile, scene.viewport)') || code.includes('mtEtFogMaskOpacity(props.skinMask')) {
    throw new Error(`${src}: ancienne géométrie encore utilisée après la conversion ; annulation.`);
  }
  stage(src, code, original);
} else {
  // Do not rewrite or overwrite a previously customized, partially installed component.
  for (const required of [
    'mtOriginalFogSprites(scene)',
    'MT_ORIGINAL_FOG_URLS',
    'fogLayer.filters',
    'mtEtRevealedScene(scene)'
  ]) if (!code.includes(required)) throw new Error(`${src}: étape 20V partiellement installée (${required} absent).`);
}

// Stage all TypeScript helpers and asset bytes AFTER every transformation succeeded.
for (const [destination, source] of [
  ['app/client/src/components/dungeon/mtDungeonOriginalFog.ts', `${payload}/mtDungeonOriginalFog.ts`],
  ['app/client/test/unit/dungeon/mtDungeonOriginalFog.test.ts', `${payload}/mtDungeonOriginalFog.test.ts`],
  ...[1,2,3,4].map(frame => [
    `app/client/public/dungeon/mt/fog_mt_${frame}_mask.png`,
    `${payload}/assets/fog_mt_${frame}_mask.png`
  ])
]) {
  const sourceBuffer = fs.readFileSync(path.join(root, source));
  const dest = path.join(root, destination);
  if (fs.existsSync(dest) && !fs.readFileSync(dest).equals(sourceBuffer)) {
    throw new Error(`${destination} existe avec des changements locaux ; refus d'écraser quoi que ce soit.`);
  }
  stage(destination, sourceBuffer);
}

if (check) {
  console.log(`[20V] Pré-vérification OK — ${staged.size} fichier(s) à créer/modifier. Aucun fichier écrit.`);
  process.exit(0);
}
for (const [relative, content] of staged) {
  const dest = path.join(root, relative);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
  console.log(`[20V] ${relative}`);
}
console.log(`[20V] Installation terminée (${staged.size} fichier(s)).`);
