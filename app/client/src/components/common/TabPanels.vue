<template>
	<div class="tabPanel">
		<ul class="tabs">
			<li :class="tabSelected === 1 ? 'active' : ''">
				<a @click="sessionStore.setTab(1)">{{ $t('dinozPage.tabs.map') }}</a>
			</li>
			<li :class="tabSelected === 2 ? 'active' : ''">
				<a @click="sessionStore.setTab(2)">{{ $t('dinozPage.tabs.inventory') }}</a>
			</li>
			<li :class="tabSelected === 3 ? 'active' : ''">
				<a @click="sessionStore.setTab(3)">{{ $t('dinozPage.tabs.details') }}</a>
			</li>
		</ul>
		<MapTab v-if="tabSelected === 1" :dinozData="dinozData" />
		<InventoryTab v-if="tabSelected === 2" />
		<!--<DetailsTab v-if="tabSelected === 3" :dinozData="dinozData" />-->
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { sessionStore } from '../../store/sessionStore';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import InventoryTab from './InventoryTab.vue';
//import DetailsTab from '../../components/common/DetailsTab.vue';
import MapTab from './MapTab.vue';

export default defineComponent({
	name: 'TabPanels',
	props: { dinozData: { type: Object as PropType<DinozFiche>, required: true } },
	components: {
		InventoryTab,
		//DetailsTab,
		MapTab
	},
	data() {
		return {
			sessionStore: sessionStore()
		};
	},
	computed: {
		tabSelected(): number {
			return this.sessionStore.getTab;
		}
	}
});
</script>

<style lang="scss" scoped>
.tabPanel {
	width: 315px;
	padding-bottom: 15px;
	color: white;
	display: flex;
	flex-direction: column;
	gap: 5px;
	align-items: center;
	background:
		url('../../assets/background/banniere_left.webp') no-repeat,
		url('../../assets/background/banniere_right.webp') no-repeat,
		url('../../assets/background/banniere_middle.webp') repeat-x;
	background-position-x: left;
	background-color: #d19860;
	background-size: auto;
	box-shadow: inset 0 0 1px 2px #d3a76a;
	border-style: hidden solid solid solid;
	border-width: 0 1px 1px 1px;
	border-color: #9f5841;
	.tabs {
		margin-top: 15px;
		margin-left: 1px;
		margin-right: 1px;
		align-self: baseline;
		background-image: none;
		text-shadow: 1px 1px 0px #9a4029;
		width: -moz-available;
		width: -webkit-fill-available;
		width: stretch;
		:hover {
			color: white;
		}
		li {
			cursor: pointer;
			&.active {
				margin-top: 1px;
				text-shadow: 1px 1px 0px #9a4029;
				a {
					background-color: #d69e68;
					color: white;
					border-left-color: #ffe7aa;
					border-top-color: #ffe7aa;
					border-bottom: 1px solid #d69e68;
				}
			}
		}
	}
}
@media (max-width: 539px) {
	.tabPanel {
		width: 95%;
	}
}
</style>
