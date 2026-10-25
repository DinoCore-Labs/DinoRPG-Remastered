#!/usr/bin/env node
/**
 * Step 20P V3 - MT's two distinct dungeon actions.
 * Upgrades the step 20O V2 installation, even after TypeScript import formatting.
 * --check is strictly read-only, and no tracked source is written until all checks pass.
 * This installer touches neither the database nor GitHub.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check')) throw new Error('Usage: node tools/dungeon/apply-step20p-original-actions.mjs [--check]');
const check = args.includes('--check');
const root = process.cwd();
const queued = new Map();
const lf = value => value.replace(/\r\n/g, '\n');
function entry(file) {
  if (queued.has(file)) return queued.get(file);
  const absolute = path.resolve(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`Fichier introuvable : ${file}. Lance depuis la racine du dépôt.`);
  const original = fs.readFileSync(absolute, 'utf8');
  const data = { original, text: lf(original), crlf: original.includes('\r\n') };
  queued.set(file, data);
  return data;
}
function modify(file, fn) {
  const e = entry(file);
  e.text = fn(e.text);
}
function expectUnique(file, s, needle) {
  const count = s.split(needle).length - 1;
  if (count !== 1) throw new Error(`${file}: ancrage ${JSON.stringify(needle.slice(0, 75))} trouvé ${count} fois (attendu 1). Aucun fichier modifié.`);
  return s.indexOf(needle);
}
function replaceOnce(file, s, before, after) {
  const idx = expectUnique(file, s, before);
  return s.slice(0, idx) + after + s.slice(idx + before.length);
}
function replaceRegexOnce(file, s, regex, replacement) {
  const matches = [...s.matchAll(regex)];
  if (matches.length !== 1) throw new Error(`${file}: motif ${regex} trouvé ${matches.length} fois (attendu 1). Aucun fichier modifié.`);
  return s.replace(regex, replacement);
}
const F = {
  model: 'packages/core/src/models/dinoz/dinozActions.ts',
  ficheModel: 'packages/core/src/models/dinoz/dinozFiche.ts',
  fiche: 'app/server/src/Dinoz/Service/getDinozFiche.service.ts',
  actions: 'app/server/src/Dinoz/Service/getDinozActions.service.ts',
  component: 'app/client/src/components/dinoz/DinozActions.vue',
  dinozPage: 'app/client/src/pages/DinozPage.vue',
  dungeonPage: 'app/client/src/pages/MtMagneticCavernsPage.vue'
};
// This is an upgrade for the V2 already installed on the user's branch, NOT a
// speculative replacement of unrelated customizations or a generic baseline patch.
if (!entry(F.model).text.includes("DUNGEON = 'dungeon'")) {
  throw new Error('Le modèle Action.DUNGEON de la V2 est absent. Ce paquet corrige la V2; il ne faut pas appliquer un mélange de versions. Aucun fichier modifié.');
}
if (!entry(F.fiche).text.includes('STEP_20O_MT_DUNGEON') &&
    !entry(F.actions).text.includes('STEP_20P_ORIGINAL_MT_ACTIONS')) {
  throw new Error('Étape 20O V2 non détectée. Aucun fichier modifié.');
}

// 1) Remove the V2 special-case from getDinozFiche.service.ts. This intentionally
// tolerates Prettier moving/reflowing imports, while preserving the rest of the file.
modify(F.fiche, s => {
  const v2 = s.indexOf('// STEP_20O_MT_DUNGEON: suppress ordinary world actions');
  if (v2 >= 0) {
    const start = s.lastIndexOf('\n', v2) + 1;
    const end = s.lastIndexOf('\treturn reply.send(ret);');
    if (start < 0 || end <= start || !s.slice(start, end).includes('await getAvailableActions(myDinoz, playerData)'))
      throw new Error(`${F.fiche}: bloc 20O modifié, retrait automatique refusé.`);
    s = s.slice(0, start) + '\tret.actions = await getAvailableActions(myDinoz, playerData);\n' + s.slice(end);
  }
  // Remove only V2 imports that are no longer used in this file, independent of order/spacing.
  s = s.replace(/^import\s*\{\s*Action\s*,\s*actionList\s*\}\s*from\s*['"]@dinorpg\/core\/models\/dinoz\/dinozActions\.js['"];[^\n]*\n/gm, '');
  s = s.replace(/^import\s*\{\s*PlaceEnum\s*\}\s*from\s*['"]@dinorpg\/core\/models\/enums\/PlaceEnum\.js['"];[^\n]*\n/gm, '');
  s = s.replace(/^import\s*\{[^}]*\b(?:getMtDungeonArchive|assertMtDungeonEntry|MtDungeonEntryError)\b[^}]*\}\s*from\s*['"]\.\.\/\.\.\/Dungeon\/Service\/mtDungeonRuntime\.service\.js['"];[^\n]*\n/gm, '');
  if (!s.includes('ret.actions = await getAvailableActions(myDinoz, playerData);'))
    throw new Error(`${F.fiche}: getAvailableActions absent après nettoyage.`);
  if (s.includes('ret.dungeon =') || s.includes('ret.actions = [];'))
    throw new Error(`${F.fiche}: gestion V2 partiellement conservée; correction manuelle nécessaire.`);
  return s;
});
modify(F.ficheModel, s => s.replace(/^\s*\/\*\* Active MT run, reported only for its owner \(leader or current follower\)\. STEP_20O_MT_DUNGEON \*\/\n\s*dungeon\?: \{ leaderDinozId: number; dungeonId: string \};\n/m, '\n'));

// 2) Use exactly the historical XML IDs and train icon, with confirmation on enter.
modify(F.model, s => {
  if (!/\bDUNGEON_ENTER\s*=\s*'dungeon_enter'/.test(s)) {
    s = replaceRegexOnce(F.model, s, /^[ \t]*DUNGEON\s*=\s*'dungeon'[^\n]*/gm,
      "\tDUNGEON_ENTER = 'dungeon_enter', // STEP_20P_ORIGINAL_MT_ACTIONS\n\tDUNGEON = 'dungeon'");
  }
  const correctEnter = `\t[Action.DUNGEON_ENTER]: {\n\t\tname: Action.DUNGEON_ENTER,\n\t\timgName: 'act_train',\n\t\tconfirm: true,\n\t\tconfirmMessageKey: 'action.description.dungeon_enter'\n\t},\n`;
  const correctMap = "\t[Action.DUNGEON]: {\n\t\tname: Action.DUNGEON,\n\t\timgName: 'act_train'\n\t}";
  if (!s.includes('[Action.DUNGEON_ENTER]:')) {
    const rx = /^[ \t]*\[Action\.DUNGEON\]:\s*\{[^}]*\}/gm;
    s = replaceRegexOnce(F.model, s, rx, correctEnter + correctMap);
  } else {
    // Previously installed V3: require the correct behavior, not just a marker.
    if (!s.includes("imgName: 'act_train'") || !s.includes('confirmMessageKey: \'action.description.dungeon_enter\''))
      throw new Error(`${F.model}: modèle dungeon_enter incomplet ou modifié.`);
  }
  return s;
});

// 3) The SERVER selects entry vs. map, before any regular actions are calculated.
modify(F.actions, s => {
  if (!s.includes("from '../../Dungeon/Service/mtDungeonRuntime.service.js'")) {
    s = replaceOnce(F.actions, s, "import gameConfig from '../../config/game.config.js';",
      "import gameConfig from '../../config/game.config.js';\nimport { assertMtDungeonEntry, getMtDungeonArchive, MtDungeonEntryError } from '../../Dungeon/Service/mtDungeonRuntime.service.js'; // STEP_20P_ORIGINAL_MT_ACTIONS");
  }
  if (!s.includes('const activeRun = await prisma.mtDungeonRun.findFirst({')) {
    s = replaceOnce(F.actions, s, '\tconst availableActions: ActionFiche[] = [];', `\tconst availableActions: ActionFiche[] = [];
	// MT: all members of a run see only the map action; no ordinary actions.
	const activeRun = await prisma.mtDungeonRun.findFirst({
		where: { userId: user.id, leaderDinozId: dinoz.leaderId ?? dinoz.id },
		select: { leaderDinozId: true }
	});
	if (activeRun) return [{ ...actionList[Action.DUNGEON], prop: activeRun.leaderDinozId }];`);
  }
  if (!s.includes("pushUniqueAction(availableActions, actionList[Action.DUNGEON_ENTER])")) {
    const insert = `\t// MT eligibility is verified again by POST /dungeon/mt/start under the gameplay lock.
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
`;
    const token = '\treturn availableActions;\n}';
    const idx = s.lastIndexOf(token);
    if (idx < 0 || s.indexOf(token) !== idx) throw new Error(`${F.actions}: retour final introuvable/ambigu.`);
    s = s.slice(0, idx) + insert + s.slice(idx);
  }
  return s;
});

// 4) Restore the separate MT controls on the Dinoz fiche.
modify(F.component, s => {
  const startV2 = s.indexOf('<!-- STEP_20O_MT_DUNGEON: this is navigation');
  if (startV2 >= 0) {
    const start = s.lastIndexOf('\n', startV2) + 1;
    const end = s.indexOf('<template v-for=', startV2);
    if (end < 0 || end - start > 800 || !s.slice(start,end).includes('dungeon-resume'))
      throw new Error(`${F.component}: lien V2 inattendu, aucun fichier modifié.`);
    s = s.slice(0,start) + `\t\t\t<DZDisclaimer v-if="dinozInDungeon" :content="$t('action.description.dungeon_status')" help />\n\t\t\t` + s.slice(end);
  } else if (!s.includes('dinozInDungeon" :content=')) {
    s = replaceOnce(F.component, s, '<div class="action_content">',
      `<div class="action_content">\n\t\t\t<DZDisclaimer v-if="dinozInDungeon" :content="$t('action.description.dungeon_status')" help />`);
  }
  s = s.replace('v-if="didi.currentMission"', 'v-if="!dinozInDungeon && didi.currentMission"');
  s = s.replace('v-if="leaderDinoz" @click="goToLeader()"', 'v-if="leaderDinoz && !dinozInDungeon" @click="goToLeader()"');
  if (!s.includes("import { MtDungeonService } from '../../services/mtDungeon.service.js';")) {
    s = replaceOnce(F.component,s,"import { DojoService } from '../../services/dojo.service.ts';",
      "import { DojoService } from '../../services/dojo.service.ts';\nimport { MtDungeonService } from '../../services/mtDungeon.service.js';");
  }
  const launchStart = s.indexOf('async launch(action: ActionFiche)');
  const switchStart = s.indexOf('switch (action.name)', launchStart);
  if (launchStart < 0 || switchStart < launchStart) throw new Error(`${F.component}: launch introuvable.`);
  const head = s.slice(launchStart, switchStart);
  if (!head.includes("header: action.name === Action.DUNGEON_ENTER")) {
    if (!head.includes("header: this.$t('popup.attention')"))
      throw new Error(`${F.component}: confirmation générique modifiée; adaptation manuelle requise.`);
    s = s.slice(0,launchStart) + head.replace("header: this.$t('popup.attention')",
      "header: action.name === Action.DUNGEON_ENTER ? this.$t('action.name.dungeon_enter') : this.$t('popup.attention')") + s.slice(switchStart);
  }
  const cases = `case Action.DUNGEON_ENTER: // STEP_20P_ORIGINAL_MT_ACTIONS
					try {
						await MtDungeonService.startMagneticCaverns(this.dinozId);
						try {
							const definitions = await MtDungeonService.getCatalog(String(this.localStore.getLanguage ?? 'fr'));
							const text = definitions.find(definition => definition.id === 'stepp')?.enter.text;
							if (text) this.$toast.open({ message: formatText(text), type: 'info' });
						} catch {
							// Entry already succeeded; unavailable metadata must not undo it.
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
				`;
  if (!s.includes('case Action.DUNGEON_ENTER:')) {
    // Replace the V2 action's behavior, even when Prettier reorganized its lines.
    const v2case = s.indexOf('case Action.DUNGEON:');
    const next = s.indexOf('case Action.IRMA:', v2case);
    if (v2case < 0 || next < 0 || next - v2case > 1300)
      throw new Error(`${F.component}: bloc d'action V2 absent ou modifié.`);
    s = s.slice(0,v2case) + cases + s.slice(next);
  }
  const resumeCss = s.indexOf('.dungeon-resume {');
  if (resumeCss >= 0) {
    const cssEnd = s.indexOf('.selling {', resumeCss);
    if (cssEnd < 0 || cssEnd-resumeCss>1200) throw new Error(`${F.component}: CSS V2 introuvable.`);
    s = s.slice(0,resumeCss) + s.slice(cssEnd);
  }
  if (!s.includes('dinozInDungeon(): boolean')) {
    s = replaceOnce(F.component,s, '\tcomputed: {\n\t\tdinozFullParty(): DinozFiche[] {',
      `\tcomputed: {\n\t\tdinozInDungeon(): boolean {\n\t\t\treturn this.dinoz.actions?.some(action => action.name === Action.DUNGEON) ?? false;\n\t\t},\n\t\tdinozFullParty(): DinozFiche[] {`);
  }
  return s;
});

// 5) Hide overworld movement while an active run exists; no extra experimental link.
modify(F.dinozPage, s => {
  if (s.includes('class="mt-caverns-entry"')) {
    const start = s.lastIndexOf('\n\t<div\n',s.indexOf('class="mt-caverns-entry"')) + 1;
    const end = s.indexOf('\t<div class="dinozPanels"',start);
    if (start<=0 || end<=start) throw new Error(`${F.dinozPage}: ancien lien d'entrée introuvable.`);
    s = s.slice(0,start) + s.slice(end);
  }
  const css = s.indexOf('.mt-caverns-entry {');
  if (css>=0) {
    const end = s.indexOf('.dinozPanels {',css);
    if (end<0) throw new Error(`${F.dinozPage}: bloc CSS d'entrée introuvable.`);
    s=s.slice(0,css)+s.slice(end);
  }
  if (!s.includes('import { Action }')) {
    s=replaceOnce(F.dinozPage,s,"import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';",
      "import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';\nimport { Action } from '@dinorpg/core/models/dinoz/dinozActions.js'; // STEP_20P_ORIGINAL_MT_ACTIONS");
  }
  if (!s.includes('dinozData.borderPlace = []')) {
    s=replaceOnce(F.dinozPage,s,'\t\t\tthis.dinozData = dinozData;',
      `\t\t\t// Outside-world movement is disabled for an active dungeon run.\n\t\t\tif (dinozData.actions.some(action => action.name === Action.DUNGEON)) dinozData.borderPlace = [];\n\t\t\tthis.dinozData = dinozData;`);
  }
  return s;
});

// 6) Enter only from the fiche. The interactive scene must not start a second run.
modify(F.dungeonPage,s=>{
  s=s.replace('<button type="button" :disabled="busy" @click="start">Entrer dans les Cavernes Magnétiques</button>',
    `<RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">Retour aux actions du Dinoz pour entrer</RouterLink>`);
  const start=s.indexOf('function start() {');
  if(start>=0){
    const end=s.indexOf("function move(direction: 'north' | 'south' | 'west' | 'east' | 'up' | 'down') {",start);
    if(end<0 || end-start>600)throw new Error(`${F.dungeonPage}: fonction start inattendue.`);
    s=s.slice(0,start)+s.slice(end);
  }
  return s;
});

// 7) Patch only action.description/name blocks; do not reformat 400KB locale files.
const localized = {
 FR: ['Entrer','Accéder au Plan','Vous pouvez explorer cet endroit, mais faites attention à ne pas vous y perdre !',"Voir l'évolution de l'exploration actuelle...",'Votre Dinoz est actuellement en exploration...'],
 EN: ['Enter','Check the Map','You can explore this place, but take care of not getting lost!','Check the current exploration state...','Your Dinoz is currently exploring an area...'],
 ES: ['Entrar','Consultar el mapa','Puedes explorar este lugar, ¡pero ten cuidado de no perderte!','Ver el progreso de la exploración actual...','Tu Dinoz está explorando una zona...'],
 DE: ['Betreten','Karte ansehen','Du kannst diesen Ort erkunden, aber pass auf, dass du dich nicht verirrst!','Den aktuellen Erkundungsfortschritt ansehen...','Dein Dinoz erkundet gerade ein Gebiet...']
};
for (const [locale,[enter,plan,warning,description,status]] of Object.entries(localized)) {
  const file = `app/client/src/i18n/locales/${locale}.json`;
  modify(file,s=>{
    const orig=JSON.parse(s);
    const a=orig.action;
    if(!a?.description?.build_dojo||!a?.name?.build_dojo)throw new Error(`${file}: clés action introuvables.`);
    const hits=[...s.matchAll(/^([\t ]*)"build_dojo":\s*("(?:\\.|[^"\\])*")[ \t]*,?[ \t]*$/gm)];
    if(hits.length!==2)throw new Error(`${file}: deux fins de sections action.name/description attendues, ${hits.length} trouvées.`);
    // Replace from the last existing original key to its containing object's closing brace.
    // Whitelist existing V2/20P keys so unrelated local changes cannot be erased.
    const sets=[
      { dungeon_enter:warning, dungeon:description, dungeon_status:status },
      { dungeon_enter:enter, dungeon:plan }
    ];
    for(let i=1;i>=0;i--){
      const hit=hits[i];const keyIndent=hit[1];const start=hit.index;
      const closeR=/^([\t ]*)\}[\t ]*,?[\t ]*$/gm;closeR.lastIndex=start+hit[0].length;
      let match,close=-1;
      while((match=closeR.exec(s))){
        if(match[1].length<keyIndent.length){close=match.index;break;}
      }
      if(close<0)throw new Error(`${file}: fermeture de section action introuvable.`);
      const extra=s.slice(start+hit[0].length,close);
      if(extra.replace(/^[\s,]*$/gm,'').trim()) {
        const extraKeys=[...extra.matchAll(/^\s*"([^"\n]+)"\s*:/gm)].map(m=>m[1]);
        if(extraKeys.some(k=>!['dungeon','resume_dungeon','dungeon_enter','dungeon_status'].includes(k)))
          throw new Error(`${file}: propriété inattendue après build_dojo (${extraKeys.join(', ')}). Aucun fichier modifié.`);
      }
      const entries=Object.entries(sets[i]).map(([k,v])=>`${keyIndent}"${k}": ${JSON.stringify(v)}`);
      const replacement=`${keyIndent}"build_dojo": ${hit[2]},\n${entries.join(',\n')}\n`;
      s=s.slice(0,start)+replacement+s.slice(close);
    }
    const result=JSON.parse(s);
    if(result.action.description.dungeon_enter!==warning||result.action.name.dungeon!==plan||result.action.name.dungeon_enter!==enter)
      throw new Error(`${file}: validation i18n échouée.`);
    return s;
  });
}

// 8) Ensure the V2 original message-box UI remains installed.
for(const file of [
 'app/client/src/components/dungeon/MtDungeonMessageBox.vue',
 'app/client/src/services/mtDungeon.service.ts',
 'app/client/test/unit/dungeon/mtDungeonMessageBox.test.ts'
])entry(file);
if(!entry('app/client/src/services/mtDungeon.service.ts').text.includes('getCatalog('))
  throw new Error('Service MT getCatalog absent: installation V2 incomplète. Aucun fichier modifié.');
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'step20p-payload','mtDungeonActions.test.ts');
if(!fs.existsSync(source))throw new Error('Payload de test absent (étape 20P).');
const test='packages/core/test/unit/dungeon/mtDungeonActions.test.ts';
const dest=path.resolve(root,test);
const expected=lf(fs.readFileSync(source,'utf8'));
if(fs.existsSync(dest)&&lf(fs.readFileSync(dest,'utf8'))!==expected)
  throw new Error(`${test}: fichier préexistant différent; écrasement refusé.`);

// Commit to disk only after all guards and all locale JSON parsers passed.
let count=0;
for(const [file,e] of queued){
  if(e.text===lf(e.original))continue;
  if(!check)fs.writeFileSync(path.resolve(root,file),e.crlf?e.text.replace(/\n/g,'\r\n'):e.text,'utf8');
  console.log(`${check?'CHECK':'UPDATED'} ${file}`);count++;
}
if(!fs.existsSync(dest)){
  if(!check){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,expected,'utf8');}
  console.log(`${check?'CHECK':'CREATED'} ${test}`);count++;
}
console.log(`${check?'Simulation OK':'Correctif appliqué'} : ${count} fichier(s).`);
