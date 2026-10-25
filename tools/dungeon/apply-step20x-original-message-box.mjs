#!/usr/bin/env node
/** STEP 20X — atomic migration to original MT message frames. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const payload = path.join(path.dirname(fileURLToPath(import.meta.url)), 'step20x-payload');
const check = process.argv.includes('--check');
if (process.argv.some(arg => arg.startsWith('--') && arg !== '--check')) throw new Error('Option inconnue.');
const base = 'app/client/';
const boxFile = base + 'src/components/dungeon/MtDungeonMessageBox.vue';
const pageFile = base + 'src/pages/MtMagneticCavernsPage.vue';
const actionFile = base + 'src/components/dinoz/DinozActions.vue';
const testFile = base + 'test/unit/dungeon/mtDungeonMessageBox.test.ts';
const plans = new Map();
const originals = new Map();

function load(f) {
  const name = path.join(root, f);
  if (!fs.existsSync(name)) throw new Error(`Fichier introuvable: ${f}`);
  const raw = fs.readFileSync(name, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  originals.set(f, { raw, eol });
  return raw.replace(/\r\n/g, '\n');
}
function change(f, before, after, label) {
  const source = plans.get(f);
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${f}: ancrage ${label} attendu une fois, obtenu ${count}. Aucun fichier modifié.`);
  plans.set(f, source.replace(before, after));
}
function payloadText(name) {
  const f = path.join(payload, name);
  if (!fs.existsSync(f)) throw new Error(`ZIP incomplet: ${f}`);
  return fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
}
for (const f of [boxFile, pageFile, actionFile, testFile]) plans.set(f, load(f));
if (!plans.get(boxFile).includes('STEP_20X_MT_MSGBOX')) {
  for (const token of ['mt-msgbox-overlay', 'msgbox_topleft.png', 'msgbox_bottomright.png'])
    if (!plans.get(boxFile).includes(token)) throw new Error(`${boxFile}: version non reconnue (${token}).`);
}
plans.set(boxFile, payloadText('MtDungeonMessageBox.vue'));
plans.set(testFile, payloadText('mtDungeonMessageBox.test.ts'));

if (!plans.get(actionFile).includes('STEP_20X_ENTRY')) {
  change(actionFile,
    '<MtDungeonMessageBox\n\t\t\tv-if="dungeonEntryMessage"',
    '<!-- STEP_20X_ENTRY -->\n\t\t<MtDungeonMessageBox\n\t\t\tvariant="notice"\n\t\t\tv-if="dungeonEntryMessage"',
    'notice entrée');
}

if (!plans.get(pageFile).includes('STEP_20X_VIEWPORT')) {
  change(pageFile,
    '.mt-test__viewport {\n\tposition: relative;\n\twidth: 100%;',
    '.mt-test__viewport {\n\tposition: relative;\n\tcontainer-type: inline-size;\n\twidth: 100%;',
    'conteneur de taille du viewport');
  change(pageFile,
    '<MtDungeonMessageBox\n\t\t\tv-if="activeMessage"',
    '<MtDungeonMessageBox\n\t\t\tv-if="activeMessage && !session"\n\t\t\t:variant="activeMessage.kind === \'entry\' || activeMessage.kind === \'irma\' ? \'notice\' : \'dialog\'"',
    'popup sortie');
  const anchor = '\t\t\t\t\t<div v-else class="mt-test__placeholder">Chargement de la vue…</div>';
  const inside = `
\t\t\t\t\t<!-- STEP_20X_VIEWPORT — dialogue visible directement sur le donjon. -->
\t\t\t\t\t<MtDungeonMessageBox
\t\t\t\t\t\tv-if="activeMessage"
\t\t\t\t\t\tplacement="viewport"
\t\t\t\t\t\t:variant="activeMessage.kind === 'entry' || activeMessage.kind === 'irma' ? 'notice' : 'dialog'"
\t\t\t\t\t\t:title="activeMessage.title"
\t\t\t\t\t\t:text="activeMessage.text"
\t\t\t\t\t\t:confirm-label="activeMessage.confirmLabel"
\t\t\t\t\t\t:cancel-label="activeMessage.cancelLabel"
\t\t\t\t\t\t:busy="busy"
\t\t\t\t\t\t@confirm="confirmMessage"
\t\t\t\t\t\t@close="closeMessage"
\t\t\t\t\t/>`;
  change(pageFile, anchor, anchor + inside, 'position popup');
  change(pageFile, "const notice = ref('');", "const notice = ref('');\nconst irmaMessage = ref<string | null>(null);", 'ref Irma');
  change(pageFile,
    "type MtNarrativeKind = 'entry' | 'exit' | 'scenario' | 'scenario-combat';",
    "type MtNarrativeKind = 'entry' | 'exit' | 'scenario' | 'scenario-combat' | 'irma';",
    'type Irma');
  const pendingAnchor = "\tconst run = session.value;\n\tconst current = encounter.value;\n\tif (run?.pending?.kind === 'scenario' && current?.text) {";
  change(pageFile, pendingAnchor,
    "\tif (session.value && irmaMessage.value) return { kind: 'irma', title: '', text: irmaMessage.value, confirmLabel: 'Continuer' };\n" + pendingAnchor,
    'fenêtre Irma');
  for (const fn of ['closeMessage', 'confirmMessage']) {
    const before = `function ${fn}(): void {\n\tconst kind = activeMessage.value?.kind;\n\tif (kind === 'entry')`;
    const after = `function ${fn}(): void {\n\tconst kind = activeMessage.value?.kind;\n\tif (kind === 'irma') irmaMessage.value = null;\n\tif (kind === 'entry')`;
    change(pageFile, before, after, 'gestion Irma '+fn);
  }
  const from = "\t\tnotice.value = `${paid.used} Potion(s) d'Irma consommée(s). Exploration reprise.`;";
  const to = `\t\t// Confirmed server action: the MT notice only acknowledges its result.
\t\tconst n = paid.used;
\t\tconst messages: Record<string, string> = {
\t\t\tfr: \`Vous avez utilisé 4{n} potion4{n > 1 ? 's' : ''} d'Irma pour votre groupe de Dinoz. Ils peuvent à nouveau se déplacer aujourd'hui.\`,
\t\t\ten: \`You have used 4{n} Madam Irma's Potion4{n > 1 ? 's' : ''} for your Dinoz group. They can move again today.\`,
\t\t\tes: \`Has usado 4{n} poción4{n > 1 ? 'es' : ''} de Irma para tu grupo de Dinoz. Hoy pueden volver a moverse.\`,
\t\t\tde: \`Du hast 4{n} Irma-Trank4{n > 1 ? 'tränke' : ''} für deine Dinoz-Gruppe benutzt. Sie kann sich heute wieder bewegen.\`
\t\t};
\t\tirmaMessage.value = messages[language.value.slice(0, 2)] ?? messages.fr ?? '';
\t\tnotice.value = '';`.replace(/\u00024/g, '$');
  change(pageFile, from, to, 'toast -> Irma popup');
}

// Verify the whole plan before any changes are made.
const pending = [];
for (const [f, body] of plans) {
  const {raw, eol} = originals.get(f);
  const next = eol === '\r\n' ? body.replace(/\n/g, '\r\n') : body;
  if (next !== raw) pending.push({f, data: next});
}
if (check) {
  console.log(`20X --check OK — ${pending.length} fichier(s) à modifier, aucun changement écrit.`);
  for (const {f} of pending) console.log('  '+f);
} else {
  for (const {f, data} of pending) {
    fs.writeFileSync(path.join(root, f), data, 'utf8');
    console.log('  modifié: '+f);
  }
  console.log(`20X terminé — ${pending.length} fichier(s) modifié(s).`);
}
