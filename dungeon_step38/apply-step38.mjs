import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const base = dirname(fileURLToPath(import.meta.url));
const target = resolve(process.cwd(), 'app/client/src/components/dungeon/mtDungeonGuardianFrames.ts');
if (!existsSync(target)) {
	throw new Error(`Fichier introuvable : ${target}. Lance le script à la racine du monorepo.`);
}
copyFileSync(resolve(base, 'mtDungeonGuardianFrames.ts'), target);
console.log('Étape 38 : recadrage uniforme des animations de gardiens installé.');
