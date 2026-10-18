/**
 * Safe, idempotent insertion of the isolated MtDungeonRun Prisma model.
 * Operates ONLY on local app/server/prisma/schema.prisma. No remote access.
 * Requires --apply; without it prints the changes that would be made.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pathname = resolve('app/server/prisma/schema.prisma');
const apply = process.argv.includes('--apply');
const input = readFileSync(pathname, 'utf8');
const eol = input.includes('\r\n') ? '\r\n' : '\n';
let schema = input.replace(/\r\n/g, '\n');
const model = `model MtDungeonRun {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @db.Uuid
  leaderDinozId Int
  mapId         String   @db.VarChar(64)
  revision      Int      @default(0)
  x             Int
  y             Int
  l             Int
  keys          Boolean[] @default([])
  flags         Int[]    @default([])
  fog           Bytes?
  locked        Boolean  @default(false)
  pending       Json?
  createdAt     DateTime @default(now()) @db.Timestamptz(3)
  updatedAt     DateTime @updatedAt @db.Timestamptz(3)

  user        User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  leaderDinoz Dinoz @relation(fields: [leaderDinozId], references: [id], onDelete: Cascade)

  @@unique([userId, leaderDinozId])
  @@index([userId])
}
`;
function addRelation(name, relation) {
  const re = new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`, 'm');
  const m = re.exec(schema);
  if (!m) throw new Error(`Prisma model ${name} not found; schema was not modified.`);
  if (m[1].includes('mtDungeonRuns')) return;
  schema = schema.replace(re, match => match.slice(0, -2) + `\n  ${relation}\n}`);
}
if (!schema.includes('model MtDungeonRun {')) {
  addRelation('User', 'mtDungeonRuns MtDungeonRun[]');
  addRelation('Dinoz', 'mtDungeonRuns MtDungeonRun[]');
  schema = `${schema.trimEnd()}\n\n${model}`;
} else {
  if (!schema.includes('@@unique([userId, leaderDinozId])'))
    throw new Error('A different MtDungeonRun model exists. Manual reconciliation required.');
  addRelation('User', 'mtDungeonRuns MtDungeonRun[]');
  addRelation('Dinoz', 'mtDungeonRuns MtDungeonRun[]');
}
const output = schema.replace(/\n/g, eol);
if (output === input) {
  console.log('MtDungeonRun schema already installed; no changes.');
} else if (!apply) {
  console.log('Dry-run OK: MtDungeonRun model and two relations can be inserted. Use --apply to write.');
} else {
  writeFileSync(pathname, output, 'utf8');
  console.log('MtDungeonRun Prisma schema updated locally.');
}
