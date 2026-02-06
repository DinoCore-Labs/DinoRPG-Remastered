<template>
	<div ref="dino" class="dinoWrap" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { sdino } from '@eternaltwin/dinorpg_animations';

export default defineComponent({
	name: 'DinozMini',
	props: {
		display: { type: String, required: true },
		width: { type: Number, default: 55 },
		height: { type: Number, default: 65 },
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
				maxMargin: `-${this.width * this.imageCount}px`,
				offsetY: `13px` // 👈 remplace ton -13 ici
			};
		}
	},
	mounted() {
		const dinoAnimDiv = this.$refs.dino as HTMLDivElement | null;
		if (!dinoAnimDiv) return;

		const anim = new sdino({
			data: this.display,
			flip: this.flip ? 0 : 1,
			pflag: true
		});

		anim.toAnimation(
			(div: HTMLElement) => {
				div.querySelectorAll('img').forEach((img: HTMLImageElement) => {
					img.removeAttribute('hidden');
				});

				dinoAnimDiv.innerHTML = '';
				dinoAnimDiv.appendChild(div);

				this.imageCount = Number(div.getAttribute('data-length') ?? '0');
			},
			this.width,
			this.height
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

.dinoWrap {
	width: v-bind('styleVars.width');
	height: v-bind('styleVars.height');
	overflow: hidden;

	transform: translateY(v-bind('styleVars.offsetY'));

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
