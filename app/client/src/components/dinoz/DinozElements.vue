<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/dinoz/DinozElements.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-02-09.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="elements_div">
		<p>{{ $t('dinozPage.elements') }}</p>
		<Elements
			v-if="dinozData"
			:fire="dinozData.nbrUpFire"
			:wood="dinozData.nbrUpWood"
			:water="dinozData.nbrUpWater"
			:lightning="dinozData.nbrUpLightning"
			:air="dinozData.nbrUpAir"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import Elements from './Elements.vue';

export default defineComponent({
	name: 'DinozElements',
	components: {
		Elements
	},
	props: {
		dinozData: Object as PropType<DinozFiche>
	}
});
</script>

<style lang="scss" scoped>
.elements_div {
	grid-area: elements;
	justify-self: center;
	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	background:
		url('../../assets/background/banniere_left.webp') no-repeat,
		url('../../assets/background/banniere_middle.webp') repeat-x,
		url('../../assets/background/banniere_right.webp') no-repeat;
	background-position-x: left, center, right;
	background-color: #d19860;
	background-size: auto;
	box-shadow: inset 0 0 1px 2px #d3a76a;
	border-style: hidden solid solid solid;
	border-width: 0 1px 1px 1px;
	border-color: #9f5841;
	width: 100%;
	height: fit-content;
	p {
		color: white;
		padding-left: 2px;
		font-size: 7.5pt;
		text-shadow: 0.5px 0 1px grey;
		text-transform: uppercase;
		font-family: 'Trebuchet MS', Arial, sans-serif;
		font-weight: bold;
		margin-top: 1.2px;
	}
}

@media (max-width: 539px) {
	.elements_div {
		width: 100%;
	}
}
</style>
