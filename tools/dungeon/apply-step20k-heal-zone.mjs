/** Step 20K — recovered MT healing sprite and manual-only healing window.
 * Run from the monorepo root: node tools/dungeon/apply-step20k-heal-zone.mjs --check
 * No Git/network access. Preflights all edits before writing anything.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const check = process.argv.includes('--check');
const pending = new Map();
const sep = (text) => text.includes('\r\n') ? '\r\n' : '\n';
const fail = (p, desc) => { throw new Error(`${p}: ${desc}`); };
const load = (p) => {
  const path = resolve(root, p);
  if (!existsSync(path)) fail(p, 'fichier source introuvable ; exécute depuis la racine du dépôt');
  return readFileSync(path, 'utf8');
};
const loadArtifact = (p) => {
  const src = resolve(root, p);
  if (!existsSync(src)) fail(p, 'fichier de l’archive manquant');
  return readFileSync(src, 'utf8');
};
function edit(p, transform) {
  const original = load(p);
  // Handle CRLF + regular LF without modifying the rest of the file on disk.
  const newline = sep(original);
  const normalized = original.replace(/\r\n/g, '\n');
  const result = transform(normalized, p);
  if (typeof result !== 'string') fail(p, 'transformation non textuelle');
  pending.set(p, result.replace(/\n/g, newline));
}
function put(p, content) {
  const path = resolve(root, p);
  if (existsSync(path)) {
    const same = readFileSync(path, 'utf8') === content;
    if (!same) fail(p, 'cible existante différente (refus d’écrasement)');
  } else pending.set(p, content);
}
function one(s, original, replacement, p) {
  if (replacement && s.includes(replacement)) return s; // idempotent exact replacement
  const n = s.split(original).length - 1;
  if (n !== 1) fail(p, `ancrage absent ou ambigu (${n}): ${original.slice(0, 93)}`);
  return s.replace(original, replacement);
}
function rex(s, expression, replacement, p) {
  const matches = [...s.matchAll(expression)];
  if (matches.length !== 1) fail(p, `ancrage regexp absent ou ambigu (${matches.length}): ${expression}`);
  return s.replace(expression, replacement);
}
function removeBlock(s, opening, p) {
  const start = s.indexOf(opening);
  if (start < 0 || s.indexOf(opening, start + opening.length) >= 0) fail(p, 'bloc à supprimer introuvable ou ambigu');
  let a = s.indexOf('{', start), depth = 0, end = -1;
  if (a < 0) fail(p, 'accolade manquante');
  for (let i=a;i<s.length;i++) {
    if (s[i]==='{') depth++;
    if (s[i]==='}' && --depth===0) { end=i+1; break; }
  }
  if (end < 0) fail(p, 'fin du bloc non trouvée');
  return s.slice(0,start)+s.slice(end);
}

const helper = 'packages/core/src/models/dungeon/dungeon.healZone.ts';
put(helper, loadArtifact('packages/core/src/models/dungeon/dungeon.healZone.ts'));
put('packages/core/test/unit/dungeon/dungeon.healZone.test.ts', loadArtifact('packages/core/test/unit/dungeon/dungeon.healZone.test.ts'));
put('app/client/test/unit/dungeon/mtDungeonHealSprite.test.ts', loadArtifact('app/client/test/unit/dungeon/mtDungeonHealSprite.test.ts'));
const imagePath = 'app/client/public/dungeon/mt/item_heal.png';
const img = resolve(root, imagePath);
if (!existsSync(img)) fail(imagePath, 'copie du PNG original requise depuis le ZIP');
const b = readFileSync(img);
if (b.subarray(0,8).toString('hex') !== '89504e470d0a1a0a' || b.readUInt32BE(16) !== 40 || b.readUInt32BE(20) !== 29)
  fail(imagePath, 'PNG inattendu (le sprite fourni fait 40 × 29)');

edit('packages/core/src/models/dungeon/dungeon.session.ts', (src,p) => {
  if (src.includes('consumeMtHealOnDeparture(cfg.map, result.position')) return src;
  let s = one(src, "import { getMtFlagIndex } from './dungeon.scene.js';",
    "import { consumeMtHealOnDeparture } from './dungeon.healZone.js';\nimport { getMtFlagIndex } from './dungeon.scene.js';",p);
  // The actual pending events are only gold, guardian and scenario.
  s = one(s, "\tconsumedFlags: ReadonlySet<number>\n", '', p);
  s = one(s, '\tcommand: DungeonCommand,\n): MtPendingInteraction', '\tcommand: DungeonCommand\n): MtPendingInteraction', p);
  s = one(s, "\t\tif (item.kind === 'IHeal' && consumedFlags.has(getMtFlagIndex(map, from.l, item.x, item.y))) continue;\n", '',p);
  s = one(s, "if (item.kind === 'IGold' || item.kind === 'IHeal' || item.kind === 'IScenario')", "if (item.kind === 'IGold' || item.kind === 'IScenario')",p);
  s = one(s, "kind: item.kind === 'IGold' ? 'gold' : item.kind === 'IHeal' ? 'heal' : 'scenario',", "kind: item.kind === 'IGold' ? 'gold' : 'scenario',",p);
  s = one(s, "flag: item.kind === 'IHeal' ? null : getMtFlagIndex(map, from.l, item.x, item.y),",
       "flag: getMtFlagIndex(map, from.l, item.x, item.y),",p);
  // Ignore the consumedFlags argument when generating pending events.
  s = one(s, "\t\t\tcommand,\n\t\t\tnew Set(result.flags)\n\t\t);", "\t\t\tcommand\n\t\t);",p);
  // Actual accepted moves consume zones as the group departs.
  s = one(s, '\t\tresult.position = { ...decision.position };',
      '\t\tresult.flags = consumeMtHealOnDeparture(cfg.map, result.position, decision.position, result.flags);\n\t\tresult.position = { ...decision.position };',p);
  // Pending guardian/scenario/gold: only a successful trusted settlement moves away.
  s = one(s, '\tif (succeeded) {\n\t\tresult.position = { ...event.to };',
      '\tif (succeeded) {\n\t\tresult.flags = consumeMtHealOnDeparture(cfg.map, event.from, event.to, result.flags);\n\t\tresult.position = { ...event.to };',p);
  if (s.includes("\t\tif (event.kind === 'heal') {")) s = removeBlock(s, "\t\tif (event.kind === 'heal') {",p);
  return s;
});

edit('packages/core/test/unit/dungeon/dungeon.session.test.ts',(s,p)=>{
  const begin=s.indexOf("\tit('marks an IHeal zone consumed only after successful settlement'");
  const end=s.indexOf("\tit('requires original scenario icons",begin);
  if(begin<0||end<0||s.indexOf("\tit('marks an IHeal zone",begin+1)>=0) {
    if(s.includes("\tit('allows manual healing on an active IHeal until departing'")) return s;
    fail(p,'ancien test IHeal introuvable');
  }
  const replacement=`\tit('allows manual healing on an active IHeal until departing', () => {
\t\tconst config = fixture();
\t\tconst entered = accepted(config, at(config, 3, 4), [cmd(3, 4, 0, 1, 0)]);
\t\tconst flag = getMtFlagIndex(config.map, 0, 4, 4);
\t\texpect(entered.pending).toBeNull();
\t\texpect(entered.session.position).toEqual({ x: 4, y: 4, l: 0 });
\t\texpect(entered.session.flags).not.toContain(flag);
\t\tconst departed = accepted(config, entered.session, [cmd(4, 4, 0, -1, 0)]);
\t\texpect(departed.session.flags).toContain(flag);
\t\tconst returned = accepted(config, departed.session, [cmd(3, 4, 0, 1, 0)]);
\t\texpect(returned.pending).toBeNull();
\t\texpect(returned.session.flags).toContain(flag);
\t});
\n`;
  return s.slice(0,begin)+replacement+s.slice(end);
});
edit('packages/core/test/unit/dungeon/dungeon.heal.test.ts',(_,p)=>loadArtifact('packages/core/test/unit/dungeon/dungeon.heal.test.ts'));

// Legacy pending heal sessions settle without any HP or flag change.
edit('app/server/src/Dungeon/Service/mtDungeonHeal.service.ts',(s,p)=>{
  if(!s.includes('export async function settleMtDungeonHealArrival')) fail(p,'settlement IHeal inconnu');
  return loadArtifact('tools/dungeon/step20k/mtDungeonHeal.service.ts.template');
});
edit('app/server/src/Dungeon/mtDungeonHealingGuard.ts',(s,p)=>{
  if(!s.includes('export async function assertNoMtDungeonHealing')) fail(p,'garde serveur inconnue');
  return loadArtifact('tools/dungeon/step20k/mtDungeonHealingGuard.ts.template');
});
edit('app/server/test/unit/dungeon/mtDungeonHealGuard.test.ts',(s,p)=>{
  if(s === loadArtifact('tools/dungeon/step20k/mtDungeonHealGuard.test.ts.template')) return s;
  if(!s.includes("describe('MT dungeon regular healing guard'")) fail(p,'ancien fichier de test inattendu');
  return loadArtifact('tools/dungeon/step20k/mtDungeonHealGuard.test.ts.template');
});
edit('app/server/src/Inventory/Service/useItem.service.ts',(s,p)=>{
  const base='await assertNoMtDungeonHealing(authed.id, dinoz.id);';
  const withOpts=`await assertNoMtDungeonHealing(authed.id, dinoz.id, prisma,\n\t\t\titem.effect?.category === ItemEffect.HEAL ||\n\t\t\t(item.effect?.category === ItemEffect.SPECIAL && item.effect.value === 'pampleboum'));`;
  return one(s,base,withOpts,p);
});
edit('app/client/src/components/dungeon/mtOriginalSpriteCatalog.ts',(s,p)=>{
  s=one(s,'const originals = new Set(MT_ORIGINAL_PNG);',
      "// The additional 40×29 sprite was recovered later by the project.\n// Keep the historical 201-PNG manifest and its tests unchanged.\nconst originals = new Set([...MT_ORIGINAL_PNG, 'item_heal.png']);",p);
  s=one(s, "\t\tcase 'heal':\n\t\t\tunresolved.add('Objet de soin (frames 7/8) : correspondance à confirmer dans gfx.swf');\n\n\t\t\treturn null;",
      "\t\tcase 'heal':\n\t\t\treturn 'item_heal.png';",p);
  return s;
});
edit('app/client/src/components/dungeon/mtDungeonItemPlacement.ts',(s,p)=>{
  return one(s,"\t} else if (file === 'item_gold.png' || file === 'item_chest.png' || file === 'item_skel.png') {",
    "\t} else if (file === 'item_heal.png') {\n\t\trelativeSize = 0.9;\n\t} else if (file === 'item_gold.png' || file === 'item_chest.png' || file === 'item_skel.png') {",p);
});
edit('app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue',(s,p)=>{
  if (s.includes("sprite.file === 'item_heal.png'")) return s;
  const start=s.indexOf('/** Temporary healing-zone stand-in: original item SWF frames 7/8 not exported. */');
  const next=s.indexOf('\nfunction paintFog(',start+5);
  // Keep paintFog, remove only the temporary heal renderer.
  if (start < 0 || next < start) fail(p,'dessin provisoire IHeal introuvable');
  s=s.slice(0,start)+s.slice(next+1);
  s=one(s,'\tpaintHealZones(scene);\n','',p);
  s=one(s,'\t\titems.addChild(visual);',
    `\t\tif (sprite.file === 'item_heal.png') {
\t\t\tconst zone = scene.features.find(feature =>
\t\t\t\tfeature.kind === 'heal' && feature.x * 40 === sprite.x && feature.y * 40 === sprite.y
\t\t\t);
\t\t\tif (zone?.kind === 'heal' && zone.consumed) {
\t\t\t\t// Inactive zone: the original recovered texture, now darkened.
\t\t\t\tvisual.tint = 0x53644b;
\t\t\t\tvisual.alpha = 0.64;
\t\t\t}
\t\t}
\t\titems.addChild(visual);`,p);
  return s;
});
edit('app/client/src/pages/MtMagneticCavernsPage.vue',(s,p)=>{
  const hint=`\t\t\t\t<section v-if="activeHealZone" class="mt-test__panel" aria-live="polite">
\t\t\t\t\t<p>Zone de soin active : utilise des objets de soin sur la fiche de tes Dinoz, puis reviens ici.</p>
\t\t\t\t\t<p>La zone sera définitivement désactivée dès que le groupe quittera cette case.</p>
\t\t\t\t\t<RouterLink :to="{ name: 'DinozPage', params: { id: leaderId } }">Soigner le chef de groupe</RouterLink>
\t\t\t\t\t<RouterLink v-for="member in visualMembers.filter(m => m.id !== leaderId)" :key="member.id"
\t\t\t\t\t\t:to="{ name: 'DinozPage', params: { id: member.id } }">Soigner le Dinoz {{ member.id }}</RouterLink>
\t\t\t\t</section>

`;
  if(!s.includes('v-if="activeHealZone"')){
    const anchor='\t\t\t\t<details v-if="view" class="mt-test__details mt-test__journal">';
    s=one(s,anchor,hint+anchor,p);
  }
  const compute=`const activeHealZone = computed(() => {
\tconst run = session.value;
\tconst current = view.value;
\tif (!run || !current || run.locked || run.pending) return false;
\treturn current.scene.features.some(feature =>
\t\tfeature.kind === 'heal' && !feature.consumed &&
\t\tfeature.x === run.position.x && feature.y === run.position.y
\t);
});
`;
  if(!s.includes('const activeHealZone = computed')) {
    const anchor='const language = computed(() =>';
    s=one(s,anchor,compute+anchor,p);
  }
  return s;
});

const modified=[...pending.entries()].filter(([p,c]) => !existsSync(resolve(root,p)) || readFileSync(resolve(root,p),'utf8') !== c);
console.log(`20K ${check?'Précontrôle':'Installation'} : ${modified.length} fichier(s) à ${check?'modifier':'écrire'}.`);
for (const [p] of modified) console.log(` - ${p}`);
if (!check) {
  for (const [p,content] of modified) {
    const path=resolve(root,p);
    mkdirSync(dirname(path),{recursive:true});
    writeFileSync(path,content);
  }
  console.log('Terminé. Aucune commande Git exécutée.');
} else console.log('Précontrôle réussi. Aucun fichier modifié.');
