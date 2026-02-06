<template>
	<div id="boxMap">
		<WorldMap :dinozData="dinozData" :key="dinozData.borderPlace[0]" />
		<p class="placeName" v-if="dinozData">
			{{ $t(`place.name.${getPlaceName(dinozData.placeId)}`) }}
		</p>
	</div>
	<p class="placeDesc" v-if="dinozData">
		{{ $t(`place.description.${getPlaceName(dinozData.placeId)}`) }}
	</p>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { placeList } from '../../constants/place';
import WorldMap from './WorldMap.vue';

export default defineComponent({
	name: 'MapTab',
	props: { dinozData: { type: Object as PropType<DinozFiche>, required: true } },
	components: {
		WorldMap
	},
	methods: {
		changeTimezone(date: Date, ianatz: string) {
			const invdate = new Date(
				date.toLocaleString('en-US', {
					timeZone: ianatz
				})
			);
			const diff = date.getTime() - invdate.getTime();
			return new Date(date.getTime() - diff); // needs to substract
		},
		getPlaceName(placeId: number): string {
			const place = placeList.find(place => place.placeId === placeId);
			if (!place) return '';
			const today = this.changeTimezone(new Date(), 'GMT');
			if (place.placeId === 29) {
				const day = today.getDay();
				switch (day) {
					case 1:
					case 2:
					case 5:
						return 'marais';
					case 4:
					case 6:
						return 'marais_flood';
					case 0:
					case 3:
						return 'marais_fog';
					default:
						return 'marais';
				}
			}
			return place.name;
		}
	}
});
</script>

<style lang="scss" scoped>
.placeDesc {
	padding: 0px;
	padding: 5px;
	font-size: 9pt;
	line-height: 10.5pt;
	font-style: italic;
	color: #fdf1c4;
	text-align: justify;
	cursor: help;
	background-color: #cd8956;
	border-radius: 10px;
	max-width: 95%;
}
#boxMap {
	display: block;
	width: 95%;
	height: 275px;
	border: 1px solid #874b2e;
	outline: 2px solid #cc8557;
	padding: 1px;
}
.placeName {
	margin-top: 1px;
	display: block;
	height: 20px;
	padding-left: 8px;
	padding-top: 4px;
	color: #ffee92;
	font-size: 12pt;
	font-variant: small-caps;
	font-weight: bold;
	background-color: #bc683c;
	border-radius: 0px;
	text-align: justify;
}
</style>
