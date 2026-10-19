/**
 * One-time migration: original MT XML assets -> one typed TS data module.
 * Run from the DinoRPG-Remastered repository root after building @dinorpg/core.
 * No Git commits or network requests.  Preserves the MT definitions and encoded maps.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dryRun = process.argv.includes('--dry-run');
const allowModified = process.argv.includes('--allow-modified');
const prefix = 'packages/core/src/models/dungeon';
const definitionsRoot = `${prefix}/definitions`;
const mapsRoot = `${prefix}/maps`;
const outputPath = `${prefix}/dungeon.mtData.ts`;
const archivePath = 'app/server/src/Dungeon/Service/mtDungeonArchive.service.ts';
const testsPath = 'packages/core/test/unit/dungeon/dungeon.catalog-assets.test.ts';
const codecTestsPath = 'packages/core/test/unit/dungeon/dungeon.codec.test.ts';
const serverTestsPath = 'app/server/test/unit/dungeon/mtDungeonArchive.service.test.ts';
const languages = ['fr', 'en', 'es', 'de'];

const abs = relative => resolve(root, relative);
const read = relative => {
  const filename = abs(relative);
  if (!existsSync(filename)) throw new Error(`Source required for migration not found: ${relative}`);
  return readFileSync(filename, 'utf8').replace(/\r\n/g, '\n');
};
const shaBlob = text => {
  const content = Buffer.from(text, 'utf8');
  return createHash('sha1').update(Buffer.from(`blob ${content.length}\0`)).update(content).digest('hex');
};
const ensureSha = (relative, content, expected) => {
  const actual = shaBlob(content);
  if (actual !== expected) {
    if (!allowModified) {
      throw new Error(`${relative}: unrecognized original MT bytes (expected ${expected}, got ${actual}).\n` +
        'Source has changed beyond CRLF normalization. Verify it first, or explicitly use --allow-modified to migrate your edited data.');
    }
    console.warn(`WARNING: preserving locally modified MT source ${relative} (${actual}); expected original ${expected}`);
  }
};
const replaceOnce = (source, match, replacement, label) => {
  const index = source.indexOf(match);
  if (index < 0 || source.indexOf(match, index + match.length) !== -1) {
    throw new Error(`The source differs from the expected feat/mt-dungeons version: ${label}. No files changed.`);
  }
  return source.slice(0, index) + replacement + source.slice(index + match.length);
};

// Do not write anything until all imports, assets and source transformations validate.
const compiledPrefix = 'packages/core/dist/models/dungeon';
const loadCore = async file => {
  const filePath = abs(`${compiledPrefix}/${file}.js`);
  if (!existsSync(filePath)) {
    throw new Error('Build @dinorpg/core first: pnpm --filter @dinorpg/core build');
  }
  return import(pathToFileURL(filePath).href);
};
const definitionApi = await loadCore('dungeon.definition');
const catalog = await loadCore('dungeon.catalog');
const mapManifest = await loadCore('dungeon.mapManifest');
const codec = await loadCore('dungeon.codec');
const originalDefinitions = {};
const sourceAssets = [];

for (const language of languages) {
  const relative = `${definitionsRoot}/${language}/dungeons.xml`;
  const source = read(relative);
  ensureSha(relative, source, catalog.MT_DUNGEON_DEFINITIONS_SHA[language]);
  const parsed = definitionApi.parseMtDungeonDefinitions(source);
  const indexed = catalog.groupMtDungeonDefinitions(parsed);
  const expected = Object.keys(catalog.MT_DUNGEON_MAPS)
    .filter(id => language !== 'de' || id !== 'labo')
    .sort();
  if (JSON.stringify([...indexed.keys()].sort()) !== JSON.stringify(expected)) {
    throw new Error(`${relative}: dungeon IDs differ from Motion Twin's catalog`);
  }
  originalDefinitions[language] = parsed;
  sourceAssets.push(relative);
}

const canonical = catalog.groupMtDungeonDefinitions(originalDefinitions.fr);
for (const language of languages.filter(language => language !== 'fr')) {
  const current = catalog.groupMtDungeonDefinitions(originalDefinitions[language]);
  for (const [id, localized] of current) {
    catalog.localizeMtDungeonDefinition(canonical.get(id), localized, language);
  }
}

const originalMaps = {};
const sortedMaps = Object.entries(mapManifest.ORIGINAL_MT_DUNGEON_MAP_SHA)
  .sort(([a], [b]) => a.localeCompare(b));
for (const [filename, expected] of sortedMaps) {
  const relative = `${mapsRoot}/${filename}`;
  const content = read(relative);
  ensureSha(relative, content, expected);
  const decoded = codec.decodeMtDungeon(content).structure;
  const [id, stageString] = filename.replace(/\.xml$/, '').split('_');
  const stageIndex = Number(stageString);
  const scenarios = canonical.get(id)?.stages[stageIndex]?.scenarios;
  if (!scenarios) throw new Error(`${filename}: no matching MT scenario definitions`);
  for (const level of decoded.levels) {
    for (const room of level.rooms) {
      if (room.item?.kind === 'IScenario' && !scenarios[room.item.value]) {
        throw new Error(`${filename}: scenario #${room.item.value} absent from original definitions`);
      }
    }
  }
  originalMaps[filename] = content;
  sourceAssets.push(relative);
}

const moduleSource = `/**
 * Original Motion Twin dungeon data, converted once from the archived assets.
 * Do not regenerate maps or alter scenario indices: they define actual gameplay.
 * The original XML files are not required at runtime (including on Windows).
 * Motion Twin data: CC BY-NC-SA 4.0 — see project NOTICE.
 *
 * Static data: ${languages.join(', ')} definitions and ${sortedMaps.length} encoded maps.
 * Generated by tools/dungeon/migrate-mt-dungeon-data.mjs.
 */
import type { MtDungeonLanguage } from './dungeon.catalog.js';
import type { MtDungeonDefinition } from './dungeon.definition.js';
import type { ORIGINAL_MT_DUNGEON_MAP_SHA } from './dungeon.mapManifest.js';

export const MT_DUNGEON_DEFINITIONS: Readonly<Record<MtDungeonLanguage, readonly MtDungeonDefinition[]>> = ${JSON.stringify(originalDefinitions, null, 2)};

/** Encoded MT map format (the .xml files actually contained this opaque encoded string). */
export const MT_DUNGEON_MAPS_ENCODED: Readonly<Record<keyof typeof ORIGINAL_MT_DUNGEON_MAP_SHA, string>> = ${JSON.stringify(originalMaps, null, 2)};
`;

let service = read(archivePath);
service = replaceOnce(service, "import { createHash } from 'node:crypto';\n", '', 'crypto import');
service = replaceOnce(service, "import { existsSync, readFileSync } from 'node:fs';\n", '', 'fs import');
service = replaceOnce(service, "import { join, resolve } from 'node:path';\n", '', 'path import');
service = replaceOnce(service, "import { compileMtDungeonBlockRules } from '@dinorpg/core/models/dungeon/dungeon.blocks.js';\n", "import { compileMtDungeonBlockRules } from '@dinorpg/core/models/dungeon/dungeon.blocks.js';\nimport { MT_DUNGEON_DEFINITIONS, MT_DUNGEON_MAPS_ENCODED } from '@dinorpg/core/models/dungeon/dungeon.mtData.js';\n", 'data import');
service = replaceOnce(service, '\tMT_DUNGEON_DEFINITIONS_SHA,\n', '', 'SHA import');
service = replaceOnce(service, "import {\n\ttype MtDungeonDefinition,\n\tparseMtDungeonDefinitions\n} from '@dinorpg/core/models/dungeon/dungeon.definition.js';\n", "import type { MtDungeonDefinition } from '@dinorpg/core/models/dungeon/dungeon.definition.js';\n", 'parser import');

const removeBetween = (content, begin, end, label) => {
  const start = content.indexOf(begin);
  const stop = content.indexOf(end, start + begin.length);
  if (start === -1 || stop === -1 || content.indexOf(begin, start + begin.length) !== -1) {
    throw new Error(`Unable to identify original ${label}. No files changed.`);
  }
  return content.slice(0, start) + content.slice(stop);
};
service = removeBetween(service, '/** A controlled directory, never assembled from a raw client URL. */', 'function iconsForStage(', 'archive filesystem helper functions');
service = removeBetween(service, '/** Original metadata is deliberately outside `maps/`, which contains exactly 11 layouts. */', 'export class MtDungeonArchive {', 'definitions directory helper');
service = replaceOnce(service, `\tconstructor(
\t\tprivate readonly directory: string = findMtDungeonArchiveDirectory(),
\t\tprivate readonly definitionsDirectory: string = findMtDungeonDefinitionsDirectory(directory)
\t) {}
`, '', 'filesystem constructor');
service = replaceOnce(service, `\t\tconst path = join(this.definitionsDirectory, language, 'dungeons.xml');
\t\tif (!existsSync(path)) throw new MtDungeonArchiveError(\`Métadonnées MT manquantes: \${path}\`);
\t\tconst bytes = readFileSync(path);
\t\tif (mtGitBlobSha(bytes) !== MT_DUNGEON_DEFINITIONS_SHA[language])
\t\t\tthrow new MtDungeonArchiveError(\`\${language}/dungeons.xml: empreinte Git MT invalide.\`);
\t\tconst definitions = parseMtDungeonDefinitions(bytes.toString('utf8'));`, `\t\tconst definitions = MT_DUNGEON_DEFINITIONS[language];`, 'runtime definitions loader');
service = replaceOnce(service, `\t\tconst bytes = readFileSync(join(this.directory, filename));
\t\tconst actual = mtGitBlobSha(bytes);
\t\tif (actual !== expected)
\t\t\tthrow new MtDungeonArchiveError(
\t\t\t\t\`\${filename}: empreinte Git invalide (\${actual}); ne pas utiliser une carte modifiée.\`
\t\t\t);
\t\tconst map = decodeMtDungeon(bytes.toString('utf8')).structure;`, `\t\tconst encoded = MT_DUNGEON_MAPS_ENCODED[filename];
\t\tif (encoded === undefined) throw new MtDungeonArchiveError(\`Carte originale introuvable: \${filename}\`);
\t\tconst map = decodeMtDungeon(encoded).structure;`, 'runtime map loader');
service = service.replace('Reads the user\'s locally archived, unmodified Motion Twin XML files.', 'Loads typed Motion Twin definitions and original encoded maps from the core bundle.');
service = service.replace('/** Loads an entire *original* locale file, checks byte integrity and mechanics. */', '/** Loads a typed original MT locale and validates its dungeon inventory/mechanics. */');

const testSource = `import { describe, expect, it } from 'vitest';

import { groupMtDungeonDefinitions, localizeMtDungeonDefinition, MT_DUNGEON_MAPS } from '../../../src/models/dungeon/dungeon.catalog.js';
import { decodeMtDungeon } from '../../../src/models/dungeon/dungeon.codec.js';
import { MT_DUNGEON_DEFINITIONS, MT_DUNGEON_MAPS_ENCODED } from '../../../src/models/dungeon/dungeon.mtData.js';
import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '../../../src/models/dungeon/dungeon.mapManifest.js';

describe('static Motion Twin dungeon archive', () => {
  it('provides every original map as a decodable static string', () => {
    expect(Object.keys(MT_DUNGEON_MAPS_ENCODED).sort()).toEqual(Object.keys(ORIGINAL_MT_DUNGEON_MAP_SHA).sort());
    const fr = groupMtDungeonDefinitions(MT_DUNGEON_DEFINITIONS.fr);
    for (const [file, encoded] of Object.entries(MT_DUNGEON_MAPS_ENCODED)) {
      const [dungeonId, stageString] = file.replace(/\\.xml$/, '').split('_');
      const stage = fr.get(dungeonId as keyof typeof MT_DUNGEON_MAPS)?.stages[Number(stageString)];
      expect(stage, file).toBeDefined();
      const map = decodeMtDungeon(encoded).structure;
      expect(map.levels.length, file).toBeGreaterThan(0);
      for (const level of map.levels) {
        for (const room of level.rooms) {
          if (room.item?.kind === 'IScenario') {
            expect(stage?.scenarios[room.item.value], \`\${file} scenario \${room.item.value}\`).toBeDefined();
          }
        }
      }
    }
  });
  it('preserves the original language inventory and identical mechanics', () => {
    const original = groupMtDungeonDefinitions(MT_DUNGEON_DEFINITIONS.fr);
    expect([...original.keys()].sort()).toEqual(Object.keys(MT_DUNGEON_MAPS).sort());
    for (const language of ['en', 'es', 'de'] as const) {
      const translated = groupMtDungeonDefinitions(MT_DUNGEON_DEFINITIONS[language]);
      for (const [id, definition] of translated) {
        expect(localizeMtDungeonDefinition(original.get(id)!, definition, language).languageUsed).toBe(language);
      }
    }
  });
});
`;

const codecTest = read(codecTestsPath);
let updatedCodecTest = replaceOnce(codecTest, "import { readdirSync, readFileSync } from 'node:fs';\n", '', 'test fs import');
updatedCodecTest = replaceOnce(updatedCodecTest, "import { join } from 'node:path';\n", '', 'test path import');
updatedCodecTest = replaceOnce(updatedCodecTest, "import { fileURLToPath } from 'node:url';\n", '', 'test url import');
updatedCodecTest = replaceOnce(updatedCodecTest, "import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '../../../src/models/dungeon/dungeon.mapManifest.js';\n", "import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '../../../src/models/dungeon/dungeon.mapManifest.js';\nimport { MT_DUNGEON_MAPS_ENCODED } from '../../../src/models/dungeon/dungeon.mtData.js';\n", 'test data import');
const codecFixtureStart = updatedCodecTest.indexOf('const originalMapsDir = fileURLToPath(');
if (codecFixtureStart < 0 || updatedCodecTest.indexOf('const originalMapsDir = fileURLToPath(', codecFixtureStart + 1) >= 0) {
  throw new Error(`Unable to find exact original maps fixture section. No files changed.`);
}
updatedCodecTest = updatedCodecTest.slice(0, codecFixtureStart) + `describe('11 cartes originales MT versionnées dans le module TS', () => {
\tit('contient exactement les 11 cartes historiques', () => {
\t\texpect(Object.keys(MT_DUNGEON_MAPS_ENCODED).sort()).toEqual(Object.keys(ORIGINAL_MT_DUNGEON_MAP_SHA).sort());
\t});
\tfor (const [filename, expectedSha] of Object.entries(ORIGINAL_MT_DUNGEON_MAP_SHA)) {
\t\tit(\`vérifie et décode \${filename}\`, () => {
\t\t\tconst source = MT_DUNGEON_MAPS_ENCODED[filename as keyof typeof MT_DUNGEON_MAPS_ENCODED];
\t\t\texpect(gitBlobSha(Buffer.from(source, 'utf8'))).toBe(expectedSha);
\t\t\tconst result = decodeMtDungeon(source);
\t\t\texpect(result.structure.levels.length).toBeGreaterThan(0);
\t\t\texpect(result.structure.levels.every(level => level.rooms.length > 0)).toBe(true);
\t\t\tfor (const p of [result.structure.start, result.structure.exit]) {
\t\t\t\texpect(p.x).toBeGreaterThanOrEqual(0);
\t\t\t\texpect(p.y).toBeGreaterThanOrEqual(0);
\t\t\t\texpect(p.l).toBeGreaterThanOrEqual(0);
\t\t\t\texpect(p.x).toBeLessThan(result.structure.width);
\t\t\t\texpect(p.y).toBeLessThan(result.structure.height);
\t\t\t\texpect(p.l).toBeLessThan(result.structure.levels.length);
\t\t\t}
\t\t});
\t}
});
`;

const serverTest = `import { describe, expect, it } from 'vitest';

import { MtDungeonArchive } from '../../../src/Dungeon/Service/mtDungeonArchive.service.js';

describe('MT static archive', () => {
\tit('loads authentic MT definitions without filesystem XML', () => {
\t\tconst archive = new MtDungeonArchive();
\t\texpect(archive.definition('stepp').name).toBe('Les Cavernes Magnétiques');
\t\texpect(archive.localizedDefinition('stepp', 'en').definition.name).toBe('The Magnetic Caverns');
\t\texpect(archive.configuration('stepp_0').map.levels.length).toBeGreaterThan(0);
\t});
});
`;

if (existsSync(abs(outputPath))) throw new Error(`Refusing to overwrite existing ${outputPath}. No files changed.`);
const gitattributes = `.gitattributes`;
const ownAttributes = '# Preserve the exact original Motion Twin XML bytes on Windows checkouts.\n' +
  '# The dungeon archive validates Git blob SHA-1 values at runtime.\n' +
  '/packages/core/src/models/dungeon/definitions/**/*.xml text eol=lf\n' +
  '/packages/core/src/models/dungeon/maps/*.xml text eol=lf\n';
const removeGitattributes = existsSync(abs(gitattributes)) && read(gitattributes) === ownAttributes;

console.log(`MT dungeon sources verified: ${languages.length} languages, ${sortedMaps.length} encoded maps.`);
console.log(`Will create: ${outputPath}`);
console.log(`Will update: ${archivePath}`);
console.log(`Will update: ${testsPath}, ${codecTestsPath}, ${serverTestsPath}`);
console.log(`Will delete: ${sourceAssets.length} original XML asset files`);
if (removeGitattributes) console.log('Will delete obsolete MT-only .gitattributes');
if (dryRun) {
  console.log('Dry run only. No files changed.');
  process.exit(0);
}

writeFileSync(abs(outputPath), moduleSource, 'utf8');
writeFileSync(abs(archivePath), service, 'utf8');
writeFileSync(abs(testsPath), testSource, 'utf8');
writeFileSync(abs(codecTestsPath), updatedCodecTest, 'utf8');
writeFileSync(abs(serverTestsPath), serverTest, 'utf8');
for (const filename of sourceAssets) rmSync(abs(filename));
if (removeGitattributes) rmSync(abs(gitattributes));
console.log('Migration complete. No commit or push was performed.');
console.log('Next: pnpm --filter @dinorpg/core build && pnpm --filter @dinorpg/server build');
