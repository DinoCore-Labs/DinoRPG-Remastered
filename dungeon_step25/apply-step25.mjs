import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const loc=(p)=>path.join(root,p);
const pageOld='app/client/src/pages/MtMagneticCavernsPage.vue';
const pageNew='app/client/src/pages/DungeonPage.vue';
const routerFile='app/client/src/router/index.ts';
const actionsFile='app/client/src/components/dinoz/DinozActions.vue';
const serviceFile='app/client/src/services/mtDungeon.service.ts';
const frFile='app/client/src/i18n/locales/FR.json';
const files=[pageOld,routerFile,actionsFile,serviceFile,frFile];
for(const file of files)if(!fs.existsSync(loc(file)))throw new Error(`Fichier introuvable : ${file}. Lance depuis la racine du projet.`);
const original=Object.fromEntries(files.map(p=>[p,fs.readFileSync(loc(p),'utf8')]));
const once=(source,find,replace,label)=>{const count=source.split(find).length-1;if(count!==1)throw new Error(`${label}: attendu une occurrence, trouvé ${count}`);return source.replace(find,replace)};
const replaceRegex=(source,re,change,label)=>{const a=[...source.matchAll(new RegExp(re.source,re.flags.includes('g')?re.flags:re.flags+'g'))];if(a.length!==1)throw new Error(`${label}: attendu 1 correspondance, trouvé ${a.length}`);return source.replace(re,change)};
if(fs.existsSync(loc(pageNew)))throw new Error('DungeonPage.vue existe déjà : installateur non destructif.');
let page=original[pageOld];
page=once(page,'aria-label="Exploration des Cavernes Magnétiques"',':aria-label="$t(\'dungeon.exploration\')"','aria');
page=replaceRegex(page,/<header class="mt-test__header">[\s\S]*?<\/header>/,`<header class="mt-test__header">
            <TitleHeader :title="dungeonName" :header="dungeonName" />
            <DZDisclaimer v-if="session" :content="'dungeon.disclaimer'" :params="{ dinoz: dinozName, dungeonName }" help />
            <RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">{{ $t('dungeon.backToDinoz') }}</RouterLink>
        </header>`,'header');
page=replaceRegex(page,/<p v-if="!isMagnetic" class="mt-test__notice">[\s\S]*?<\/p>\s*<template v-else>/,`<template>`, 'restriction stepp');
page=once(page,"title: 'Les Cavernes Magnétiques',","title: dungeonName.value,",'entry title');
page=once(page,"const isMagnetic = computed(() => session.value?.mapId.startsWith('stepp_') ?? false);",`const dungeonId = computed(() => session.value?.mapId.replace(/_[0-9]+$/, '') ?? '');
const dungeonName = computed(() => catalog.value.find(entry => entry.id === dungeonId.value)?.name || dungeonId.value || t('dungeon.title'));
const dinozName = ref('');
const catalog = ref<MtDungeonCatalogEntry[]>([]);`,'isMagnetic');
page=once(page,"const latestView = current.mapId.startsWith('stepp_') ? await MtDungeonService.getView(leaderId) : null;","const latestView = await MtDungeonService.getView(leaderId);",'vue toutes cartes');
page=once(page,"const definition = (await MtDungeonService.getCatalog(language.value)).find(value => value.id === 'stepp');","const definition = catalog.value.find(value => value.id === dungeonId.value);",'intro catalogue');
page=once(page,"if (route.query.mtEntry === '1' && session.value?.mapId.startsWith('stepp_')) {","if (route.query.mtEntry === '1' && session.value) {",'entree generic');
page=once(page,"import { computed, onBeforeUnmount, onMounted, ref } from 'vue';","import { computed, onBeforeUnmount, onMounted, ref } from 'vue';\nimport { useI18n } from 'vue-i18n';\nimport TitleHeader from '../components/utils/TitleHeader.vue';\nimport DZDisclaimer from '../components/utils/DZDisclaimer.vue';",'imports');
page=once(page,"type MtDungeonCurrentView,","type MtDungeonCurrentView,\n\ttype MtDungeonCatalogEntry,",'type catalogue');
page=once(page,"const route = useRoute();","const { t } = useI18n();\nconst route = useRoute();",'i18n');
page=once(page,"const leaderId = Number(route.params.id);","const leaderId = Number(route.params.id);\n// Always use the authoritative active session; route parameters never select map content.", 'id route');
page=once(page,"const leader = await DinozService.getDinozFiche(leaderId, { silent: true });","const leader = await DinozService.getDinozFiche(leaderId, { silent: true });\n        dinozName.value = String(leader.name || leader.display || leaderId);",'dinoz name');
page=once(page,"await refresh();\n\t\tawait loadDevCapabilities();","await refresh();\n        try { catalog.value = await MtDungeonService.getCatalog(language.value); } catch { /* API indisponible : afficher l'identifiant sans inventer de nom */ }\n\t\tawait loadDevCapabilities();",'onMounted');
// All text directly in the page UI is moved under dungeon.*. Original MT encounter text remains supplied by the server.
const translations={
 'Chargement du donjon…':'loading',
 'Entre dans le donjon depuis les Pylônes de Magnétite avec un groupe disponible.':'enterFromWorld',
 'Les conditions d’accès et la position des Dinoz sont vérifiées côté serveur.':'entryValidated',
 'Les conditions d\'accès et la position des Dinoz sont vérifiées côté serveur.':'entryValidated',
 'Retour aux actions du Dinoz pour entrer':'enterReturn',
 'Donjon terminé':'completed',
 'Retour à la surface':'returnSurface',
 'Votre progression a été sauvegardée. Aucune récompense de fin supplémentaire n’est attribuée.':'progressSaved',
 "Votre progression a été sauvegardée. Aucune récompense de fin supplémentaire n'est attribuée.":'progressSaved',
 'Retour à la fiche du Dinoz':'backToDinozShort',
 'Informations sur l’exploration':'explorationInfo',
 "Informations sur l'exploration":'explorationInfo',
 'Tous les Dinoz sont KO. Le groupe doit quitter le donjon pour pouvoir être ressuscité.':'allKo',
 'Le chef du groupe est KO : évacuation nécessaire avant de reprendre l’exploration.':'leaderKo',
 'Évacuer le groupe KO':'evacuate',
 'Chargement de la vue…':'loadingView',
 'Actualiser la vue':'refreshView',
 'Aucun texte découvert pour le moment.':'noDiscoveries',
 'Actualiser les découvertes':'refreshDiscoveries',
 'Diagnostics de fidélité':'diagnostics',
 'Journal momentanément indisponible.':'journalUnavailable'
};
for(const [source,key] of Object.entries(translations)){page=page.split('>'+source+'<').join('>{{ $t(\'dungeon.'+key+'\') }}<')}
page=page.replace(/\{\{ exitOutcome\.kind === 'complete' \? 'Donjon terminé' : 'Retour à la surface' \}\}/,"{{ $t(exitOutcome.kind === 'complete' ? 'dungeon.completed' : 'dungeon.returnSurface') }}");
page=page.replace(/const stage = computed\(\(\) => Number\(session\.value\?\.mapId\.split\('_'\)\[1\] \?\? 0\)\);/,"const stage = computed(() => Number(session.value?.mapId.match(/_([0-9]+)$/)?.[1] ?? 0));");
let router=original[routerFile];
router=once(router,"import MtMagneticCavernsPage from '../pages/MtMagneticCavernsPage.vue';","import DungeonPage from '../pages/DungeonPage.vue';",'router import');
router=once(router,"path: '/dinoz/:id/dungeon/stepp',\n\t\t\t\tname: 'MtMagneticCavernsPage',\n\t\t\t\tcomponent: MtMagneticCavernsPage,","path: '/dinoz/:id/dungeon',\n\t\t\t\tname: 'DungeonPage',\n\t\t\t\tcomponent: DungeonPage,",'router route');
// Old links redirect to the new generic route, preserving historical bookmarks.
router=once(router,"path: '/dinoz/:id',\n\t\t\t\tname: 'DinozPage',", "path: '/dinoz/:id/dungeon/stepp',\n                redirect: to => ({ name: 'DungeonPage', params: { id: to.params.id } })\n            },\n            {\n                path: '/dinoz/:id',\n\t\t\t\tname: 'DinozPage',",'ancien url');
let action=original[actionsFile];
action=once(action,"name: 'MtMagneticCavernsPage',","name: 'DungeonPage',",'action route');
// Allow dungeon ID supplied by the canonical action; if missing do not guess one from a place.
// The current entry-action backend is stepp-specific, so keep the entry logic intact here.
let service=original[serviceFile];
service=replaceRegex(service,/startMagneticCaverns\(id: number\): Promise<MtDungeonSession> \{\s*return api\.post\('\/dungeon\/mt\/start', \{ leaderDinozId: id, dungeonId: 'stepp' \}\);\s*\},/,"startDungeon(id: number, dungeonId: string): Promise<MtDungeonSession> {\n        return api.post('/dungeon/mt/start', { leaderDinozId: id, dungeonId });\n    },\n    startMagneticCaverns(id: number): Promise<MtDungeonSession> {\n        return this.startDungeon(id, 'stepp');\n    },",'service start');
const fr=JSON.parse(original[frFile]);
if(fr.dungeon)throw new Error('FR.json possède déjà une section dungeon : pas de fusion automatique destructive.');
fr.dungeon={
 title:'Donjon',exploration:'Exploration du donjon',
 disclaimer:'**{dinoz}** explore actuellement **{dungeonName}**. Ce Dinoz sera capable d’en sortir seulement s’il retrouve l’entrée, la sortie ou s’il meurt.',
 backToDinoz:'← Revenir à la fiche du Dinoz',backToDinozShort:'Retour à la fiche du Dinoz',
 loading:'Chargement du donjon…',enterFromWorld:'Entre dans le donjon depuis son lieu d’accès avec un groupe disponible.',entryValidated:'Les conditions d’accès et la position des Dinoz sont vérifiées côté serveur.',enterReturn:'Retour aux actions du Dinoz pour entrer',completed:'Donjon terminé',returnSurface:'Retour à la surface',progressSaved:'Votre progression a été sauvegardée. Aucune récompense de fin supplémentaire n’est attribuée.',explorationInfo:'Informations sur l’exploration',allKo:'Tous les Dinoz sont KO. Le groupe doit quitter le donjon pour pouvoir être ressuscité.',leaderKo:'Le chef du groupe est KO : évacuation nécessaire avant de reprendre l’exploration.',evacuate:'Évacuer le groupe KO',loadingView:'Chargement de la vue…',refreshView:'Actualiser la vue',noDiscoveries:'Aucun texte découvert pour le moment.',refreshDiscoveries:'Actualiser les découvertes',diagnostics:'Diagnostics de fidélité',journalUnavailable:'Journal momentanément indisponible.'
};
// Preserve the exact wording demanded by the user, including bold markdown markers.
fr.dungeon.disclaimer='**{dinoz}** explore actuellement **{dungeonName}**. Ce Dinoz sera capable d’en sortir seulement s’il retrouve l’entrée, la sortie ou s’il meurt.';
// Check the payload before writing anything.
if(!page.includes('<MtOriginalDungeonCanvas')||!page.includes('DZDisclaimer')||!page.includes('TitleHeader'))throw new Error('Canvas/header/disclaimer absent après transformation');
if(page.includes('isMagnetic'))throw new Error('Ancienne restriction isMagnetic non supprimée');
const updates={[routerFile]:router,[actionsFile]:action,[serviceFile]:service,[frFile]:JSON.stringify(fr,null,'\t')+'\n'};
// FR.json reformatted structurally by JSON serialization; no locale values changed except dungeon.*.
for(const [p,v] of Object.entries(updates))fs.writeFileSync(loc(p),v);
fs.writeFileSync(loc(pageNew),page);
fs.unlinkSync(loc(pageOld));
console.log('Étape 25 installée : DungeonPage.vue, route générique et traduction FR.');
