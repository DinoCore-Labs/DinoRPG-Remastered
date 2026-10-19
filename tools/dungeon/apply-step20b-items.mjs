/**
 * Stage 20B: narrow, fail-closed, idempotent edits to two current source files.
 * Run at repository root. The original files are never rewritten if any anchor
 * has changed or if the helper/test files haven't first been extracted.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const catalogPath = 'app/client/src/components/dungeon/mtOriginalSpriteCatalog.ts';
const canvasPath = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
const helperPath = 'app/client/src/components/dungeon/mtDungeonItemPlacement.ts';
const testPath = 'app/client/test/unit/dungeon/mtDungeonItemPlacement.test.ts';

for (const path of [catalogPath, canvasPath, helperPath, testPath]) {
	if (!existsSync(path)) throw new Error(`Fichier requis absent : ${path}. Extraire l'archive à la racine du dépôt.`);
}

const catalog = readFileSync(catalogPath, 'utf8');
const canvas = readFileSync(canvasPath, 'utf8');
const changes = new Map();

function replaceOnce(path, source, exact, replacement) {
	if (source.includes(replacement)) return source;
	const hits = source.split(exact).length - 1;
	if (hits !== 1) throw new Error(`${path}: ancrage introuvable ou ambigu (${hits}) : ${exact.slice(0, 75)}`);
	return source.replace(exact, replacement);
}

// These icons are explicitly present in the canonical FR dungeons.xml definitions.
const scenarioPattern = /[ \t]*case 'scenario-icon':\s*unresolved\.add\(`Scénario : symbole Flash DIIcon « \$\{feature\.icon\} » à extraire de gfx\.swf`\);\s*return null;/;
const scenarioReplacement = `\t\tcase 'scenario-icon': {
\t\t\t// The canonical MT definitions use exactly chest, scroll and skel.
\t\t\t// These exact PNG files exist in the original export.
\t\t\tif (feature.icon === 'chest' || feature.icon === 'scroll' || feature.icon === 'skel') {
\t\t\t\treturn \`item_\${feature.icon}.png\`;
\t\t\t}
\t\t\tunresolved.add(\`Scénario : symbole Flash DIIcon « \${feature.icon} » à extraire de gfx.swf\`);
\t\t\treturn null;
\t\t}`;

let nextCatalog = catalog;
if (!catalog.includes("if (feature.icon === 'chest' || feature.icon === 'scroll' || feature.icon === 'skel')")) {
	const matches = catalog.match(new RegExp(scenarioPattern.source, 'g')) ?? [];
	if (matches.length !== 1) throw new Error(`Catalogue: bloc scenario-icon non trouvé de manière unique (${matches.length})`);
	nextCatalog = catalog.replace(scenarioPattern, scenarioReplacement);
}

const oldLabel = '`item:${file ?? feature.kind}`';
const newLabel = '`item:${feature.kind}:${file ?? \'missing\'}`';
nextCatalog = replaceOnce(catalogPath, nextCatalog, oldLabel, newLabel);
changes.set(catalogPath, nextCatalog);

const importAnchor = "import { createMtSpritePlan, type MtRandomFrameSource } from './mtOriginalSpriteCatalog.js';";
const importReplacement = `${importAnchor}\nimport { placeMtDungeonItem } from './mtDungeonItemPlacement.js';`;
let nextCanvas = replaceOnce(canvasPath, canvas, importAnchor, importReplacement);

// Replace the complete stair-specific branch + catch-all. Not the preceding wall logic.
const oldBranch = `\t} else if (sprite.file === 'item_stair_up.png' || sprite.file === 'item_stair_down.png') {
\t\t// EternalTwin MazeRenderer.drawIcon()/sprite(): separate centered icon plane.
\t\t// The former label was item:stair for both variants, so it never matched.
\t\tconst size = sprite.file === 'item_stair_up.png' ? 1.2 : 0.9;
\t\tconst cell = 40;
\t\tvisual.anchor.set(0.5);
\t\tvisual.scale.set((cell * size) / Math.max(texture.width, texture.height));
\t\tvisual.position.set(sprite.x + cell / 2 - originX, sprite.y + cell / 2 - cell * 0.4 - originY);
\t\titems.addChild(visual);
\t} else {
\t\tvisual.position.set(sprite.x - originX, sprite.y - originY);
\t\t(sprite.label.startsWith('item:') ? items : ground).addChild(visual);
\t}`;

const newBranch = `\t} else if (sprite.label.startsWith('item:')) {
\t\t// Unlike ground tiles, MT items are centered on the logical cell.
\t\t// Compute placement from the *actual* source PNG, not an item label.
\t\tconst placement = placeMtDungeonItem(
\t\t\tsprite.file, sprite.x, sprite.y, texture.width, texture.height
\t\t);
\t\tif (placement) {
\t\t\tvisual.anchor.set(placement.anchorX, placement.anchorY);
\t\t\tvisual.scale.set(placement.scale);
\t\t\tvisual.position.set(placement.x - originX, placement.y - originY);
\t\t} else {
\t\t\t// No fabricated artwork for unsupported original Flash frames.
\t\t\tvisual.position.set(sprite.x - originX, sprite.y - originY);
\t\t}
\t\titems.addChild(visual);
\t} else {
\t\t// Ground and overground remain at their original top-left coordinates.
\t\tvisual.position.set(sprite.x - originX, sprite.y - originY);
\t\tground.addChild(visual);
\t}`;
nextCanvas = replaceOnce(canvasPath, nextCanvas, oldBranch, newBranch);

// EternalTwin ground -> map(items) -> wallBack -> actors -> wallFront -> fog.
nextCanvas = replaceOnce(
	canvasPath, nextCanvas,
	'worldLayer.addChild(ground, northernWalls, items, actorsLayer, nearWalls, fogLayer, diagnosticsLayer);',
	'worldLayer.addChild(ground, items, northernWalls, actorsLayer, nearWalls, fogLayer, diagnosticsLayer);'
);
changes.set(canvasPath, nextCanvas);

// Check successful patch before any write: no broken text substitutions.
if (!nextCatalog.includes("return `item_${feature.icon}.png`;")) throw new Error('Catalogue: mapping scénario non construit.');
if (!nextCanvas.includes('placeMtDungeonItem(')) throw new Error('Canvas: placement des items non construit.');
const dirty = [...changes].filter(([path, contents]) => contents !== readFileSync(path, 'utf8'));
for (const [path, contents] of dirty) writeFileSync(path, contents, 'utf8');
console.log(dirty.length ? `20B appliquée : ${dirty.map(([path]) => path).join(', ')}` : '20B déjà appliquée : aucun changement.');
