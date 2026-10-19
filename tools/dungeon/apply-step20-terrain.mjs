/** Safe, repeatable patch of the checked feat/mt-dungeons server + diagnostic page. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const files = [
	'app/server/src/Dungeon/Service/mtDungeonView.service.ts',
	'app/client/src/pages/MtMagneticCavernsPage.vue'
];
if (files.some(file => !existsSync(file))) {
	throw new Error('Run at the DinoRPG-Remastered repository root.');
}
const server = readFileSync(files[0], 'utf8');
const page = readFileSync(files[1], 'utf8');
function replaceOnce(source, before, after, file) {
	if (source.includes(after)) return source;
	const count = source.split(before).length - 1;
	if (count !== 1) throw new Error(`Unexpected ${file} anchor count: ${count}. No files changed.`);
	return source.replace(before, after);
}
let newServer = replaceOnce(
	server,
	"import { buildMtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';",
	"import { buildMtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';\nimport { createMtDungeonTerrainNoise } from '@dinorpg/core/models/dungeon/dungeon.terrainNoise.js';",
	files[0]
);
newServer = replaceOnce(
	newServer,
	'noiseAt: () => 255,',
	'noiseAt: createMtDungeonTerrainNoise(session.mapId, position.l, skin.perlin),',
	files[0]
);
newServer = replaceOnce(
	newServer,
	"['neutral-perlin-noise', 'flash-actor-not-yet-ported'] as const",
	"['approximate-terrain-noise', 'flash-actor-not-yet-ported'] as const",
	files[0]
);
newServer = newServer.replace(
	/\s*\/\/ Neutral fallback until original Flash perlinNoise implementation is ported\.\n/,
	'\n\t\t// Deterministic EternalTwin approximation; Flash perlinNoise still unavailable.\n'
);
newServer = newServer.replace(
	' * intentionally uses a neutral/no-overlay surface rather than inventing noise.',
	' * now uses explicitly approximate EternalTwin-style value noise (not Flash perlinNoise).'
);
let newPage = replaceOnce(
	page,
	':facing-right="facingRight"',
	':facing-right="facingRight"\n\t\t\t\t\t\t:show-unverified-same-name-overlays="true"',
	files[1]
);
// All anchors checked before any mutation.
writeFileSync(files[0], newServer);
writeFileSync(files[1], newPage);
console.log('Step 20 terrain approximation enabled, same-name overlays preview in Cavernes test page only.');
