/**
 * Offline verification of all 201 MT dungeon PNG exports.
 * Usage: node tools/dungeon/verify-mt-images.mjs
 * Optional custom directory: node tools/dungeon/verify-mt-images.mjs ./path/to/gfx
 * No downloads. No GitHub writes. Files are never changed.
 */
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = join(repoRoot, 'app/client/src/components/dungeon/mtOriginalGfxManifest.json');
const gfxPath = resolve(process.argv[2] ?? join(repoRoot, 'app/client/public/dungeon/mt'));
const expected = JSON.parse(await readFile(manifestPath, 'utf8'));
const actual = (await readdir(gfxPath)).filter(name => name.toLowerCase().endsWith('.png'));
const missing = expected.filter(name => !actual.includes(name));
const extras = actual.filter(name => !expected.includes(name));
const invalid = [];
for (const name of expected) {
  if (missing.includes(name)) continue;
  const data = await readFile(join(gfxPath, name));
  if (data.length < 24 || data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') invalid.push(name);
}
console.log(`Motion Twin gfx/dungeon/gfx : ${expected.length} PNG attendus / ${actual.length} présents`);
if (missing.length) console.error('Images manquantes :\n' + missing.map(x => `  ${x}`).join('\n'));
if (extras.length) console.warn('PNG supplémentaires hors manifest :\n' + extras.map(x => `  ${x}`).join('\n'));
if (invalid.length) console.error('Fichiers PNG invalides :\n' + invalid.map(x => `  ${x}`).join('\n'));
if (missing.length || invalid.length) process.exitCode = 1;
else console.log('OK : les 201 PNG originaux attendus sont présents et ont une signature PNG valide.');
