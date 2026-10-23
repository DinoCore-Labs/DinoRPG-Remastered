/**
 * MT 20M: shared finite gold reserve, all-or-nothing local installer.
 * Run from repo root: node tools/dungeon/apply-step20m-shared-gold.mjs --check
 * No Git actions, no database DDL execution, no network connections.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(filename), '../..');
const payloadRoot = resolve(dirname(filename), 'step20m-payload');
const check = process.argv.includes('--check');
if (process.argv.some(arg => arg.startsWith('--') && arg !== '--check')) throw new Error('Unknown option');

const canon = source => source.replace(/\r\n?/g, '\n').trimEnd() + '\n';
const hash = source => createHash('sha256').update(canon(source), 'utf8').digest('hex');
// Secondary fingerprints for the post-20E GitHub branch, which gained extra
// authorization checks after the original 20E release. Length + FNV + required
// anchors are checked together; unrelated local edits are never overwritten.
const fnv = source => { let value = 2166136261; for (const char of canon(source)) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0; return value; };
const branchFingerprints = new Map([
  ['app/server/src/Dungeon/Service/mtDungeonGold.service.ts', { len: 4770, fnv: 3592353863, anchors: ['leaderDinoz: { userId: identity.userId }', 'const settled = settleMtDungeonInteraction(cfg, pendingSession, true);'] }],
  ['app/server/test/unit/dungeon/mtDungeonGold.service.test.ts', { len: 3668, fnv: 1200916129, anchors: ['credits raw 8-bit value', 'MT dungeon automatic IGold settlement'] }]
]);
const read = path => readFileSync(path, 'utf8');
const plan = [];
const files = [
	{
		path: 'packages/core/src/models/dungeon/dungeon.gold.ts',
		payload: 'core-gold.ts',
		originalHash: '7dd1ccb00bc5a6a36af9c10bab7e3080110e605f57e2e401148ee6088563fad2'
	},
	{
		path: 'packages/core/test/unit/dungeon/dungeon.gold.test.ts',
		payload: 'core-gold.test.ts',
		originalHash: '8ad7b669499c69a8bce87ab8a0833af13ff77db6054c1ef9e5530a38a8162155'
	},
	{
		path: 'app/server/src/Dungeon/Service/mtDungeonGold.service.ts',
		payload: 'server-gold.ts',
		originalHash: '709df3982d7957f186a67a0bfdc8344994901d048cb0eb347690a5427b496a78'
	},
	{
		path: 'app/server/test/unit/dungeon/mtDungeonGold.service.test.ts',
		payload: 'server-gold.test.ts',
		originalHash: '7b92f1c44a8e85b73e127797aabac2a7e0cfd0550be9352f82e0a0fd7f1d198a'
	}
];
function stage(path, next, previous, backups = true) {
	if (previous === next) return;
	plan.push({ path, next, previous, backups });
}
for (const f of files) {
	const target = resolve(root, f.path);
	const source = resolve(payloadRoot, f.payload);
	if (!existsSync(target) || !existsSync(source)) throw new Error(`Missing ${f.path} or ${f.payload}`);
	const original = read(target), desired = read(source);
	if (hash(original) === hash(desired)) continue;
	const branch = branchFingerprints.get(f.path);
	const isKnownBranch = branch && canon(original).length === branch.len && fnv(original) === branch.fnv && branch.anchors.every(anchor => original.includes(anchor));
	if (hash(original) !== f.originalHash && !isKnownBranch) {
		throw new Error(`${f.path}: fichier modifié localement ou version différente; refus d'écraser. Aucune modification effectuée. Compare ce fichier avec l'étape 20E.`);
	}
	stage(target, desired, original);
}

const schemaPath = resolve(root, 'app/server/prisma/schema.prisma');
if (!existsSync(schemaPath)) throw new Error('Prisma schema missing');
const schema = read(schemaPath);
const model = `model MtDungeonGoldPool {
  dungeonId     String   @id @db.VarChar(64)
  initialGold   Int
  remainingGold Int
  createdAt     DateTime @default(now()) @db.Timestamptz(3)
  updatedAt     DateTime @updatedAt @db.Timestamptz(3)
}`;
const foundModel = /\bmodel\s+MtDungeonGoldPool\s*\{/.test(schema);
if (foundModel) {
	if (!canon(schema).includes(model)) throw new Error('Prisma MtDungeonGoldPool already defined differently; manual reconciliation required.');
} else {
	if (!schema.includes('model MtDungeonRun {') || !schema.includes('model MtDungeonProgress {')) throw new Error('Missing MT run/progress schema baseline.');
	const newline = schema.includes('\r\n') ? '\r\n' : '\n';
	const desired = schema.trimEnd() + '\n\n' + model + '\n';
	stage(schemaPath, newline === '\r\n' ? desired.replace(/\n/g, '\r\n') : desired, schema);
}

const routePath = resolve(root, 'app/server/src/Dungeon/Routes/mtDungeon.routes.ts');
if (!existsSync(routePath)) throw new Error('MT routes missing');
const route = read(routePath);
if (!route.includes("error.code === 'pool-conflict'")) {
	const rx = /(if\s*\(error instanceof MtDungeonGoldError\)\s*return\s*\{\s*status:\s*)error\.code\s*===\s*'stale-run'\s*\?\s*409\s*:\s*422(\s*,\s*code:\s*error\.code\s*\}\s*;)/g;
	const matches = [...route.matchAll(rx)];
	if (matches.length !== 1) throw new Error('MT Gold error handler missing or ambiguous; no files changed.');
	const next = route.replace(rx, "$1(error.code === 'stale-run' || error.code === 'pool-conflict') ? 409 : 422$2");
	stage(routePath, next, route);
}

const sql = resolve(root, 'app/server/prisma/migrations/20261023210000_mt_dungeon_shared_gold_pool/migration.sql');
const desiredSql = read(resolve(payloadRoot, 'migration.sql'));
if (!existsSync(sql)) stage(sql, desiredSql, null, false);
else if (hash(read(sql)) !== hash(desiredSql)) throw new Error('Existing gold pool migration differs; refusing overwrite.');

console.log(`[20M] ${check ? 'Précontrôle' : 'Installation'} : ${plan.length} fichier(s) à créer/modifier.`);
for (const p of plan) console.log(`  ${p.path.slice(root.length + 1)}${p.previous === null ? ' (nouveau)' : ''}`);
if (check) {
	console.log('[20M] Précontrôle validé. Aucun fichier modifié.');
	process.exit(0);
}
// All preconditions are checked before any write. Restore-able backups for existing files.
for (const p of plan) {
	mkdirSync(dirname(p.path), { recursive: true });
	if (p.previous !== null && p.backups) {
		const backup = `${p.path}.before-step20m`;
		if (!existsSync(backup)) writeFileSync(backup, p.previous);
	}
	writeFileSync(p.path, p.next);
}
console.log('[20M] Terminé. Applique la migration Prisma, puis relance les tests et builds.');
