import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dungeonPath = path.join(root, 'app/client/src/pages/DungeonPage.vue');
const dinozPath = path.join(root, 'app/client/src/pages/DinozPage.vue');
const source = [fs.readFileSync(dungeonPath, 'utf8'), fs.readFileSync(dinozPath, 'utf8')];
let [dungeon, dinoz] = source;
const replaceOnce = (input, regex, replacement, label) => {
  const matches = [...input.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g'))];
  if (matches.length !== 1) throw new Error(`${label}: attendu une seule occurrence, trouvé ${matches.length}. Aucun fichier modifié.`);
  return input.replace(regex, replacement);
};
const ready = dungeon.includes('STEP_27_EXIT_ON_DINOZ') && dinoz.includes('STEP_27_EXIT_ON_DINOZ');
if (ready) {
  console.log('Étape 27 déjà installée.');
  process.exit(0);
}
if (dungeon.includes('STEP_27_EXIT_ON_DINOZ') || dinoz.includes('STEP_27_EXIT_ON_DINOZ'))
  throw new Error('Installation partielle détectée. Aucun fichier modifié.');

// Remove the duplicate exit panel: the message belongs only on DinozPage.
dungeon = replaceOnce(dungeon, /\s*<section v-if="exitOutcome" class="mt-test__panel" aria-live="polite">[\s\S]*?<\/section>/, '', 'Panneau de sortie');
dungeon = replaceOnce(dungeon, /v-if="!session && !loading && !exitOutcome"/, 'v-if="!session && !loading"', 'Condition sans session');
// The former exit message must not be rendered by DungeonPage after an exit.
dungeon = replaceOnce(dungeon, /\s*if \(exitOutcome\.value && !exitDismissed\.value\) \{\s*return \{ kind: 'exit',[^\n]*\};\s*\}/, '', 'Ancienne MsgBox de sortie');
// Route to Dinoz page immediately after the server acknowledges a world exit.
dungeon = replaceOnce(dungeon, /\s*session\.value = null;\s*view\.value = null;\s*encounter\.value = null;\s*guardianTrial\.value = null;\s*movementTrail\.value = \[\];\s*exitOutcome\.value = outcome;\s*journalEntries\.value = \[\];\s*return true;/, `
	// STEP_27_EXIT_ON_DINOZ: the server exit is committed before navigation.
	// Carry the original MT message in Vue Router history state, never a URL parameter.
	await router.replace({
		name: 'DinozPage',
		params: { id: String(leaderId) },
		state: { mtDungeonExitMessage: outcome.text }
	});
	return true;`, 'Redirection après sortie');
// These no longer have a use after routing directly on exit.
dungeon = replaceOnce(dungeon, /^const exitOutcome = ref<MtDungeonWorldExitResult \| null>\(null\);\r?\n/m, '', 'État de sortie');
dungeon = replaceOnce(dungeon, /^const exitDismissed = ref\(false\);\r?\n/m, '', 'État de fermeture de sortie');
dungeon = replaceOnce(dungeon, /^\s*if \(kind === 'exit'\) exitDismissed\.value = true;\r?\n/m, '\n', 'Fermeture sortie');
dungeon = replaceOnce(dungeon, /\s*if \(kind === 'exit'\) \{\s*exitDismissed\.value = true;\s*void router\.push\(\{ name: 'DinozPage', params: \{ id: String\(leaderId\) \} \}\);\s*\}/, '', 'Ancien clic de sortie');
dungeon = replaceOnce(dungeon, /type MtNarrativeKind = 'entry' \| 'exit' \|/, "type MtNarrativeKind = 'entry' |", 'Union type sortie');
dungeon = replaceOnce(dungeon, /\s*type MtDungeonWorldExitResult\s*\r?\n/, '\n', 'Import ancien résultat sortie');

// Show the MT notice on the destination Dinoz page, after routing has changed.
dinoz = replaceOnce(dinoz, /(<template>\s*)/, `$1
	<!-- STEP_27_EXIT_ON_DINOZ: visible only on the destination Dinoz page. -->
	<MtDungeonMessageBox
		v-if="dungeonExitMessage"
		variant="notice"
		:text="dungeonExitMessage"
		:confirm-label="'Continuer'"
		@confirm="dungeonExitMessage = null"
	/>
`, 'Destination template');
dinoz = replaceOnce(dinoz, /(import TabPanels from '[^']+';)/, `$1\nimport MtDungeonMessageBox from '../components/dungeon/MtDungeonMessageBox.vue';`, 'Import MsgBox');
dinoz = replaceOnce(dinoz, /(\s*isReady: false as boolean)/, "$1,\n\t\t\tdungeonExitMessage: null as string | null", 'État MsgBox Dinoz');
dinoz = replaceOnce(dinoz, /(\s*TabPanels,\s*\r?\n)/, "$1\t\tMtDungeonMessageBox,\n", 'Composant MsgBox Dinoz');
dinoz = replaceOnce(dinoz, /(\s*async mounted\(\): Promise<void> \{)/, `$1
		// Read once from the new navigation entry; do not show it after refresh/back.
		const exitText = window.history.state?.mtDungeonExitMessage;
		if (typeof exitText === 'string' && exitText.trim()) {
			this.dungeonExitMessage = exitText;
			const { mtDungeonExitMessage: _consumed, ...remainingState } = window.history.state;
			window.history.replaceState(remainingState, '');
		}
`, 'Lecture du message après redirection');

// Validate both replacements before writing either file.
if (!dungeon.includes('STEP_27_EXIT_ON_DINOZ') || !dinoz.includes('STEP_27_EXIT_ON_DINOZ')) throw new Error('Validation interne échouée.');
const temp = [dungeonPath + '.step27.tmp', dinozPath + '.step27.tmp'];
try {
  fs.writeFileSync(temp[0], dungeon);
  fs.writeFileSync(temp[1], dinoz);
  fs.renameSync(temp[0], dungeonPath);
  fs.renameSync(temp[1], dinozPath);
} finally { for (const p of temp) if (fs.existsSync(p)) fs.unlinkSync(p); }
console.log('Étape 27 installée : retour immédiat à la fiche, MsgBox sur DinozPage uniquement.');
