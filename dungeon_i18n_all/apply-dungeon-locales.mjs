import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(process.cwd(), 'app/client/src/i18n/locales');
const langs = ['EN', 'ES', 'DE'];
const pending = [];
for (const lang of langs) {
  const target = resolve(localesDir, `${lang}.json`);
  if (!existsSync(target)) throw new Error(`Missing locale: ${target}`);
  const source = JSON.parse(readFileSync(resolve(dir, `${lang}.dungeon.json`), 'utf8'));
  const original = JSON.parse(readFileSync(target, 'utf8'));
  // Only write the dungeon namespace; retain all other translations.
  const dungeon = original.dungeon && typeof original.dungeon === 'object' && !Array.isArray(original.dungeon)
    ? original.dungeon : {};
  original.dungeon = { ...dungeon, ...source, keys: { ...(dungeon.keys || {}), ...source.keys } };
  pending.push([target, JSON.stringify(original, null, 2) + '\n']);
}
for (const [file, content] of pending) writeFileSync(file, content, 'utf8');
console.log('All 3 dungeon locales updated (EN, ES, DE).');
