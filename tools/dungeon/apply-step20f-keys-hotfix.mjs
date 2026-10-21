/**
 * Step 20F hotfix — preserve a dense boolean key array when collecting IKey.
 * Uses an exact, fail-closed anchor; does not touch the database or GitHub.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const relative = 'packages/core/src/models/dungeon/dungeon.exploration.ts';
const path = resolve(process.cwd(), relative);
if (!existsSync(path)) throw new Error(`${relative}: fichier introuvable (lancer depuis la racine du projet).`);
const input = readFileSync(path, 'utf8');
const crlf = input.includes('\r\n');
const source = input.replace(/\r\n/g, '\n');
const before = "\t\tif (item.kind === 'IKey') {\n\t\t\tkeys[item.value] = true;";
const after = "\t\tif (item.kind === 'IKey') {\n\t\t\t// Preserve dense boolean keys for nonzero MT key IDs (Postgres + session validation).\n\t\t\twhile (keys.length <= item.value) keys.push(false);\n\t\t\tkeys[item.value] = true;";

if (source.includes(after)) {
  console.log('Correctif 20F clés déjà installé : aucune modification.');
  process.exit(0);
}
const position = source.indexOf(before);
if (position === -1 || source.indexOf(before, position + 1) !== -1) {
  throw new Error(`${relative}: ancre introuvable ou ambiguë. Aucun fichier modifié.`);
}
const updated = source.slice(0, position) + after + source.slice(position + before.length);
writeFileSync(path, crlf ? updated.replace(/\n/g, '\r\n') : updated, 'utf8');
console.log(`Correctif appliqué : ${relative}`);
