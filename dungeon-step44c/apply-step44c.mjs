import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/** 44c-v2: whitespace-independent, preflighted edits; no GitHub writes. */
const root = process.cwd();
const sourceDir = resolve(root, 'dungeon-step44c');
if (!existsSync(resolve(root, 'app/client/package.json')) || !existsSync(sourceDir)) {
  throw new Error('Extraire le ZIP à la racine de DinoRPG Remastered, puis lancer depuis cette racine.');
}
const pagePath = resolve(root, 'app/client/src/pages/DungeonPage.vue');
const boxPath = resolve(root, 'app/client/src/components/dungeon/MtDungeonMessageBox.vue');
const testPath = resolve(root, 'app/client/test/unit/dungeon/mtDungeonMessageBox.test.ts');
const additions = [
  ['app/client/src/components/dungeon/mtDungeonScenarioMessageIcon.ts', 'mtDungeonScenarioMessageIcon.ts'],
  ['app/client/test/unit/dungeon/mtDungeonScenarioMessageIcon.test.ts', 'mtDungeonScenarioMessageIcon.test.ts'],
];
const original = new Map();
const staged = new Map();
function read(path) {
  if (!existsSync(path)) throw new Error(`Fichier manquant : ${path}`);
  if (!original.has(path)) original.set(path, readFileSync(path, 'utf8'));
  return original.get(path);
}
function set(path, data) { staged.set(path, data); }
function assertion(ok, explanation) { if (!ok) throw new Error(`44c-v2 : ${explanation}. Aucun fichier n'a été modifié.`); }
function count(source, re) { return [...source.matchAll(re)].length; }
function expectedCount(source, re, n, label) {
  assertion(count(source, re) === n, `${label} : ${count(source, re)} occurrence(s), ${n} attendue(s)`);
}

// ----- DungeonPage.vue ----------------------------------------------------
let page = read(pagePath);
const noticeChoice = /(\?\s*'notice'\s*:\s*)'dialog'/g;
const alreadyChoice = /\?\s*'notice'\s*:\s*'story'/g;
assertion(count(page, noticeChoice) + count(page, alreadyChoice) === 2,
  "les deux sélecteurs de variante 'notice'/'dialog' ou 'story' sont introuvables");
page = page.replace(noticeChoice, "$1'story'");

const iconImport = "import { mtDungeonScenarioMessageIcon } from '../components/dungeon/mtDungeonScenarioMessageIcon.js';";
if (!page.includes(iconImport)) {
  const anchor = "import MtDungeonMessageBox from '../components/dungeon/MtDungeonMessageBox.vue';";
  assertion(page.includes(anchor), 'import MtDungeonMessageBox introuvable');
  page = page.replace(anchor, anchor + '\n' + iconImport);
}

const oldIcon = /icon:\s*current\.messageIcon\s*\?\?\s*null\s*,/g;
const newIcon = /icon:\s*mtDungeonScenarioMessageIcon\(run\.mapId,\s*run\.pending\.itemValue,\s*current\.messageIcon\)\s*,/g;
assertion(count(page, oldIcon) + count(page, newIcon) === 2,
  'les deux icônes de scénarios ne correspondent plus aux sources attendues');
page = page.replace(oldIcon,
  'icon: mtDungeonScenarioMessageIcon(run.mapId, run.pending.itemValue, current.messageIcon),');
page = page.replace(/^\s*cancelLabel:\s*t\('dungeon\.later'\)\s*,?\s*\r?\n/gm, '\n');
page = page.replace(/^\s*const scenarioDismissedRevision = ref\(''\);\s*\r?\n/gm, '\n');
page = page.replace(/^\s*const key = run\.mapId \+ ':' \+ run\.revision;\s*\r?\n\s*if \(scenarioDismissedRevision\.value === key\) return null;\s*\r?\n/gm, '\n');
page = page.replace(/\s*if \(\(kind === 'scenario' \|\| kind === 'scenario-combat'\) && session\.value\)\s*scenarioDismissedRevision\.value = session\.value\.mapId \+ ':' \+ session\.value\.revision;/g, '');

const oldConfirm = /if\s*\(kind === 'scenario'\)\s*\{\s*closeMessage\(\);\s*resolveScenario\(\);\s*\}\s*if\s*\(kind === 'scenario-combat'\)\s*\{\s*closeMessage\(\);\s*fight\(\);\s*\}/g;
const newConfirm = "if (kind === 'scenario') resolveScenario();\n\tif (kind === 'scenario-combat') fight();";
if (count(page, oldConfirm) === 1) page = page.replace(oldConfirm, newConfirm);
else assertion(/if\s*\(kind === 'scenario'\)\s*resolveScenario\(\);\s*if\s*\(kind === 'scenario-combat'\)\s*fight\(\);/.test(page), 'confirmation des scénarios inconnue');

// The message is already visible in the scenario popup; never echo it above the dungeon.
page = page.replace(/^\s*notice\.value = outcome\.message \?\? t\('dungeon\.scenarioProcessed'\);\s*\r?\n/gm, '\n');
page = page.replace(/^\s*<p v-if="notice" class="mt-test__notice" role="status">\{\{ notice \}\}<\/p>\s*\r?\n/gm, '\n');
page = page.replace(/^\s*const notice = ref\(''\);\s*\r?\n/gm, '\n');
page = page.replace(/notice\.value = t\('dungeon\.moveRefused'\);/g,
  "errorMessage.value = t('dungeon.moveRefused');");
page = page.replace(/^\s*notice\.value = '';\s*\r?\n/gm, '\n');
page = page.replace(/^\.mt-test__notice,\s*\r?\n/gm, '');

expectedCount(page, alreadyChoice, 2, 'sélecteurs story');
expectedCount(page, newIcon, 2, 'icônes de scénario');
assertion(page.includes('function resolveScenario()') && page.includes('function fight()'),
  'gestionnaires des événements de scénario manquants');
assertion(!page.includes('scenarioDismissedRevision') && !page.includes('notice.value') &&
  !page.includes('v-if="notice"') && !page.includes("cancelLabel: t('dungeon.later')"),
  'des anciens éléments de scénario ou du bandeau restent dans DungeonPage');
set(pagePath, page);

// ----- MtDungeonMessageBox.vue -------------------------------------------
let box = read(boxPath);
if (!box.includes('confirmStoryOnFrame')) {
  const anchor = /(<section\s+class="mt-msgbox"\s+:class="`mt-msgbox--\$\{variant\}`")/g;
  expectedCount(box, anchor, 1, 'racine de la msgBox');
  box = box.replace(anchor, '$1\n\t\t\t@click="confirmStoryOnFrame"');
  const dismiss = /function dismissOutside\(\): void \{/g;
  expectedCount(box, dismiss, 1, 'gestionnaire de clic extérieur');
  box = box.replace(dismiss, "function confirmStoryOnFrame(): void {\n\tif (props.variant === 'story' && !props.busy) emit('confirm');\n}\n\nfunction dismissOutside(): void {");
}
if (!box.includes('mt-msgbox__story-button')) {
  const oldTemplate = /<template v-else>\s*<h3 v-if="title"/g;
  expectedCount(box, oldTemplate, 1, 'contenu dialog');
  box = box.replace(oldTemplate, `<template v-else-if="variant === 'story'">
					<button
						type="button"
						class="mt-msgbox__story-button"
						:disabled="busy"
						@click.stop="emit('confirm')"
					>
						<span v-if="title" class="mt-msgbox__title mt-msgbox__story-title">{{ title }}</span>
						<span class="mt-msgbox__text">{{ text }}</span>
					</button>
				</template>
				<template v-else>
					<h3 v-if="title"`);
  const cssAnchor = '.mt-msgbox__title {';
  assertion(box.includes(cssAnchor), 'ancre CSS du titre introuvable');
  box = box.replace(cssAnchor, `.mt-msgbox__story-button {
	display: block;
	width: 100%;
	padding: 0;
	border: 0;
	background: transparent;
	color: inherit;
	font: inherit;
	text-align: center;
	cursor: pointer;
}
.mt-msgbox__story-button:disabled {
	cursor: progress;
}
.mt-msgbox__story-title,
.mt-msgbox__story-button .mt-msgbox__text {
	display: block;
}
${cssAnchor}`);
  const focusAnchor = '.mt-msgbox__notice-button:focus-visible,';
  assertion(box.includes(focusAnchor), 'ancre CSS de focus introuvable');
  box = box.replace(focusAnchor, focusAnchor + '\n.mt-msgbox__story-button:focus-visible,');
}
box = box.replace("variant?: 'notice' | 'dialog';", "variant?: 'notice' | 'dialog' | 'story';");
assertion(box.includes("variant?: 'notice' | 'dialog' | 'story';") &&
  box.includes('mt-msgbox__story-button') && box.includes('confirmStoryOnFrame') &&
  box.includes('<template v-else-if="variant === \'story\'">'),
  'le composant msgBox ne contient pas toutes les parties du mode story');
set(boxPath, box);

// ----- Regression test -----------------------------------------------------
let test = read(testPath);
if (!test.includes('renders long scenario text and its icon')) {
  const anchor = "\tit('allows an explicit cancel without confirming a scenario', async () => {";
  assertion(test.includes(anchor), 'point d’insertion des tests msgBox introuvable');
  test = test.replace(anchor, `\tit('renders long scenario text and its icon without a button footer', async () => {
		const wrapper = mount(MtDungeonMessageBox, {
			props: { ...props, variant: 'story', placement: 'viewport', icon: 'scroll' }
		});
		expect(wrapper.get('.mt-msgbox__tab').attributes('src')).toBe('/dungeon/mt/item_scroll.png');
		expect(wrapper.get('.mt-msgbox__story-button').text()).toContain(props.text);
		expect(wrapper.get('.mt-msgbox__title').text()).toBe(props.title);
		expect(wrapper.find('.mt-msgbox__actions').exists()).toBe(false);
		await wrapper.get('.mt-msgbox__story-button').trigger('click');
		expect(wrapper.emitted('confirm')).toHaveLength(1);
		await wrapper.get('.mt-msgbox').trigger('click');
		expect(wrapper.emitted('confirm')).toHaveLength(2);
	});

	it('does not settle a scenario while the request is busy', async () => {
		const wrapper = mount(MtDungeonMessageBox, {
			props: { ...props, variant: 'story', busy: true }
		});
		await wrapper.get('.mt-msgbox__story-button').trigger('click');
		await wrapper.get('.mt-msgbox').trigger('click');
		expect(wrapper.emitted('confirm')).toBeUndefined();
	});

${anchor}`);
}
assertion(test.includes('renders long scenario text and its icon'), 'tests du mode story non installés');
set(testPath, test);

for (const [relative, name] of additions) {
  const path = resolve(root, relative);
  const source = readFileSync(resolve(sourceDir, name), 'utf8');
  if (existsSync(path)) assertion(readFileSync(path, 'utf8') === source, `fichier ${relative} déjà présent mais différent`);
  else staged.set(path, source);
}

const dirty = [...staged].filter(([p, data]) => !existsSync(p) || readFileSync(p, 'utf8') !== data);
if (process.argv.includes('--dry-run')) {
  console.log(`44c-v2 : prévalidation réussie (${dirty.length} fichier(s) à traiter, aucune écriture).`);
  process.exit(0);
}
if (!dirty.length) {
  console.log('44c-v2 : déjà installée, aucun fichier modifié.');
  process.exit(0);
}
// Preflight ended successfully. Stage all temporary files before replacing targets.
const temps = [];
try {
  for (const [path, data] of dirty) {
    mkdirSync(dirname(path), { recursive: true });
    const temp = `${path}.mt44c-v2.tmp`;
    assertion(!existsSync(temp), `fichier temporaire déjà présent : ${temp}`);
    writeFileSync(temp, data, { encoding: 'utf8', flag: 'wx' });
    temps.push([temp, path]);
  }
  for (const [temp, path] of temps) renameSync(temp, path);
} finally {
  for (const [temp] of temps) if (existsSync(temp)) unlinkSync(temp);
}
console.log(`44c-v2 : installation terminée (${dirty.length} fichier(s) mis à jour).`);
