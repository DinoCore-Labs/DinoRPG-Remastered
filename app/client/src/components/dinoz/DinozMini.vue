<template>
	<div ref="dino" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { sdino } from '@eternaltwin/dinorpg_animations';

export default defineComponent({
	name: 'DinozMini',
	props: {
		display: { type: String, required: true },
		width: { type: Number, default: 45 },
		height: { type: Number, default: 55 },
		flip: { type: Boolean, default: false }
	},
	data() {
		return {
			imageCount: 0
		};
	},
	computed: {
		styleVars() {
			return {
				width: `${this.width}px`,
				height: `${this.height}px`,
				animationLength: `${(this.imageCount * 1000) / 24}ms`,
				maxMargin: `-${this.width * this.imageCount}px`
			};
		}
	},
	mounted() {
		const dinoAnimDiv = this.$refs.dino as HTMLDivElement | null;
		if (!dinoAnimDiv) return;
		new sdino({
			data: this.display,
			flip: this.flip ? 0 : 1,
			pflag: true
		}).toAnimation(
			div => {
				div.querySelectorAll('img').forEach(img => {
					img.removeAttribute('hidden');
				});
				dinoAnimDiv.appendChild(div);
				this.imageCount = +(div.getAttribute('data-length') ?? '0');
			},
			this.width,
			this.height,
			0,
			-13
		);
	}
});
</script>

<style lang="scss" scoped>
@keyframes play {
	from {
		margin-left: 0;
	}
	to {
		margin-left: v-bind('styleVars.maxMargin');
	}
}

div {
	width: v-bind('styleVars.width');
	height: v-bind('styleVars.height');
	overflow: hidden;
	:deep(.DinoRPG-Animation) {
		display: flex;
		margin-left: 0;
		animation-name: play;
		animation-duration: v-bind('styleVars.animationLength');
		animation-timing-function: steps(v-bind('imageCount'));
		animation-iteration-count: infinite;
	}
}
</style>
