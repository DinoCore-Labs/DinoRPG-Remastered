import fs from 'node:fs';
const changes = new Map();
function read(path) { return changes.get(path) ?? fs.readFileSync(path,'utf8'); }
function set(path,s) { changes.set(path,s); }
function once(s,needle,replacement,label) {const n=s.split(needle).length-1;if(n!==1)throw Error(`${label}: attendu 1 ancrage, trouvé ${n}; aucun fichier modifié`);return s.replace(needle,replacement)}
const core='packages/core/src/models/dungeon/dungeon.guardianTrial.ts';
let s=read(core);
s=once(s,"\tif (!/^stepp_[0-3]$/.test(session.mapId) || definition.id !== 'stepp')\n\t\tthrow new Error('Trial guardian fights are restricted to Magnetic Caverns.');", "\tif (!session.mapId.startsWith(`${definition.id}_`) || !definition.monsters.length)\n\t\tthrow new Error('Invalid original MT guardian monster roster.');",'restrictions stepp core');
set(core,s);
const svc='app/server/src/Dungeon/Service/mtDungeonGuardianTrial.service.ts';
s=read(svc);
s=once(s,"\t\t\tdefinition: archive.definition('stepp')","\t\t\tdefinition: archive.definition(session.mapId.slice(0, session.mapId.lastIndexOf('_')))",'definition combat gardien');
s=once(s,"\tensureEnabled();\n\tconst session = await mtDungeonDependencies().repository.load(identity);","\tconst session = await mtDungeonDependencies().repository.load(identity);",'preview gardien');
s=once(s,"getMtDungeonArchive().definition('stepp').enter.place","getMtDungeonArchive().definition(session.mapId.slice(0, session.mapId.lastIndexOf('_'))).enter.place",'lieu combat gardien');
set(svc,s);
const page='app/client/src/pages/DungeonPage.vue';s=read(page);
// Clear legacy developer-only hints and test controls. Combat buttons remain available through regular actions.
s=s.replace(/\n\s*<p class="mt-test__caption">\s*PixiJS[\s\S]*?<\/p>/,'');
s=s.replace(/\n\s*<p class="mt-test__caption">\s*Clavier :[\s\S]*?<\/p>/,'');
s=s.replace(/\n\s*<details v-if="view" class="mt-test__details">\s*<summary>\{\{ \$t\('dungeon\.diagnostics'\) \}\}<\/summary>[\s\S]*?<\/details>/,'');
s=s.replace(/\n\s*<p v-if="guardianTrial" class="mt-test__caption">[\s\S]*?<\/p>/,'');
s=s.replace(/\n\s*<p class="mt-test__caption">\s*Le combat utilise le moteur Remastered[\s\S]*?<\/p>/,'');
s=s.replace(/\n\s*<button\s+v-if="session\.pending\.kind === 'guardian' && devCapabilities\?\.guardianSkip"[\s\S]*?<\/button>/,'');
s=s.replace(/\n\s*<p v-if="encounter\?\.status" class="mt-test__caption">[\s\S]*?<\/p>/,'');
s=s.replace(/\n\s*<p v-if="!actionAvailable" class="mt-test__caption">[\s\S]*?<\/p>/,'');
// Remove dev-only API calls from the page; retain actual fight functionality.
s=s.replace(/\n\s*await loadDevCapabilities\(\);/,'');
s=s.replace(/\nasync function loadGuardianTrial\([\s\S]*?\nfunction fightGuardian\(/,'\nfunction fightGuardian(');
s=s.replace(/\nasync function loadDevCapabilities\([\s\S]*?\nfunction evacuateDefeated\(/,'\nfunction evacuateDefeated(');
s=s.replace(/\n\s*await loadGuardianTrial\([^;]*\);/g,'');
s=s.replace(/\nconst guardianTrial = ref<[^;]+;/,'');
s=s.replace(/\nconst devCapabilities = ref<[^;]+;/,'');
s=s.replace(/\n\s*guardianTrial\.value = null;/g,'');
// Clean unused types, guards, and calls where present.
s=s.replace(/^\s*type MtGuardianTrialPreview,\n/m,'').replace(/^\s*type MtDungeonDevCapabilities,\n/m,'');
s=s.replace(/\n\s*if \(session\.value\?\.pending\?\.kind === 'guardian' && devCapabilities[^\n]+\n/g,'\n');
set(page,s);
const route='app/server/src/Dungeon/Routes/mtDungeon.routes.ts';s=read(route);
const start=s.indexOf('\t// These routes are NOT present unless explicitly opted in on a development server.');
const end=s.indexOf('\n\t/** Real MT door guardian fight;',start);
if(start<0||end<0)throw Error('Routes dev: ancrages absents, aucun fichier modifié');
s=s.slice(0,start)+s.slice(end);
// Dev-only imports are no longer required.
s=s.replace(/^import \{[^}]*\} from '\.\.\/Service\/mtDungeonDevTools\.service\.js';\n/m, '');
s=s.replace(/\s*getMtGuardianTrialPreview,\n/, '\n').replace(/\s*mtDungeonGuardianTrialEnabled,\n/, '\n');
set(route,s);
// Abort with no writes on any missing expected anchor.
for(const [p,content] of changes){ if(!content.includes('\n'))throw Error(`Invalid result: ${p}`) }
for(const [p,content] of changes)fs.writeFileSync(p,content);
console.log(`Étape 32 appliquée : ${changes.size} fichiers modifiés.`);
