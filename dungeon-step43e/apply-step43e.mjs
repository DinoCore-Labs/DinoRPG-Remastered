import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const root = process.cwd();
const source = new URL('./mtDungeonOriginalRoutes.test.ts', import.meta.url);
const target = resolve(root, 'app/server/test/integration/dungeon/mtDungeonOriginalRoutes.test.ts');
if (!existsSync(resolve(root, 'app/server/vitest.integration.config.ts')) || !existsSync(resolve(root, 'packages/core/src/models/dungeon/dungeon.mtData.ts')))
  throw new Error('Run this script at the DinoRPG Remastered monorepo root.');
const content = readFileSync(source, 'utf8');
if (existsSync(target)) {
  if (readFileSync(target, 'utf8') === content) { console.log('Already installed.'); process.exit(0); }
  throw new Error(`Refusing to overwrite existing file: ${target}`);
}
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, content, 'utf8');
console.log(`Created ${target}`);
