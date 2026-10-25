import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const changes = new Map();
function read(name) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) throw new Error(`Fichier manquant : ${name}`);
  return changes.has(file) ? changes.get(file) : fs.readFileSync(file, 'utf8');
}
function put(name, value) { changes.set(path.join(root, name), value); }
function assertUnique(text, needle, label) {
  const first = text.indexOf(needle);
  if (first < 0 || text.indexOf(needle, first + needle.length) !== -1)
    throw new Error(`${label}: ancre manquante ou ambiguë (aucun fichier modifié)`);
  return first;
}

// Do not manufacture a visual for a monster: canonical metadata from the MT archive
// determines the door guardians; scenario gfx comes from the authenticated scene.
const serverPath = 'app/server/src/Dungeon/Service/mtDungeonGuardianVisuals.service.ts';
let server = read(serverPath);
const obsolete = `// Verified exported identifiers in smonsters.swf for the Cavernes Magnétiques.\n// Do not let the library render its "unknown monster" fallback as real MT art.\nconst MAGNETIC_MONSTER_GFX = new Set(['worm2', 'worm', 'scorp', 'cactus', 'brig1', 'brig2', 'brig3']);\n\n`;
if (server.includes(obsolete)) {
  server = server.replace(obsolete, `/** The native canvas resolves actual smonster frames for each MT graphic ID.\n * Do not filter on stepp's seven monster IDs: each dungeon has its own list. */\n`);
} else if (server.includes('const MAGNETIC_MONSTER_GFX')) {
  throw new Error('Liste MT modifiée: vérifier avant patch (aucun fichier modifié)');
}
const filter = `\t\tif (!MAGNETIC_MONSTER_GFX.has(gfx)) continue;`;
if (server.includes(filter)) server = server.replace(filter, `\t\t// Fail closed on malformed IDs; never manufacture a placeholder or disclose hidden guardians.\n\t\tif (!/^[a-z][a-z0-9]*$/.test(gfx)) continue;`);
else if (!server.includes('if (!/^[a-z][a-z0-9]*$/.test(gfx)) continue;')) throw new Error('Filtre gfx introuvable');
put(serverPath, server);

// Regression tests: use an arbitrary dungeon-specific monster that is not from stepp,
// in addition to the existing tests for fog redaction and scenario handling.
const testPath = 'app/server/test/unit/dungeon/mtDungeonGuardianVisuals.service.test.ts';
let test = read(testPath);
if (!test.includes("it('supports monsters from any MT dungeon without a stepp allowlist'")) {
 const anchor = "\tit('does not create guardians missing from the redacted scene', () => {";
 assertUnique(test, anchor, 'Test des gardiens');
 test = test.replace(anchor, `\tit('supports monsters from any MT dungeon without a stepp allowlist', () => {\n\t\tconst candidates = ['smonstera', 'smonsterb'];\n\t\tconst nonStepp = getVisibleMtDungeonGuardianVisuals(\n\t\t\t{ features: [\n\t\t\t\t{ kind: 'guardian', source: 'door', x: 1, y: 2, randomSeed: 102 },\n\t\t\t\t{ kind: 'guardian', source: 'scenario', x: 3, y: 4, gfx: 'smonstera' }\n\t\t\t] },\n\t\t\t20, 20, candidates\n\t\t);\n\t\texpect(nonStepp).toEqual([\n\t\t\t{ x: 1, y: 2, source: 'door', gfx: selectMtGuardianSprite({ x: 1, y: 2, width: 20, height: 20, serverMonsterSprites: candidates }).sprite },\n\t\t\t{ x: 3, y: 4, source: 'scenario', gfx: 'smonstera' }\n\t\t]);\n\t});\n\t${anchor.trimStart()}`);
}
// Previous test assumed the app silenced all gfx not in the stepp list.
const obsoleteTest = `\tit('does not pretend unsupported smonster identifiers are a real monster', () => {\n\t\texpect(\n\t\t\tgetVisibleMtDungeonGuardianVisuals(\n\t\t\t\t{ features: [{ kind: 'guardian', source: 'scenario', x: 2, y: 2, gfx: 'unknown' }] },\n\t\t\t\t100,\n\t\t\t\t100,\n\t\t\t\tkeys\n\t\t\t)\n\t\t).toEqual([]);\n\t});`;
if(test.includes(obsoleteTest)) test = test.replace(obsoleteTest, `\tit('rejects malformed graphic identifiers before they reach the canvas', () => {\n\t\texpect(getVisibleMtDungeonGuardianVisuals(\n\t\t\t{ features: [{ kind: 'guardian', source: 'scenario', x: 2, y: 2, gfx: '../unknown' }] },\n\t\t\t100, 100, keys\n\t\t)).toEqual([]);\n\t});`);
else if(test.includes('does not pretend unsupported smonster identifiers')) throw new Error('Test historique modifié: patch refusé');
put(testPath, test);

// Report only genuine nonrenderable gfx in the development diagnostics; no invented monster art.
const clientPath = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
let client = read(clientPath);
client = client.replace('aria-label="Exploration des Cavernes Magnétiques"', 'aria-label="Exploration du donjon"');
put(clientPath, client);

// All changes validated above: only now write to disk.
for (const [file, contents] of changes) if (fs.readFileSync(file,'utf8') !== contents) fs.writeFileSync(file,contents,'utf8');
console.log('Étape 31 installée : gardiens de tous les donjons MT visibles, sans whitelist stepp.');
