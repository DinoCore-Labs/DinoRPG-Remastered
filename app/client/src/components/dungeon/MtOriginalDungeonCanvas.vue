<template>
	<section class="mt-dungeon-preview" aria-label="Vue des Cavernes Magnétiques">
		<canvas
			ref="canvas"
			width="360"
			height="360"
			class="mt-dungeon-preview__canvas"
			role="img"
			aria-label="Carte du donjon : sprites originaux, brouillard adouci"
		/>
		<p class="mt-dungeon-preview__caption">
			PNG Motion Twin ; fondu du brouillard approximatif (le filtre Flash 32×32 reste à comparer à l'original).
		</p>
		<details v-if="diagnostics.length" class="mt-dungeon-preview__diagnostics">
			<summary>{{ diagnostics.length }} point(s) de fidélité encore à résoudre</summary>
			<ul>
				<li v-for="message in diagnostics" :key="message">{{ message }}</li>
			</ul>
		</details>
	</section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { createMtSpritePlan, type MtRandomFrameSource } from './mtOriginalSpriteCatalog.js';

const props = defineProps<{
	scene: MtDungeonScene;
	frameFor?: MtRandomFrameSource;
	assetBase?: string;
	showUnverifiedSameNameOverlays?: boolean;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const diagnostics = ref<string[]>([]);
const imagePromises = new Map<string, Promise<HTMLImageElement>>();
let renderVersion = 0;
let disposed = false;

function loadOriginalImage(url: string): Promise<HTMLImageElement> {
	const existing = imagePromises.get(url);
	if (existing) return existing;
	const promise = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.decoding = 'async';
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`PNG MT inaccessible : ${url}`));
		image.src = url;
	});
	imagePromises.set(url, promise);
	void promise.catch(() => {
		if (imagePromises.get(url) === promise) imagePromises.delete(url);
	});
	return promise;
}

/**
 * View.hx draws the fog as a bitmap tinted by skin.fog, then applies
 * BlurFilter(32,32,1). Canvas blur radius and Flash's blur kernel are not
 * identical: this is a presentation approximation, not a reimplementation.
 * Unrevealed geometry is already removed by the server's redaction.
 */
function paintFog(ctx: CanvasRenderingContext2D, scene: MtDungeonScene): void {
	if (scene.fog.length === 0) return;
	const size = scene.viewport.visiblePixels;
	const tile = 40;
	const border = 48;
	const hidden = new Set(scene.fog.map(cell => `${cell.x}:${cell.y}`));
	const mask = document.createElement('canvas');
	mask.width = mask.height = size + border * 2;
	const maskCtx = mask.getContext('2d');
	if (!maskCtx) return;
	maskCtx.fillStyle = `#${scene.fogColor.toString(16).padStart(6, '0')}`;
	maskCtx.fillRect(0, 0, mask.width, mask.height);
	maskCtx.globalCompositeOperation = 'destination-out';
	maskCtx.fillStyle = '#ffffff';
	for (let y = 0; y < 9; y++) {
		for (let x = 0; x < 9; x++) {
			if (!hidden.has(`${scene.viewport.ix + x}:${scene.viewport.iy + y}`)) {
				maskCtx.fillRect(border + x * tile, border + y * tile, tile, tile);
			}
		}
	}
	const blurred = document.createElement('canvas');
	blurred.width = blurred.height = mask.width;
	const blurCtx = blurred.getContext('2d');
	if (!blurCtx) return;
	blurCtx.filter = 'blur(12px)';
	blurCtx.drawImage(mask, 0, 0);
	ctx.drawImage(blurred, border, border, size, size, 0, 0, size, size);
}

async function paint(): Promise<void> {
	const version = ++renderVersion;
	const target = canvas.value;
	if (!target || disposed) return;
	const ctx = target.getContext('2d');
	if (!ctx) {
		diagnostics.value = ['Canvas 2D indisponible.'];
		return;
	}
	const scene = props.scene;
	let plan;
	try {
		plan = createMtSpritePlan(scene, {
			frameFor: props.frameFor,
			assetBase: props.assetBase,
			showUnverifiedSameNameOverlays: props.showUnverifiedSameNameOverlays
		});
	} catch (error) {
		diagnostics.value = [error instanceof Error ? error.message : 'Catalogue MT inaccessible'];
		return;
	}
	const files = [...new Set(plan.sprites.map(sprite => sprite.url))];
	const results = await Promise.allSettled(files.map(loadOriginalImage));
	if (disposed || version !== renderVersion) return;
	const errors = new Set(plan.unresolved);
	const images = new Map<string, HTMLImageElement>();
	results.forEach((result, i) => {
		const url = files[i]!;
		if (result.status === 'fulfilled') images.set(url, result.value);
		else errors.add(`PNG MT inaccessible : ${url}`);
	});
	const width = scene.viewport.visiblePixels;
	target.width = width;
	target.height = width;
	ctx.clearRect(0, 0, width, width);
	ctx.fillStyle = `#${scene.fogColor.toString(16).padStart(6, '0')}`;
	ctx.fillRect(0, 0, width, width);
	ctx.imageSmoothingEnabled = false;
	const originX = scene.viewport.ix * 40;
	const originY = scene.viewport.iy * 40;
	for (const sprite of plan.sprites) {
		const image = images.get(sprite.url);
		if (!image) continue;
		ctx.drawImage(image, sprite.x - originX, sprite.y - originY);
	}
	paintFog(ctx, scene);
	diagnostics.value = [...errors];
}

onMounted(() => {
	void paint();
});
watch(
	() => [props.scene, props.frameFor, props.assetBase, props.showUnverifiedSameNameOverlays],
	() => {
		void paint();
	}
);
onBeforeUnmount(() => {
	disposed = true;
	++renderVersion;
	imagePromises.clear();
});
</script>

<style scoped>
.mt-dungeon-preview {
	max-width: 360px;
}
.mt-dungeon-preview__canvas {
	width: 100%;
	height: auto;
	display: block;
	image-rendering: pixelated;
}
.mt-dungeon-preview__caption {
	font-size: 0.8rem;
	line-height: 1.35;
	margin: 0.45rem 0;
}
.mt-dungeon-preview__diagnostics {
	margin-top: 0.45rem;
	font-size: 0.78rem;
}
.mt-dungeon-preview__diagnostics ul {
	padding-left: 1.3rem;
	max-height: 10rem;
	overflow: auto;
}
</style>
