import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const page = 'app/client/src/pages/MtMagneticCavernsPage.vue';
if (!existsSync(page)) throw new Error('Run this command at the DinoRPG monorepo root.');
for (const src of ['mtDungeonKeyNames.ts', 'mtDungeonKeyNames.test.ts']) {
  if (!existsSync(`dungeon_step23/${src}`)) throw new Error(`Missing dungeon_step23/${src}. Extract the ZIP at the monorepo root.`);
}
const old = readFileSync(page, 'utf8');
let code = old;
function replaceUnique(label, pattern, replacement, alreadyApplied) {
  if (alreadyApplied.test(code)) { console.log(`Already applied: ${label}`); return; }
  const matches = [...code.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))];
  if (matches.length !== 1) throw new Error(`${label}: expected exactly one compatible anchor, found ${matches.length}. No files modified. Please provide the relevant code in ${page}.`);
  code = code.replace(pattern, replacement);
}
replaceUnique('key-name import',
  /import MtDungeonMessageBox from '\.\.\/components\/dungeon\/MtDungeonMessageBox\.vue';/,
  "$&\nimport { mtDungeonKeyPickupMessage, mtDungeonLockedDoorMessage } from '../components/dungeon/mtDungeonKeyNames.js';",
  /import\s*\{\s*mtDungeonKeyPickupMessage\s*,\s*mtDungeonLockedDoorMessage\s*\}/
);
// Replace only the existing numeric-key message; keep the server's requiredKey authoritative.
replaceUnique('locked door message',
  /`Cette porte est verrouillée\. Il vous faut la clé n°\$\{result\.requiredKey\}\.`/,
  'mtDungeonLockedDoorMessage(leaderId, result.session.mapId, result.requiredKey!)',
  /mtDungeonLockedDoorMessage\(leaderId,\s*result\.session\.mapId,\s*result\.requiredKey!?\)/
);
// Replace each branch independently to tolerate Prettier changes in whitespace/indentation.
replaceUnique('single key pickup',
  /`Vous avez trouvé la clé n°\$\{collectedKeys\[0\]\}\.`/,
  'mtDungeonKeyPickupMessage(leaderId, result.session.mapId, collectedKeys[0]!)',
  /mtDungeonKeyPickupMessage\(leaderId,\s*result\.session\.mapId,\s*collectedKeys\[0\]!\)/
);
replaceUnique('multiple key pickups',
  /`Vous avez trouvé les clés n°\$\{collectedKeys\.join\(', '\)\}\.`/,
  "collectedKeys.map(id => mtDungeonKeyPickupMessage(leaderId, result.session.mapId, id)).join('\\n')",
  /collectedKeys\.map\(id\s*=>\s*mtDungeonKeyPickupMessage\(leaderId,\s*result\.session\.mapId,\s*id\)\)\.join\('\\n'\)/
);
// We are now sure every required edit is possible. Copy dependencies first, then write page.
const copies = [
  ['dungeon_step23/mtDungeonKeyNames.ts', 'app/client/src/components/dungeon/mtDungeonKeyNames.ts'],
  ['dungeon_step23/mtDungeonKeyNames.test.ts', 'app/client/test/unit/dungeon/mtDungeonKeyNames.test.ts']
];
for (const [src, dst] of copies) {
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  console.log(`Wrote ${dst}`);
}
if (code !== old) { writeFileSync(page, code); console.log(`Updated ${page}`); }
else console.log('Page already patched.');
console.log('Step 23 installed. Run pnpm --filter @dinorpg/client test -- mtDungeonKeyNames');
