#!/usr/bin/env node
/**
 * Step 20O: original MT narrative UI and Dinoz dungeon actions.
 * Source baseline: DinoCore-Labs/DinoRPG-Remastered feat/mt-dungeons @ 91cab18e58e2.
 * Safe by default: all anchors are checked before writing any file.
 * Usage: node tools/dungeon/apply-step20o-dungeon-ui.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';

const dryRun = process.argv.includes('--check');
if (process.argv.some((v, i) => i > 1 && v !== '--check')) throw new Error('Usage: apply-step20o-dungeon-ui.mjs [--check]');
const root = process.cwd();
const pending = new Map();
const MARKER = 'STEP_20O_MT_DUNGEON';
const component = 'app/client/src/components/dungeon/MtDungeonMessageBox.vue';
const payload = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname), 'step20o-payload', 'MtDungeonMessageBox.vue');
const texts = {
	FR: ['Entrer dans les Cavernes Magnétiques pour explorer les galeries d’origine Motion Twin.', 'Explorer les Cavernes Magnétiques', "Reprendre l’exploration"],
	EN: ['Enter the Magnetic Caverns and explore the original Motion Twin dungeon.', 'Explore the Magnetic Caverns', 'Resume exploring'],
	ES: ['Entra en las Cavernas Magnéticas y explora el calabozo original de Motion Twin.', 'Explorar las Cavernas Magnéticas', 'Volver a explorar'],
	DE: ['Betritt die Magnetischen Höhlen und erkunde den ursprünglichen Motion-Twin-Dungeon.', 'Magnetische Höhlen erkunden', 'Erkundung fortsetzen']
};
const nl = s => s.replace(/\r\n/g, '\n');
function get(file) {
	if (pending.has(file)) return pending.get(file);
	const dest = path.resolve(root, file);
	if (!fs.existsSync(dest)) throw new Error(`Fichier manquant : ${file}. Lance depuis la racine du dépôt.`);
	const original = fs.readFileSync(dest, 'utf8');
	const value = { text: nl(original), crlf: original.includes('\r\n'), original };
	pending.set(file, value);
	return value;
}
function edit(file, oldText, newText) {
	const value = get(file);
	if (nl(value.original).includes(MARKER)) return; // already installed
	const count = value.text.split(oldText).length - 1;
	if (count !== 1) throw new Error(`${file}: ancrage attendu 1 fois, trouvé ${count} (${oldText.slice(0, 85)})`);
	value.text = value.text.replace(oldText, newText);
}
function changed(file) {
	const value = get(file);
	return value.text !== nl(value.original);
}
function replaceRange(file, start, end, newText) {
	const value = get(file);
	if (nl(value.original).includes(MARKER)) return;
	const index = value.text.indexOf(start);
	if (index < 0 || value.text.indexOf(start, index + 1) !== -1) throw new Error(`${file}: début introuvable/ambigu`);
	const last = value.text.indexOf(end, index + start.length);
	if (last < 0) throw new Error(`${file}: fin introuvable`);
	value.text = value.text.slice(0, index) + newText + value.text.slice(last);
}
const actionModel = 'packages/core/src/models/dinoz/dinozActions.ts';
edit(actionModel, "\tBUILD_DOJO = 'build_dojo'", "\tBUILD_DOJO = 'build_dojo',\n\tDUNGEON = 'dungeon' // STEP_20O_MT_DUNGEON");
edit(actionModel, "\t[Action.BUILD_DOJO]: {\n\t\tname: Action.BUILD_DOJO,\n\t\timgName: 'act_dojo'\n\t}", "\t[Action.BUILD_DOJO]: {\n\t\tname: Action.BUILD_DOJO,\n\t\timgName: 'act_dojo'\n\t},\n\t[Action.DUNGEON]: {\n\t\tname: Action.DUNGEON,\n\t\timgName: 'act_explore',\n\t\tprop: 'stepp'\n\t}");

const ficheModel = 'packages/core/src/models/dinoz/dinozFiche.ts';
edit(ficheModel, '\tactions: ActionFiche[];', "\t/** Active MT run, reported only for its owner (leader or current follower). STEP_20O_MT_DUNGEON */\n\tdungeon?: { leaderDinozId: number; dungeonId: string };\n\tactions: ActionFiche[];");

const serverFiche = 'app/server/src/Dinoz/Service/getDinozFiche.service.ts';
edit(serverFiche, "import { ExpectedError }", "import { Action, actionList } from '@dinorpg/core/models/dinoz/dinozActions.js';\nimport { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';\nimport { ExpectedError }");
edit(serverFiche, "import { advanceDinozMissionOnWait }", "import { getMtDungeonArchive, assertMtDungeonEntry, MtDungeonEntryError } from '../../Dungeon/Service/mtDungeonRuntime.service.js'; // STEP_20O_MT_DUNGEON\nimport { advanceDinozMissionOnWait }");
edit(serverFiche,
"\tret.actions = await getAvailableActions(myDinoz, playerData);\n\treturn reply.send(ret);",
`\t// STEP_20O_MT_DUNGEON: suppress ordinary world actions for every member of an active run.
\t// The dungeon entrance/scene remains authoritative; never trust a client-provided run id.
\tconst activeRun = await prisma.mtDungeonRun.findFirst({
\t\twhere: { userId: authedId, leaderDinozId: myDinoz.leaderId ?? myDinoz.id },
\t\tselect: { leaderDinozId: true, mapId: true }
\t});
\tif (activeRun) {
\t\tret.dungeon = {
\t\t\tleaderDinozId: activeRun.leaderDinozId,
\t\t\tdungeonId: activeRun.mapId.slice(0, activeRun.mapId.lastIndexOf('_'))
\t\t};
\t\tret.actions = [];
\t\tret.borderPlace = [];
\t\treturn reply.send(ret);
\t}
\tret.actions = await getAvailableActions(myDinoz, playerData);
\t// Show the same entry as the server accepts; the start route rechecks atomically.
\tif (
\t\tmyDinoz.leaderId === null &&
\t\tmyDinoz.placeId === PlaceEnum.PYLONES_DE_MAGNETITES &&
\t\tmyDinoz.state === null &&
\t\tmyDinoz.life > 0 &&
\t\tmyDinoz.fight
\t) {
\t\ttry {
\t\t\tawait assertMtDungeonEntry(getMtDungeonArchive(), { userId: authedId, leaderDinozId: myDinoz.id }, 'stepp_0');
\t\t\tret.actions.push(actionList[Action.DUNGEON]);
\t\t} catch (error) {
\t\t\tif (!(error instanceof MtDungeonEntryError)) throw error;
\t\t}
\t}
\treturn reply.send(ret);`);

const fichePage = 'app/client/src/pages/DinozPage.vue';
replaceRange(fichePage, '\t<div\n\t\tv-if="\n\t\t\tisReady &&', '\t<div class="dinozPanels"', '\t<!-- STEP_20O_MT_DUNGEON: entry action now lives in DinozActions -->\n');
edit(fichePage, "import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';\n", '');
edit(fichePage, '\t\t\tPlaceEnum,\n', '');
replaceRange(fichePage, '.mt-caverns-entry {', '.dinozPanels {', '');

const ficheActions = 'app/client/src/components/dinoz/DinozActions.vue';
edit(ficheActions, '<div class="action_content">', `<div class="action_content">
\t\t\t<!-- STEP_20O_MT_DUNGEON: this is navigation, never a gameplay action. -->
\t\t\t<RouterLink
\t\t\t\tv-if="dinoz.dungeon?.dungeonId === 'stepp'"
\t\t\t\tclass="dungeon-resume"
\t\t\t\t:to="{ name: 'MtMagneticCavernsPage', params: { id: dinoz.dungeon.leaderDinozId } }"
\t\t\t>
\t\t\t\t{{ $t('action.name.resume_dungeon') }}
\t\t\t</RouterLink>`);
edit(ficheActions, "import { DojoService } from '../../services/dojo.service.ts';", "import { DojoService } from '../../services/dojo.service.ts';\nimport { MtDungeonService } from '../../services/mtDungeon.service.js';");
edit(ficheActions, '\t\t\tswitch (action.name) {\n\t\t\t\tcase Action.IRMA:', `\t\t\tswitch (action.name) {
\t\t\t\tcase Action.DUNGEON: // STEP_20O_MT_DUNGEON
\t\t\t\t\ttry {
\t\t\t\t\t\tawait MtDungeonService.startMagneticCaverns(this.dinozId);
\t\t\t\t\t\tawait this.$router.push({
\t\t\t\t\t\t\tname: 'MtMagneticCavernsPage',
\t\t\t\t\t\t\tparams: { id: String(this.dinozId) },
\t\t\t\t\t\t\tquery: { mtEntry: '1' }
\t\t\t\t\t\t});
\t\t\t\t\t} catch (error) {
\t\t\t\t\t\terrorHandler.handle(error, this.$toast);
\t\t\t\t\t\tawait this.refreshDinoz();
\t\t\t\t\t}
\t\t\t\t\tbreak;
\t\t\t\tcase Action.IRMA:`);
edit(ficheActions, '.selling {\n', `.dungeon-resume { // STEP_20O_MT_DUNGEON
\tpadding: 8px 6px;
\tborder: 1px solid #8b6839;
\tbackground: #e9d09f;
\tcolor: #4c2f16;
\tfont-size: 10pt;
\ttext-align: center;
\tfont-weight: bold;
\ttext-decoration: none;
}
.dungeon-resume:hover { background: #f2dfba; }
.selling {
`);

const service = 'app/client/src/services/mtDungeon.service.ts';
edit(service, 'export interface MtDungeonJournal {', `export interface MtDungeonCatalogEntry { // STEP_20O_MT_DUNGEON
\tid: string;
\tname: string;
\tenter: { place: string; text: string };
\texit: { place: string; text: string };
\tstageCount: number;
\tlanguageUsed: string;
}

export interface MtDungeonJournal {`);
edit(service, 'export const MtDungeonService = {', `export const MtDungeonService = {
\tgetCatalog(language: string): Promise<MtDungeonCatalogEntry[]> { // STEP_20O_MT_DUNGEON
\t\treturn api.get('/dungeon/mt/catalog', { params: { lang: language }, silent: true });
\t},`);

const page = 'app/client/src/pages/MtMagneticCavernsPage.vue';
edit(page, '<p>Exploration expérimentale — cartes et graphismes d\'origine Motion Twin</p>', '<p>Exploration des cartes et graphismes d\'origine Motion Twin</p>');
edit(page, '<section class="mt-test" aria-label="Exploration des Cavernes Magnétiques">', `<section class="mt-test" aria-label="Exploration des Cavernes Magnétiques">
\t\t<!-- STEP_20O_MT_DUNGEON: original eight-piece Motion Twin message box. -->
\t\t<MtDungeonMessageBox
\t\t\tv-if="activeMessage"
\t\t\t:title="activeMessage.title"
\t\t\t:text="activeMessage.text"
\t\t\t:confirm-label="activeMessage.confirmLabel"
\t\t\t:cancel-label="activeMessage.cancelLabel"
\t\t\t:busy="busy"
\t\t\t@confirm="confirmMessage"
\t\t\t@close="closeMessage"
\t\t/>`);
edit(page, "import MtOriginalDungeonCanvas from '../components/dungeon/MtOriginalDungeonCanvas.vue';", "import MtOriginalDungeonCanvas from '../components/dungeon/MtOriginalDungeonCanvas.vue';\nimport MtDungeonMessageBox from '../components/dungeon/MtDungeonMessageBox.vue';");
edit(page, "const notice = ref('');", `const notice = ref('');
const originalEntryText = ref<string | null>(null); // STEP_20O_MT_DUNGEON
const entryDismissed = ref(false);
const exitDismissed = ref(false);
const scenarioDismissedRevision = ref('');`);
edit(page, 'function formatError(error: unknown): string {', `type MtNarrativeKind = 'entry' | 'exit' | 'scenario' | 'scenario-combat'; // STEP_20O_MT_DUNGEON
type MtNarrative = { kind: MtNarrativeKind; title: string; text: string; confirmLabel: string; cancelLabel?: string };
const activeMessage = computed((): MtNarrative | null => {
\tif (exitOutcome.value && !exitDismissed.value) {
\t\treturn { kind: 'exit', title: 'Sortie du donjon', text: exitOutcome.value.text, confirmLabel: 'Retour à la fiche' };
\t}
\tif (session.value && originalEntryText.value && !entryDismissed.value) {
\t\treturn { kind: 'entry', title: 'Les Cavernes Magnétiques', text: originalEntryText.value, confirmLabel: 'Continuer' };
\t}
\tconst run = session.value;
\tconst current = encounter.value;
\tif (run?.pending?.kind === 'scenario' && current?.text) {
\t\tconst key = run.mapId + ':' + run.revision;
\t\tif (scenarioDismissedRevision.value === key) return null;
\t\tif (current.kind === 'scenario') {
\t\t\treturn { kind: 'scenario', title: 'Découverte', text: current.text, confirmLabel: 'Lire / récupérer', cancelLabel: 'Plus tard' };
\t\t}
\t\tif (current.kind === 'scenario-combat' && current.status === 'ready-for-combat') {
\t\t\treturn { kind: 'scenario-combat', title: 'Rencontre', text: current.text, confirmLabel: 'Combattre', cancelLabel: 'Plus tard' };
\t\t}
\t}
\treturn null;
});
function closeMessage(): void {
\tconst kind = activeMessage.value?.kind;
\tif (kind === 'entry') entryDismissed.value = true;
\tif (kind === 'exit') exitDismissed.value = true;
\tif ((kind === 'scenario' || kind === 'scenario-combat') && session.value)
\t\tscenarioDismissedRevision.value = session.value.mapId + ':' + session.value.revision;
}
function confirmMessage(): void {
\tconst kind = activeMessage.value?.kind;
\tif (kind === 'entry') entryDismissed.value = true;
\tif (kind === 'exit') {
\t\texitDismissed.value = true;
\t\tvoid router.push({ name: 'DinozPage', params: { id: String(leaderId) } });
\t}
\tif (kind === 'scenario') {
\t\tcloseMessage();
\t\tresolveScenario();
\t}
\tif (kind === 'scenario-combat') {
\t\tcloseMessage();
\t\tfight();
\t}
}
async function showOriginalEntryText(): Promise<void> {
\ttry {
\t\t// Public metadata contain introduction and exit only; no hidden scenario leaks.
\t\tconst definition = (await MtDungeonService.getCatalog(language.value)).find(value => value.id === 'stepp');
\t\tif (definition?.enter.text) {
\t\t\toriginalEntryText.value = definition.enter.text;
\t\t\tentryDismissed.value = false;
\t\t}
\t} catch (error) {
\t\terrorMessage.value = formatError(error);
\t}
}

function formatError(error: unknown): string {`);
edit(page, "\t\tnotice.value = 'Exploration initialisée sur la carte originale stepp_0.';", "\t\tawait showOriginalEntryText();\n\t\tnotice.value = 'Exploration initialisée sur la carte originale stepp_0.';");
edit(page, 'if (event.altKey || event.ctrlKey || event.metaKey || cannotMove.value) return;', 'if (event.altKey || event.ctrlKey || event.metaKey || cannotMove.value || !!activeMessage.value) return;');
edit(page, `onMounted(() => {
\twindow.addEventListener('keydown', onKeyDown);
\tvoid loadVisualParty();
\tvoid loadDevCapabilities();
\tvoid refresh();
});`, `onMounted(() => { // STEP_20O_MT_DUNGEON
\twindow.addEventListener('keydown', onKeyDown);
\tvoid (async () => {
\t\tawait refresh();
\t\tawait loadDevCapabilities();
\t\tif (route.query.mtEntry === '1' && session.value?.mapId.startsWith('stepp_')) {
\t\t\tawait showOriginalEntryText();
\t\t\tconst query = { ...route.query };
\t\t\tdelete query.mtEntry;
\t\t\tawait router.replace({ query });
\t\t}
\t})();
});`);

// Localized action strings: do not reformat the entire large JSON locale files.
for (const [locale, values] of Object.entries(texts)) {
	const file = `app/client/src/i18n/locales/${locale}.json`;
	const value = get(file);
	if (value.text.includes('"resume_dungeon"')) continue;
	const hits = [...value.text.matchAll(/"build_dojo": "[^"\n]*"/g)];
	if (hits.length !== 2) throw new Error(`${file}: attendu deux clés build_dojo sous action.description et action.name, trouvé ${hits.length}`);
	const quote = s => JSON.stringify(s);
	const a = hits[0][0];
	const b = hits[1][0];
	const desc = `${a},\n			"dungeon": ${quote(values[0])}`;
	const name = `${b},\n			"dungeon": ${quote(values[1])},\n			"resume_dungeon": ${quote(values[2])}`;
	value.text = value.text.replace(a, desc).replace(b, name);
	try { JSON.parse(value.text); } catch (error) { throw new Error(`${file}: JSON invalide : ${error}`); }
}

// Assets and new files are validated before any source file is changed.
const requiredAssets = ['topleft','top','topright','left','right','bottomleft','bottom','bottomright'].map(part =>
    `app/client/public/dungeon/mt/msgbox_${part}.png`);
for (const asset of requiredAssets) {
    if (!fs.existsSync(path.resolve(root, asset))) throw new Error(`Asset Motion Twin introuvable : ${asset}`);
}
const additionalFiles = [
    [component, payload],
    ['app/client/test/unit/dungeon/mtDungeonMessageBox.test.ts', path.resolve(path.dirname(payload), 'mtDungeonMessageBox.test.ts')]
];
for (const [file, source] of additionalFiles) {
    const dest = path.resolve(root, file);
    if (fs.existsSync(dest) && nl(fs.readFileSync(dest, 'utf8')) !== nl(fs.readFileSync(source, 'utf8'))) {
        throw new Error(`${file}: déjà présent et différent du payload, ne pas écraser`);
    }
}

// Never write anything if an anchor failed above.
let wrote = 0;
for (const [file, item] of pending) {
	if (!changed(file)) continue;
	const target = path.resolve(root, file);
	if (!dryRun) fs.writeFileSync(target, item.crlf ? item.text.replace(/\n/g, '\r\n') : item.text, 'utf8');
	console.log(`${dryRun ? 'CHECK' : 'UPDATED'} ${file}`);
	wrote++;
}
for (const [file, source] of additionalFiles) {
    const dest = path.resolve(root, file);
    if (fs.existsSync(dest)) continue;
    if (!dryRun) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, fs.readFileSync(source, 'utf8'), 'utf8');
    }
    console.log(`${dryRun ? 'CHECK' : 'CREATED'} ${file}`);
    wrote++;
}
console.log(`${dryRun ? 'Simulation terminée' : 'Correctif installé'} : ${wrote} fichier(s) ${dryRun ? 'à modifier' : 'modifiés'}.`);
