import fs from 'fs';
import path from 'path';

/**
 * Transforme un chemin de workspace en un nom lisible :
 * - packages/core → Core
 * - app/server → Server
 * - @dinorpg/client → Client
 */
function formatPackageName(pkg) {
	// Récupère juste le dernier segment (client, server, core…)
	const base = pkg.split('/').pop() || pkg;

	// Retire un éventuel préfixe @dinorpg/
	const clean = base.replace('@dinorpg/', '').replace('dinorpg-', '');

	// Transforme "core-module" → "Core Module"
	return clean.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function mergeChangelogs() {
	const workspaces = ['packages/core', 'packages/bot', 'app/server', 'app/client'];

	let output = `# 📦 Global CHANGELOG\n\n`;

	for (const pkg of workspaces) {
		const file = path.join(pkg, 'CHANGELOG.md');

		if (!fs.existsSync(file)) {
			console.warn(`⚠️ Aucun CHANGELOG pour ${pkg}`);
			continue;
		}

		let content = fs.readFileSync(file, 'utf8');

		// Nettoyage : supprime le titre h1 existant
		content = content.replace(/^#.*$/m, '').trim();

		const prettyName = formatPackageName(pkg);

		output += `## 🔹 ${prettyName}\n\n${content}\n\n`;
	}

	fs.writeFileSync('CHANGELOG.md', output);
	console.log('✨ CHANGELOG.md global généré !');
}

mergeChangelogs();
