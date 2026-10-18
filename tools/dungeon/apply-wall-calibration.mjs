import { readFileSync, writeFileSync } from 'node:fs';

const filename = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
const source = readFileSync(filename, 'utf8');
const original = 'const wallOffsets = ref<Partial<Record<MtWallPart, { x: number; y: number }>>>({});';
const replacement = `const wallOffsets = ref<Partial<Record<MtWallPart, { x: number; y: number }>>>({
\tfront: { x: 0, y: -2 },
\t'side-left': { x: 0, y: -10 },
\t'side-right': { x: 0, y: -10 },
\tback: { x: 0, y: -20 },
\t'corner-top-left': { x: -1, y: -3 },
\t'corner-top-right': { x: -7, y: -3 },
\t'corner-bottom-left': { x: -1, y: 1 },
\t'corner-bottom-right': { x: -7, y: 0 }
});`;
if (source.includes(replacement)) {
	console.log('Les calibrations demandées sont déjà en place.');
	process.exit(0);
}
const matches = source.split(original).length - 1;
if (matches !== 1) {
	console.error(
		`Impossible de trouver l'initialisation attendue des murs (occurrences : ${matches}). Fichier inchangé.`
	);
	process.exit(1);
}
writeFileSync(filename, source.replace(original, replacement), 'utf8');
console.log('Calibrations des 8 types de murs appliquées :', filename);
