/**
 * Fix: automatically evacuate after total MT party wipe, plus recovery action.
 * Works against feat/mt-dungeons after step 20D. Never performs any git action.
 * All anchors preflight before writing; backups are made before replacement.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const changes = new Map();
const original = new Map();
function source(path) {
    if (!changes.has(path)) {
        const target = join(root, path);
        if (!existsSync(target)) throw new Error(`Fichier du dépôt absent : ${path}`);
        const content = readFileSync(target, 'utf8');
        original.set(path, content);
        changes.set(path, content.replace(/\r\n/g, '\n'));
    }
    return changes.get(path);
}
function replace(path, before, after) {
    const content = source(path);
    if (content.includes(after)) return;
    const first = content.indexOf(before);
    if (first === -1 || first !== content.lastIndexOf(before)) {
        throw new Error(`Ancre absente ou ambiguë dans ${path}: ${before.slice(0, 95)}`);
    }
    changes.set(path, content.slice(0, first) + after + content.slice(first + before.length));
}
function after(path, anchor, addition) { replace(path, anchor, anchor + addition); }
function before(path, anchor, addition) { replace(path, anchor, addition + anchor); }
function addFile(path) {
    const target = join(root, path);
    const patch = join(packageRoot, path);
    if (!existsSync(patch)) throw new Error(`Fichier absent de l'archive : ${path}`);
    const content = readFileSync(patch, 'utf8');
    if (existsSync(target) && readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== content)
        throw new Error(`Conflit : ${path} existe déjà avec un contenu différent`);
    changes.set(path, content);
}

const defeatImport = `import { isWipedMtDungeonParty } from './mtDungeonDefeat.service.js';\n`;
for (const file of [
    'app/server/src/Dungeon/Service/mtDungeonFight.service.ts',
    'app/server/src/Dungeon/Service/mtDungeonGuardianTrial.service.ts'
]) {
    after(file,
        `import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';\n`,
        defeatImport
    );
    const errorName = file.includes('GuardianTrial') ? 'MtDungeonGuardianTrialError' : 'MtDungeonFightError';
    before(file,
        `\t\t\t\tconst updated = await tx.mtDungeonRun.updateMany({`,
        `\t\t\t\t// The fight engine has already persisted all HP losses.\n` +
        `\t\t\t\t// A full-party wipe ends the run; resurrection is possible outside.\n` +
        `\t\t\t\tif (await isWipedMtDungeonParty(tx, identity)) {\n` +
        `\t\t\t\t\tconst removed = await tx.mtDungeonRun.deleteMany({\n` +
        `\t\t\t\t\t\twhere: {\n` +
        `\t\t\t\t\t\t\tid: attempt.runId,\n` +
        `\t\t\t\t\t\t\tuserId: identity.userId,\n` +
        `\t\t\t\t\t\t\tleaderDinozId: identity.leaderDinozId,\n` +
        `\t\t\t\t\t\t\trevision: session.revision\n` +
        `\t\t\t\t\t\t}\n` +
        `\t\t\t\t\t});\n` +
        `\t\t\t\t\tif (removed.count !== 1) throw new ${errorName}('conflict');\n` +
        `\t\t\t\t\t// FK cascade deletes the fight attempt; a replay cannot award rewards again.\n` +
        `\t\t\t\t\treturn;\n` +
        `\t\t\t\t}\n`
    );
}

const route = 'app/server/src/Dungeon/Routes/mtDungeon.routes.ts';
after(route,
    `import { getMtDungeonPendingEncounter } from '../Service/mtDungeonEncounter.service.js';\n`,
    `import { evacuateDefeatedMtDungeon, MtDungeonDefeatError } from '../Service/mtDungeonDefeat.service.js';\n`
);
after(route,
    `function handleKnownError(error: unknown): { status: number; code: string } | null {\n`,
    `\tif (error instanceof MtDungeonDefeatError)\n` +
    `\t\treturn { status: error.code === 'not-found' ? 404 : 409, code: error.code };\n`
);
before(route,
    `\t// Public-facing metadata are limited to introduction/exit strings and titles;`,
    `\t/** Allow recovery of an already-defeated party from a pre-fix dungeon session. */\n` +
    `\tapp.post('/:leaderDinozId/defeat/evacuate', { preHandler: app.authenticate }, async (req, reply) => {\n` +
    `\t\tconst params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);\n` +
    `\t\tconst body = z.object({ revision: z.number().int().nonnegative() }).strict().safeParse(req.body);\n` +
    `\t\tif (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-evacuation-request' });\n` +
    `\t\ttry {\n` +
    `\t\t\treturn reply.send(await evacuateDefeatedMtDungeon(\n` +
    `\t\t\t\t{ userId: req.user.id, leaderDinozId: params.data }, body.data.revision\n` +
    `\t\t\t));\n` +
    `\t\t} catch (error) {\n` +
    `\t\t\tconst known = handleKnownError(error);\n` +
    `\t\t\tif (known) return reply.code(known.status).send({ code: known.code });\n` +
    `\t\t\tthrow error;\n` +
    `\t\t}\n` +
    `\t});\n\n`
);

const clientService='app/client/src/services/mtDungeon.service.ts';
before(clientService,
    `\tgetSession(id: number): Promise<MtDungeonSession> {`,
    `\t/** Escape a session stranded by a pre-fix total defeat (server verifies all HP). */\n` +
    `\tevacuateDefeatedGroup(id: number, revision: number): Promise<{ evacuated: true }> {\n` +
    `\t\treturn api.post(\`/dungeon/mt/\${id}/defeat/evacuate\`, { revision });\n` +
    `\t},\n`
);

const page='app/client/src/pages/MtMagneticCavernsPage.vue';
before(page,
    `\t\t\t\t<div class="mt-test__viewport">`,
    `\t\t\t\t<section v-if="partyDefeated" class="mt-test__panel" aria-live="polite">\n` +
    `\t\t\t\t\t<p>Tous les Dinoz sont KO. Le groupe doit quitter le donjon pour pouvoir être ressuscité.</p>\n` +
    `\t\t\t\t\t<button type="button" :disabled="busy" @click="evacuateDefeated">Évacuer le groupe KO</button>\n` +
    `\t\t\t\t</section>\n\n`
);
replace(page,
    `const visualMembers = ref<{ id: number; display: string }[]>([]);`,
    `const visualMembers = ref<{ id: number; display: string; life: number }[]>([]);`
);
replace(page,
    `\t\t\t{ id: leader.id, display: leader.display },\n\t\t\t...followers.map(follower => ({ id: follower.id, display: follower.display }))`,
    `\t\t\t{ id: leader.id, display: leader.display, life: leader.life },\n\t\t\t...followers.map(follower => ({ id: follower.id, display: follower.display, life: follower.life }))`
);
before(page,
    `const cannotMove = computed(`,
    `const partyDefeated = computed(() => visualMembers.value.length > 0 && visualMembers.value.every(dinoz => dinoz.life <= 0));\n`
);
replace(page,
    `() => busy.value || loading.value || !session.value || !!session.value.pending || session.value.locked`,
    `() => partyDefeated.value || busy.value || loading.value || !session.value || !!session.value.pending || session.value.locked`
);
before(page,
    `function onKeyDown(event: KeyboardEvent): void {`,
    `function evacuateDefeated(): void {\n` +
    `\tif (!session.value || !partyDefeated.value) return;\n` +
    `\tvoid execute(async () => {\n` +
    `\t\tawait MtDungeonService.evacuateDefeatedGroup(leaderId, session.value!.revision);\n` +
    `\t\tsession.value = null;\n` +
    `\t\tview.value = null;\n` +
    `\t\tencounter.value = null;\n` +
    `\t\tguardianTrial.value = null;\n` +
    `\t\tmovementTrail.value = [];\n` +
    `\t\tawait router.replace({ name: 'DinozPage', params: { id: String(leaderId) } });\n` +
    `\t});\n` +
    `}\n`
);
for(const path of [
    'packages/core/src/models/dungeon/dungeon.defeat.ts',
    'packages/core/test/unit/dungeon/dungeon.defeat.test.ts',
    'app/server/src/Dungeon/Service/mtDungeonDefeat.service.ts'
]) addFile(path);

// No files are touched before successful preflight of every anchor.
let count = 0;
for (const [path, content] of changes) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    const before = original.get(path);
    if (before !== undefined) {
        if (before.replace(/\r\n/g, '\n') === content) continue;
        const backup = target + '.before-mt-defeat-fix';
        if (!existsSync(backup)) copyFileSync(target, backup);
    } else if (existsSync(target) && readFileSync(target, 'utf8') === content) {
        continue;
    }
    writeFileSync(target, content, 'utf8');
    count++;
}
console.log(`MT defeat evacuation fix: ${count} fichier(s) écrit(s). Aucun push GitHub.`);
