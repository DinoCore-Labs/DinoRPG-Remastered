<template>
	<div class="dinozBars" v-if="dinozData">
		<div
			class="level"
			v-tippy="{
				content: formatContent($t('dinozPage.level')),
				theme: 'small'
			}"
		>
			{{ dinozData.level }}
		</div>
		<div class="bars">
			<div class="life">
				<img
					v-if="dinozData.life <= Math.round(dinozData.maxLife * 0.1)"
					:src="getImgURL('bar', 'bar_warning')"
					alt="life"
					style="width: 98px; height: 11px"
				/>
				<img
					v-else
					:src="getImgURL('bar', 'bar_life')"
					alt="life"
					:style="getBarSize(dinozData.life, dinozData.maxLife)"
				/>
				<div>{{ dinozData.life }} / {{ dinozData.maxLife }}</div>
			</div>
			<div class="xp">
				<img
					:src="getImgURL('bar', 'bar_xp')"
					alt="xp"
					:style="getBarSize(dinozData.experience, dinozData.maxExperience)"
				/>
				<div>
					{{ dinozData.experience }} /
					{{ dinozData.maxExperience }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';

export default defineComponent({
	name: 'DinozBars',
	props: { dinozData: Object as PropType<DinozFiche> },
	methods: {
		getBarSize(value: number, maxValue: number): string {
			// Limit value to max value
			const actualValue = value > maxValue ? maxValue : value;

			const width = Math.round((actualValue / maxValue) * 98);
			if (maxValue === 0) {
				return `width : 0px ; height : 11px`;
			}
			return `width : ${width}px ; height : 11px`;
		}
	}
});
</script>

<style lang="scss" scoped>
.dinozBars {
	grid-area: vie;
	align-self: center;
	justify-self: center;
	background: url('../../assets/background/stats_box.webp') no-repeat;
	display: flex;
	width: 180px;
	height: 40px;
	.level {
		font-weight: bold;
		text-align: center;
		font-size: 17pt;
		color: #faf1c5;
		text-shadow: -1px -2px 0px #581a10;
		min-width: 40px;
		cursor: help;
		align-items: center;
		display: flex;
		justify-content: center;
	}
	.bars {
		display: flex;
		flex-direction: column;
		width: 140px;
		font-size: 8pt;
		line-height: 11pt;
		color: white;
		justify-content: center;
		align-items: center;
		padding-top: 4px;
	}
	.life,
	.xp {
		position: relative;
		width: 98px;
		margin-left: 16px;
	}
	.life div,
	.xp div {
		position: absolute;
		top: -1px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 12px;
		font-weight: bold;
		width: 100%;
		text-align: center;
		color: #fef4d4;
		text-shadow: 1px 1px 0px #8f5203;
	}
	.xp div {
		color: #fbd7ff;
		text-shadow: 1px 1px 0px #812b56;
	}
}
</style>
