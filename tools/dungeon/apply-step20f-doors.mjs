/**
 * Step 20F corrected: accepts MT command results from either step 20D or 20E.
 * Patches in memory and validates all anchors BEFORE any filesystem write.
 * Keeps existing goldAwarded/walletGold fields. No Git / network operations.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const planned = new Map();
function edit(file, transform) {
  const path = resolve(root, file);
  if (!existsSync(path)) throw new Error(`${file}: fichier absent (lancer depuis la racine du projet)`);
  const original = readFileSync(path, 'utf8');
  const source = original.replace(/\r\n/g, '\n');
  const changed = transform(source, file);
  planned.set(file, {path, original, updated: original.includes('\r\n') ? changed.replace(/\n/g, '\r\n') : changed});
}
function replaceOnce(input, oldValue, newValue, file) {
  if (input.includes(newValue)) return input;
  const start = input.indexOf(oldValue);
  if (start < 0 || input.indexOf(oldValue, start+1) !== -1)
    throw new Error(`${file}: ancre introuvable/ambiguë : ${oldValue.slice(0,85)}`);
  return input.slice(0, start) + newValue + input.slice(start + oldValue.length);
}

edit('packages/core/src/models/dungeon/dungeon.session.ts', (text, file) => {
  // Find the successful discriminated union arm without assuming the previous
  // extensions (20E goldAwarded/walletGold) or Prettier layout.
  const typeStart = text.indexOf('export type MtSessionBatchResult =');
  const typeEnd = text.indexOf('export interface MtSessionConfiguration', typeStart);
  if (typeStart < 0 || typeEnd < 0) throw new Error(`${file}: MtSessionBatchResult introuvable`);
  const before = text.slice(typeStart, typeEnd);
  const successMatch = before.match(/\|\s*\{\s*ok\s*:\s*true\s*;[\s\S]*?\}\s*;/);
  if (!successMatch || !/\bpending\s*:\s*MtPendingInteraction\s*\|\s*null\s*;/.test(successMatch[0]))
    throw new Error(`${file}: branche ok:true de MtSessionBatchResult introuvable`);
  if (!before.includes('blockedDoor?')) {
    const currentArm = successMatch[0];
    // No destructive replacement of the success arm: add only one extra field.
    const addedProperty = "blockedDoor?: 'missing-key';";
    let updatedArm;
    if (!currentArm.includes('\n')) {
      const end = currentArm.lastIndexOf('}');
      const prefix = currentArm.slice(0, end).trimEnd();
      const separator = prefix.endsWith(';') ? '' : ';';
      updatedArm = `${prefix}${separator} ${addedProperty} ${currentArm.slice(end)}`;
    } else {
      const propertyIndent = currentArm.match(/^([ \t]*)pending\s*:/m)?.[1];
      const closing = currentArm.match(/\n([ \t]*)}\s*;$/);
      if (propertyIndent === undefined || !closing) throw new Error(`${file}: format du type de succès inattendu`);
      updatedArm = currentArm.replace(/\n([ \t]*)}\s*;$/,
        `\n${propertyIndent}${addedProperty}\n${closing[1]}};`);
    }
    text = text.slice(0,typeStart) + before.replace(currentArm,updatedArm) + text.slice(typeEnd);
  }
  const oldMove = "\t\t\t// MT View.move sends this command for a locked door, but does not move.\n\t\t\t// No key/flag is created by an unsuccessful crossing.\n\t\t\tif (index !== commands.length - 1) return fail('invalid-batch', index + 1);\n\t\t\tresult.revision++;\n\t\t\treturn { ok: true, session: result, accepted: index + 1, pending: null };";
  const newMove = "\t\t\t// MT View.move sends this command for a locked door, but does not move.\n\t\t\t// No key/flag is created by an unsuccessful crossing.\n\t\t\tif (index !== commands.length - 1) return fail('invalid-batch', index + 1);\n\t\t\tresult.revision++;\n\t\t\tconst missingKey = decision.events.some(event => event.kind === 'locked-door');\n\t\t\treturn {\n\t\t\t\tok: true,\n\t\t\t\tsession: result,\n\t\t\t\taccepted: index + 1,\n\t\t\t\tpending: null,\n\t\t\t\t...(missingKey ? { blockedDoor: 'missing-key' as const } : {})\n\t\t\t};";
  return replaceOnce(text, oldMove, newMove, file);
});

edit('app/client/src/services/mtDungeon.service.ts', (text, file) => {
  const start = text.indexOf('\tmove(');
  const end = text.indexOf('\ttransition(', start);
  if (start < 0 || end < 0) throw new Error(`${file}: méthode move() introuvable`);
  const block = text.slice(start,end);
  if (block.includes("blockedDoor?: 'missing-key'")) return text;
  const match = block.match(/^(\s*)pending:\s*MtDungeonSession\['pending'\];/m);
  if (!match) throw new Error(`${file}: type pending de move() introuvable`);
  const indent = match[1].match(/\n([\t ]*)$/)?.[1] ?? '\t\t';
  const updated = block.replace(match[0], match[0] + `\n${indent}blockedDoor?: 'missing-key';`);
  return text.slice(0,start) + updated + text.slice(end);
});

edit('app/client/src/pages/MtMagneticCavernsPage.vue', (text, file) => {
  const keysSpan = '\t\t\t\t\t<span>Clés MT récupérées : {{ session.keys.filter(Boolean).length }}</span>';
  if (!text.includes(keysSpan)) {
    const revision = /(<span>Révision\s*:\s*\{\{\s*session\.revision\s*\}\}<\/span>)/g;
    const matches = [...text.matchAll(revision)];
    if (matches.length !== 1) throw new Error(`${file}: ancre Révision introuvable/ambiguë`);
    const anchor = matches[0][1];
    text = text.replace(anchor, `${anchor}\n${keysSpan}`);
  }
  const west = "\t\tif (direction === 'west') facingRight.value = false;";
  const feedback = "\t\tif (result.blockedDoor === 'missing-key') {\n\t\t\t// Consume the revision, but do not animate a fake movement.\n\t\t\tawait afterMutation(result.session);\n\t\t\tnotice.value = 'Cette porte est verrouillée. Il faut trouver sa clé dans le donjon.';\n\t\t\treturn;\n\t\t}\n";
  if (text.includes("result.blockedDoor === 'missing-key'")) return text;
  return replaceOnce(text,west,feedback+west,file);
});

const testFile = 'packages/core/test/unit/dungeon/dungeon.doors-persistence.test.ts';
const srcTest = resolve(dirname(fileURLToPath(import.meta.url)), '../../',testFile);
const targetTest = resolve(root,testFile);
if (!existsSync(srcTest)) throw new Error(`Archive incomplète : ${testFile}`);
const sourceTest = readFileSync(srcTest, 'utf8');
if (existsSync(targetTest) && readFileSync(targetTest, 'utf8').replace(/\r\n/g,'\n') !== sourceTest.replace(/\r\n/g,'\n'))
  throw new Error(`${testFile}: fichier de test existant différent, refus d'écraser`);
// Write only after every check is complete.
let count = 0;
for (const [file, {path, original, updated}] of planned) {
  if (updated === original) continue;
  writeFileSync(path, updated, 'utf8');
  console.log(`Modifié : ${file}`);
  count++;
}
if (!existsSync(targetTest)) {
  mkdirSync(dirname(targetTest), {recursive: true});
  writeFileSync(targetTest, sourceTest, 'utf8');
  console.log(`Ajouté : ${testFile}`);
  count++;
}
console.log(count ? `Étape 20F corrigée : ${count} fichier(s) installé(s).` : 'Étape 20F déjà appliquée (aucune modification).');
