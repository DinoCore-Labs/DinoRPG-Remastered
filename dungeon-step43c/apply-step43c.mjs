import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const base = dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
if (!existsSync(resolve(root, 'app/server/vitest.integration.config.ts'))) {
  throw new Error('Launch the installer at the monorepo root.');
}
const destination = resolve(root, 'app/server/test/integration/dungeon/mtDungeonPartyActions.test.ts');
if (existsSync(destination)) throw new Error(`File exists; refusing to overwrite: ${destination}`);
mkdirSync(dirname(destination), { recursive: true });
copyFileSync(resolve(base, 'mtDungeonPartyActions.test.ts'), destination);
console.log('Installed true PostgreSQL integration tests at', destination);
