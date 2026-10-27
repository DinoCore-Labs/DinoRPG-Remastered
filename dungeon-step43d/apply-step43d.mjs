import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repo = process.cwd();
const source = new URL('./mtDungeonStages.test.ts', import.meta.url);
const target = resolve(repo, 'app/server/test/integration/dungeon/mtDungeonStages.test.ts');
const prerequisite = resolve(repo, 'app/server/src/Dungeon/Repository/prismaMtDungeonRun.repository.ts');
if (!existsSync(prerequisite)) throw new Error('Exécuter depuis la racine du monorepo.');
if (existsSync(target)) throw new Error(`Fichier déjà présent : ${target}. Aucun écrasement automatique.`);
mkdirSync(resolve(repo, 'app/server/test/integration/dungeon'), { recursive: true });
writeFileSync(target, readFileSync(source));
console.log(`Ajouté : ${target}`);
