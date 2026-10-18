<template>
	<section class="mt-dungeon-preview" aria-label="Aperçu des sprites originaux du donjon">
		<canvas
			ref="canvas"
			:width="360"
			:height="360"
			class="mt-dungeon-preview__canvas"
			role="img"
			aria-label="Vue de donjon composée uniquement avec les PNG originaux Motion Twin disponibles"
		/>
		<p class="mt-dungeon-preview__caption">
			Aperçu partiel — catalogue des 201 PNG originaux disponibles. Les variantes de sols et murs suivent mt.Rand. Les
			symboles Flash, les points d’ancrage et les filtres restant à vérifier ne sont pas simulés.
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
	/** Optional override of the ported original mt.Rand selector (normally not needed). */
	frameFor?: MtRandomFrameSource;
	assetBase?: string;
	/** Optional exploratory overlay frames; disabled until Flash timeline is confirmed. */
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
	const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.decoding = 'async';
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`PNG MT inaccessible : ${url}`));
		image.src = url;
	});
	// Evict unsuccessful loads, allowing the user to add a missing asset
	// without having to fully reload the page.
	imagePromises.set(url, imagePromise);
	void imagePromise.catch(() => {
		if (imagePromises.get(url) === imagePromise) imagePromises.delete(url);
	});
	return imagePromise;
}

async function paint(): Promise<void> {
	const currentVersion = ++renderVersion;
	if (!canvas.value || disposed) return;
	const ctx = canvas.value.getContext('2d');
	if (!ctx) {
		diagnostics.value = ['Le navigateur ne dispose pas de Canvas 2D.'];
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
		diagnostics.value = [error instanceof Error ? error.message : 'Échec du catalogue MT'];
		return;
	}

	const files = [...new Set(plan.sprites.map(sprite => sprite.url))];
	const results = await Promise.allSettled(files.map(loadOriginalImage));
	if (disposed || currentVersion !== renderVersion) return;

	const errors = new Set(plan.unresolved);
	const images = new Map<string, HTMLImageElement>();
	results.forEach((result, i) => {
		const url = files[i]!;
		if (result.status === 'fulfilled') images.set(url, result.value);
		else errors.add(`PNG MT inaccessible : ${url}`);
	});
	// Canvas is clipped to the *original 9x9 tiles* viewport, not to overscan.
	const width = scene.viewport.visiblePixels;
	canvas.value.width = width;
	canvas.value.height = width;
	ctx.clearRect(0, 0, width, width);
	ctx.fillStyle = `#${scene.fogColor.toString(16).padStart(6, '0')}`;
	ctx.fillRect(0, 0, width, width);
	ctx.imageSmoothingEnabled = false;
	const originX = scene.viewport.ix * 40;
	const originY = scene.viewport.iy * 40;
	for (const sprite of plan.sprites) {
		const image = images.get(sprite.url);
		if (!image) continue;
		// Draw original PNG at native resolution. Flash registration-point
		// adjustments will only be added after comparison with gfx.swf.
		ctx.drawImage(image, sprite.x - originX, sprite.y - originY);
	}
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
