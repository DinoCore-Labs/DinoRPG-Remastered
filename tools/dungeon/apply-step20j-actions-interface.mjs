/** 20J v3 - MT action lock + original interface; robust against Vue formatting. */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const check = process.argv.includes('--check');
const plan = new Map();
// Compatible with existing 20I variations and CRLF/Prettier formatting.
// All replacements remain fail-closed if the intended method cannot be identified.
function insertActionGateInFunction(s, name, variable, p) {
  const starts = [...s.matchAll(new RegExp('export async function ' + name + '\\b', 'g'))];
  if (starts.length !== 1) throw new Error(`${p}: fonction ${name} absente ou ambiguë (${starts.length})`);
  const start = starts[0].index;
  const endAt = s.indexOf('\nexport ', start + 1);
  const end = endAt < 0 ? s.length : endAt;
  const part = s.slice(start, end);
  const gate = 'if (deps.assertPartyActions) await deps.assertPartyActions(identity);';
  if (part.includes(gate)) return s;
  const re = new RegExp(String.raw`^([ \t]*)const\s+` + variable + String.raw`\s*=\s*deps\s*\.\s*getConfiguration\s*\(\s*run\s*\.\s*mapId\s*\)\s*;`, 'gm');
  const matches = [...part.matchAll(re)];
  if (matches.length !== 1) throw new Error(`${p}: emplacement du verrouillage ${name} introuvable ou ambigu (${matches.length})`);
  const target = start + matches[0].index;
  return s.slice(0, target) + matches[0][1] + gate + '\n' + s.slice(target);
}
/** Close only the MT status details after its unique "Clés MT" row. */
function closeMtStatusDetails(s, p) {
  const key = '<span>Clés MT récupérées : {{ session.keys.filter(Boolean).length }}</span>';
  const i = s.indexOf(key);
  if (i < 0 || s.indexOf(key, i + key.length) >= 0)
    throw new Error(`${p}: ligne des clés introuvable ou ambiguë`);
  const tail = s.slice(i + key.length);
  // Preserve the actual indentation and line ending of the user's Vue file.
  const m = /^(\r?\n[ \t]*)<\/(div|details)>/.exec(tail);
  if (!m) throw new Error(`${p}: fermeture du panneau des clés introuvable`);
  if (m[2] === 'details') return s;
  if (!s.includes('<details class="mt-test__status">'))
    throw new Error(`${p}: ouverture du panneau MT non reconnue`);
  const end = i + key.length + m[1].length;
  return s.slice(0,end) + '</details>' + s.slice(end+'</div>'.length);
}

/** Inject controls in the unique current dungeon viewport, regardless of indentation. */
function addOriginalControlsToViewport(s, snippet, p) {
  if (/class=["']mt-test__original-controls(?:\s|["'])/.test(s)) return s;
  const opening = '<div class="mt-test__viewport">';
  const start = s.indexOf(opening);
  if (start < 0 || s.indexOf(opening, start + opening.length) >= 0)
    throw new Error(`${p}: viewport MT absent ou ambigu`);
  const placeholder = s.indexOf('class="mt-test__placeholder"', start + opening.length);
  if (placeholder < 0 || placeholder - start > 2500)
    throw new Error(`${p}: placeholder absent du viewport MT`);
  const placeholderClose = s.indexOf('</div>', placeholder);
  if (placeholderClose < 0) throw new Error(`${p}: placeholder non fermé`);
  const parent = /^(\r?\n)([ \t]*)<\/div>/.exec(s.slice(placeholderClose + '</div>'.length));
  if (!parent) throw new Error(`${p}: fermeture directe du viewport MT introuvable`);
  const end = placeholderClose + '</div>'.length + parent[1].length;
  const indent = parent[2];
  // New elements are siblings of the canvas/placeholder (within viewport).
  const rows = snippet.replace(/^\r?\n/, '').split('\n');
  const nonEmpty = rows.filter(row => row.trim());
  const prefix = Math.min(...nonEmpty.map(row => (row.match(/^[ \t]*/) || [''])[0].length));
  const indented = rows.map(row => indent + '\t' + row.slice(prefix)).join('\n');
  return s.slice(0,end) + indented + '\n' + s.slice(end);
}

function insertAfterUniqueCall(s, call, textToInsert, p) {
  const matches = [...s.matchAll(new RegExp('^([ \t]*)' + call + '[ \t]*$', 'gm'))];
  if (matches.length !== 1) throw new Error(`${p}: appel introuvable ou ambigu (${matches.length}): ${call}`);
  const m = matches[0];
  const tail = s.slice(m.index + m[0].length);
  if (/^\r?\n[ \t]*await loadVisualParty\(\);/.test(tail)) return s;
  return s.slice(0,m.index + m[0].length) + '\n' + m[1] + textToInsert + tail;
}

function file(p) { return resolve(root,p); }
function edit(p,fn) {
  if (!existsSync(file(p))) throw new Error(`${p}: introuvable. Décompresser à la racine du projet.`);
  const source = plan.get(p) ?? readFileSync(file(p),'utf8');
  const crlf = source.includes('\r\n');
  const normalized = source.replace(/\r\n/g,'\n');
  const updated = fn(normalized,p);
  plan.set(p, crlf ? updated.replace(/\n/g,'\r\n') : updated);
}
function replace(s,oldValue,newValue,p) {
  if (s.includes(newValue)) return s;
  const n=s.split(oldValue).length-1;
  if(n!==1) throw new Error(`${p}: ancrage manquant ou ambigu (${n}): ${oldValue.slice(0,90)}`);
  return s.replace(oldValue,newValue);
}
function insert(s,anchor,addition,marker,p) {
  if(s.includes(marker)) return s;
  return replace(s,anchor,addition+anchor,p);
}

const actionGateService='app/server/src/Dungeon/Service/mtDungeonActionGate.service.ts';
const guard = `/** Runtime, server-authoritative movement lock: one spent action blocks the entire group. */
import { evaluateMtDungeonActionGate } from '@dinorpg/core/models/dungeon/dungeon.actionGate.js';
import { prisma } from '../../prisma.js';
import { MtDungeonSessionError, type MtSessionIdentity } from './mtDungeonSession.service.js';

export async function assertMtDungeonPartyActions(identity: MtSessionIdentity): Promise<void> {
  const members = await prisma.dinoz.findMany({
    where: {
      userId: identity.userId,
      OR: [{ id: identity.leaderDinozId }, { leaderId: identity.leaderDinozId }]
    },
    select: { id: true, leaderId: true, life: true, fight: true }
  });
  const state = evaluateMtDungeonActionGate(members, identity.leaderDinozId);
  if(state === 'ready') return;
  if(state === 'actions-exhausted') throw new MtDungeonSessionError('actions-exhausted');
  if(state === 'party-defeated') throw new MtDungeonSessionError('party-defeated');
  throw new MtDungeonSessionError('invalid-run');
}
`;
const actionIrmaService='app/server/src/Dungeon/Service/mtDungeonIrma.service.ts';
// New domain service is shipped next to the installer; refuse overwriting edited versions.
const irmaService = readFileSync(resolve(import.meta.dirname, '../../app/server/src/Dungeon/Service/mtDungeonIrma.service.ts'),'utf8');
const oldIrma = existsSync(file(actionIrmaService)) ? readFileSync(file(actionIrmaService),'utf8') : null;
if (oldIrma !== null && oldIrma !== irmaService) throw new Error(`${actionIrmaService}: fichier existant différent, aucun écrasement`);
plan.set(actionIrmaService, irmaService);
const oldGuard = existsSync(file(actionGateService)) ? readFileSync(file(actionGateService),'utf8') : null;
if(oldGuard !== null && oldGuard !== guard) throw new Error(`${actionGateService}: fichier existant différent, aucun écrasement`);
plan.set(actionGateService,guard);

edit('app/server/src/Dungeon/Service/mtDungeonSession.service.ts',(s,p)=>{
  s=insert(s, '\t/** Transactional IGold pickup;', '\t/** Authoritative action status (fight action required for all party members). */\n\tassertPartyActions?(identity: MtSessionIdentity): Promise<void>;\n', 'assertPartyActions?(identity: MtSessionIdentity)',p)
    .replace('  /** Authoritative action status', '\t/** Authoritative action status')
    .replace('\n  assertPartyActions?', '\n\tassertPartyActions?');
  // Follow same indentation as the existing interface, including tabs, not spaces
  s=s.replace(/\n\t\/\*\* Authoritative action status.*?\n\tassertPartyActions\?/,'\n\t/** Authoritative action status (fight action required for all party members). */\n\tassertPartyActions?');
  // Do not anchor to TWO adjacent source lines: the user's branch may contain
  // intervening guards and/or a different layout after earlier steps.
  s=insertActionGateInFunction(s, 'submitMtDungeonCommands', 'cfg', p);
  s=insertActionGateInFunction(s, 'moveMtDungeonToAdjacentStage', 'current', p);
  s=replace(s,
    "'invalid-run' | 'invalid-identity'",
    "'invalid-run' | 'invalid-identity' | 'actions-exhausted' | 'party-defeated'",p);
  return s;
});
edit('app/server/src/Dungeon/Service/mtDungeonRuntime.service.ts',(s,p)=>{
  s=insert(s,
    "import { MtDungeonArchive } from './mtDungeonArchive.service.js';",
    "import { assertMtDungeonPartyActions } from './mtDungeonActionGate.service.js';\n",
    "import { assertMtDungeonPartyActions }",p);
  return replace(s,
    '\t\tloadProgress: loadMtDungeonProgress,',
    '\t\tloadProgress: loadMtDungeonProgress,\n\t\tassertPartyActions: assertMtDungeonPartyActions,',p);
});
edit('app/server/src/Dungeon/Routes/mtDungeon.routes.ts',(s,p)=>{
  s=insert(s, "import { MtDungeonGoldError } from '../Service/mtDungeonGold.service.js';",
    "import { MtDungeonIrmaError, useMtDungeonIrma } from '../Service/mtDungeonIrma.service.js';\n",
    "import { MtDungeonIrmaError, useMtDungeonIrma }",p);
  s=replace(s,
    "error.code === 'conflict' || error.code === 'already-exists' ? 409 : 400;",
    "error.code === 'conflict' || error.code === 'already-exists' || error.code === 'actions-exhausted' || error.code === 'party-defeated' ? 409 : 400;",p);
  const route= `	/** Restore exactly one MT dungeon fight action per exhausted member, consuming physical Irma items. */
	app.post('/:leaderDinozId/actions/irma', { preHandler: app.authenticate }, async (req, reply) => {
		const params = leaderIdSchema.safeParse((req.params as { leaderDinozId: unknown }).leaderDinozId);
		const body = z.object({ revision: z.number().int().nonnegative() }).strict().safeParse(req.body);
		if (!params.success || !body.success) return reply.code(400).send({ code: 'invalid-irma-request' });
		try {
			return reply.send(await useMtDungeonIrma({ userId: req.user.id, leaderDinozId: params.data }, body.data.revision));
		} catch (error) {
			if (error instanceof MtDungeonIrmaError) return reply.code(error.code === 'not-found' ? 404 : 409).send({ code: error.code });
			throw error;
		}
	});

`;
  return insert(s,
    "	/** Allow recovery of an already-defeated party",
    route, "app.post('/:leaderDinozId/actions/irma'",p);
});

// The generic Irma endpoint uses remaining actions before items. While a dungeon is active
// force its dedicated transactional endpoint so restoring movement always consumes real potions.
edit('app/server/src/Dinoz/Service/useIrma.service.ts',(s,p)=>{
  s=replace(s,
    '\t\t\tid: true,\n\t\t\tremaining: true,',
    '\t\t\tid: true,\n\t\t\tleaderId: true,\n\t\t\tremaining: true,',p);
  return insert(s,
    '\tconst team = [dinoz, ...(dinoz.followers ?? [])];',
    `\tconst activeMtDungeon = await prisma.mtDungeonRun.findFirst({
\t\twhere: { userId, leaderDinozId: dinoz.leaderId ?? dinozId }, select: { id: true }
\t});
\tif (activeMtDungeon) throw new ExpectedError('useDungeonIrma', { statusCode: 409 });
`,
    "if (activeMtDungeon) throw new ExpectedError('useDungeonIrma'",p);
});

// MT graphics (already in the repository; no fabricated icons): 24x20 arrows, 24x31 Irma.
edit('app/client/src/services/mtDungeon.service.ts',(s,p)=>insert(s,
  '	getSession(id: number): Promise<MtDungeonSession> {',
  `	useDungeonIrma(id: number, revision: number): Promise<{ used: number; stock: number }> {
		return api.post(\`/dungeon/mt/\${id}/actions/irma\`, { revision });
	},
`, 'useDungeonIrma(id: number',p));

edit('app/client/src/pages/MtMagneticCavernsPage.vue',(s,p)=>{
  s=replace(s, 'Exploration expérimentale — cartes et graphismes d\'origine Motion Twin',
    'Exploration des Cavernes Magnétiques',p);
  s=replace(s,
    '<div class="mt-test__status">',
    '<details class="mt-test__status"><summary>Informations sur l\'exploration</summary>',p);
  s=closeMtStatusDetails(s,p);
  s=addOriginalControlsToViewport(s, `					<div v-if="view && !partyDefeated" class="mt-test__original-controls" aria-label="Commandes originales du donjon">
						<button v-if="partyNeedsIrma" class="mt-test__original-irma" type="button" :disabled="busy || !partyActionsLoaded" aria-label="Utiliser Irma pour restaurer les actions du groupe" title="Restaurer les actions du groupe" @click="restoreDungeonActions">
							<img src="/dungeon/mt/interf_irma.png" alt="Potion d'Irma" />
						</button>
						<template v-else>
							<button class="mt-test__original-dir mt-test__original-up" type="button" :disabled="cannotMove" aria-label="Nord" @click="move('north')"><img src="/dungeon/mt/interf_arrow.png" alt="" /></button>
							<button class="mt-test__original-dir mt-test__original-left" type="button" :disabled="cannotMove" aria-label="Ouest" @click="move('west')"><img src="/dungeon/mt/interf_arrow.png" alt="" /></button>
							<button class="mt-test__original-dir mt-test__original-right" type="button" :disabled="cannotMove" aria-label="Est" @click="move('east')"><img src="/dungeon/mt/interf_arrow.png" alt="" /></button>
							<button class="mt-test__original-dir mt-test__original-down" type="button" :disabled="cannotMove" aria-label="Sud" @click="move('south')"><img src="/dungeon/mt/interf_arrow.png" alt="" /></button>
							<button v-if="stairDirections.includes('up')" class="mt-test__original-stair mt-test__original-stair-up" type="button" :disabled="cannotMove" aria-label="Escalier vers le haut" @click="move('up')"><img src="/dungeon/mt/interf_stair_up.png" alt="" /></button>
							<button v-if="stairDirections.includes('down')" class="mt-test__original-stair mt-test__original-stair-down" type="button" :disabled="cannotMove" aria-label="Escalier vers le bas" @click="move('down')"><img src="/dungeon/mt/interf_stair_down.png" alt="" /></button>
						</template>
					</div>
					<div v-if="view && partyNeedsIrma && !partyDefeated" class="mt-test__irma-hint" role="status">Actions épuisées : utilisez Irma pour continuer.</div>
					<div v-if="view" class="mt-test__original-level">Niveau -{{ session.position.l + 1 }}</div>`,p);
  // Remove secondary arrow panel but keep refresh button under viewport and keyboard documentation.
  const controlsStart='\t\t\t\t<div class="mt-test__controls" aria-label="Déplacements dans le donjon">';
  const controlsEnd='\n\t\t\t\t<p class="mt-test__caption">\n\t\t\t\t\tClavier :';
  const a=s.indexOf(controlsStart), b=s.indexOf(controlsEnd,a);
  if (a>=0 && b>a) {
    s=s.slice(0,a)+ '\t\t\t\t<button class="mt-test__refresh" type="button" :disabled="busy" @click="refresh">Actualiser la vue</button>'+s.slice(b);
  } else if (!s.includes('class="mt-test__refresh"')) throw new Error(`${p}: impossible de localiser les anciennes commandes`);
  s=replace(s,
    "const visualMembers = ref<{ id: number; display: string; life: number }[]>([]);",
    "const visualMembers = ref<{ id: number; display: string; life: number; fight: boolean; remaining: number }[]>([]);\nconst partyActionsLoaded = ref(false);",p);
  s=replace(s,
    "\t\t\t{ id: leader.id, display: leader.display, life: leader.life },\n\t\t\t...followers.map(follower => ({ id: follower.id, display: follower.display, life: follower.life }))",
    "\t\t\t{ id: leader.id, display: leader.display, life: leader.life, fight: leader.fight, remaining: leader.remaining },\n\t\t\t...followers.map(follower => ({ id: follower.id, display: follower.display, life: follower.life, fight: follower.fight, remaining: follower.remaining }))",p);
  s=replace(s,
    '\t\t];\n\t} catch {\n\t\t// Actor data is decorative; never block authoritative exploration.\n\t\tvisualMembers.value = [];\n\t}\n}',
    '\t\t];\n\t\tpartyActionsLoaded.value = true;\n\t} catch {\n\t\t// Navigation fails closed when the server-side party action state is unknown.\n\t\tvisualMembers.value = [];\n\t\tpartyActionsLoaded.value = false;\n\t}\n}',p);
  s=insert(s,
    'const cannotMove = computed(',
    `const partyNeedsIrma = computed(() => partyActionsLoaded.value && visualMembers.value.some(dinoz => dinoz.life > 0 && !dinoz.fight));
`, 'const partyNeedsIrma = computed(',p);
  s=replace(s,
    '\t\tpartyDefeated.value ||\n\t\tbusy.value ||',
    '\t\tpartyDefeated.value ||\n\t\tpartyNeedsIrma.value ||\n\t\t!partyActionsLoaded.value ||\n\t\tbusy.value ||',p);
  s=replace(s,
    '\t\tawait loadGuardianTrial(current);\n\t\tif (latestView) await loadJournal();',
    '\t\tawait loadGuardianTrial(current);\n\t\tawait loadVisualParty();\n\t\tif (latestView) await loadJournal();',p);
  // Refresh party actions after modifications (including combat returns and item use).
  s=insertAfterUniqueCall(s, 'await loadGuardianTrial\\(next\\);', 'await loadVisualParty();', p);
  s=insert(s,
    "function start() {",
    `function restoreDungeonActions(): void {
	if (!session.value || !partyNeedsIrma.value || partyDefeated.value) return;
	void execute(async () => {
		const paid = await MtDungeonService.useDungeonIrma(leaderId, session.value!.revision);
		await loadVisualParty();
		if (!partyActionsLoaded.value || partyNeedsIrma.value) {
			throw new Error('Une action reste indisponible : vérifiez les Dinoz du groupe.');
		}
		notice.value = \`\${paid.used} Potion(s) d'Irma consommée(s). Exploration reprise.\`;
	});
}
`, 'function restoreDungeonActions(): void {',p);
  s=insert(s,
    '.mt-test__viewport {',
    `.mt-test__original-controls {
	position: absolute;
	z-index: 20;
	left: 5px;
	top: 5px;
	width: 90px;
	height: 92px;
	pointer-events: none;
}
.mt-test__original-controls button {
	position: absolute;
	border: 0;
	padding: 0;
	background: transparent;
	line-height: 0;
	pointer-events: auto;
	filter: drop-shadow(0 1px 2px #241c0a);
}
.mt-test__original-controls button:disabled { opacity: 0.35; cursor: not-allowed; }
.mt-test__original-controls button:not(:disabled):hover { filter: drop-shadow(0 0 5px #eee883); }
.mt-test__original-dir { width: 24px; height: 24px; }
.mt-test__original-dir img { width: 24px; height: 20px; }
.mt-test__original-up { top: 0; left: 31px; }
.mt-test__original-left { top: 30px; left: 0; }
.mt-test__original-right { top: 30px; left: 62px; }
.mt-test__original-down { top: 58px; left: 31px; }
.mt-test__original-up img { transform: rotate(-90deg); }
.mt-test__original-left img { transform: rotate(180deg); }
.mt-test__original-right img { transform: rotate(0deg); }
.mt-test__original-down img { transform: rotate(90deg); }
.mt-test__original-stair { top: 29px; }
.mt-test__original-stair-up { left: 33px; }
.mt-test__original-stair-down { left: 56px; }
.mt-test__original-stair img { width: 24px; height: 28px; }
.mt-test__original-irma { top: 17px; left: 27px; }
.mt-test__original-irma img { width: 24px; height: 31px; image-rendering: auto; }
.mt-test__irma-hint { position: absolute; top: 84px; left: 7px; z-index: 20; max-width: 170px; padding: 3px 5px; font-size: 11px; background: #261f11df; color: #fff0b3; border-radius: 3px; }
.mt-test__original-level { position: absolute; right: 8px; bottom: 5px; z-index: 20; color: #f5eccb; font-size: 17px; font-weight: 600; text-shadow: 1px 2px 2px #000, -1px -1px 2px #000; pointer-events: none; }
.mt-test__refresh { font-size: 0.72rem; }
`, '.mt-test__original-controls {\n',p);
  return s;
});

// Every edit is validated before writing any file, including the new server service.
for (const [p,data] of plan) {
  if (typeof data !== 'string' || !data.trim()) throw new Error(`${p}: contenu invalide`);
}
const changed = [...plan].filter(([p,data]) => !existsSync(file(p)) || readFileSync(file(p),'utf8')!==data).map(([p])=>p);
if (!check) for(const p of changed){mkdirSync(dirname(file(p)),{recursive:true});writeFileSync(file(p),plan.get(p),'utf8');}
console.log(`${check?'Précontrôle':'Installation'} 20J OK. ${changed.length} fichier(s) à ${check?'modifier':'jour'} :\n${changed.map(p=>'  '+p).join('\n')||'  Aucun (déjà installé).'}`);
