<template>
	<div ref="container" id="pixiCanvas"></div>
</template>

<script lang="ts">
import { defineComponent, toRaw, type PropType } from 'vue';
import { Fight } from '@eternaltwin/dinorpg_animations';
import type { preFightLoader } from '@dinorpg/core/models/fight/transpiler.js';

export default defineComponent({
	name: 'Fight',
	props: {
		fight: {
			type: Object as PropType<preFightLoader>,
			required: true
		}
	},
	data() {
		return {
			loadedFight: null as Fight | null
		};
	},
	emits: ['animationEnded'],
	methods: {
		async loadAnimation() {
			await this.$nextTick();
			const fight = this.fight;
			const container = this.$refs.container as HTMLDivElement | undefined;
			if (!container || !fight?.history?.length) {
				return;
			}
			this.loadedFight?.destroy();
			container.replaceChildren();
			const loadedFight = new Fight(toRaw(fight));
			(loadedFight as Fight & { onFightEnd?: () => void }).onFightEnd = () => {
				this.$emit('animationEnded');
			};
			this.loadedFight = loadedFight;
			const display = this.loadedFight.getDisplay();
			display.style.maxWidth = '100%';
			container.appendChild(display);
		}
	},
	mounted() {
		this.loadAnimation();
	},
	beforeUnmount() {
		this.loadedFight?.destroy();
	}
});
</script>

<style scoped lang="scss"></style>
