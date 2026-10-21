/** Step 20H — atomic, rerunnable installer; checks all anchors before writing. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const staged = new Map();
function edit(path, transform) {
	const filename = resolve(root, path);
	if (!existsSync(filename)) throw new Error(`${path}: file missing (extract the ZIP at repository root)`);
	const old = staged.get(filename) ?? readFileSync(filename, 'utf8');
	const fresh = transform(old, path);
	staged.set(filename, fresh);
}
function replaceOnce(value, source, target, file) {
	const count = value.split(source).length - 1;
	if (count === 1) return value.replace(source, target);
	if (count === 0 && value.includes(target)) return value; // rerun
	throw new Error(`${file}: expected one source anchor, found ${count}: ${source.slice(0, 110)}`);
}
function insertOnce(value, anchor, inserted, sentinel, file) {
	if (value.includes(sentinel)) return value;
	const count = value.split(anchor).length - 1;
	if (count !== 1) throw new Error(`${file}: missing/ambiguous insertion anchor ${anchor.slice(0, 100)}`);
	return value.replace(anchor, inserted + anchor);
}

edit('app/server/src/Dungeon/Routes/mtDungeon.routes.ts', (source, file) => {
	let s = insertOnce(
		source,
		"import { getMtDungeonCurrentView } from '../Service/mtDungeonView.service.js';",
		"import { completeMtDungeonWorldExit, MtDungeonWorldExitError, MtDungeonWorldExitSettlementError } from '../Service/mtDungeonWorldExit.service.js';\n",
		"import { completeMtDungeonWorldExit,",
		file
	);
	s = insertOnce(s, '\tif (error instanceof MtDungeonDefeatError)',
		"\tif (error instanceof MtDungeonWorldExitError) return { status: 409, code: error.code };\n" +
		"\tif (error instanceof MtDungeonWorldExitSettlementError)\n" +
		"\t\treturn { status: error.code === 'not-found' ? 404 : error.code === 'unknown-place' ? 422 : 409, code: error.code };\n",
		'if (error instanceof MtDungeonWorldExitError)', file);
	const route = `\t/** Step 20H: canonical outside exit, with atomic progress and group relocation. */
\tapp.post('/:leaderDinozId/world/exit', { preHandler: app.authenticate }, async (req, reply) => {
\t\tconst params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
\t\tconst body = z.object({ revision: z.number().int().nonnegative(), lang: z.string().max(12).optional() }).strict().safeParse(req.body);
\t\tif (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-world-exit-request' });
\t\ttry {
\t\t\treturn reply.send(await completeMtDungeonWorldExit(
\t\t\t\t{ userId: req.user.id, leaderDinozId: params.data }, body.data.revision, body.data.lang
\t\t\t));
\t\t} catch (error) {
\t\t\tconst known = handleKnownError(error);
\t\t\tif (known) return reply.code(known.status).send({ code: known.code });
\t\t\tthrow error;
\t\t}
\t});

`;
	s = insertOnce(s, "\tapp.post('/:leaderDinozId/transition'", route, "app.post('/:leaderDinozId/world/exit'", file);
	return s;
});

edit('app/client/src/services/mtDungeon.service.ts', (source, file) => {
	let s = insertOnce(source, 'export const MtDungeonService = {',
		`export interface MtDungeonWorldExitResult {
\tkind: 'return' | 'complete';
\tplaceId: number;
\ttext: string;
\tlanguageUsed: string;
}

`, 'export interface MtDungeonWorldExitResult', file);
	s = insertOnce(s, '\ttransition(id: number, revision: number',
		`\tworldExit(id: number, revision: number, language: string): Promise<MtDungeonWorldExitResult> {
\t\treturn api.post(\`/dungeon/mt/\${id}/world/exit\`, { revision, lang: language });
\t},
`, 'worldExit(id: number, revision: number', file);
	return s;
});

edit('app/client/src/pages/MtMagneticCavernsPage.vue', (source, file) => {
	let s = replaceOnce(source,
		'<section v-if="!session && !loading" class="mt-test__panel">',
		'<section v-if="!session && !loading && !exitOutcome" class="mt-test__panel">', file);
	s = insertOnce(s, '\t\t<template v-if="session">',
		`\t\t<section v-if="exitOutcome" class="mt-test__panel" aria-live="polite">
\t\t\t<h3>{{ exitOutcome.kind === 'complete' ? 'Donjon terminé' : 'Retour à la surface' }}</h3>
\t\t\t<p>{{ exitOutcome.text }}</p>
\t\t\t<p class="mt-test__caption">Votre progression a été sauvegardée. Aucune récompense de fin supplémentaire n'est attribuée.</p>
\t\t\t<RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">Retour à la fiche du Dinoz</RouterLink>
\t\t</section>

`, '<section v-if="exitOutcome"', file);
	s = replaceOnce(s,
		`v-if="session.pending.kind === 'boundary-start' && stage === 0 && devCapabilities?.surfaceExit"`,
		`v-if="session.pending.kind === 'boundary-start' && stage === 0"`, file);
	s = replaceOnce(s, '@click="leaveToSurface"', '@click="exitDungeon"', file);
	s = replaceOnce(s, 'Retour à la surface (terminer la session de test)', 'Quitter le donjon (retour à la surface)', file);
	const afterForward = `\t\t\t\t\t\tPasser à la carte suivante
\t\t\t\t\t</button>`;
	const withFinal = `${afterForward}
\t\t\t\t\t<button
\t\t\t\t\t\tv-if="session.pending.kind === 'boundary-exit' && stage === 3"
\t\t\t\t\t\ttype="button"
\t\t\t\t\t\t:disabled="busy"
\t\t\t\t\t\t@click="exitDungeon"
\t\t\t\t\t>
\t\t\t\t\t\tSortir définitivement du donjon
\t\t\t\t\t</button>`;
	if (!s.includes('Sortir définitivement du donjon')) s = replaceOnce(s, afterForward, withFinal, file);
	// Update named type import without assuming a fixed order of other imports.
	s = replaceOnce(s, '\ttype MtGuardianTrialPreview\n} from', '\ttype MtGuardianTrialPreview,\n\ttype MtDungeonWorldExitResult\n} from', file);
	s = insertOnce(s, 'const errorMessage = ref(', 'const exitOutcome = ref<MtDungeonWorldExitResult | null>(null);\n', 'const exitOutcome = ref<', file);
	s = replaceOnce(s, "if (pending.kind === 'boundary-exit') return stage.value < 3;", "if (pending.kind === 'boundary-exit') return true;", file);
	s = replaceOnce(s,
		"if (pending.kind === 'boundary-start')\n\t\treturn stage.value > 0 || (stage.value === 0 && !!devCapabilities.value?.surfaceExit);",
		"if (pending.kind === 'boundary-start') return true;", file);
	if (!s.includes('function exitDungeon(): void {')) {
		const beginning = 'function leaveToSurface(): void {';
		const ending = 'function evacuateDefeated(): void {';
		const start = s.indexOf(beginning), end = s.indexOf(ending, start + beginning.length);
		if (start < 0 || end < 0 || s.indexOf(beginning, start + 1) !== -1) throw new Error(`${file}: cannot locate old dev exit function`);
		s = s.slice(0, start) + `function exitDungeon(): void {
\tconst current = session.value;
\tconst pendingKind = current?.pending?.kind;
\tif (!current || (pendingKind !== 'boundary-start' && pendingKind !== 'boundary-exit')) return;
\tif (!(current.mapId === 'stepp_0' && pendingKind === 'boundary-start') &&
\t\t!(current.mapId === 'stepp_3' && pendingKind === 'boundary-exit')) return;
\tvoid execute(async () => {
\t\tconst outcome = await MtDungeonService.worldExit(leaderId, current.revision, language.value);
\t\tsession.value = null;
\t\tview.value = null;
\t\tencounter.value = null;
\t\tguardianTrial.value = null;
\t\tmovementTrail.value = [];
\t\texitOutcome.value = outcome;
\t\tjournalEntries.value = [];
\t});
}
` + s.slice(end);
	}
	return s;
});

// Write only after all modifications have passed their checks.
for (const [file, content] of staged) {
	if (readFileSync(file, 'utf8') !== content) {
		writeFileSync(file, content, 'utf8');
		console.log('Updated:', file.replace(root + '/', ''));
	}
}
console.log('20H world exit integration complete.');
