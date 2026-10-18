/**
 * One-time, offline migration of the four original MT dungeons.xml files.
 * Maps/ must contain only the 11 map XMLs; translated metadata belongs
 * in definitions/{fr,en,es,de}/dungeons.xml (raw, unmodified archive blobs).
 *
 * Examples:
 *   node tools/dungeon/import-step07-locales.mjs --source=C:/archives/DinoRPG/xml
 *   node tools/dungeon/import-step07-locales.mjs --source=C:/archives/DinoRPG/xml --apply
 *
 * Without --source, the local legacy maps/dungeons.xml can be migrated for FR.
 * The command never downloads or changes any GitHub file.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const maps = resolve(process.env.MT_DUNGEON_MAPS_DIR || 'packages/core/src/models/dungeon/maps');
const definitions = resolve(process.env.MT_DUNGEON_DEFINITIONS_DIR || 'packages/core/src/models/dungeon/definitions');
const sourceArg = process.argv.find(arg => arg.startsWith('--source='));
const source = sourceArg ? resolve(sourceArg.slice('--source='.length)) : null;
const apply = process.argv.includes('--apply');
const shaByLanguage = {
  fr: '82f6f047231953c08f4bec923ca8d39f67d847e4',
  en: 'e439fbc1bb0353ff3bf2446b80429e7ef925c4cc',
  es: '76dd00323a7fc43c473ab699e1b3e39b17b97dc3',
  de: 'c7a6b1897f35777c55a7f5dbc8d40eafb2c525c6'
};
const sha = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
let missing = 0;
for (const [language, expected] of Object.entries(shaByLanguage)) {
  const destination = join(definitions, language, 'dungeons.xml');
  const legacy = language === 'fr' ? join(maps, 'dungeons.xml') : null;
  const archived = source && join(source, language, 'dungeons.xml');
  const candidates = [destination, legacy, archived].filter(Boolean);
  for (const file of candidates) {
    if (existsSync(file) && sha(readFileSync(file)) !== expected) {
      console.error(`REFUSED: modified ${file}. The original MT bytes are mandatory.`);
      process.exit(1);
    }
  }
  const available = candidates.find(file => existsSync(file));
  if (!available) {
    console.error(`MISSING: ${language}/dungeons.xml (specify --source=<archive>/DinoRPG/xml)`);
    missing++;
    continue;
  }
  if (available !== destination) {
    console.log(`${apply ? 'COPY' : 'WOULD COPY'} ${available} -> ${destination}`);
    if (apply) {
      mkdirSync(dirname(destination), {recursive:true});
      writeFileSync(destination, readFileSync(available));
    }
  } else console.log(`OK ${destination}`);
  if (legacy && existsSync(legacy)) {
    console.log(`${apply ? 'REMOVE' : 'WOULD REMOVE'} obsolete file maps/dungeons.xml`);
    if (apply) unlinkSync(legacy);
  }
}
if (!apply) console.log('Preview only. Add --apply after reviewing; no changes have been made.');
if (missing) {
  console.error(`${missing} locale file(s) are not available locally. The originals must be copied before verification can pass.`);
  process.exitCode = 1;
}
