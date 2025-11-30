<template>
	<div ref="container" id="pixiCanvas"></div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { Fight } from '@eternaltwin/dinorpg_animations';
import type { preFightLoader } from '@dinorpg/core/models/fight/transpiler';

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
			loadedFight: null as unknown as Fight
		};
	},
	methods: {
		loadAnimation() {
			const container = this.$refs.container as HTMLCanvasElement;
			this.loadedFight = new Fight(this.fight);
			const display = this.loadedFight.getDisplay();
			display.style.maxWidth = '100%';
			container.appendChild(display);
		}
	},
	mounted() {
		this.loadAnimation();
	},
	unmounted() {
		this.loadedFight.destroy();
	}
});
</script>

<style scoped lang="scss"></style>
