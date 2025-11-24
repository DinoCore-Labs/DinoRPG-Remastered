import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Récupère le chemin absolu vers le dossier du serveur
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lit le package.json à partir de la racine du backend
const packageJsonPath = path.join(__dirname, '../../package.json');
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const version = pkg.version;

export default version;
