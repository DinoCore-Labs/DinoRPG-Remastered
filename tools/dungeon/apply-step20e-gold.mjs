/** Step 20E — install only on the up-to-date feat/mt-dungeons base.
 * Strict preflight of every source anchor; no partial writes on an anchor failure.
 * Deliberately never accesses git, network or external tools. Safe to re-run.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const archive = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const originals = new Map();
const planned = new Map();

function source(path) {
  if (!planned.has(path)) {
    const file = join(root, path);
    if (!existsSync(file)) throw new Error(`Fichier manquant : ${path}`);
    const body = readFileSync(file, 'utf8');
    originals.set(path, body);
    planned.set(path, body.replace(/\r\n/g, '\n'));
  }
  return planned.get(path);
}
function replaceOnce(path, oldText, newText) {
  const body = source(path);
  if (body.includes(newText)) return;
  const start = body.indexOf(oldText);
  if (start < 0 || body.indexOf(oldText, start + 1) !== -1)
    throw new Error(`Ancre manquante / ambiguë dans ${path} : ${JSON.stringify(oldText.slice(0, 85))}`);
  planned.set(path, body.slice(0, start) + newText + body.slice(start + oldText.length));
}
function after(path, anchor, addition) { replaceOnce(path, anchor, anchor + addition); }
function before(path, anchor, addition) { replaceOnce(path, anchor, addition + anchor); }
function add(path) {
  const src = join(archive, path);
  if (!existsSync(src)) throw new Error(`Fichier manquant dans l'archive : ${path}`);
  const expected = readFileSync(src, 'utf8');
  const dst = join(root, path);
  if (existsSync(dst) && readFileSync(dst, 'utf8').replace(/\r\n/g, '\n') !== expected)
    throw new Error(`Conflit, le fichier existe avec d'autres données : ${path}`);
  planned.set(path, expected);
}

for (const file of [
  'packages/core/src/models/dungeon/dungeon.gold.ts',
  'packages/core/test/unit/dungeon/dungeon.gold.test.ts',
  'app/server/src/Dungeon/Service/mtDungeonGold.service.ts',
  'app/server/test/unit/dungeon/mtDungeonGold.service.test.ts'
]) add(file);

const sessionCore = 'packages/core/src/models/dungeon/dungeon.session.ts';
replaceOnce(sessionCore,
  `| { ok: true; session: MtDungeonSession; accepted: number; pending: MtPendingInteraction | null };`,
  `| { ok: true; session: MtDungeonSession; accepted: number; pending: MtPendingInteraction | null; goldAwarded?: number; walletGold?: number };`);

const session = 'app/server/src/Dungeon/Service/mtDungeonSession.service.ts';
before(session,
  `\t/** Transactional IHeal settlement; must commit HP and session together. */`,
  `\t/** Transactional IGold pickup; must commit wallet + session in one transaction. */\n\tsettleGold?(\n\t\tidentity: MtSessionIdentity,\n\t\toldRevision: number,\n\t\tpending: MtDungeonSession,\n\t\tcfg: MtSessionConfiguration\n\t): Promise<{ session: MtDungeonSession; goldAwarded: number; walletGold: number }>;\n`);
// Place automatic gold handling BEFORE the automatic heal and ordinary CAS.
before(session,
  `\t\tif (result.session.pending?.kind === 'heal') {`,
  `\t\tif (result.session.pending?.kind === 'gold') {\n\t\t\tif (!deps.settleGold) throw new MtDungeonSessionError('invalid-run');\n\t\t\tconst award = await deps.settleGold(identity, run.revision, result.session, cfg);\n\t\t\treturn { ok: true, accepted: result.accepted, session: award.session, pending: null,\n\t\t\t\tgoldAwarded: award.goldAwarded, walletGold: award.walletGold };\n\t\t}\n`);

const runtime = 'app/server/src/Dungeon/Service/mtDungeonRuntime.service.ts';
after(runtime,
  `import { settleMtDungeonHealArrival } from './mtDungeonHeal.service.js';\n`,
  `import { settleMtDungeonGoldArrival } from './mtDungeonGold.service.js';\n`);
after(runtime,
  `\t\tsettleHeal: settleMtDungeonHealArrival,\n`,
  `\t\tsettleGold: settleMtDungeonGoldArrival,\n`);

const routes = 'app/server/src/Dungeon/Routes/mtDungeon.routes.ts';
after(routes,
  `import { getMtDungeonPendingEncounter } from '../Service/mtDungeonEncounter.service.js';\n`,
  `import { MtDungeonGoldError } from '../Service/mtDungeonGold.service.js';\n`);
after(routes,
  `function handleKnownError(error: unknown): { status: number; code: string } | null {\n`,
  `\tif (error instanceof MtDungeonGoldError)\n\t\treturn { status: error.code === 'stale-run' ? 409 : 422, code: error.code };\n`);

const clientService = 'app/client/src/services/mtDungeon.service.ts';
after(clientService,
  `\t\tpending: MtDungeonSession['pending'];\n`,
  `\t\tgoldAwarded?: number;\n\t\twalletGold?: number;\n`);

const clientPage = 'app/client/src/pages/MtMagneticCavernsPage.vue';
after(clientPage,
  `import { localStore } from '../store/localStore';\n`,
  `import { userStore } from '../store/userStore.js';\n`);
replaceOnce(clientPage,
  `\t\tawait afterMutation(result.session);\n\t});\n}`, 
  `\t\tawait afterMutation(result.session);\n\t\tif (typeof result.goldAwarded === 'number') {\n\t\t\tif (typeof result.walletGold === 'number') userStore().setGold(result.walletGold);\n\t\t\tnotice.value = result.goldAwarded > 0\n\t\t\t\t? \`Trésor récupéré : +\${result.goldAwarded} or.\`\n\t\t\t\t: 'Trésor récupéré (valeur MT brute : 0).';\n\t\t}\n\t});\n}`);
replaceOnce(clientPage,
  `Cette interaction n'est pas encore résoluble : aucun combat, soin, or ou passage extérieur n'est simulé. Le`,
  `Cette interaction n'est pas encore résoluble dans cette version. Le`);

// Preflight succeeded, now write changes. Never delete or overwrite custom files.
let written = 0;
for (const [path, next] of planned) {
  const dest = join(root, path);
  const beforeText = originals.get(path);
  if (beforeText !== undefined && beforeText.replace(/\r\n/g, '\n') === next) continue;
  if (beforeText === undefined && existsSync(dest) && readFileSync(dest, 'utf8').replace(/\r\n/g, '\n') === next) continue;
  mkdirSync(dirname(dest), { recursive: true });
  if (beforeText !== undefined) {
    const backup = `${dest}.before-step20e`;
    if (!existsSync(backup)) copyFileSync(dest, backup);
  }
  writeFileSync(dest, next, 'utf8');
  written++;
}
console.log(`Étape 20E : ${written} fichier(s) installé(s). Aucun git commit/push.`);
