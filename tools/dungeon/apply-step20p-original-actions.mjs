#!/usr/bin/env node
/**
 * Step 20P: restore MT's two-stage dungeon action flow after step 20O V2.
 * Tested against repository feat/mt-dungeons @ 91cab18e58e2 and step20O V2.
 * Does not touch GitHub or the database.
 * Usage: node tools/dungeon/apply-step20p-original-actions.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';

if (process.argv.slice(2).some(arg => arg !== '--check')) {
  throw new Error('Usage: node tools/dungeon/apply-step20p-original-actions.mjs [--check]');
}
const dryRun = process.argv.includes('--check');
const root = process.cwd();
const changes = new Map();
const MARKER = 'STEP_20P_ORIGINAL_MT_ACTIONS';
const lf = value => value.replace(/\r\n/g, '\n');
function load(file) {
  if (changes.has(file)) return changes.get(file);
  const destination = path.resolve(root, file);
  if (!fs.existsSync(destination)) throw new Error(`Fichier absent : ${file}. Exécuter depuis la racine du dépôt.`);
  const original = fs.readFileSync(destination, 'utf8');
  const item = { original, text: lf(original), crlf: original.includes('\r\n') };
  changes.set(file, item);
  return item;
}
function edit(file, before, after) {
  const item = load(file);
  const count = item.text.split(before).length - 1;
  if (count !== 1) throw new Error(`${file}: ancrage manquant/ambigu (attendu 1, trouvé ${count}) : ${before.slice(0, 100)}`);
  item.text = item.text.replace(before, after);
}
function range(file, before, after, replacement) {
  const item = load(file);
  const start = item.text.indexOf(before);
  if (start < 0 || item.text.indexOf(before, start + before.length) >= 0) throw new Error(`${file}: début manquant/ambigu : ${before}`);
  const end = item.text.indexOf(after, start + before.length);
  if (end < 0) throw new Error(`${file}: fin introuvable : ${after}`);
  item.text = item.text.slice(0, start) + replacement + item.text.slice(end);
}
function assertInstalledV2() {
  const v2 = load('app/server/src/Dinoz/Service/getDinozFiche.service.ts').text;
  const actions = load('packages/core/src/models/dinoz/dinozActions.ts').text;
  if (!v2.includes('STEP_20O_MT_DUNGEON') || !actions.includes('STEP_20O_MT_DUNGEON')) {
    throw new Error('Ce correctif met à jour l’étape 20O V2. Installer d’abord la V2, ou utiliser un dépôt où elle est déjà appliquée. Aucun fichier modifié.');
  }
}
const actionsPath = 'app/server/src/Dinoz/Service/getDinozActions.service.ts';
if (load(actionsPath).text.includes(MARKER)) {
  console.log('Étape 20P déjà installée : aucune modification.');
  process.exit(0);
}
assertInstalledV2();

// Restore fiche loader: all dungeon action decisions belong to getAvailableActions.
const fiche = 'app/server/src/Dinoz/Service/getDinozFiche.service.ts';
edit(fiche, "import { Action, actionList } from '@dinorpg/core/models/dinoz/dinozActions.js';\nimport { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';\n", '');
edit(fiche, "import { getMtDungeonArchive, assertMtDungeonEntry, MtDungeonEntryError } from '../../Dungeon/Service/mtDungeonRuntime.service.js'; // STEP_20O_MT_DUNGEON\n", '');
range(fiche,
  '\t// STEP_20O_MT_DUNGEON: suppress ordinary world actions for every member of an active run.',
  '\treturn reply.send(ret);\n}',
  '\tret.actions = await getAvailableActions(myDinoz, playerData);\n');
const ficheModel = 'packages/core/src/models/dinoz/dinozFiche.ts';
edit(ficheModel, '\t/** Active MT run, reported only for its owner (leader or current follower). STEP_20O_MT_DUNGEON */\n\tdungeon?: { leaderDinozId: number; dungeonId: string };\n', '');

// Canonical historical actions and asset icon="train" (act_train.webp).
const actionModel = 'packages/core/src/models/dinoz/dinozActions.ts';
edit(actionModel,
  "\tDUNGEON = 'dungeon' // STEP_20O_MT_DUNGEON",
  "\tDUNGEON_ENTER = 'dungeon_enter', // STEP_20P_ORIGINAL_MT_ACTIONS\n\tDUNGEON = 'dungeon'");
edit(actionModel,
  "\t[Action.DUNGEON]: {\n\t\tname: Action.DUNGEON,\n\t\timgName: 'act_explore',\n\t\tprop: 'stepp'\n\t}",
  "\t[Action.DUNGEON_ENTER]: {\n\t\tname: Action.DUNGEON_ENTER,\n\t\timgName: 'act_train',\n\t\tconfirm: true,\n\t\tconfirmMessageKey: 'action.description.dungeon_enter'\n\t},\n\t[Action.DUNGEON]: {\n\t\tname: Action.DUNGEON,\n\t\timgName: 'act_train'\n\t}");

// Server-side authoritative choice for the active member, before all normal actions.
edit(actionsPath,
  "import gameConfig from '../../config/game.config.js';",
  "import gameConfig from '../../config/game.config.js';\nimport { assertMtDungeonEntry, getMtDungeonArchive, MtDungeonEntryError } from '../../Dungeon/Service/mtDungeonRuntime.service.js'; // STEP_20P_ORIGINAL_MT_ACTIONS");
edit(actionsPath,
  '\tconst availableActions: ActionFiche[] = [];',
  `\tconst availableActions: ActionFiche[] = [];
	// Every member, including a follower, has only "Accéder au Plan" in an active run.
	// This query is made before resting, concentration, missions and all regular actions.
	const activeRun = await prisma.mtDungeonRun.findFirst({
		where: { userId: user.id, leaderDinozId: dinoz.leaderId ?? dinoz.id },
		select: { leaderDinozId: true }
	});
	if (activeRun) return [{ ...actionList[Action.DUNGEON], prop: activeRun.leaderDinozId }];`);
edit(actionsPath,
  '\treturn availableActions;\n}',
  `	// Match the authoritative MT entry gate instead of a place-only UI guess.
	if (
		dinoz.leaderId === null &&
		dinoz.placeId === PlaceEnum.PYLONES_DE_MAGNETITES &&
		dinoz.life > 0 &&
		dinoz.state === null
	) {
		try {
			await assertMtDungeonEntry(getMtDungeonArchive(), { userId: user.id, leaderDinozId: dinoz.id }, 'stepp_0');
			pushUniqueAction(availableActions, actionList[Action.DUNGEON_ENTER]);
		} catch (error) {
			if (!(error instanceof MtDungeonEntryError)) throw error;
		}
	}
	return availableActions;
}`);

// Same two actions and the small original in-exploration disclaimer in DinozActions.
const component = 'app/client/src/components/dinoz/DinozActions.vue';
range(component,
  '\t\t\t<!-- STEP_20O_MT_DUNGEON: this is navigation, never a gameplay action. -->',
  '\t\t\t<template v-for=',
  `			<DZDisclaimer
				v-if="dinozInDungeon"
				:content="$t('action.description.dungeon_status')"
				help
			/>
`);
edit(component,
  'v-if="didi.currentMission"',
  'v-if="!dinozInDungeon && didi.currentMission"');
edit(component,
  '<Tippy tag="p" theme="small" class="follow" v-if="leaderDinoz" @click="goToLeader()">',
  '<Tippy tag="p" theme="small" class="follow" v-if="leaderDinoz && !dinozInDungeon" @click="goToLeader()">');
edit(component,
  "\t\t\t\tcase Action.DUNGEON: // STEP_20O_MT_DUNGEON\n\t\t\t\t\ttry {\n\t\t\t\t\t\tawait MtDungeonService.startMagneticCaverns(this.dinozId);",
  `				case Action.DUNGEON_ENTER: // STEP_20P_ORIGINAL_MT_ACTIONS
					try {
						await MtDungeonService.startMagneticCaverns(this.dinozId);`);
// The V2 redirect and V2 catch are replaced together, so entry refreshes the Dinoz fiche.
range(component,
  "\t\t\t\t\t\tawait this.$router.push({\n\t\t\t\t\t\t\tname: 'MtMagneticCavernsPage',",
  '\t\t\t\tcase Action.IRMA:',
  `						try {
							const definitions = await MtDungeonService.getCatalog(String(this.localStore.getLanguage ?? 'fr'));
							const text = definitions.find(definition => definition.id === 'stepp')?.enter.text;
							if (text) this.$toast.open({ message: formatText(text), type: 'info' });
						} catch {
							// The session was created; a metadata request must not undo its success.
						}
						await this.refreshDinoz();
					} catch (error) {
						errorHandler.handle(error, this.$toast);
						await this.refreshDinoz();
					}
					break;
				case Action.DUNGEON:
					await this.$router.push({
						name: 'MtMagneticCavernsPage',
						params: { id: String(typeof action.prop === 'number' ? action.prop : (this.dinoz.leaderId ?? this.dinozId)) }
					});
					break;
`);
// Remove stale CSS for the V2 special RouterLink.
range(component, '.dungeon-resume { // STEP_20O_MT_DUNGEON', '.selling {', '');
edit(component,
  '\tcomputed: {\n\t\tdinozFullParty(): DinozFiche[] {',
  `	computed: {
		dinozInDungeon(): boolean {
			return this.dinoz.actions?.some(action => action.name === Action.DUNGEON) ?? false;
		},
		dinozFullParty(): DinozFiche[] {`);

// Hide the regular overworld movement list on the fiche while the run exists.
const page = 'app/client/src/pages/DinozPage.vue';
edit(page,
  "import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';",
  "import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';\nimport { Action } from '@dinorpg/core/models/dinoz/dinozActions.js'; // STEP_20P_ORIGINAL_MT_ACTIONS");
edit(page,
  '\t\t\tthis.dinozData = dinozData;',
  `			// Overworld travel is unavailable during a dungeon run.
			if (dinozData.actions.some(action => action.name === Action.DUNGEON)) dinozData.borderPlace = [];
			this.dinozData = dinozData;`);
// Interactive page may not create a run itself; entry must come from DinozActions.
const mapPage = 'app/client/src/pages/MtMagneticCavernsPage.vue';
edit(mapPage,
  '<button type="button" :disabled="busy" @click="start">Entrer dans les Cavernes Magnétiques</button>',
  `<RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">Retourner aux actions du Dinoz pour entrer</RouterLink>`);
range(mapPage,
  'function start() {',
  "function move(direction: 'north' | 'south' | 'west' | 'east' | 'up' | 'down') {",
  '');

// Replace ONLY the action strings introduced by V2, preserving the large locale files.
const values = {
  FR: {enter: 'Entrer', plan: 'Accéder au Plan', warning: 'Vous pouvez explorer cet endroit, mais faites attention à ne pas vous y perdre !', description: "Voir l'évolution de l'exploration actuelle...", status: 'Votre Dinoz est actuellement en exploration...'},
  EN: {enter: 'Enter', plan: 'Check the Map', warning: 'You can explore this place, but take care of not getting lost!', description: 'Check the current exploration state...', status: 'Your Dinoz is currently exploring an area...'},
  ES: {enter: 'Entrar', plan: 'Consultar el mapa', warning: 'Puedes explorar este lugar, ¡pero ten cuidado de no perderte!', description: 'Ver el progreso de la exploración actual...', status: 'Tu Dinoz está explorando una zona...'},
  DE: {enter: 'Betreten', plan: 'Karte ansehen', warning: 'Du kannst diesen Ort erkunden, aber pass auf, dass du dich nicht verirrst!', description: 'Den aktuellen Erkundungsfortschritt ansehen...', status: 'Dein Dinoz erkundet gerade ein Gebiet...'}
};
for (const [lang, strings] of Object.entries(values)) {
  const file = `app/client/src/i18n/locales/${lang}.json`;
  const item = load(file);
  const json = JSON.parse(item.text);
  if (!Object.prototype.hasOwnProperty.call(json.action.description, 'dungeon') || !Object.prototype.hasOwnProperty.call(json.action.name, 'resume_dungeon'))
    throw new Error(`${file}: les traductions de l'étape 20O V2 sont absentes : aucun fichier modifié.`);
  // Replace exact JSON property spans by regex under their expected V2 locale sections, avoiding a full file reformat.
  const blocks = [...item.text.matchAll(/^\s*"build_dojo":\s*"[^"\n]*",?$/gm)];
  if (blocks.length !== 2) throw new Error(`${file}: structure action.name / action.description inattendue`);
  const frags = item.text.match(/"dungeon":\s*"(?:\\.|[^"\\])*"/g);
  if (!frags || frags.length !== 2) throw new Error(`${file}: clés dungeon ambiguës`);
  const oldDesc = `"dungeon": ${JSON.stringify(json.action.description.dungeon)}`;
  const oldLabel = `"dungeon": ${JSON.stringify(json.action.name.dungeon)},\n\t\t\t"resume_dungeon": ${JSON.stringify(json.action.name.resume_dungeon)}`;
  const descReplacement = `"dungeon_enter": ${JSON.stringify(strings.warning)},\n\t\t\t"dungeon": ${JSON.stringify(strings.description)},\n\t\t\t"dungeon_status": ${JSON.stringify(strings.status)}`;
  const nameReplacement = `"dungeon_enter": ${JSON.stringify(strings.enter)},\n\t\t\t"dungeon": ${JSON.stringify(strings.plan)}`;
  edit(file, oldDesc, descReplacement);
  edit(file, oldLabel, nameReplacement);
  JSON.parse(item.text); // validate all four full locale files before writing
}

// Verify scene popup source still exists; it is used for the MT scenario and exit messages.
for (const file of [
  'app/client/src/components/dungeon/MtDungeonMessageBox.vue',
  'app/client/src/services/mtDungeon.service.ts',
  'app/client/src/pages/MtMagneticCavernsPage.vue'
]) load(file);

// Add targeted regression tests without overwriting an existing different file.
const testFile = 'packages/core/test/unit/dungeon/mtDungeonActions.test.ts';
const testPayload = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'step20p-payload', 'mtDungeonActions.test.ts');
if (!fs.existsSync(testPayload)) throw new Error(`Fichier de test fourni introuvable : ${testPayload}`);
const testDestination = path.resolve(root, testFile);
const testSource = fs.readFileSync(testPayload, 'utf8');
if (fs.existsSync(testDestination) && lf(fs.readFileSync(testDestination, 'utf8')) !== lf(testSource)) {
  throw new Error(`${testFile}: fichier existant différent : pas d'écrasement`);
}

// No writes until every one of the above validations succeeds.
let modified = 0;
for (const [file, item] of changes) {
  if (item.text === lf(item.original)) continue;
  if (!dryRun) fs.writeFileSync(path.resolve(root, file), item.crlf ? item.text.replace(/\n/g, '\r\n') : item.text, 'utf8');
  console.log(`${dryRun ? 'CHECK' : 'UPDATED'} ${file}`);
  modified++;
}
if (!fs.existsSync(testDestination)) {
  if (!dryRun) {
    fs.mkdirSync(path.dirname(testDestination), { recursive: true });
    fs.writeFileSync(testDestination, testSource, 'utf8');
  }
  console.log(`${dryRun ? 'CHECK' : 'CREATED'} ${testFile}`);
  modified++;
}
console.log(`${dryRun ? 'Simulation OK' : 'Étape 20P installée'} : ${modified} fichier(s).`);
