import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve(process.cwd(), 'app/client/src/pages/DungeonPage.vue');
if (!fs.existsSync(file)) throw new Error(`DungeonPage.vue introuvable : ${file}`);
const original = fs.readFileSync(file, 'utf8');
const startPattern = /^(\s*)<template>\s*\r?\n(?=\s*<details class="mt-test__status">)/gm;
const starts = [...original.matchAll(startPattern)];
if (starts.length === 0) {
  if (original.includes('<details class="mt-test__status">') && !original.includes('<template v-else>')) {
    console.log('Correctif deja applique (aucun wrapper inerte).');
    process.exit(0);
  }
  throw new Error('Wrapper du statut introuvable : aucun fichier modifie.');
}
if (starts.length !== 1) throw new Error(`Wrapper ambigu (${starts.length}) : aucun fichier modifie.`);
const closingPattern = /(^[ \t]*<\/details>\r?\n)([ \t]*<\/template>\r?\n)([ \t]*<\/template>\r?\n[ \t]*<\/section>\r?\n<\/template>)/gm;
const closings = [...original.matchAll(closingPattern)];
if (closings.length !== 1) throw new Error(`Fermeture de wrapper ambiguë (${closings.length}) : aucun fichier modifie.`);
let output = original.replace(startPattern, '');
output = output.replace(closingPattern, '$1$3');
if (output === original || !output.includes('<MtOriginalDungeonCanvas') || !output.includes('<template v-if="session">') || !output.includes('<DZDisclaimer')) {
  throw new Error('Validation du correctif echouee : aucun fichier modifie.');
}
fs.writeFileSync(file, output, 'utf8');
console.log('OK : wrapper HTML inerte supprime. Canvas et interactions conserves.');
