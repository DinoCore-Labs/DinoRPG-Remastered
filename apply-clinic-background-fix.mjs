import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Correctif local clinik / clinik2 (l'ancien identifiant enum CLINI2 = 129 reste compatible).
 * Toutes les modifications sont vérifiées en mémoire avant la première écriture.
 * Compatible Windows CRLF ; préserve les autres modifications locales.
 */
const args = process.argv.slice(2);
const root = resolve(args.find(arg => !arg.startsWith('--')) ?? '.');
const dryRun = args.includes('--check');
const origin = dirname(fileURLToPath(import.meta.url));
const updates = new Map();
const newFiles = new Map();

async function exists(path) {
  try { await access(join(root, path)); return true; }
  catch (e) { if (e?.code === 'ENOENT') return false; throw e; }
}
async function read(path) {
  if (!(await exists(path))) throw new Error(`Fichier manquant (étapes précédentes requises) : ${path}`);
  return readFile(join(root, path), 'utf8');
}
function once(source, oldValue, newValue, path) {
  const hits = source.split(oldValue).length - 1;
  if (hits !== 1) throw new Error(`${path}: ancre absente/ambiguë (${hits}) : ${oldValue.slice(0, 110)}`);
  return source.replace(oldValue, newValue);
}
function rxOnce(source, expr, replacement, path) {
  const hits = [...source.matchAll(new RegExp(expr.source, expr.flags.includes('g') ? expr.flags : expr.flags + 'g'))];
  if (hits.length !== 1) throw new Error(`${path}: bloc attendu une seule fois, trouvé ${hits.length}`);
  return source.replace(expr, replacement);
}
async function edit(path, fn) {
  const original = await read(path);
  const normalized = original.replace(/\r\n?/g, '\n');
  const modified = fn(normalized);
  if (modified !== normalized) {
    updates.set(path, original.includes('\r\n') ? modified.replace(/\n/g, '\r\n') : modified);
  }
}
async function add(path, sourceFile) {
  const content = await readFile(join(origin, 'files', sourceFile), 'utf8');
  if (await exists(path)) {
    const existing = await read(path);
    if (existing.replace(/\r\n?/g, '\n') !== content.replace(/\r\n?/g, '\n'))
      throw new Error(`Test existant différent (aucun écrasement) : ${path}`);
  } else newFiles.set(path, content);
}

// Préconditions : la fonction de l'étape 2 doit recevoir les actions du clan.
const mapper = await read('app/server/src/utils/dinoz/dinozFiche.mapper.ts');
if (!mapper.includes('completedClanActionKeys: string[] = []') || !mapper.includes('displayPlaceId:')) {
  throw new Error('Le correctif clinik/clini2 des étapes précédentes manque dans dinozFiche.mapper.ts.');
}
const fiche = await read('packages/core/src/models/dinoz/dinozFiche.ts');
if (!fiche.includes('displayPlaceId?: number')) {
  throw new Error('Le champ displayPlaceId manque dans le type DinozFiche.');
}

const core = 'packages/core/src/models/place/clinicPlace.ts';
await edit(core, s => {
  if (!s.includes('export function getClinicDisplayPlaceId(')) throw new Error(`${core}: résolveur introuvable`);
  if (s.includes('export function getClinicDisplayPlaceKey(')) return s;
  return s.trimEnd() + `\n\n/**\n * Le lieu en base reste clinik (38) ; la représentation construite est\n * 129 (enum historique CLINI2), mais la clé des ressources est clinik2.\n */\nexport function getClinicDisplayPlaceKey(\n\tplaceId: number,\n\tdisplayPlaceId: number | undefined,\n\tdefaultName: string\n): string {\n\treturn placeId === PlaceEnum.CLINIQUE && displayPlaceId === PlaceEnum.CLINI2\n\t\t? 'clinik2'\n\t\t: defaultName;\n}\n`;
});

const data = 'packages/core/src/models/place/placeListv2.ts';
await edit(data, s => {
  if (/\[PlaceEnum\.CLINI2\]:\s*\{\s*\n\s*placeId: PlaceEnum\.CLINI2,\s*\n\s*name: 'clinik2'/.test(s)) return s;
  return rxOnce(s,
    /(\[PlaceEnum\.CLINI2\]:\s*\{\s*\n\s*placeId: PlaceEnum\.CLINI2,\s*\n\s*name: )'clini2'/,
    "$1'clinik2'", data);
});

const menu = 'app/server/src/Dinoz/Service/getDinozMenu.service.ts';
await edit(menu, s => {
  if (!s.includes("import { getCompletedClanActionKeys } from '../../Clan/Service/completedClanActionKeys.service.js';")) {
    s = once(s,
      "import { prisma } from '../../prisma.js';",
      "import { getCompletedClanActionKeys } from '../../Clan/Service/completedClanActionKeys.service.js';\nimport { prisma } from '../../prisma.js';", menu);
  }
  if (!s.includes('const completedClanActionKeys = await getCompletedClanActionKeys(prisma, authedId);')) {
    s = once(s,
      '\tconst dinozList: DinozFiche[] = [];',
      '\tconst completedClanActionKeys = await getCompletedClanActionKeys(prisma, authedId);\n\tconst dinozList: DinozFiche[] = [];', menu);
  }
  if (!s.includes('restInfosByDinozId.get(dinoz.id) ?? null, null, completedClanActionKeys')) {
    s = once(s,
      'toDinozFiche(playerData, dinoz.id, restInfosByDinozId.get(dinoz.id) ?? null)',
      'toDinozFiche(playerData, dinoz.id, restInfosByDinozId.get(dinoz.id) ?? null, null, completedClanActionKeys)', menu);
  }
  return s;
});

const mapTab = 'app/client/src/components/common/MapTab.vue';
await edit(mapTab, s => {
  const importLine = "import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';";
  if (!s.includes("import { getClinicDisplayPlaceKey } from '@dinorpg/core/models/place/clinicPlace.js';")) {
    s = once(s, importLine, importLine + "\nimport { getClinicDisplayPlaceKey } from '@dinorpg/core/models/place/clinicPlace.js';", mapTab);
  }
  // Retire la branche de l'ancien installateur (ou une variante déjà renommée).
  const oldBranch = /(?:\t{3}\/\/ MT real="clinik"[^\n]*\n\t{3}\/\/[^\n]*\n)?\t{3}if \(placeId === PlaceEnum\.CLINIQUE && this\.dinozData\.displayPlaceId === PlaceEnum\.CLINI2\) \{\n\t{4}return 'clini(?:k)?2';\n\t{3}\}\n/;
  s = s.replace(oldBranch, '');
  if (!s.includes('getClinicDisplayPlaceKey(placeId, this.dinozData.displayPlaceId, place.name)')) {
    s = rxOnce(s,
      /(getPlaceName\(placeId: number\): string \{[\s\S]*?)(\t{3}return place\.name;)/,
      '$1\t\t\treturn getClinicDisplayPlaceKey(placeId, this.dinozData.displayPlaceId, place.name);', mapTab);
  }
  return s;
});

const panel = 'app/client/src/components/common/LeftPanel.vue';
await edit(panel, s => {
  const anchor = "import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';";
  if (!s.includes("import { getClinicDisplayPlaceKey } from '@dinorpg/core/models/place/clinicPlace.js';")) {
    s = once(s, anchor, anchor + "\nimport { getClinicDisplayPlaceKey } from '@dinorpg/core/models/place/clinicPlace.js';", panel);
  }
  if (!s.includes('getClinicDisplayPlaceKey(currentDinoz.placeId, currentDinoz.displayPlaceId, place.name)')) {
    s = once(s, '\t\t\treturn place.name;',
      '\t\t\treturn getClinicDisplayPlaceKey(currentDinoz.placeId, currentDinoz.displayPlaceId, place.name);', panel);
  }
  return s;
});

for (const path of ['app/client/src/components/dinoz/DinozList.vue', 'app/client/src/components/tools/LeftUserMenu.vue']) {
  await edit(path, s => {
    if (!s.includes("import { getClinicDisplayPlaceKey } from '@dinorpg/core/models/place/clinicPlace.js';")) {
      const re = /^import .* from '(@dinorpg\/core\/models\/dinoz\/dinozFiche\.js)';$/m;
      if (!re.test(s)) throw new Error(`${path}: import DinozFiche introuvable`);
      s = s.replace(re, line => line + "\nimport { getClinicDisplayPlaceKey } from '@dinorpg/core/models/place/clinicPlace.js';");
    }
    s = s.replaceAll('getPlaceName(dinoz.placeId)', 'getPlaceName(dinoz.placeId, dinoz.displayPlaceId)');
    const modern = /getPlaceName\(placeId: number, displayPlaceId\?: number\): string \{\n\t{3}return getClinicDisplayPlaceKey\(placeId, displayPlaceId, placeList\.find\(place => place\.placeId === placeId\)\?\.name \?\? ''\);\n\t{2}\}/;
    if (!modern.test(s)) {
      s = rxOnce(s,
        /getPlaceName\(placeId: number\): string \{\n\t{3}return placeList\.find\(place => place\.placeId === placeId\)\?\.name \?\? '';\n\t{2}\}/,
        "getPlaceName(placeId: number, displayPlaceId?: number): string {\n\t\t\treturn getClinicDisplayPlaceKey(placeId, displayPlaceId, placeList.find(place => place.placeId === placeId)?.name ?? '');\n\t\t}",
        path);
    }
    return s;
  });
}

for (const lang of ['FR', 'EN', 'ES', 'DE']) {
  const path = `app/client/src/i18n/locales/${lang}.json`;
  await edit(path, s => {
    const obj = JSON.parse(s);
    const oldName = obj.place?.name?.clini2;
    const oldDesc = obj.place?.description?.clini2;
    const newName = obj.place?.name?.clinik2;
    const newDesc = obj.place?.description?.clinik2;
    if (newName && newDesc && !oldName && !oldDesc) return s;
    if (!oldName || !oldDesc || newName || newDesc) {
      throw new Error(`${path}: état de traduction ambigu (clini2 et clinik2).`);
    }
    const hits = [...s.matchAll(/"clini2"\s*:/g)].length;
    if (hits !== 2) throw new Error(`${path}: 2 clés clini2 attendues, trouvé ${hits}`);
    const result = s.replaceAll('"clini2":', '"clinik2":');
    const after = JSON.parse(result);
    if (after.place?.name?.clinik2 !== oldName || after.place?.description?.clinik2 !== oldDesc)
      throw new Error(`${path}: les traductions ont été altérées`);
    return result;
  });
}

await add('packages/core/test/unit/clinic/clinicPlaceDisplay.test.ts',
  'packages/core/test/unit/clinic/clinicPlaceDisplay.test.ts');

const asset = 'app/client/src/assets/place/clinik2.webp';
console.log(`Correctif clinik/clinik2 : ${updates.size} fichiers à modifier, ${newFiles.size} fichier(s) à ajouter.`);
if (!(await exists(asset))) {
  console.warn(`ATTENTION : ${asset} absent de ton projet. Le correctif gère la clé d'affichage, mais l'image construite devra être ajoutée à ce chemin.`);
}
if (dryRun) {
  for (const name of updates.keys()) console.log('~', name);
  for (const name of newFiles.keys()) console.log('+', name);
  console.log('Préflight réussi ; aucune écriture (--check).');
  process.exit(0);
}
for (const [path, content] of updates) {
  await writeFile(join(root, path), content, 'utf8');
  console.log('~', path);
}
for (const [path, content] of newFiles) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), content, 'utf8');
  console.log('+', path);
}
console.log('Correctif local appliqué. Aucun Git push, aucune migration Prisma.');
