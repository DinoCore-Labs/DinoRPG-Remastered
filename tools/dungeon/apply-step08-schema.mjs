/** Idempotent local Prisma schema upgrade. Dry run unless --apply. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve('app/server/prisma/schema.prisma');
const original = readFileSync(path, 'utf8');
const eol = original.includes('\r\n') ? '\r\n' : '\n';
const source = original.replace(/\r\n/g, '\n');
const model = /model MtDungeonRun \{([\s\S]*?)\n\}/m.exec(source);
if (!model) throw new Error('MtDungeonRun is missing: apply stage 7 schema before stage 8.');
let output = source;
if (/^\s*stageStates\s+/m.test(model[1])) {
  if (!/^\s*stageStates\s+Json\s+@default\("\{\}"\)/m.test(model[1]))
    throw new Error('MtDungeonRun.stageStates already exists with incompatible Prisma definition.');
  console.log('Stage 8 schema already installed; no changes.');
} else {
  if (!/^\s*pending\s+Json\?/m.test(model[1]))
    throw new Error('MtDungeonRun model is not the expected stage 7 schema.');
  const newModel = model[0].replace(/(^\s*pending\s+Json\?[^\n]*\n)/m,
    '$1  stageStates   Json     @default("{}")\n');
  output = source.replace(model[0], newModel);
  if (process.argv.includes('--apply')) {
    writeFileSync(path, output.replace(/\n/g, eol), 'utf8');
    console.log('Installed MtDungeonRun.stageStates (local Prisma schema).');
  } else console.log('Dry-run OK: MtDungeonRun.stageStates will be added. Use --apply to write.');
}
