/** Check the 11 authentic map blobs and 4 independent MT translation blobs. */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const mapsDir = resolve(process.env.MT_DUNGEON_MAPS_DIR || 'packages/core/src/models/dungeon/maps');
const definitionsDir = resolve(process.env.MT_DUNGEON_DEFINITIONS_DIR || 'packages/core/src/models/dungeon/definitions');
const maps = {
  'stepp_0.xml': '03f5e61a5090e0d405c707a59c9da2b09fa038ac',
  'stepp_1.xml': 'c3f89e48c079c97235f10c22646084db4c059f01',
  'stepp_2.xml': '30ffee14f559447dcb0ec3c5a26482135d8fb3d8',
  'stepp_3.xml': '56a4793d80c6a0b8682d459379c9d42effb16e4d',
  'katak_0.xml': 'a0e6f6a692c1a007d746ce28aa4f8a0460ae976f',
  'mbegin_0.xml': 'f52da8a77db8f812348ce075b05fa754eec612e9',
  'mquetz_0.xml': '26c0d73a4eb27c428a94ff9e46ff411235930cab',
  'mcuzco_0.xml': '85875831ff6be90199ed4daf13d83b1eeaee3c2f',
  'mcuzco_1.xml': 'ea1947665d2eedcd9d9891036d7cdc61c000f129',
  'mcuzco_2.xml': '4ca5fa03105c2c3be560dc8c1300a87035f0e12e',
  'labo_0.xml': '967b64b9f23b744ba4cb4e3fb2e8b64cc0bf06da'
};
const definitions = {
  fr: '82f6f047231953c08f4bec923ca8d39f67d847e4',
  en: 'e439fbc1bb0353ff3bf2446b80429e7ef925c4cc',
  es: '76dd00323a7fc43c473ab699e1b3e39b17b97dc3',
  de: 'c7a6b1897f35777c55a7f5dbc8d40eafb2c525c6'
};
function sha(data) {
  return createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
}
let failed = 0;
function verify(name, path, expectedSha) {
  if (!existsSync(path)) { console.error('MISSING', name); failed++; return; }
  const currentSha = sha(readFileSync(path));
  if (currentSha !== expectedSha) { console.error('INVALID', name, currentSha); failed++; }
  else console.log('OK', name);
}
if (existsSync(mapsDir)) {
  const actual = readdirSync(mapsDir).filter(x => x.endsWith('.xml')).sort();
  const expected = Object.keys(maps).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error('Maps folder must contain exactly 11 map XMLs.', {actual, expected}); failed++;
  }
}
for (const [name, expectedSha] of Object.entries(maps)) verify(`maps/${name}`, join(mapsDir, name), expectedSha);
for (const [lang, expectedSha] of Object.entries(definitions)) verify(`definitions/${lang}/dungeons.xml`, join(definitionsDir, lang, 'dungeons.xml'), expectedSha);
if (failed) { console.error(`${failed} error(s) in original MT assets.`); process.exitCode = 1; }
else console.log('15 original MT files verified: 11 maps + 4 language catalogs.');
