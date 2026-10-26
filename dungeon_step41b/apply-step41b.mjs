import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = resolve(dirname(fileURLToPath(import.meta.url)), 'dungeon.mtInteractionCoverage.test.ts');
const dest = resolve(process.cwd(), 'packages/core/test/unit/dungeon/dungeon.mtInteractionCoverage.test.ts');
if (!existsSync(resolve(process.cwd(), 'packages/core/src/models/dungeon/dungeon.mtData.ts'))) {
  throw new Error('Run this installer from the DinoRPG monorepo root.');
}
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log('Stage 41b: all-map interaction/persistence test installed.');
