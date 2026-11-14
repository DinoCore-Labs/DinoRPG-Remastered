import { access, mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// DinoRPG Remastered — panneau admin > Clan > Actions collectives.
// Usage: node apply-admin-clan-actions.mjs . --check
//        node apply-admin-clan-actions.mjs .
// Aucune opération Git/GitHub et aucune connexion à la base.
const args = process.argv.slice(2);
const root = resolve(args.find(arg => !arg.startsWith('--')) ?? '.');
const check = args.includes('--check');
const packageRoot = dirname(fileURLToPath(import.meta.url));
const edits = new Map();
const testFile = 'app/server/test/integration/admin-clan-actions.test.ts';

async function exists(path) {
  try { await access(join(root, path)); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
function replaceOne(contents, needle, replacement, path) {
  const n = contents.split(needle).length - 1;
  if (n !== 1) throw new Error(`${path}: ancre absente ou ambiguë (${n}) : ${needle.slice(0, 90)}`);
  return contents.replace(needle, replacement);
}
async function edit(path, change) {
  const original = await readFile(join(root, path), 'utf8');
  const normalized = original.replace(/\r\n?/g, '\n');
  const updated = change(normalized);
  if (updated === normalized) throw new Error(`${path}: aucun changement préparé`);
  edits.set(path, original.includes('\r\n') ? updated.replace(/\n/g, '\r\n') : updated);
}

for (const required of [
  'packages/core/src/models/clan/clanActions.ts',
  'app/server/src/Clan/Service/clanAction.service.ts',
  'app/server/prisma/schema.prisma',
  'app/server/src/Admin/Service/adminClanHandler.service.ts',
  'app/server/src/Admin/Routes/admin.routes.ts',
  'app/server/src/Admin/Schema/adminClan.schema.ts',
  'app/client/src/services/adminClan.service.ts',
  'app/client/src/pages/Admin/AdminClanPage.vue'
]) {
  if (!(await exists(required))) throw new Error(`Fichier requis introuvable : ${required}`);
}
const schema = await readFile(join(root, 'app/server/prisma/schema.prisma'), 'utf8');
if (!schema.includes('model ClanActionProgress {')) {
  throw new Error('Étape 1 de la clinique clanique manquante : modèle ClanActionProgress absent.');
}
if (await exists(testFile)) throw new Error(`Test déjà présent, étape potentiellement appliquée : ${testFile}`);

const adminSchema = 'app/server/src/Admin/Schema/adminClan.schema.ts';
await edit(adminSchema, source => {
  if (source.includes('adminClanActionParamsSchema')) throw new Error('Actions admin déjà ajoutées (schema)');
  return source.trimEnd() + `\n\n// Modification des compteurs collectifs réservée à l'administration.\nexport const adminClanActionParamsSchema = adminClanParamsSchema.extend({\n\tactionKey: z.string().min(1).max(64)\n});\n\nexport const updateAdminClanActionProgressSchema = z.object({\n\tprogress: z.number().int().min(0)\n});\n`;
});

const handler = 'app/server/src/Admin/Service/adminClanHandler.service.ts';
await edit(handler, source => {
  if (source.includes('updateAdminClanActionProgressHandler')) throw new Error('Actions admin déjà ajoutées (handler)');
  source = replaceOne(source,
    "import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';",
    "import { clanActionDefinitions, getClanActionDefinition } from '@dinorpg/core/models/clan/clanActions.js';\nimport { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';", handler);
  source = replaceOne(source,
    '\tadminClanPageParamsSchema,\n\tadminClanParamsSchema,',
    '\tadminClanActionParamsSchema,\n\tadminClanPageParamsSchema,\n\tadminClanParamsSchema,', handler);
  source = replaceOne(source,
    '\tupdateClanTreasureSchema\n}',
    '\tupdateClanTreasureSchema,\n\tupdateAdminClanActionProgressSchema\n}', handler);
  source = replaceOne(source,
    "\tif (!clan) return reply.status(404).send({ message: 'Clan not found' });\n\treturn reply.send(clan);\n}",
    `\tif (!clan) return reply.status(404).send({ message: 'Clan not found' });\n\n\tconst progressRows = await prisma.clanActionProgress.findMany({\n\t\twhere: { clanId: clan.id },\n\t\tselect: { actionKey: true, progress: true, completedAt: true }\n\t});\n\tconst byKey = new Map(progressRows.map(row => [row.actionKey, row]));\n\tconst actions = Object.values(clanActionDefinitions).map(definition => {\n\t\tconst current = byKey.get(definition.key);\n\t\treturn {\n\t\t\tactionKey: definition.key,\n\t\t\tprogress: current?.progress ?? 0,\n\t\t\ttotal: definition.requiredActions,\n\t\t\tcompletedAt: current?.completedAt ?? null\n\t\t};\n\t});\n\treturn reply.send({ ...clan, actions });\n}`, handler);
  const newHandler = `/**\n * Saisie manuelle de la progression d'une action de clan.\n * Utilise le même advisory lock que contributeToClanAction : pas de perte de mise\n * à jour lorsqu'un joueur contribue pendant qu'un administrateur intervient.\n */\nexport async function updateAdminClanActionProgressHandler(request: FastifyRequest, reply: FastifyReply) {\n\tconst params = adminClanActionParamsSchema.safeParse(request.params);\n\tconst body = updateAdminClanActionProgressSchema.safeParse(request.body);\n\tif (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });\n\n\tconst { id: clanId, actionKey } = params.data;\n\tconst definition = getClanActionDefinition(actionKey);\n\tif (!definition) return reply.status(404).send({ message: 'Unknown clan action' });\n\tif (body.data.progress > definition.requiredActions) {\n\t\treturn reply.status(400).send({ message: 'Progress exceeds required actions' });\n\t}\n\n\tconst updated = await prisma.$transaction(async tx => {\n\t\tawait tx.$executeRaw\u0060\n\t\t\tSELECT pg_advisory_xact_lock(hashtextextended(\u0024{\u0060clan-action:\u0024{clanId}:\u0024{actionKey}\u0060}, 0::bigint))\n\t\t\u0060;\n\t\tconst clan = await tx.clan.findUnique({ where: { id: clanId }, select: { id: true } });\n\t\tif (!clan) return null;\n\n\t\tconst where = { clanId_actionKey: { clanId, actionKey } };\n\t\tconst current = await tx.clanActionProgress.findUnique({ where });\n\t\tconst progress = body.data.progress;\n\t\t// Complétion liée à la progression, comme les contributions normales.\n\t\t// Une valeur inférieure au seuil rouvre l'objectif.\n\t\tconst completedAt = progress === definition.requiredActions\n\t\t\t? (current?.completedAt ?? new Date())\n\t\t\t: null;\n\t\tawait tx.clanActionProgress.upsert({\n\t\t\twhere,\n\t\t\tcreate: { clanId, actionKey, progress, completedAt },\n\t\t\tupdate: { progress, completedAt }\n\t\t});\n\t\treturn {\n\t\t\tclanId, actionKey, progress, total: definition.requiredActions, completedAt,\n\t\t\tpreviousProgress: current?.progress ?? 0\n\t\t};\n\t}, { maxWait: 5_000, timeout: 30_000 });\n\n\tif (!updated) return reply.status(404).send({ message: 'Clan not found' });\n\tawait logAdminClanAction(request, clanId, {\n\t\taction: 'UPDATE_CLAN_ACTION_PROGRESS',\n\t\tactionKey,\n\t\tpreviousProgress: updated.previousProgress,\n\t\tprogress: updated.progress\n\t});\n\treturn reply.send({\n\t\tclanId: updated.clanId,\n\t\tactionKey: updated.actionKey,\n\t\tprogress: updated.progress,\n\t\ttotal: updated.total,\n\t\tcompletedAt: updated.completedAt\n\t});\n}\n\n`;
  return replaceOne(source, 'export async function updateAdminClanNameHandler(',
    newHandler + 'export async function updateAdminClanNameHandler(', handler);
});

const routes = 'app/server/src/Admin/Routes/admin.routes.ts';
await edit(routes, source => {
  if (source.includes("'/clan/:id/actions/:actionKey'")) throw new Error('Actions admin déjà ajoutées (routes)');
  source = replaceOne(source,
    '\tupdateAdminClanIngredientHandler,\n',
    '\tupdateAdminClanActionProgressHandler,\n\tupdateAdminClanIngredientHandler,\n', routes);
  const anchor = `\tapp.get(\n\t\t'/clan/:id',\n\t\t{ preHandler: [app.authenticate, app.moderator], schema: { tags: ['Admin'] } },\n\t\tgetAdminClanHandler\n\t);`;
  return replaceOne(source, anchor, anchor + `\n\tapp.patch(\n\t\t'/clan/:id/actions/:actionKey',\n\t\t{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },\n\t\tupdateAdminClanActionProgressHandler\n\t);`, routes);
});

const service = 'app/client/src/services/adminClan.service.ts';
await edit(service, source => {
  if (source.includes('AdminClanAction')) throw new Error('Actions admin déjà ajoutées (service client)');
  source = replaceOne(source,
    'export interface AdminClan {',
    `export interface AdminClanAction {\n\tactionKey: string;\n\tprogress: number;\n\ttotal: number;\n\tcompletedAt: string | null;\n}\n\nexport interface AdminClan {`, service);
  source = replaceOne(source,
    '\tpages: AdminClanPage[];',
    '\tpages: AdminClanPage[];\n\tactions: AdminClanAction[];', service);
  source = replaceOne(source,
    '\tstatic async clearPage(id: number, pageId: number): Promise<void> {',
    `\tstatic async updateActionProgress(id: number, actionKey: string, progress: number): Promise<AdminClanAction> {\n\t\treturn await api.patch<AdminClanAction>(\u0060/admin/clan/\u0024{id}/actions/\u0024{encodeURIComponent(actionKey)}\u0060, { progress });\n\t}\n\n\tstatic async clearPage(id: number, pageId: number): Promise<void> {`, service);
  return source;
});

const page = 'app/client/src/pages/Admin/AdminClanPage.vue';
await edit(page, source => {
  if (source.includes('saveActionProgress(')) throw new Error('Actions admin déjà ajoutées (Vue)');
  const ui = `\n\t\t\t<div class="card" v-if="uStore.isAdmin">\n\t\t\t\t<div class="card-container">\n\t\t\t\t\t<h3>Actions de clan</h3>\n\t\t\t\t\t<p class="small-info">Modifie les actions effectuées. Atteindre le seuil termine l'objectif ; une valeur inférieure le rend incomplet. Les récompenses déjà obtenues ne sont pas annulées.</p>\n\t\t\t\t\t<div class="table-responsive">\n\t\t\t\t\t\t<table class="members-table">\n\t\t\t\t\t\t\t<thead><tr><th>Action</th><th>Progression</th><th>État</th><th>Modification</th></tr></thead>\n\t\t\t\t\t\t\t<tbody>\n\t\t\t\t\t\t\t\t<tr v-for="action in clan.actions" :key="action.actionKey">\n\t\t\t\t\t\t\t\t\t<td>{{ clanActionNames[action.actionKey] ?? action.actionKey }} <small>({{ action.actionKey }})</small></td>\n\t\t\t\t\t\t\t\t\t<td>{{ action.progress }} / {{ action.total }}</td>\n\t\t\t\t\t\t\t\t\t<td>{{ action.completedAt ? 'Terminée' : 'En cours' }}</td>\n\t\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t\t<div class="field-group clan-action-edit">\n\t\t\t\t\t\t\t\t\t\t\t<input v-model.number="editedActionProgress[action.actionKey]" type="number" min="0" :max="action.total" step="1" :aria-label="'Progression ' + action.actionKey" />\n\t\t\t\t\t\t\t\t\t\t\t<DZButton size="small" :disabled="savingActionKey !== null" @click="saveActionProgress(action)">Sauvegarder</DZButton>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t</tbody>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n`;
  source = replaceOne(source,
    '\t\t\t<div class="card">\n\t\t\t\t<div class="card-container">\n\t\t\t\t\t<h3>Pages du Clan</h3>',
    ui + '\n\t\t\t<div class="card">\n\t\t\t\t<div class="card-container">\n\t\t\t\t\t<h3>Pages du Clan</h3>', page);
  source = replaceOne(source,
    "import { AdminClanService, type AdminClan } from '../../services/adminClan.service';",
    "import { AdminClanService, type AdminClan, type AdminClanAction } from '../../services/adminClan.service';", page);
  source = replaceOne(source,
    "const editTreasure = ref(0);",
    `const editTreasure = ref(0);\nconst editedActionProgress = ref<Record<string, number>>({});\nconst savingActionKey = ref<string | null>(null);\nconst clanActionNames: Record<string, string> = {\n\thopita: 'Clinique clanique',\n\ttour: 'Tour de Karinbao',\n\tpompe: 'Pompe des Steppes',\n\tlabora: 'Laboratoire'\n};`, page);
  source = replaceOne(source,
    '\t\teditTreasure.value = data.treasureValue;',
    `\t\teditTreasure.value = data.treasureValue;\n\t\teditedActionProgress.value = Object.fromEntries(data.actions.map(action => [action.actionKey, action.progress]));`, page);
  const actionMethod = `async function saveActionProgress(action: AdminClanAction) {\n\tif (!clan.value || savingActionKey.value !== null) return;\n\tconst progress = editedActionProgress.value[action.actionKey];\n\tif (!Number.isSafeInteger(progress) || progress < 0 || progress > action.total) {\n\t\tinstance?.proxy?.$toast?.error(\u0060La progression doit être comprise entre 0 et \u0024{action.total}.\u0060);\n\t\treturn;\n\t}\n\tif (progress === action.progress) return;\n\tconst confirmed = await instance?.proxy?.$confirm({\n\t\theader: 'Confirmer la modification',\n\t\tmessage: \u0060Définir la progression de \u0024{clanActionNames[action.actionKey] ?? action.actionKey} à \u0024{progress} / \u0024{action.total} ?\u0060\n\t});\n\tif (!confirmed) return;\n\tsavingActionKey.value = action.actionKey;\n\ttry {\n\t\tawait AdminClanService.updateActionProgress(clan.value.id, action.actionKey, progress);\n\t\tawait loadClan(clan.value.id);\n\t\tinstance?.proxy?.$toast?.success('Progression du clan mise à jour');\n\t} catch (e: any) {\n\t\tinstance?.proxy?.$toast?.error(e.response?.data?.message || 'Erreur');\n\t} finally {\n\t\tsavingActionKey.value = null;\n\t}\n}\n\n`;
  source = replaceOne(source, 'async function saveName() {', actionMethod + 'async function saveName() {', page);
  source = replaceOne(source, '.small-info {', `.clan-action-edit {\n\tmargin-bottom: 0;\n\tinput { width: 85px; }\n}\n.small-info {`, page);
  return source;
});

// Tout est validé avant la première écriture. --check ne modifie rien.
console.log(`\n${check ? 'Validation' : 'Installation'} de l'édition des actions claniques :`);
for (const path of edits.keys()) console.log('~', path);
console.log('+', testFile);
if (check) { console.log('\nOK — aucune écriture (--check).'); process.exit(0); }
for (const [path, contents] of edits) await writeFile(join(root, path), contents, 'utf8');
await mkdir(dirname(join(root, testFile)), { recursive: true });
await copyFile(join(packageRoot, 'files', testFile), join(root, testFile));
console.log('\nTerminé — aucune modification de la base Prisma nécessaire.');
