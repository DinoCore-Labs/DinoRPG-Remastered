<template>
	<div ref="container" class="swf" />
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
	NPC?: string;
	flashvars?: string;
}>();

const container = ref<HTMLDivElement | null>(null);

let player: any = null;
let loadToken = 0;
let destroyed = false;

function getNpcSwfUrl(npc?: string): string | null {
	if (!npc) return null;

	return `/swf/${npc}.swf`;
}

function parseFlashvars(source?: string): Record<string, string> {
	if (!source) return {};

	const params = new URLSearchParams(source);
	return Object.fromEntries(params.entries());
}

function destroyPlayer() {
	if (player) {
		try {
			player.remove();
		} catch {
			//
		}
		player = null;
	}
}

async function mountPlayer() {
	const currentToken = ++loadToken;
	const swfUrl = getNpcSwfUrl(props.NPC);

	if (!container.value || !swfUrl || destroyed) return;

	await nextTick();

	if (!container.value || destroyed || currentToken !== loadToken) return;

	container.value.innerHTML = '';

	const Ruffle = (window as any).RufflePlayer?.newest?.();
	if (!Ruffle) {
		console.error('Ruffle is not available');
		return;
	}

	const localPlayer = Ruffle.createPlayer();
	player = localPlayer;

	localPlayer.style.width = '100%';
	localPlayer.style.height = '100%';
	localPlayer.style.display = 'block';

	container.value.appendChild(localPlayer);

	try {
		console.log('Loading NPC SWF:', {
			npc: props.NPC,
			swfUrl,
			flashvars: props.flashvars ?? ''
		});

		await localPlayer.load({
			url: swfUrl,
			parameters: parseFlashvars(props.flashvars)
		});

		if (destroyed || currentToken !== loadToken || player !== localPlayer) {
			try {
				localPlayer.remove();
			} catch {
				//
			}
		}
	} catch (error) {
		if (!destroyed && currentToken === loadToken) {
			console.error('Failed to load SWF', {
				swfUrl,
				error
			});
		}
	}
}

async function reloadPlayer() {
	destroyPlayer();
	await mountPlayer();
}

onMounted(mountPlayer);

watch(() => [props.NPC, props.flashvars], reloadPlayer);

onBeforeUnmount(() => {
	destroyed = true;
	loadToken++;
	destroyPlayer();
});
</script>

<style lang="scss" scoped>
.swf {
	position: relative;
	width: 100px;
	height: 100px;
	border: 1px solid #ffe044;
	background-color: #9a4029;
	padding: 1px;
	overflow: hidden;
}
</style>
