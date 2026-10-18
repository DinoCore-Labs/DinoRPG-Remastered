/** Idempotently register protected MT dungeon routes in server.ts. Local-only. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const path = resolve('app/server/src/server.ts');
const apply = process.argv.includes('--apply');
const original = readFileSync(path, 'utf8');
const eol = original.includes('\r\n') ? '\r\n' : '\n';
let content = original.replace(/\r\n/g, '\n');
const markerImport = "import { dinozRoutes } from './Dinoz/Routes/dinoz.routes.js';";
const newImport = "import { mtDungeonRoutes } from './Dungeon/Routes/mtDungeon.routes.js';";
const markerRegister = "server.register(dinozRoutes, { prefix: 'api/dinoz' });";
const newRegister = "server.register(mtDungeonRoutes, { prefix: 'api/dungeon/mt' });";
if (!content.includes(markerImport) || !content.includes(markerRegister)) throw new Error('server.ts differs from the validated develop baseline. Manual reconciliation required.');
if (!content.includes(newImport)) content = content.replace(markerImport, `${markerImport}\n${newImport}`);
if (!content.includes(newRegister)) content = content.replace(markerRegister, `${markerRegister}\n\t${newRegister}`);
const output = content.replace(/\n/g, eol);
if (output === original) console.log('MT dungeon routes already registered.');
else if (!apply) console.log('Dry-run OK: MT routes can be registered. Use --apply.');
else { writeFileSync(path, output, 'utf8'); console.log('MT dungeon routes registered locally.'); }
