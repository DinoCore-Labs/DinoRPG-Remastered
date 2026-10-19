/** Step 20C: fail-closed, idempotent source edits (no Git operation). */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const catalogPath = 'app/client/src/components/dungeon/mtOriginalSpriteCatalog.ts';
const canvasPath = 'app/client/src/components/dungeon/MtOriginalDungeonCanvas.vue';
const servicePath = 'app/client/src/services/mtDungeon.service.ts';
const pagePath = 'app/client/src/pages/MtMagneticCavernsPage.vue';
const serverPath = 'app/server/src/Dungeon/Service/mtDungeonView.service.ts';
const helperServer = 'app/server/src/Dungeon/Service/mtDungeonGuardianVisuals.service.ts';
const helperClient = 'app/client/src/components/dungeon/mtDungeonGuardianFrames.ts';
const test = 'app/server/test/unit/dungeon/mtDungeonGuardianVisuals.service.test.ts';

const paths = [catalogPath, canvasPath, servicePath, pagePath, serverPath];
for (const path of [...paths, helperServer, helperClient, test]) {
	if (!existsSync(path)) throw new Error(`Fichier absent : ${path} — extrais l'archive à la racine du dépôt.`);
}
const sources = Object.fromEntries(paths.map(path => [path, readFileSync(path, 'utf8')]));

function replaceOnce(path, src, before, after) {
	if (src.includes(after)) return src;
	const count = src.split(before).length - 1;
	if (count !== 1) throw new Error(`20C: ancrage absent ou ambigu dans ${path} (${count}) : ${before.slice(0, 90)}`);
	return src.replace(before, after);
}
function patch(path, actions) {
	let content = sources[path];
	for (const [before, after] of actions) content = replaceOnce(path, content, before, after);
	sources[path] = content;
}

// Graphic guardians are no longer arbitrary static item_skel placeholders.
const guardianCase = /case 'guardian':\s*unresolved\.add\([^;]+\);\s*return 'item_skel\.png';[^\n]*/g;
if (!sources[catalogPath].includes("// Animated smonster guardians are drawn on the actor plane")) {
	const matches = [...sources[catalogPath].matchAll(guardianCase)];
	if (matches.length !== 1) throw new Error(`20C: bloc guardian du catalogue ambigu (${matches.length}).`);
	sources[catalogPath] = sources[catalogPath].replace(guardianCase,
		"case 'guardian':\n\t\t\t// Animated smonster guardians are drawn on the actor plane, not the item plane.\n\t\t\treturn null;");
}

patch(serverPath, [
	["import { buildMtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';",
	 "import { buildMtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';\nimport { getVisibleMtDungeonGuardianVisuals } from './mtDungeonGuardianVisuals.service.js';"],
	["const skinName = archive.definition(dungeonId).stages[stage]?.skin;",
	 "const definition = archive.definition(dungeonId);\n\tconst skinName = definition.stages[stage]?.skin;"],
	["\treturn {\n\t\tmapId: session.mapId,",
	 "\t// Never expose monsters on tiles that have not been revealed.\n\tconst visibleScene = redactMtDungeonViewport(scene, cfg.map, fog);\n\tconst guardianSprites = getVisibleMtDungeonGuardianVisuals(\n\t\tvisibleScene, cfg.map.width, cfg.map.height, definition.monsters\n\t);\n\treturn {\n\t\tmapId: session.mapId,"],
	["scene: redactMtDungeonViewport(scene, cfg.map, fog),",
	 "scene: visibleScene,\n\t\tguardianSprites,"]
]);

patch(servicePath, [
	["export interface MtDungeonCurrentView {",
	 "export interface MtDungeonGuardianVisual {\n\tx: number;\n\ty: number;\n\tgfx: string;\n\tsource: 'door' | 'scenario';\n}\n\nexport interface MtDungeonCurrentView {"],
	["\tscene: MtDungeonScene;",
	 "\tscene: MtDungeonScene;\n\tguardianSprites: MtDungeonGuardianVisual[];"]
]);

// Page binding: keep the existing formatting/indentation.
if (!sources[pagePath].includes(':guardians="view.guardianSprites ?? []"')) {
    const line = /^([ \t]*):scene="view\.scene"$/gm;
    const hits = [...sources[pagePath].matchAll(line)];
    if (hits.length !== 1) throw new Error(`20C: lien scene du composant absent/ambigu (${hits.length}).`);
    sources[pagePath] = sources[pagePath].replace(line,
        (_full, indent) => `${indent}:scene="view.scene"\n${indent}:guardians="view.guardianSprites ?? []"`);
}

const importsAnchor = "import { loadMtDungeonActorFrames } from './mtDungeonActorFrames.js';";
patch(canvasPath, [
	[importsAnchor,
	 `${importsAnchor}\nimport { loadMtDungeonGuardianFrames } from './mtDungeonGuardianFrames.js';\nimport type { MtDungeonGuardianVisual } from '../../services/mtDungeon.service.js';`],
	['\tactors?: readonly MtDungeonActor[];',
	 '\tactors?: readonly MtDungeonActor[];\n\tguardians?: readonly MtDungeonGuardianVisual[];'],
	['const actorNodes = new Map<number, ActorState>();',
	 'const actorNodes = new Map<number, ActorState>();\nconst guardianNodes = new Set<AnimatedSprite>();'],
	['function paintFog(scene: MtDungeonScene): void {',
`/** Monsters share the sortable actor plane with the Dinoz. Never use PixiJS 7 nodes. */
function clearGuardianNodes(): void {
\tfor (const visual of guardianNodes) {
\t\tvisual.stop();
\t\tactorsLayer.removeChild(visual);
\t\tvisual.destroy();
\t}
\tguardianNodes.clear();
}

function paintGuardians(scene: MtDungeonScene, ticket: number): void {
\tfor (const guardian of props.guardians ?? []) {
\t\tif (!Number.isInteger(guardian.x) || !Number.isInteger(guardian.y)) continue;
\t\tconst x = (guardian.x - scene.viewport.ix + 0.5) * 40;
\t\tconst y = (guardian.y - scene.viewport.iy + 0.75) * 40;
\t\tvoid loadMtDungeonGuardianFrames(guardian.gfx)
\t\t\t.then(frames => {
\t\t\t\tif (disposed || !app || ticket !== generation || !frames.length) return;
\t\t\t\tconst visual = new AnimatedSprite([...frames]);
\t\t\t\tvisual.anchor.set(0.5);
\t\t\t\tvisual.position.set(x, y);
\t\t\t\tvisual.zIndex = guardian.y;
\t\t\t\tvisual.animationSpeed = 0.2;
\t\t\t\tvisual.loop = true;
\t\t\t\tactorsLayer.addChild(visual);
\t\t\t\tguardianNodes.add(visual);
\t\t\t\tvisual.play();
\t\t\t})
\t\t\t.catch(error => {
\t\t\t\tif (disposed || ticket !== generation) return;
\t\t\t\tdiagnostics.value = [
\t\t\t\t\t...diagnostics.value,
\t\t\t\t\t\`Monstre MT \${guardian.gfx} : chargement impossible (\${String(error)})\`
\t\t\t\t];
\t\t\t});
\t}
}

function paintFog(scene: MtDungeonScene): void {`],
	['\tfor (const layer of [ground, northernWalls, items, nearWalls, fogLayer, diagnosticsLayer]) clear(layer);',
	 '\tclearGuardianNodes();\n\tfor (const layer of [ground, northernWalls, items, nearWalls, fogLayer, diagnosticsLayer]) clear(layer);'],
	['\tsyncActors(shift.snap);',
	 '\tsyncActors(shift.snap);\n\tpaintGuardians(scene, ticket);'],
	['\tactorNodes.clear();',
	 '\tclearGuardianNodes();\n\tactorNodes.clear();']
]);

// Be tolerant of Prettier's optional blank lines in the Vue watcher.
if (!sources[canvasPath].includes('props.guardians,') ||
    !/props\.guardians,\s*props\.stageKey,/.test(sources[canvasPath])) {
    const watchedScene = /props\.scene,(\s*)props\.stageKey,/g;
    const found = [...sources[canvasPath].matchAll(watchedScene)];
    if (found.length !== 1) throw new Error(`20C: watcher de scène ambigu (${found.length}).`);
    sources[canvasPath] = sources[canvasPath].replace(watchedScene,
        (_whole, whitespace) => `props.scene,${whitespace}props.guardians,${whitespace}props.stageKey,`);
}

// The inserted template literal must interpolate in the produced Vue source, not the installer.
const canvas = sources[canvasPath];
if (canvas.includes('\${guardian.gfx}') || canvas.includes('\${String(error)}')) {
	sources[canvasPath] = canvas.replaceAll('\${guardian.gfx}', '${guardian.gfx}').replaceAll('\${String(error)}', '${String(error)}');
}

// All patches are computed/checked in memory BEFORE writing any source file.
for (const [path, data] of Object.entries(sources)) {
	if (!data.includes('\n') || data.includes('replace(/**')) throw new Error(`20C: source potentiellement corrompue : ${path}`);
}
const dirty = Object.entries(sources).filter(([path, data]) => data !== readFileSync(path, 'utf8'));
for (const [path, data] of dirty) writeFileSync(path, data, 'utf8');
console.log(dirty.length ? `20C installée : ${dirty.map(([path]) => path).join(', ')}` : '20C déjà installée : aucun changement.');
