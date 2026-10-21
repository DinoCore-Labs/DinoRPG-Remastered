/**
 * Keep MT discoveries across distinct runs. Requires steps 20D + defeat evacuation.
 * Reads all files and preflights every anchor before writing anything. No git actions.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const planned = new Map();
const original = new Map();
function content(path) {
	if (!planned.has(path)) {
		const target = join(root, path);
		if (!existsSync(target)) throw new Error(`Fichier absent : ${path}`);
		const source = readFileSync(target, 'utf8');
		original.set(path, source);
		planned.set(path, source.replace(/\r\n/g, '\n'));
	}
	return planned.get(path);
}
function replace(path, needle, replacement) {
	const body = content(path);
	if (body.includes(replacement)) return;
	const i = body.indexOf(needle);
	if (i < 0 || i !== body.lastIndexOf(needle)) throw new Error(`Ancre absente ou ambiguë : ${path}: ${needle.slice(0, 95)}`);
	planned.set(path, body.slice(0, i) + replacement + body.slice(i + needle.length));
}
function after(path, anchor, addition) { replace(path, anchor, anchor + addition); }
function before(path, anchor, addition) { replace(path, anchor, addition + anchor); }
function addFile(path) {
	const source = join(packageRoot, path);
	const target = join(root, path);
	if (!existsSync(source)) throw new Error(`Archive incomplète : ${path}`);
	const body = readFileSync(source, 'utf8');
	if (existsSync(target) && readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== body)
		throw new Error(`Conflit : le fichier existe avec un contenu différent : ${path}`);
	planned.set(path, body);
}

const schema = 'app/server/prisma/schema.prisma';
const schemaBody = content(schema);
if (!schemaBody.includes('model MtDungeonProgress {')) {
	const relation = '  mtDungeonRuns MtDungeonRun[]';
	const count = schemaBody.split(relation).length - 1;
	if (count !== 2) throw new Error(`Ancre de relations Prisma incorrecte : ${count} occurrences`);
	planned.set(schema, schemaBody.replaceAll(relation, `${relation}\n  mtDungeonProgress MtDungeonProgress[]`));
	before(schema, 'model MtDungeonRun {',
`/** Discoveries retained after MtDungeonRun is removed. One owner + group leader + dungeon. */
model MtDungeonProgress {
  userId        String   @db.Uuid
  leaderDinozId Int
  dungeonId     String   @db.VarChar(64)
  stageStates   Json     @default("{}")
  updatedAt     DateTime @updatedAt @db.Timestamptz(3)

  user        User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  leaderDinoz Dinoz @relation(fields: [leaderDinozId], references: [id], onDelete: Cascade)

  @@id([userId, leaderDinozId, dungeonId])
  @@index([leaderDinozId])
}

`);
}

const sessions = 'app/server/src/Dungeon/Service/mtDungeonSession.service.ts';
after(sessions,
  `import type { DungeonCommand } from '@dinorpg/core/models/dungeon/dungeon.types.js';\n`,
  `import { restoreMtDungeonProgress } from '@dinorpg/core/models/dungeon/dungeon.progress.js';\n`);
after(sessions,
  `\tbeforeOpen?(identity: MtSessionIdentity, mapId: string): Promise<void>;\n`,
  `\t/** Durable saved discoveries from earlier visits; never data supplied by HTTP. */\n\tloadProgress?(identity: MtSessionIdentity, mapId: string): Promise<unknown | null>;\n`);
replace(sessions,
  `\t\tconst run = createMtDungeonSession(cfg, fogEnabled);\n\t\tif (!(await deps.repository.createIfAbsent(identity, run)))`,
  `\t\tlet run = createMtDungeonSession(cfg, fogEnabled);\n` +
  `\t\tif (deps.loadProgress) {\n` +
  `\t\t\tconst saved = await deps.loadProgress(identity, mapId);\n` +
  `\t\t\tif (saved !== null) {\n` +
  `\t\t\t\ttry {\n` +
  `\t\t\t\t\trun = restoreMtDungeonProgress(run, saved, deps.getConfiguration);\n` +
  `\t\t\t\t} catch {\n` +
  `\t\t\t\t\tthrow new MtDungeonSessionError('invalid-run');\n` +
  `\t\t\t\t}\n` +
  `\t\t\t}\n` +
  `\t\t}\n` +
  `\t\tif (!(await deps.repository.createIfAbsent(identity, run)))`);

const runtime = 'app/server/src/Dungeon/Service/mtDungeonRuntime.service.ts';
after(runtime,
  `import { prismaMtDungeonRunRepository } from '../Repository/prismaMtDungeonRun.repository.js';\n`,
  `import { loadMtDungeonProgress } from './mtDungeonProgress.service.js';\n`);
after(runtime,
  `\t\trepository: prismaMtDungeonRunRepository,\n`,
  `\t\tloadProgress: loadMtDungeonProgress,\n`);

const dev = 'app/server/src/Dungeon/Service/mtDungeonDevTools.service.ts';
after(dev, `import { prisma } from '../../prisma.js';\n`, `import { saveMtDungeonProgress } from './mtDungeonProgress.service.js';\n`);
replace(dev,
  `\t\tconst removed = await prisma.mtDungeonRun.deleteMany({\n` +
  `\t\t\twhere: { userId: identity.userId, leaderDinozId: identity.leaderDinozId, mapId: 'stepp_0', revision }\n` +
  `\t\t});\n` +
  `\t\tif (removed.count !== 1) throw new MtDungeonDevToolsError('conflict');`,
  `\t\t// A single transaction must either preserve discoveries AND delete the run, or do neither.\n` +
  `\t\tawait prisma.$transaction(async tx => {\n` +
  `\t\t\tawait saveMtDungeonProgress(tx, identity, session, cfg);\n` +
  `\t\t\tconst removed = await tx.mtDungeonRun.deleteMany({\n` +
  `\t\t\t\twhere: { userId: identity.userId, leaderDinozId: identity.leaderDinozId, mapId: 'stepp_0', revision }\n` +
  `\t\t\t});\n` +
  `\t\t\tif (removed.count !== 1) throw new MtDungeonDevToolsError('conflict');\n` +
  `\t\t});`);

for (const file of [
 'app/server/src/Dungeon/Service/mtDungeonFight.service.ts',
 'app/server/src/Dungeon/Service/mtDungeonGuardianTrial.service.ts'
]) {
  after(file,
    `import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';\n`,
    `import { saveMtDungeonProgress } from './mtDungeonProgress.service.js';\n`);
  const code = content(file);
  if (!code.includes(`if (await isWipedMtDungeonParty(tx, identity)) {`))
    throw new Error(`Installer ejection KO requis avant cette étape : ${file}`);
  replace(file,
    `\t\t\t\tif (await isWipedMtDungeonParty(tx, identity)) {\n\t\t\t\t\tconst removed = await tx.mtDungeonRun.deleteMany({`,
    `\t\t\t\tif (await isWipedMtDungeonParty(tx, identity)) {\n\t\t\t\t\tawait saveMtDungeonProgress(tx, identity, settled, ${file.includes('GuardianTrial') ? 'cfg' : 'map'});\n\t\t\t\t\tconst removed = await tx.mtDungeonRun.deleteMany({`);
}

const defeat = 'app/server/src/Dungeon/Service/mtDungeonDefeat.service.ts';
after(defeat, `import { prisma } from '../../prisma.js';\n`, `import { saveMtDungeonProgress } from './mtDungeonProgress.service.js';\n`);
replace(defeat,
  `\treturn mtDungeonDependencies().withLock(identity.userId, async () =>\n`,
  `\tconst deps = mtDungeonDependencies();\n\treturn deps.withLock(identity.userId, async () =>\n`);
before(defeat,
  `\t\t\tconst removed = await tx.mtDungeonRun.deleteMany({`,
  `\t\t\tconst session = await deps.repository.load(identity);\n` +
  `\t\t\tif (!session || session.revision !== expectedRevision) throw new MtDungeonDefeatError('conflict');\n` +
  `\t\t\tawait saveMtDungeonProgress(tx, identity, session, deps.getConfiguration(session.mapId));\n`);

for (const path of [
 'packages/core/src/models/dungeon/dungeon.progress.ts',
 'packages/core/test/unit/dungeon/dungeon.progress.test.ts',
 'app/server/test/unit/dungeon/mtDungeonProgress.service.test.ts',
 'app/server/src/Dungeon/Service/mtDungeonProgress.service.ts',
 'app/server/prisma/migrations/20261021193000_mt_dungeon_persistent_progress/migration.sql'
]) addFile(path);

let written = 0;
for (const [path, value] of planned) {
  const file = join(root,path);
  mkdirSync(dirname(file),{recursive:true});
  const existing = original.get(path);
  if (existing !== undefined && existing.replace(/\r\n/g,'\n') === value) continue;
  if (existing === undefined && existsSync(file) && readFileSync(file,'utf8').replace(/\r\n/g,'\n') === value) continue;
  if (existing !== undefined) {
    const backup = file + '.before-mt-persistence';
    if (!existsSync(backup)) copyFileSync(file, backup);
  }
  writeFileSync(file,value,'utf8');
  written++;
}
console.log(`MT durable progress installed: ${written} fichier(s) modifié(s). Aucun git push.`);
