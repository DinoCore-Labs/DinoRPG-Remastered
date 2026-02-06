<template>
	<div class="element">
		<div
			class="wrap"
			v-for="el in elementList"
			:key="el"
			v-tippy="{
				content: formatContent($t(`element.${el}`)),
				theme: 'small'
			}"
		>
			<img :src="getImgURL('elements', `elem_${el}`)" :alt="el" />
			<div class="df numb">
				<span :class="getMaxElement(el) ? 'max' : ''">{{ getElement(el) }}</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Elements',
	props: {
		fire: { type: Number, required: true },
		wood: { type: Number, required: true },
		water: { type: Number, required: true },
		lightning: { type: Number, required: true },
		air: { type: Number, required: true }
	},
	methods: {
		getMaxElement(el: string): boolean {
			const maxValue = Math.max(this.fire, this.wood, this.water, this.lightning, this.air);
			switch (el) {
				case 'fire':
					return this.fire === maxValue;
				case 'wood':
					return this.wood === maxValue;
				case 'water':
					return this.water === maxValue;
				case 'lightning':
					return this.lightning === maxValue;
				case 'air':
					return this.air === maxValue;
				default:
					return false;
			}
		},
		getElement(el: string): number {
			switch (el) {
				case 'fire':
					return this.fire;
				case 'wood':
					return this.wood;
				case 'water':
					return this.water;
				case 'lightning':
					return this.lightning;
				case 'air':
					return this.air;
				default:
					return 0;
			}
		}
	},
	computed: {
		elementList() {
			return ['fire', 'wood', 'water', 'lightning', 'air'];
		}
	}
});
</script>

<style lang="scss" scoped>
.element {
	display: flex;
	gap: 1px;
	flex-wrap: wrap;
	width: 100%;
	padding-bottom: 2px;
	justify-content: space-evenly;
	.wrap {
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		font-weight: bold;
		width: 43px;
		align-items: flex-end;
		background: url('../../assets/background/element_bg.webp') no-repeat;
		background-position-y: 6px;
		background-position-x: 7px;
		padding-right: 4px;

		cursor: help;
		.numb {
			width: 100%;
			justify-content: center;
			span {
				color: white;
				font-size: 13.3px;
				text-align: left;
				letter-spacing: -0.2pt;
				margin-bottom: 2px;
				&.max {
					color: yellow;
				}
			}
		}
	}
}
</style>
