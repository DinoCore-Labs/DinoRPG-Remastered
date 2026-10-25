import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const path = 'app/client/src/pages/DungeonPage.vue';
if (!existsSync(path)) throw new Error(`Fichier introuvable : ${path}. Lance le script depuis la racine du monorepo.`);
const original = readFileSync(path, 'utf8');
let source = original;
const exact = (before, after, label) => {
  if (source.includes(after) && !source.includes(before)) return;
  if (source.split(before).length !== 2) throw new Error(`Ancre absente ou ambiguë (${label}). Aucun fichier modifié.`);
  source = source.replace(before, after);
};
const redundantPanel = /\t\t<section v-if="exitOutcome" class="mt-test__panel" aria-live="polite">[\s\S]*?\t\t<\/section>\r?\n/;
if (redundantPanel.test(source)) source = source.replace(redundantPanel, '');
const oldVariant = "activeMessage.kind === 'entry' || activeMessage.kind === 'irma' || activeMessage.kind === 'pickup'";
const newVariant = "activeMessage.kind === 'entry' || activeMessage.kind === 'irma' || activeMessage.kind === 'pickup' || activeMessage.kind === 'exit'";
if (source.includes(oldVariant) && !source.includes(newVariant)) {
  source = source.split(oldVariant).join(newVariant);
}
exact("return { kind: 'exit', title: 'Sortie du donjon', text: exitOutcome.value.text, confirmLabel: 'Retour à la fiche' };", "return { kind: 'exit', title: '', text: exitOutcome.value.text, confirmLabel: 'Retour à la fiche' };", 'message de sortie');
exact("void router.push({ name: 'DinozPage', params: { id: String(leaderId) } });", "void router.replace({ name: 'DinozPage', params: { id: String(leaderId) } });", 'navigation de sortie');
if (!source.includes("activeMessage.kind === 'exit'")) throw new Error('Le mode notice de sortie est absent. Aucun fichier modifié.');
if (redundantPanel.test(source)) throw new Error('Panneau de sortie toujours présent. Aucun fichier modifié.');
if (source === original) console.log('Étape 26 déjà appliquée.');
else { writeFileSync(path, source); console.log('Étape 26 appliquée : sortie via MsgBox sans bouton, sans panneau, retour vers fiche Dinoz.'); }
