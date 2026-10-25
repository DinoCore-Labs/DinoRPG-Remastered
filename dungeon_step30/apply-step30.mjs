import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const relative = [
  'app/client/src/components/dungeon/mtDungeonBoundaryAction.ts',
  'app/client/src/pages/DungeonPage.vue',
  'app/client/test/unit/dungeon/mtDungeonBoundaryAction.test.ts'
];
const files = relative.map(p => path.join(root, p));
const originals = files.map(file => fs.readFileSync(file, 'utf8'));
function replaceExactly(source, pattern, replacement, label) {
  const matches = [...source.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))];
  if (matches.length !== 1) throw new Error(`${label}: ${matches.length} occurrence(s), aucun fichier modifié.`);
  return source.replace(pattern, replacement);
}
const boundary = `/** Resolve MT stair transitions across ALL original dungeon definitions. */
import { MT_DUNGEON_MAPS } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';

export type MtDungeonBoundaryAction = 'forward' | 'backward' | 'surface-exit' | null;

export function mtDungeonBoundaryAction(run: Pick<MtDungeonSession, 'mapId' | 'pending'>): MtDungeonBoundaryAction {
  const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(run.mapId);
  if (!match) return null;
  const id = match[1]!;
  if (!Object.prototype.hasOwnProperty.call(MT_DUNGEON_MAPS, id)) return null;
  const maps = MT_DUNGEON_MAPS[id as keyof typeof MT_DUNGEON_MAPS];
  const stage = Number(match[2]);
  if (stage >= maps.length || maps[stage] !== run.mapId + '.xml') return null;
  switch (run.pending?.kind) {
    case 'boundary-start': return stage === 0 ? 'surface-exit' : 'backward';
    case 'boundary-exit': return stage === maps.length - 1 ? 'surface-exit' : 'forward';
    default: return null;
  }
}
`;
let page = originals[1];
// Compute the original MT tower flag from its authoritative shared definition.
if (!page.includes("import { MT_DUNGEON_DEFINITIONS }")) {
  page = replaceExactly(page,
    /import \{ getDungeonSkin \} from '@dinorpg\/core\/models\/dungeon\/dungeon\.skins\.js';/,
    "import { getDungeonSkin } from '@dinorpg/core/models/dungeon/dungeon.skins.js';\nimport { MT_DUNGEON_DEFINITIONS } from '@dinorpg/core/models/dungeon/dungeon.mtData.js';",
    'Import définition MT');
}
if (!page.includes('const isTowerDungeon = computed(')) {
  page = replaceExactly(page,
    /const stairDirections = computed\(\(\) => \{/,
    `const isTowerDungeon = computed(() => MT_DUNGEON_DEFINITIONS.fr.find(d => d.id === dungeonId.value)?.tower ?? false);\nconst stairDirections = computed(() => {`,
    'Indicateur tour MT');
}
page = replaceExactly(page,
  /\.map\(f => \(f\.kind === 'stair' \? \(f\.up \? 'down' : 'up'\) : ''\)\);/,
  ".map(f => (f.kind === 'stair' ? (isTowerDungeon.value ? (f.up ? 'up' : 'down') : (f.up ? 'down' : 'up')) : ''));",
  'Orientation des flèches');
page = replaceExactly(page,
  /const \[dx, dy, dl\] = offsets\[direction\];\s*const command: DungeonCommand = \{ \.\.\.previous\.position, dx, dy, dl \};/,
  `const [dx, dy, baseDl] = offsets[direction];\n\t\tconst dl = isTowerDungeon.value ? -baseDl : baseDl;\n\t\tconst command: DungeonCommand = { ...previous.position, dx, dy, dl };`,
  'Sens du déplacement vertical');
// Note: existing exit flow (worldExit -> router.replace -> MsgBox on DinozPage) is preserved.
const tests = `import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { MT_DUNGEON_MAPS } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import { describe, expect, it } from 'vitest';
import { mtDungeonBoundaryAction } from '../../../src/components/dungeon/mtDungeonBoundaryAction.js';

const run = (mapId: string, kind: 'boundary-start' | 'boundary-exit' | null) =>
  ({ mapId, pending: kind ? { kind } : null }) as Pick<MtDungeonSession, 'mapId' | 'pending'>;

describe('MT dungeon boundary routing for every archived dungeon', () => {
  for (const [id, maps] of Object.entries(MT_DUNGEON_MAPS)) {
    it(id + ' returns from its entry and exits its final map', () => {
      expect(mtDungeonBoundaryAction(run(id + '_0', 'boundary-start'))).toBe('surface-exit');
      expect(mtDungeonBoundaryAction(run(id + '_' + (maps.length - 1), 'boundary-exit'))).toBe('surface-exit');
      for (let stage = 0; stage < maps.length - 1; stage++)
        expect(mtDungeonBoundaryAction(run(id + '_' + stage, 'boundary-exit'))).toBe('forward');
      for (let stage = 1; stage < maps.length; stage++)
        expect(mtDungeonBoundaryAction(run(id + '_' + stage, 'boundary-start'))).toBe('backward');
    });
  }
  it('does not process absent or invalid boundaries', () => {
    expect(mtDungeonBoundaryAction(run('katak_0', null))).toBeNull();
    expect(mtDungeonBoundaryAction(run('madeup_0', 'boundary-start'))).toBeNull();
    expect(mtDungeonBoundaryAction(run('stepp_999', 'boundary-exit'))).toBeNull();
  });
});
`;
if (!originals[0].includes('export function mtDungeonBoundaryAction') || !originals[2].includes('mtDungeonBoundaryAction')) throw new Error('Fichiers inattendus, aucun fichier modifié.');
const outputs = [boundary, page, tests];
const changed = files.map((file, i) => ({file, content: outputs[i]}));
// Validate all before committing changes; avoid half-written files.
for (let i = 0; i < files.length; i++) if (fs.readFileSync(files[i], 'utf8') !== originals[i]) throw new Error('Fichier changé pendant préparation.');
for (const {file, content} of changed) fs.writeFileSync(file, content);
console.log('Étape 30 installée : routes de sortie génériques + inversion MT des tours.');
