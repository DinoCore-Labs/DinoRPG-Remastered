<template>
	<section class="mt-dungeon-renderer" aria-label="Exploration des Cavernes Magnétiques">
		<div
			ref="mount"
			class="mt-dungeon-renderer__stage"
			role="img"
			aria-label="Vue du donjon : sols MT, murs en profondeur et groupe de Dinoz"
		/>

		<div class="mt-dungeon-renderer__tools">
			<label v-if="isDevelopment"> <input v-model="debugWalls" type="checkbox" /> Diagnostic des murs </label>
		</div>

		<div v-if="isDevelopment && debugWalls" class="mt-dungeon-renderer__calibration">
			<label for="mt-wall-part">Ajustement temporaire des murs</label>

			<select id="mt-wall-part" v-model="selectedWallPart">
				<option v-for="part in wallParts" :key="part" :value="part">{{ part }}</option>
			</select>

			<div class="mt-dungeon-renderer__nudge">
				<button type="button" @click="nudgeWall(-1, 0)" aria-label="Décaler à gauche">←</button>

				<button type="button" @click="nudgeWall(1, 0)" aria-label="Décaler à droite">→</button>

				<button type="button" @click="nudgeWall(0, -1)" aria-label="Décaler vers le haut">↑</button>

				<button type="button" @click="nudgeWall(0, 1)" aria-label="Décaler vers le bas">↓</button>

				<button type="button" @click="resetWall" aria-label="Réinitialiser le décalage">0</button>
			</div>

			<span
				>{{ currentWallOffset.x > 0 ? '+' : '' }}{{ currentWallOffset.x }} px / {{ currentWallOffset.y > 0 ? '+' : ''
				}}{{ currentWallOffset.y }} px</span
			>
		</div>

		<details v-if="diagnostics.length" class="mt-dungeon-renderer__diagnostics">
			<summary>{{ diagnostics.length }} limite(s) graphiques à vérifier</summary>

			<ul>
				<li v-for="message in diagnostics" :key="message">{{ message }}</li>
			</ul>
		</details>
	</section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type { MtDungeonScene, MtWallPart } from '@dinorpg/core/models/dungeon/dungeon.scene.js';

import { AnimatedSprite, Application, Assets, BlurFilter, Container, Graphics, Sprite, type Texture } from 'pixi.js';

import { createMtSpritePlan, type MtRandomFrameSource } from './mtOriginalSpriteCatalog.js';
import { placeMtDungeonItem } from './mtDungeonItemPlacement.js';

import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';

import { loadMtDungeonActorFrames } from './mtDungeonActorFrames.js';
import { loadMtDungeonGuardianFrames } from './mtDungeonGuardianFrames.js';
import type { MtDungeonGuardianVisual } from '../../services/mtDungeon.service.js';

import { easeMtCameraOffset, mtCameraShift, type MtCameraViewport } from './mtDungeonCamera.js';

export interface MtDungeonActor {
	id: number;

	display: string;

	/** Absolute MT map cell, never coordinates from a client movement request. */

	x: number;

	y: number;
}

const props = defineProps<{
	scene: MtDungeonScene;

	/** Identifies a stage to prevent camera pans between different maps. */

	stageKey?: string;

	actors?: readonly MtDungeonActor[];
	guardians?: readonly MtDungeonGuardianVisual[];

	facingRight?: boolean;

	frameFor?: MtRandomFrameSource;

	assetBase?: string;

	showUnverifiedSameNameOverlays?: boolean;
}>();

const mount = ref<HTMLDivElement | null>(null);

const debugWalls = ref(false);

const wallParts: MtWallPart[] = [
	'front',

	'side-left',

	'side-right',

	'back',

	'corner-top-left',

	'corner-top-right',

	'corner-bottom-left',

	'corner-bottom-right'
];

const selectedWallPart = ref<MtWallPart>('side-left');

// Visually measured corrections only. This does not change MT map data or collision.

const wallOffsets = ref<Partial<Record<MtWallPart, { x: number; y: number }>>>({});

const calibrationVersion = ref(0);

const currentWallOffset = computed(() => wallOffsets.value[selectedWallPart.value] ?? { x: 0, y: 0 });

function nudgeWall(dx: number, dy: number): void {
	const current = currentWallOffset.value;

	wallOffsets.value = {
		...wallOffsets.value,

		[selectedWallPart.value]: {
			x: Math.max(-20, Math.min(20, current.x + dx)),

			y: Math.max(-20, Math.min(20, current.y + dy))
		}
	};

	calibrationVersion.value++;
}

function resetWall(): void {
	wallOffsets.value = { ...wallOffsets.value, [selectedWallPart.value]: { x: 0, y: 0 } };

	calibrationVersion.value++;
}

const isDevelopment = import.meta.env.DEV;

const diagnostics = ref<string[]>([]);

let app: Application | null = null;

let disposed = false;

let generation = 0;

let ground: Container;

let northernWalls: Container;

let items: Container;

let actorsLayer: Container;

let nearWalls: Container;

let fogLayer: Container;

let diagnosticsLayer: Container;

/** Holds all world layers. One offset lets the camera move without disturbing depth ordering. */

let worldLayer: Container;

let renderedViewport: MtCameraViewport | null = null;

let renderedScene: MtDungeonScene | null = null;

const textures = new Map<string, Texture>();

interface ActorState {
	visual: Container;

	/** Avoid applying an asynchronous result to a removed or replaced actor. */

	animationLoading: boolean;

	code: string;

	x: number;

	y: number;

	startX: number;

	startY: number;

	targetX: number;

	targetY: number;

	progress: number;
}

const actorNodes = new Map<number, ActorState>();
const guardianNodes = new Set<AnimatedSprite>();

function clear(layer: Container): void {
	for (const child of layer.removeChildren()) child.destroy({ children: true });
}

function palette(color: number): number {
	return color & 0xffffff;
}

/** A native PixiJS 8 placeholder. No legacy Pixi display object goes on the stage. */

function createPlaceholder(): Graphics {
	return new Graphics().circle(0, -10, 10).fill({ color: 0xf8dc96 });
}

/**

 * Turn independently rasterized legacy sdino frames into native PixiJS 8

 * AnimatedSprite textures. Never add an @eternaltwin/dinorpg_animations

 * display object to the PixiJS 8 scene: its transform API is incompatible.

 */

function loadActorAnimation(id: number, state: ActorState): void {
	if (!state.code || state.animationLoading || disposed) return;

	state.animationLoading = true;

	void loadMtDungeonActorFrames(state.code)
		.then(frames => {
			if (disposed || !app || actorNodes.get(id) !== state) return;

			const visual = new AnimatedSprite([...frames]);

			visual.anchor.set(0.5, 0.75);

			visual.width = 70;

			visual.height = 70;

			visual.animationSpeed = 0.35;

			visual.loop = true;

			visual.scale.x = props.facingRight === false ? -Math.abs(visual.scale.x) : Math.abs(visual.scale.x);

			visual.position.set(state.x, state.y);

			visual.zIndex = state.visual.zIndex;

			actorsLayer.removeChild(state.visual);

			state.visual.destroy({ children: true });

			state.visual = visual;

			actorsLayer.addChild(visual);

			if (state.progress < 1) visual.play();
			else visual.gotoAndStop(0);
		})

		.catch(error => {
			if (disposed || actorNodes.get(id) !== state) return;

			diagnostics.value = [
				...diagnostics.value.filter(message => !message.startsWith(`Dinoz ${id} :`)),

				`Dinoz ${id} : images d’animation indisponibles (${String(error)}). Repère affiché.`
			];
		})

		.finally(() => {
			state.animationLoading = false;
		});
}

function syncActors(snap = false): void {
	if (!app) return;

	const scene = props.scene;

	const latest = new Set<number>();

	for (const actor of props.actors ?? []) {
		if (!Number.isInteger(actor.x) || !Number.isInteger(actor.y)) continue;

		latest.add(actor.id);

		const x = (actor.x - scene.viewport.ix + 0.5) * 40;

		const y = (actor.y - scene.viewport.iy + 0.7) * 40;

		let state = actorNodes.get(actor.id);

		if (state && state.code !== actor.display) {
			actorsLayer.removeChild(state.visual);

			state.visual.destroy({ children: true });

			actorNodes.delete(actor.id);

			state = undefined;
		}

		if (!state) {
			const visual = createPlaceholder();

			actorsLayer.addChild(visual);

			visual.position.set(x, y);

			state = {
				visual,

				animationLoading: false,

				code: actor.display,

				x,

				y,

				startX: x,

				startY: y,

				targetX: x,

				targetY: y,

				progress: 1
			};

			actorNodes.set(actor.id, state);

			loadActorAnimation(actor.id, state);
		} else if (state.targetX !== x || state.targetY !== y) {
			// Never interpolate across a different map, layer or a server resync.

			const distance = Math.hypot(state.x - x, state.y - y);

			const instant = snap || distance > 90;

			state.startX = instant ? x : state.x;

			state.startY = instant ? y : state.y;

			state.targetX = x;

			state.targetY = y;

			state.progress = instant ? 1 : 0;

			if (state.progress === 1) {
				state.x = x;

				state.y = y;

				state.visual.position.set(x, y);
			} else if (state.visual instanceof AnimatedSprite) state.visual.play();
		}

		// Closer Dinoz are painted above more distant group members.

		state.visual.zIndex = actor.y;

		// Facing is cosmetic and comes from an accepted move in the parent page.

		if (state.visual instanceof AnimatedSprite)
			state.visual.scale.x =
				props.facingRight === false ? -Math.abs(state.visual.scale.x) : Math.abs(state.visual.scale.x);
	}

	for (const [id, state] of actorNodes) {
		if (latest.has(id)) continue;

		actorsLayer.removeChild(state.visual);

		state.visual.destroy({ children: true });

		actorNodes.delete(id);
	}
}

function animate(deltaMS: number): void {
	if (worldLayer) {
		worldLayer.position.set(
			easeMtCameraOffset(worldLayer.position.x, deltaMS),

			easeMtCameraOffset(worldLayer.position.y, deltaMS)
		);
	}

	for (const state of actorNodes.values()) {
		if (state.progress >= 1) continue;

		state.progress = Math.min(1, state.progress + deltaMS / 220);

		const k = state.progress * state.progress * (3 - 2 * state.progress);

		state.x = state.startX + (state.targetX - state.startX) * k;

		state.y = state.startY + (state.targetY - state.startY) * k;

		state.visual.position.set(state.x, state.y);

		if (state.progress === 1 && state.visual instanceof AnimatedSprite) state.visual.gotoAndStop(0);
	}
}

/** Sprite is drawn at its own PNG native size; only the anchor is reconstructed. */

function paintSprite(sprite: ReturnType<typeof createMtSpritePlan>['sprites'][number], scene: MtDungeonScene): void {
	const texture = textures.get(sprite.url);

	if (!texture) return;

	const originX = scene.viewport.ix * 40;

	const originY = scene.viewport.iy * 40;

	const visual = new Sprite(texture);

	visual.roundPixels = true;

	if (sprite.label.startsWith('wall:')) {
		const part = sprite.label.slice('wall:'.length);

		// Resolve by original Flash registration, not by PNG top-left dimensions.

		const wall = scene.walls.find(
			w => w.part === part && w.x * 40 + w.offsetX === sprite.x && w.y * 40 + w.offsetY === sprite.y
		);

		if (!wall) {
			visual.destroy();

			return;
		}

		const position = placeMtWall(wall.part, wall.x, wall.y, 40, wallOffsets.value[wall.part]);

		visual.anchor.set(position.anchorX, position.anchorY);

		visual.scale.x = position.flipX ? -1 : 1;

		visual.position.set(position.x - originX, position.y - originY);

		(position.plane === 'behind-actors' ? northernWalls : nearWalls).addChild(visual);

		if (debugWalls.value) {
			const bounds = mtWallBounds(position, texture.width, texture.height);

			const color = position.plane === 'behind-actors' ? 0x65bafe : 0xffac57;

			const marker = new Graphics()

				.rect(bounds.x - originX, bounds.y - originY, bounds.width, bounds.height)

				.stroke({ width: 1, color, alpha: 0.9 })

				.circle(position.x - originX, position.y - originY, 2)

				.fill({ color });

			diagnosticsLayer.addChild(marker);
		}
	} else if (sprite.label.startsWith('item:')) {
		// Unlike ground tiles, MT items are centered on the logical cell.
		// Compute placement from the *actual* source PNG, not an item label.
		const placement = placeMtDungeonItem(sprite.file, sprite.x, sprite.y, texture.width, texture.height);
		if (placement) {
			visual.anchor.set(placement.anchorX, placement.anchorY);
			visual.scale.set(placement.scale);
			visual.position.set(placement.x - originX, placement.y - originY);
		} else {
			// No fabricated artwork for unsupported original Flash frames.
			visual.position.set(sprite.x - originX, sprite.y - originY);
		}
		items.addChild(visual);
	} else {
		// Ground and overground remain at their original top-left coordinates.
		visual.position.set(sprite.x - originX, sprite.y - originY);
		ground.addChild(visual);
	}
}

/** Monsters share the sortable actor plane with the Dinoz. Never use PixiJS 7 nodes. */
function clearGuardianNodes(): void {
	for (const visual of guardianNodes) {
		visual.stop();
		actorsLayer.removeChild(visual);
		visual.destroy();
	}
	guardianNodes.clear();
}

function paintGuardians(scene: MtDungeonScene, ticket: number): void {
	for (const guardian of props.guardians ?? []) {
		if (!Number.isInteger(guardian.x) || !Number.isInteger(guardian.y)) continue;
		const x = (guardian.x - scene.viewport.ix + 0.5) * 40;
		const y = (guardian.y - scene.viewport.iy + 0.75) * 40;
		void loadMtDungeonGuardianFrames(guardian.gfx)
			.then(frames => {
				if (disposed || !app || ticket !== generation || !frames.length) return;
				const visual = new AnimatedSprite([...frames]);
				visual.anchor.set(0.5);
				// EternalTwin MazeRenderer limits guardians to 1.15 x 1.25 cells.
				// Exported smonster frames may be larger than their nominal 72px canvas.
				// Fit using the largest frame so the animation never changes size.
				const frameWidth = Math.max(...frames.map(frame => frame.width));
				const frameHeight = Math.max(...frames.map(frame => frame.height));
				if (!Number.isFinite(frameWidth) || !Number.isFinite(frameHeight) || frameWidth <= 0 || frameHeight <= 0) {
					visual.destroy();
					return;
				}
				visual.scale.set(Math.min(1, (40 * 1.15) / frameWidth, (40 * 1.25) / frameHeight));
				visual.position.set(x, y);
				visual.zIndex = guardian.y;
				visual.animationSpeed = 0.2;
				visual.loop = true;
				actorsLayer.addChild(visual);
				guardianNodes.add(visual);
				visual.play();
			})
			.catch(error => {
				if (disposed || ticket !== generation) return;
				diagnostics.value = [
					...diagnostics.value,
					`Monstre MT ${guardian.gfx} : chargement impossible (${String(error)})`
				];
			});
	}
}

function paintFog(scene: MtDungeonScene): void {
	if (!scene.fog.length) return;

	const marks = new Graphics();

	for (const tile of scene.fog) {
		const x = (tile.x - scene.viewport.ix) * 40;

		const y = (tile.y - scene.viewport.iy) * 40;

		marks.rect(x, y, 40, 40);
	}

	marks.fill({ color: palette(scene.fogColor) });

	// Visual approximation only: original uses Flash BlurFilter(32,32,1).

	marks.filters = [new BlurFilter({ strength: 16, quality: 3 })];

	fogLayer.addChild(marks);
}

async function repaint(): Promise<void> {
	const ticket = ++generation;

	if (!app || disposed) return;

	const scene = props.scene;

	let plan: ReturnType<typeof createMtSpritePlan>;

	try {
		plan = createMtSpritePlan(scene, {
			assetBase: props.assetBase,

			frameFor: props.frameFor,

			showUnverifiedSameNameOverlays: props.showUnverifiedSameNameOverlays
		});
	} catch (error) {
		diagnostics.value = [`Plan des sprites : ${String(error)}`];

		return;
	}

	const paths = [...new Set(plan.sprites.map(sprite => sprite.url))];

	const fetched = await Promise.allSettled(
		paths.map(async path => {
			if (!textures.has(path)) textures.set(path, await Assets.load<Texture>(path));
		})
	);

	if (!app || disposed || ticket !== generation) return;

	const errors = new Set(plan.unresolved);

	fetched.forEach((result, index) => {
		if (result.status === 'rejected') errors.add(`PNG inaccessible : ${paths[index]}`);
	});

	const viewport: MtCameraViewport = {
		ix: scene.viewport.ix,

		iy: scene.viewport.iy,

		level: scene.level,

		mapId: props.stageKey ?? ''
	};

	const shift = mtCameraShift(renderedViewport, viewport, {
		x: worldLayer.position.x,

		y: worldLayer.position.y
	});

	if (shift.deltaX || shift.deltaY) {
		// Every actor is still expressed in the OLD viewport coordinates.

		// Rebase both its interpolated position and its target to the new origin

		// before placing the camera at the matching compensating offset.

		for (const state of actorNodes.values()) {
			state.x -= shift.deltaX;

			state.y -= shift.deltaY;

			state.startX -= shift.deltaX;

			state.startY -= shift.deltaY;

			state.targetX -= shift.deltaX;

			state.targetY -= shift.deltaY;

			state.visual.position.set(state.x, state.y);
		}
	}

	worldLayer.position.set(shift.offsetX, shift.offsetY);

	clearGuardianNodes();
	for (const layer of [ground, northernWalls, items, nearWalls, fogLayer, diagnosticsLayer]) clear(layer);

	app.renderer.background.color = palette(scene.fogColor);

	for (const sprite of plan.sprites) paintSprite(sprite, scene);

	paintFog(scene);

	diagnostics.value = [...errors];

	renderedViewport = viewport;

	renderedScene = scene;

	syncActors(shift.snap);
	paintGuardians(scene, ticket);
}

async function setup(): Promise<void> {
	const created = new Application();

	try {
		await created.init({ width: 360, height: 360, antialias: false, resolution: 1, background: 0x3d3325 });

		if (disposed || !mount.value) {
			created.destroy(true);

			return;
		}

		app = created;

		mount.value.appendChild(created.canvas);

		worldLayer = new Container();

		ground = new Container();

		northernWalls = new Container();

		items = new Container();

		actorsLayer = new Container();

		actorsLayer.sortableChildren = true;

		nearWalls = new Container();

		fogLayer = new Container();

		diagnosticsLayer = new Container();

		worldLayer.addChild(ground, items, northernWalls, actorsLayer, nearWalls, fogLayer, diagnosticsLayer);

		created.stage.addChild(worldLayer);

		created.ticker.add(ticker => animate(ticker.deltaMS));

		await repaint();
	} catch (error) {
		diagnostics.value = [`Initialisation du renderer PixiJS impossible : ${String(error)}`];

		if (!disposed) created.destroy(true);
	}
}

onMounted(() => {
	void setup();
});

watch(
	() => [
		props.scene,

		props.guardians,

		props.stageKey,

		props.frameFor,

		props.assetBase,

		props.showUnverifiedSameNameOverlays,

		debugWalls.value,

		calibrationVersion.value
	],

	() => {
		void repaint().catch(error => {
			diagnostics.value = [`Erreur de rendu : ${String(error)}`];
		});
	}
);

watch(
	() => [props.actors, props.facingRight],

	() => {
		// Do not mix a NEW actor coordinate system with an OLD rendered viewport

		// while a new server view is still waiting for its textures.

		if (app && renderedScene === props.scene) syncActors();
	}
);

onBeforeUnmount(() => {
	disposed = true;

	++generation;

	for (const state of actorNodes.values()) {
		if (state.visual instanceof AnimatedSprite) state.visual.stop();
	}

	clearGuardianNodes();
	actorNodes.clear();

	renderedViewport = null;

	renderedScene = null;

	app?.destroy(true, { children: true });

	app = null;
});
</script>

<style scoped>
.mt-dungeon-renderer {
	width: 100%;

	height: 100%;

	position: relative;
}

.mt-dungeon-renderer__stage {
	width: 100%;

	aspect-ratio: 1;

	overflow: hidden;
}

.mt-dungeon-renderer__stage :deep(canvas) {
	display: block;

	width: 100%;

	height: auto;

	image-rendering: pixelated;
}

.mt-dungeon-renderer__tools {
	position: absolute;

	top: 3px;

	right: 4px;

	font-size: 0.65rem;

	color: #f9e3be;

	background: #211c19d9;

	padding: 2px 4px;

	border-radius: 3px;
}

.mt-dungeon-renderer__tools label {
	cursor: pointer;
}

.mt-dungeon-renderer__diagnostics {
	position: absolute;

	left: 3px;

	bottom: 3px;

	right: 3px;

	color: #f9e3be;

	background: #211c19df;

	font-size: 0.66rem;

	line-height: 1.3;

	max-height: 7rem;

	overflow: auto;
}

.mt-dungeon-renderer__diagnostics ul {
	padding-left: 1.2rem;
}

.mt-dungeon-renderer__calibration {
	position: absolute;

	top: 26px;

	right: 4px;

	z-index: 3;

	background: #211c19ef;

	color: #f9e3be;

	padding: 5px;

	font-size: 0.65rem;

	display: flex;

	flex-direction: column;

	gap: 3px;

	border-radius: 3px;

	max-width: 220px;
}

.mt-dungeon-renderer__calibration select {
	font-size: 0.72rem;

	max-width: 205px;
}

.mt-dungeon-renderer__nudge {
	display: flex;

	gap: 2px;
}

.mt-dungeon-renderer__nudge button {
	min-width: 28px;

	padding: 2px;

	cursor: pointer;
}
</style>
