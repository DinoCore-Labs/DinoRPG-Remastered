#!/usr/bin/env node
/**
 * Step 20R - Dungeon entry MT dialog & automatic original boundary transitions.
 * Applies on top of 20O V2 + 20P V3, not 20Q.
 * No DB or GitHub modifications; --check never writes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check')) throw new Error('Usage: node tools/dungeon/apply-step20r-dungeon-dialogues.mjs [--check]');
const check = args.includes('--check');
const root = process.cwd();
const base = path.dirname(fileURLToPath(import.meta.url));
const queued = new Map();
const lf = s => s.replace(/\r\n/g, '\n');
const MARK = 'STEP_20R_MT_BOUNDARIES';
const paths = {
  actions: 'app/client/src/components/dinoz/DinozActions.vue',
  page: 'app/client/src/pages/MtMagneticCavernsPage.vue',
  component: 'app/client/src/components/dungeon/MtDungeonMessageBox.vue',
  service: 'app/client/src/services/mtDungeon.service.ts',
  helper: 'app/client/src/components/dungeon/mtDungeonBoundaryAction.ts',
  test: 'app/client/test/unit/dungeon/mtDungeonBoundaryAction.test.ts'
};
function read(file) {
  if (queued.has(file)) return queued.get(file);
  const target = path.resolve(root,file);
  if (!fs.existsSync(target)) throw new Error(`Fichier introuvable : ${file}. Extraire le ZIP à la racine du projet.`);
  const original = fs.readFileSync(target,'utf8');
  const state = {original, text:lf(original), crlf:original.includes('\r\n')};
  queued.set(file,state);
  return state;
}
function fail(file, message) { throw new Error(`${file}: ${message}. Aucun fichier modifié.`); }
function once(file, s, needle, replacement) {
  const count=s.split(needle).length-1;
  if(count!==1)fail(file,`ancrage introuvable/ambigu (${count}): ${needle.slice(0,100)}`);
  return s.replace(needle,replacement);
}
function range(file,s,start,end,replacement) {
  const count=s.split(start).length-1;
  if(count!==1)fail(file,`début de bloc introuvable/ambigu (${count}): ${start.slice(0,80)}`);
  const from=s.indexOf(start),to=s.indexOf(end,from+start.length);
  if(to<0)fail(file,`fin de bloc introuvable: ${end.slice(0,80)}`);
  return s.slice(0,from)+replacement+s.slice(to);
}
function modify(file, fn) { const f=read(file); f.text=fn(f.text); }

// Preflight: don't silently modify a branch missing the already installed 20P actions.
const actionPage=read(paths.actions).text;
const dungeonPage=read(paths.page).text;
if(!actionPage.includes('case Action.DUNGEON_ENTER:') || !actionPage.includes('case Action.DUNGEON:'))
  fail(paths.actions,'les deux actions MT de l’étape 20P sont absentes');
if(!dungeonPage.includes('MtDungeonMessageBox') || !dungeonPage.includes('exitOutcome'))
  fail(paths.page,'étape 20O et composant de popup non détectés');
if(!read(paths.service).text.includes('getCatalog(language: string)'))
  fail(paths.service,'catalogue des textes MT de 20O absent');
read(paths.component);

modify(paths.actions,s=>{
  if(s.includes('STEP_20R_MT_ENTRY_DIALOG')){
    if(!s.includes('dungeonEntryMessage') || !s.includes('MtDungeonMessageBox'))fail(paths.actions,'installation 20R incomplète');
    return s;
  }
  s=once(paths.actions,s,'<div class="actions">',`<div class="actions">
		<!-- STEP_20R_MT_ENTRY_DIALOG : texte MT après création, sur la fiche Dinoz. -->
		<MtDungeonMessageBox
			v-if="dungeonEntryMessage"
			:title="dungeonEntryMessage.title"
			:text="dungeonEntryMessage.text"
			confirm-label="Continuer"
			@confirm="dungeonEntryMessage = null"
			@close="dungeonEntryMessage = null"
		/>`);
  const importLine="import { MtDungeonService } from '../../services/mtDungeon.service.js';";
  if(!s.includes(importLine))fail(paths.actions,'import de MtDungeonService (20P) absent');
  s=once(paths.actions,s,importLine,importLine+"\nimport MtDungeonMessageBox from '../dungeon/MtDungeonMessageBox.vue';");
  const data=/fastGatherResult:\s*null as GatherResult \| null/;
  if(!data.test(s))fail(paths.actions,'données du composant inattendues (fastGatherResult)');
  s=s.replace(data,"fastGatherResult: null as GatherResult | null,\n\t\t\tdungeonEntryMessage: null as { title: string; text: string } | null");
  const cStart=s.indexOf('\tcomponents: {');
  const cEnd=s.indexOf('\tprops: {',cStart);
  if(cStart<0||cEnd<0||cEnd-cStart>500)fail(paths.actions,'bloc components inattendu');
  const components=s.slice(cStart,cEnd);
  if(components.includes('MtDungeonMessageBox'))fail(paths.actions,'composant déjà inscrit ailleurs');
  s=s.slice(0,cStart)+components.replace(/GatherRewardModal(?=\s*\n|\s*,)/,'GatherRewardModal,\n\t\tMtDungeonMessageBox').replace(/MtDungeonMessageBox,,/g,'MtDungeonMessageBox,')+s.slice(cEnd);
  // Replace ONLY the launch() branch, never unrelated action handlers.
  const start=s.indexOf('case Action.DUNGEON_ENTER:');
  const end=s.indexOf('case Action.DUNGEON:',start);
  if(start<0||end<0||end-start>2200)fail(paths.actions,'bloc Action.DUNGEON_ENTER absent ou inattendu');
  const old=s.slice(start,end);
  if(!old.includes('MtDungeonService.startMagneticCaverns')||!old.includes('await this.refreshDinoz()'))
    fail(paths.actions,'comportement 20P de dungeon_enter inattendu');
  const replacement=`case Action.DUNGEON_ENTER: // STEP_20R_MT_ENTRY_DIALOG
					try {
						// Charger la phrase d'origine AVANT la création : une réponse vide ne doit pas créer une session silencieuse.
						const definitions = await MtDungeonService.getCatalog(String(this.localStore.getLanguage ?? 'fr'));
						const definition = definitions.find(entry => entry.id === 'stepp');
						if (!definition?.enter.text) throw new Error('Texte d’entrée original MT indisponible.');
						await MtDungeonService.startMagneticCaverns(this.dinozId);
						await this.refreshDinoz();
						this.dungeonEntryMessage = { title: definition.name, text: definition.enter.text };
					} catch (error) {
						errorHandler.handle(error, this.$toast);
						await this.refreshDinoz();
					}
					break;
				`;
  s=s.slice(0,start)+replacement+s.slice(end);
  return s;
});

modify(paths.page,s=>{
  if(s.includes(MARK)){
    if(!s.includes('await settleMtBoundary(result.session)') || !s.includes('mtDungeonBoundaryAction(current)'))
      fail(paths.page,'installation 20R partielle');
    return s;
  }
  const importLine="import MtDungeonMessageBox from '../components/dungeon/MtDungeonMessageBox.vue';";
  if(!s.includes(importLine))fail(paths.page,'import popup 20O absent');
  s=once(paths.page,s,importLine,importLine+"\nimport { mtDungeonBoundaryAction } from '../components/dungeon/mtDungeonBoundaryAction.js'; // "+MARK);
  // The boundary is now resolved by the arrow interaction, not a second panel button.
  const buttons=[
    /\n[ \t]*<button\s+v-if="session\.pending\.kind === 'boundary-start' && stage === 0"[\s\S]*?<\/button>/g,
    /\n[ \t]*<button\s+v-if="session\.pending\.kind === 'boundary-exit' && stage < 3"[\s\S]*?<\/button>/g,
    /\n[ \t]*<button\s+v-if="session\.pending\.kind === 'boundary-exit' && stage === 3"[\s\S]*?<\/button>/g,
    /\n[ \t]*<button\s+v-if="session\.pending\.kind === 'boundary-start' && stage > 0"[\s\S]*?<\/button>/g
  ];
  for(const pattern of buttons){
    const matches=[...s.matchAll(pattern)];
    if(matches.length!==1)fail(paths.page,`bouton frontière non retrouvé (${matches.length}): ${pattern}`);
    s=s.replace(pattern,'');
  }
  s=once(paths.page,s,'<section v-if="session.pending" class="mt-test__panel" aria-live="polite">',
    '<section v-if="session.pending && !mtDungeonBoundaryAction(session)" class="mt-test__panel" aria-live="polite">');
  s=once(paths.page,s,'if (latestView) await loadJournal();',
    `if (latestView) await loadJournal();
		// Recover a boundary from a previous refresh/browser tab without a second button.
		if (mtDungeonBoundaryAction(current)) await settleMtBoundary(current);`);
  const moveNeedle='\t\tawait afterMutation(result.session);\n\t\tif (mtDungeonCombatTrigger(result.session.pending, encounter.value)';
  s=once(paths.page,s,moveNeedle,'\t\tawait afterMutation(result.session);\n\t\tif (await settleMtBoundary(result.session)) return;\n\t\tif (mtDungeonCombatTrigger(result.session.pending, encounter.value)');
  const oldTransition="function transition(action: 'forward' | 'backward') {";
  const helper=`/** The server validates the pending boundary, revision and allowed next stage. */
async function settleMtBoundary(current: MtDungeonSession): Promise<boolean> {
	const action = mtDungeonBoundaryAction(current);
	if (!action) return false;
	if (action === 'forward' || action === 'backward') {
		const next = await MtDungeonService.transition(leaderId, current.revision, action);
		movementTrail.value = [];
		await afterMutation(next);
		return true;
	}
	const outcome = await MtDungeonService.worldExit(leaderId, current.revision, language.value);
	session.value = null;
	view.value = null;
	encounter.value = null;
	guardianTrial.value = null;
	movementTrail.value = [];
	exitOutcome.value = outcome;
	journalEntries.value = [];
	return true;
}
`;
  s=range(paths.page,s,oldTransition,'function resolveScenario()',helper);
  s=range(paths.page,s,'function exitDungeon(): void {','function evacuateDefeated(): void {','');
  // Ensure the old event-driven boundary handlers and UI hooks were removed.
  if(s.includes('@click="exitDungeon"')||s.includes("@click=\"transition('"))fail(paths.page,'ancien bouton d’interaction encore présent');
  return s;
});

// Prepare exact new files before writing anything. Do not overwrite user customizations.
const extras=[[paths.helper,'mtDungeonBoundaryAction.ts'],[paths.test,'mtDungeonBoundaryAction.test.ts']];
for(const [target,source] of extras){
  const payload=path.join(base,'step20r-payload',source);
  if(!fs.existsSync(payload))throw new Error(`Payload absent: ${source}`);
  const full=path.resolve(root,target);
  if(fs.existsSync(full)&&lf(fs.readFileSync(full,'utf8'))!==lf(fs.readFileSync(payload,'utf8')))
    fail(target,'fichier existant différent du payload, intervention manuelle requise');
}
let count=0;
for(const [file,item] of queued){
  if(item.text===lf(item.original))continue;
  console.log(`${check?'CHECK':'UPDATED'} ${file}`);
  if(!check)fs.writeFileSync(path.resolve(root,file),item.crlf?item.text.replace(/\n/g,'\r\n'):item.text,'utf8');
  count++;
}
for(const [target,source] of extras){
  const dest=path.resolve(root,target);
  if(fs.existsSync(dest))continue;
  console.log(`${check?'CHECK':'CREATED'} ${target}`);
  if(!check){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(base,'step20r-payload',source),dest);}
  count++;
}
console.log(`${check?'Simulation':'Installation'} terminée (${count} fichier(s) ${check?'à modifier':'modifiés'}).`);
