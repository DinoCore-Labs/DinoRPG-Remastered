/** Step 20G. Safe, repeatable installer: edits only the route, service and page. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const edits = new Map();
function edit(file) {
	if (!edits.has(file)) {
		const location = path.join(root, file);
		if (!fs.existsSync(location)) throw new Error(`Fichier absent : ${file}`);
		edits.set(file, fs.readFileSync(location, 'utf8'));
	}
	return edits.get(file);
}
function replaceOne(file, before, after, marker) {
	const source = edit(file);
	if (source.includes(marker)) return;
	const index = source.indexOf(before);
	if (index < 0 || source.indexOf(before, index + before.length) >= 0)
		throw new Error(`${file}: ancrage manquant ou ambigu : ${before.slice(0, 95)}`);
	edits.set(file, source.slice(0, index) + after + source.slice(index + before.length));
}
const routes = 'app/server/src/Dungeon/Routes/mtDungeon.routes.ts';
replaceOne(routes,
	"import { getMtDungeonPendingEncounter } from '../Service/mtDungeonEncounter.service.js';",
	"import { getMtDungeonPendingEncounter } from '../Service/mtDungeonEncounter.service.js';\nimport { getMtDungeonJournal } from '../Service/mtDungeonJournal.service.js';",
	"import { getMtDungeonJournal } from '../Service/mtDungeonJournal.service.js';");
replaceOne(routes,
	'\t/** Only inspect the server-owned encounter the leader has just triggered. */',
	`\t/** Step 20G: only completed original scenarios; no hidden text or replayable rewards. */
\tapp.get('/:leaderDinozId/journal', { preHandler: app.authenticate }, async (req, reply) => {
\t\tconst params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
\t\tconst query = z.object({ lang: z.string().max(12).optional() }).strict().safeParse(req.query);
\t\tif (!params.success || !query.success) return reply.code(400).send({ code: 'invalid-journal-request' });
\t\ttry {
\t\t\treturn reply.send(await getMtDungeonJournal(
\t\t\t\t{ userId: req.user.id, leaderDinozId: params.data }, query.data.lang
\t\t\t));
\t\t} catch (error) {
\t\t\tconst known = handleKnownError(error);
\t\t\tif (known) return reply.code(known.status).send({ code: known.code });
\t\t\tthrow error;
\t\t}
\t});

\t/** Only inspect the server-owned encounter the leader has just triggered. */`,
	"app.get('/:leaderDinozId/journal'");

const api = 'app/client/src/services/mtDungeon.service.ts';
replaceOne(api,
	'export const MtDungeonService = {',
	`export interface MtDungeonJournalEntry {
\tmapId: string;
\tstage: number;
\tlevel: number;
\tscenarioIndex: number;
\ticon: string | null;
\ttext: string;
}

export interface MtDungeonJournal {
\tlanguageUsed: string;
\tentries: MtDungeonJournalEntry[];
}

export const MtDungeonService = {`,
	'export interface MtDungeonJournalEntry {');
replaceOne(api,
	'\tgetGuardianTrialPreview(id: number): Promise<MtGuardianTrialPreview> {',
	`\tgetJournal(id: number, language: string): Promise<MtDungeonJournal> {
\t\treturn api.get(\`/dungeon/mt/\${id}/journal\`, { params: { lang: language }, silent: true });
\t},
\tgetGuardianTrialPreview(id: number): Promise<MtGuardianTrialPreview> {`,
	'getJournal(id: number, language: string): Promise<MtDungeonJournal>');

const page = 'app/client/src/pages/MtMagneticCavernsPage.vue';
replaceOne(page,
	'\t\t\t<details v-if="view" class="mt-test__details">',
	`\t\t\t<details v-if="view" class="mt-test__details mt-test__journal">
\t\t\t\t<summary>Journal et coffres découverts ({{ journalEntries.length }})</summary>
\t\t\t\t<p v-if="journalError" role="status">{{ journalError }}</p>
\t\t\t\t<p v-else-if="journalEntries.length === 0">Aucun texte découvert pour le moment.</p>
\t\t\t\t<ol v-else>
\t\t\t\t\t<li v-for="entry in journalEntries" :key="\`\${entry.mapId}:\${entry.level}:\${entry.scenarioIndex}\`">
\t\t\t\t\t\t<strong>Carte {{ entry.stage + 1 }} — niveau {{ entry.level + 1 }}</strong>
\t\t\t\t\t\t<p>{{ entry.text }}</p>
\t\t\t\t\t</li>
\t\t\t\t</ol>
\t\t\t\t<button type="button" :disabled="busy" @click="loadJournal">Actualiser les découvertes</button>
\t\t\t</details>

\t\t\t<details v-if="view" class="mt-test__details">`,
	'Journal et coffres découverts ({{ journalEntries.length }})');
replaceOne(page,
	'\ttype MtDungeonCurrentView,',
	'\ttype MtDungeonCurrentView,\n\ttype MtDungeonJournalEntry,',
	'type MtDungeonJournalEntry,');
replaceOne(page,
	"const errorMessage = ref('');",
	"const journalEntries = ref<MtDungeonJournalEntry[]>([]);\nconst journalError = ref('');\nconst errorMessage = ref('');",
	'const journalEntries = ref<MtDungeonJournalEntry[]>([]);');
replaceOne(page,
	'async function refresh(): Promise<void> {',
	`/** Read-only: an inaccessible journal must never block dungeon movement. */
async function loadJournal(): Promise<void> {
\ttry {
\t\tconst result = await MtDungeonService.getJournal(leaderId, language.value);
\t\tjournalEntries.value = result.entries;
\t\tjournalError.value = '';
\t} catch {
\t\tjournalError.value = 'Journal momentanément indisponible.';
\t}
}

async function refresh(): Promise<void> {`,
	'async function loadJournal(): Promise<void> {');
replaceOne(page,
	'\t\tawait loadGuardianTrial(current);',
	'\t\tawait loadGuardianTrial(current);\n\t\tif (latestView) await loadJournal();',
	'if (latestView) await loadJournal();');
replaceOne(page,
	'\t\t\tguardianTrial.value = null;\n\t\t} else errorMessage.value = formatError(error);',
	'\t\t\tguardianTrial.value = null;\n\t\t\tjournalEntries.value = [];\n\t\t\tjournalError.value = \'\';\n\t\t} else errorMessage.value = formatError(error);',
	'journalEntries.value = [];\n\t\t\tjournalError.value');
replaceOne(page,
	'\tsession.value = next;\n\tview.value = latestView;',
	`\tconst journalChanged =
\t\t!session.value || session.value.mapId !== next.mapId ||
\t\tJSON.stringify(session.value.flags) !== JSON.stringify(next.flags);
\tsession.value = next;
\tview.value = latestView;`,
	'const journalChanged =');
replaceOne(page,
	'\tawait loadGuardianTrial(next);',
	'\tawait loadGuardianTrial(next);\n\tif (journalChanged) await loadJournal();',
	'if (journalChanged) await loadJournal();');
replaceOne(page,
	'</style>',
	`.mt-test__journal {
\twidth: min(420px, 100%);
\tmax-width: 420px;
\tpadding: 0.55rem 0.7rem;
\tborder: 1px solid #a38b6c;
\tbackground: #efdfbd;
}
.mt-test__journal summary { cursor: pointer; font-weight: 700; }
.mt-test__journal ol { padding-left: 1.1rem; }
.mt-test__journal li { margin: 0.65rem 0; }
.mt-test__journal li p { margin: 0.25rem 0; white-space: pre-wrap; overflow-wrap: anywhere; }
</style>`,
	'.mt-test__journal summary {');

// All replacements are first validated in memory: never leave half-applied changes.
let changed = 0;
for (const [file, output] of edits) {
	const location = path.join(root, file);
	if (fs.readFileSync(location, 'utf8') === output) continue;
	fs.writeFileSync(location, output, 'utf8');
	changed++;
	console.log(`20G: ${file}`);
}
console.log(`Étape 20G installée : ${changed} fichier(s) modifié(s).`);
