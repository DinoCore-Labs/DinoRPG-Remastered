#!/usr/bin/env node
/** Step 20W: restore MT mask (SWF ExportAssets 'mask' ID 49), after autonomous 20V. */
import fs from 'node:fs';
import path from 'node:path';

if (process.argv.slice(2).some(arg => arg !== '--check'))
  throw new Error('Usage: node tools/dungeon/apply-step20w-original-mask.mjs [--check]');
const check = process.argv.includes('--check');
const root = process.cwd();
const payload = 'tools/dungeon/step20w-mask';
const source = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
const page = 'app/client/src/pages/MtMagneticCavernsPage.vue';
const staged = new Map();
function abs(p) { return path.join(root, p); }
function read(p) {
  if (!fs.existsSync(abs(p))) throw new Error(`Fichier requis absent : ${p}`);
  return fs.readFileSync(abs(p));
}
function stage(p, buf) {
  const previous = fs.existsSync(abs(p)) ? fs.readFileSync(abs(p)) : null;
  if (!previous || !previous.equals(buf)) staged.set(p, buf);
}
function unique(code, needle, file) {
  const count = code.split(needle).length - 1;
  if (count !== 1) throw new Error(`${file}: ancrage manquant/ambigu (${count}) : ${needle.slice(0,110)}`);
  return needle;
}
function one(code, before, after, file) { return code.replace(unique(code, before, file), after); }
function editFile(file, transform) {
  const b = read(file); const crlf = b.includes(Buffer.from('\r\n'));
  const original = b.toString('utf8').replace(/\r\n/g, '\n');
  const modified = transform(original);
  stage(file, Buffer.from(crlf ? modified.replace(/\n/g, '\r\n') : modified, 'utf8'));
}
editFile(source, code => {
  const already = code.includes('paintMtDungeonOriginalMask(scene)');
  if (already) {
    for (const part of ['mtDungeonMask.js', 'props.maskStrength', 'MT_DUNGEON_MASK_URL'])
      if (!code.includes(part)) throw new Error(`${source}: installation partielle (${part})`);
    return code;
  }
  if (!code.includes('mtOriginalFogSprites(scene)') || !code.includes('paintFog(scene);'))
    throw new Error(`${source}: le brouillard autonome 20V doit être installé avant 20W. Aucune écriture.`);
  code = one(code,
    "import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';",
    "import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';\nimport { MT_DUNGEON_MASK_URL, mtDungeonMaskAlpha, mtDungeonMaskTint } from './mtDungeonMask.js';", source);
  code = one(code,
    'showUnverifiedSameNameOverlays?: boolean;',
    'showUnverifiedSameNameOverlays?: boolean;\n\t/** Original MT skin.mask percentage for the stage-fixed vignette. */\n\tmaskStrength?: number;', source);
  code = one(code,
    'let fogLayer: Container;',
    'let fogLayer: Container;\n\n/** Separate screen-space overlay: does not scroll with worldLayer. */\nlet originalMask: Sprite | null = null;', source);
  code = one(code,
    '...(scene.fog.length ? MT_ORIGINAL_FOG_URLS : [])',
    '...(scene.fog.length ? MT_ORIGINAL_FOG_URLS : []), ...(props.maskStrength ? [MT_DUNGEON_MASK_URL] : [])', source);
  code = one(code,
    '\tpaintFog(scene);\n\n\tdiagnostics.value = [...errors];',
    '\tpaintFog(scene);\n\tpaintMtDungeonOriginalMask(scene);\n\n\tdiagnostics.value = [...errors];', source);
  code = one(code,
    'async function repaint(): Promise<void> {',
    `/** Original gfx.swf mask (symbol 49) overlays the scene but not HTML controls. */
function paintMtDungeonOriginalMask(scene: MtDungeonScene): void {
\tif (!app) return;
\tconst opacity = mtDungeonMaskAlpha(props.maskStrength ?? 0);
\tconst texture = textures.get(MT_DUNGEON_MASK_URL);
\tif (opacity <= 0 || !texture) {
\t\tif (originalMask) originalMask.visible = false;
\t\treturn;
\t}
\tif (!originalMask) {
\t\toriginalMask = new Sprite(texture);
\t\toriginalMask.position.set(0, 0);
\t\t// View.hx: mask is attached to the root depth manager, NOT levelMC.
\t\tapp.stage.addChild(originalMask);
\t}
\toriginalMask.tint = mtDungeonMaskTint(scene.fogColor);
\toriginalMask.alpha = opacity;
\toriginalMask.visible = true;
}

async function repaint(): Promise<void> {`, source);
  code = one(code,
    '\t\tprops.showUnverifiedSameNameOverlays,',
    '\t\tprops.showUnverifiedSameNameOverlays,\n\n\t\tprops.maskStrength,', source);
  code = one(code,
    '\tapp = null;\n});',
    '\tapp = null;\n\toriginalMask = null;\n});', source);
  for (const x of ['paintMtDungeonOriginalMask(scene);', 'props.maskStrength', 'originalMask.tint = mtDungeonMaskTint(scene.fogColor)'])
    if (!code.includes(x)) throw new Error(`${source}: validation finale impossible: ${x}`);
  return code;
});
editFile(page, code => {
  if (code.includes(':mask-strength="getDungeonSkin(view.skin)?.mask ?? 0"')) return code;
  code = one(code,
    "import MtOriginalDungeonCanvas from '../components/dungeon/MtOriginalDungeonCanvas.vue';",
    "import MtOriginalDungeonCanvas from '../components/dungeon/MtOriginalDungeonCanvas.vue';\nimport { getDungeonSkin } from '@dinorpg/core/models/dungeon/dungeon.skins.js';", page);
  code = one(code,
    ':scene="view.scene"',
    ':scene="view.scene"\n\t\t\t\t\t\t:mask-strength="getDungeonSkin(view.skin)?.mask ?? 0"', page);
  return code;
});
for (const [dest, filename] of [
  ['app/client/src/components/dungeon/mtDungeonMask.ts', 'mtDungeonMask.ts'],
  ['app/client/test/unit/dungeon/mtDungeonMask.test.ts', 'mtDungeonMask.test.ts'],
  ['app/client/public/dungeon/mt/mask_mt_49.png', 'assets/mask_mt_49.png']
]) {
  const bytes = read(`${payload}/${filename}`);
  if (fs.existsSync(abs(dest)) && !fs.readFileSync(abs(dest)).equals(bytes))
    throw new Error(`${dest}: un fichier différent existe déjà ; refus de l'écraser.`);
  stage(dest, bytes);
}
if (check) {
  console.log(`[20W] Vérification OK : ${staged.size} fichier(s) à modifier. Aucun changement effectué.`);
} else {
  for (const [relative, bytes] of staged) {
    fs.mkdirSync(path.dirname(abs(relative)), { recursive: true });
    fs.writeFileSync(abs(relative), bytes);
    console.log(`[20W] ${relative}`);
  }
  console.log(`[20W] Installation terminée (${staged.size} fichier(s)).`);
}
