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
		<details v-if="diagnostics.length" class="mt-dungeon-renderer__diagnostics">
			<summary>{{ diagnostics.length }} limite(s) graphiques à vérifier</summary>
			<ul>
				<li v-for="message in diagnostics" :key="message">{{ message }}</li>
			</ul>
		</details>
	</section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { sdino } from '@eternaltwin/dinorpg_animations';
import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { Application, Assets, BlurFilter, Container, Graphics, Sprite, type Texture } from 'pixi.js';

import { createMtSpritePlan, type MtRandomFrameSource } from './mtOriginalSpriteCatalog.js';
import { mtWallBounds, placeMtWall } from './mtDungeonWallPlacement.js';

export interface MtDungeonActor {
	id: number;
	display: string;
	/** Absolute MT map cell, never coordinates from a client movement request. */
	x: number;
	y: number;
}

const props = defineProps<{
	scene: MtDungeonScene;
	actors?: readonly MtDungeonActor[];
	facingRight?: boolean;
	frameFor?: MtRandomFrameSource;
	assetBase?: string;
	showUnverifiedSameNameOverlays?: boolean;
}>();

const mount = ref<HTMLDivElement | null>(null);
const debugWalls = ref(false);
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

const textures = new Map<string, Texture>();
interface AnimatedContainer extends Container {
	playAnim?: (name: string) => void;
	flip?: (direction: number) => void;
}
interface ActorState {
	visual: AnimatedContainer;
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

function clear(layer: Container): void {
	for (const child of layer.removeChildren()) child.destroy({ children: true });
}

function palette(color: number): number {
	return color & 0xffffff;
}

/** Used only for a testable display fallback; no fictitious Dinoz is created. */
function createVisual(code: string): AnimatedContainer {
	try {
		if (!code) throw new Error('Données visuelles du Dinoz indisponibles');
		const visual = new sdino({
			data: code,
			flip: props.facingRight === false ? 0 : 1,
			pflag: true
		}) as unknown as AnimatedContainer;
		// The original actor is roughly 2 tiles tall, as in View.hx/Dino.hx.
		visual.scale.set(80 / 90);
		return visual;
	} catch (error) {
		diagnostics.value = [...diagnostics.value, `Animation Dinoz non disponible : ${String(error)}`];
		const marker = new Graphics().circle(0, -10, 10).fill({ color: 0xf8dc96 });
		return marker as AnimatedContainer;
	}
}

function syncActors(): void {
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
			const visual = createVisual(actor.display);
			actorsLayer.addChild(visual);
			visual.position.set(x, y);
			state = { visual, code: actor.display, x, y, startX: x, startY: y, targetX: x, targetY: y, progress: 1 };
			actorNodes.set(actor.id, state);
		} else if (state.targetX !== x || state.targetY !== y) {
			// A new stage or reload should snap rather than fly across the map.
			const distance = Math.hypot(state.x - x, state.y - y);
			state.startX = distance > 90 ? x : state.x;
			state.startY = distance > 90 ? y : state.y;
			state.targetX = x;
			state.targetY = y;
			state.progress = distance > 90 ? 1 : 0;
			if (state.progress === 1) {
				state.x = x;
				state.y = y;
				state.visual.position.set(x, y);
			} else state.visual.playAnim?.('walk');
		}
		// Closer Dinoz are painted above more distant group members.
		state.visual.zIndex = actor.y;
		// Facing is cosmetic and comes from an accepted move in the parent page.
		if (state.visual.flip) state.visual.flip(props.facingRight === false ? 0 : 1);
	}
	for (const [id, state] of actorNodes) {
		if (latest.has(id)) continue;
		actorsLayer.removeChild(state.visual);
		state.visual.destroy({ children: true });
		actorNodes.delete(id);
	}
}

function animate(deltaMS: number): void {
	for (const state of actorNodes.values()) {
		if (state.progress >= 1) continue;
		state.progress = Math.min(1, state.progress + deltaMS / 220);
		const k = state.progress * state.progress * (3 - 2 * state.progress);
		state.x = state.startX + (state.targetX - state.startX) * k;
		state.y = state.startY + (state.targetY - state.startY) * k;
		state.visual.position.set(state.x, state.y);
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
		const position = placeMtWall(wall.part, wall.x, wall.y);
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
	} else {
		visual.position.set(sprite.x - originX, sprite.y - originY);
		(sprite.label.startsWith('item:') ? items : ground).addChild(visual);
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
	marks.filters = [new BlurFilter({ strength: 12, quality: 2 })];
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
	for (const layer of [ground, northernWalls, items, nearWalls, fogLayer, diagnosticsLayer]) clear(layer);
	app.renderer.background.color = palette(scene.fogColor);
	for (const sprite of plan.sprites) paintSprite(sprite, scene);
	paintFog(scene);
	diagnostics.value = [...errors];
	syncActors();
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
		ground = new Container();
		northernWalls = new Container();
		items = new Container();
		actorsLayer = new Container();
		actorsLayer.sortableChildren = true;
		nearWalls = new Container();
		fogLayer = new Container();
		diagnosticsLayer = new Container();
		created.stage.addChild(ground, northernWalls, items, actorsLayer, nearWalls, fogLayer, diagnosticsLayer);
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
	() => [props.scene, props.frameFor, props.assetBase, props.showUnverifiedSameNameOverlays, debugWalls.value],
	() => {
		void repaint().catch(error => {
			diagnostics.value = [`Erreur de rendu : ${String(error)}`];
		});
	}
);
watch(
	() => [props.actors, props.facingRight],
	() => {
		if (app) syncActors();
	}
);
onBeforeUnmount(() => {
	disposed = true;
	++generation;
	actorNodes.clear();
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
</style>
