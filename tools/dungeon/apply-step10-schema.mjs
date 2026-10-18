/** Idempotent, local-only Prisma schema extension. Dry run by default. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve('app/server/prisma/schema.prisma');
const input = readFileSync(path, 'utf8');
const eol = input.includes('\r\n') ? '\r\n' : '\n';
let schema = input.replace(/\r\n/g, '\n');
const parent = /model MtDungeonRun \{([\s\S]*?)\n\}/m.exec(schema);
if (!parent || !/^\s*stageStates\s+Json\s+@default\("\{\}"\)/m.test(parent[1]))
  throw new Error('First apply stage 8: MtDungeonRun.stageStates missing.');
const model = `model MtDungeonFightAttempt {
  id            String       @id @default(uuid()) @db.Uuid
  runId         String       @db.Uuid
  token         String       @unique @default(uuid()) @db.Uuid
  mapId         String       @db.VarChar(64)
  revision      Int
  scenarioIndex Int
  pendingJson   String       @db.Text
  monsterKeys   String[]
  fightSeed     String       @db.Text
  status        String       @default("PREPARED") @db.VarChar(16)
  result        Json?
  createdAt     DateTime     @default(now()) @db.Timestamptz(3)
  updatedAt     DateTime     @updatedAt @db.Timestamptz(3)
  run           MtDungeonRun @relation(fields: [runId], references: [id], onDelete: Cascade)

  @@unique([runId, revision])
  @@index([runId])
}
`;
if (!/^\s*mtFightAttempts\s+MtDungeonFightAttempt\[\]/m.test(parent[1])) {
  schema = schema.replace(parent[0], parent[0].replace(/\n\}$/, '\n  mtFightAttempts MtDungeonFightAttempt[]\n}'));
}
if (!schema.includes('model MtDungeonFightAttempt {')) {
  schema = `${schema.trimEnd()}\n\n${model}`;
} else if (!/model MtDungeonFightAttempt \{[\s\S]*?@@unique\(\[runId, revision\]\)/.test(schema)) {
  throw new Error('Incompatible MtDungeonFightAttempt model: reconcile manually.');
}
if (schema === input.replace(/\r\n/g, '\n')) {
  console.log('Étape 10 : schéma déjà à jour.');
} else if (process.argv.includes('--apply')) {
  writeFileSync(path, schema.replace(/\n/g, eol), 'utf8');
  console.log('Étape 10 : modèle MtDungeonFightAttempt ajouté localement.');
} else {
  console.log('Dry-run OK : ajout du modèle MtDungeonFightAttempt et de la relation MtDungeonRun. Relancer avec --apply.');
}
