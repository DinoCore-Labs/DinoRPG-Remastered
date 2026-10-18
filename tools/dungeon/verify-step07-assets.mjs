/** Offline verification of the twelve unchanged MT archive assets used in step 7. */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
const folder = process.env.MT_DUNGEON_MAPS_DIR || resolve('packages/core/src/models/dungeon/maps');
const expected = {
  'dungeons.xml': '82f6f047231953c08f4bec923ca8d39f67d847e4',
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
let failed = 0;
for (const [name, sha] of Object.entries(expected)) {
  const path = join(folder, name);
  if (!existsSync(path)) { console.error('MISSING', name); failed++; continue; }
  const bytes = readFileSync(path);
  const got = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (got !== sha) { console.error('DIFFERENT', name, got); failed++; }
  else console.log('OK', name);
}
if (failed) { console.error(`${failed} MT asset(s) missing or altered.`); process.exitCode = 1; }
else console.log('12 authentic MT data files verified.');
