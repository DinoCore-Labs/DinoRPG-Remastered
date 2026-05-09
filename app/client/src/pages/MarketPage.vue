<template>
	<TitleHeader :title="$t('pageTitle.market')" :header="$t('market.title')" />
	<div class="tabPanel">
		<ul class="tabs">
			<li :class="{ active: tab === 0 }">
				<a href="#" @click.prevent="changeTab(0)">{{ $t('market.allOffers') }}</a>
			</li>
			<li :class="{ active: tab === 1 }">
				<a href="#" @click.prevent="changeTab(1)">{{ $t('market.myTransactions') }}</a>
			</li>
			<li :class="{ active: tab === 2 }">
				<a href="#" @click.prevent="changeTab(2)">{{ $t('market.sell') }}</a>
			</li>
			<li :class="{ active: tab === 3 }">
				<a href="#" @click.prevent="changeTab(3)">{{ $t('market.history') }}</a>
			</li>
		</ul>
	</div>
	<OfferList v-if="tab === 0" :change-tab="changeTab" />
	<Transactions v-if="tab === 1" />
	<Sell v-if="tab === 2" :change-tab="changeTab" />
	<OfferHistory v-if="tab === 3" :change-tab="changeTab" />
	<DZButton back @click="goBackToDinozPage">
		{{ $t('market.back') }}
	</DZButton>
</template>

<script lang="ts">
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { defineAsyncComponent, defineComponent } from 'vue';

import DZButton from '../components/utils/DZButton.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { dinozStore } from '../store/dinozStore';
import { formatText } from '../utils/formatText';

export default defineComponent({
	name: 'MarketPage',
	components: {
		TitleHeader,
		DZButton,
		OfferList: defineAsyncComponent(() => import('../components/market/OfferList.vue')),
		Transactions: defineAsyncComponent(() => import('../components/market/Transactions.vue')),
		Sell: defineAsyncComponent(() => import('../components/market/Sell.vue')),
		OfferHistory: defineAsyncComponent(() => import('../components/market/OfferHistory.vue'))
	},
	data() {
		return {
			tab: 0,
			dStore: dinozStore()
		};
	},
	methods: {
		changeTab(tab: number) {
			this.tab = tab;
			this.$router.replace({
				name: 'MarketPage',
				params: { tab }
			});
		},
		goBackToDinozPage() {
			const currentDinozId = this.dStore.getCurrentDinozId;
			if (!currentDinozId) {
				this.$router.push({ name: 'NewsPage' });
				return;
			}
			this.$router.push({
				name: 'DinozPage',
				params: { id: currentDinozId }
			});
		},
		resolveMarketDinoz(): boolean {
			const currentDinozId = this.dStore.getCurrentDinozId;
			if (currentDinozId) {
				const currentDinoz = this.dStore.getDinoz(currentDinozId);
				if (currentDinoz?.placeId === PlaceEnum.PLACE_DU_MARCHE) {
					return true;
				}
			}
			const marketDinoz = this.dStore.getDinozList.find(dinoz => dinoz.placeId === PlaceEnum.PLACE_DU_MARCHE);
			if (marketDinoz) {
				this.dStore.setCurrentDinozId(marketDinoz.id);
				return true;
			}
			this.$toast.open({
				message: formatText(this.$t('toast.selectADinozAtMarketFirst')),
				type: 'error'
			});
			this.$router.push({ name: 'NewsPage' });
			return false;
		}
	},
	mounted() {
		const routeTab = Number(this.$route.params.tab ?? 0);
		this.tab = Number.isNaN(routeTab) ? 0 : routeTab;
		this.resolveMarketDinoz();
	}
});
</script>

<style lang="scss" scoped>
.tabPanel {
	position: relative;
	width: 100%;
	top: 6px;
	color: white;
	.tabs {
		padding-top: 4px;
		background-color: transparent;
		text-shadow: 1px 1px 0 #9a4029;
		border-bottom: 3px solid #bc683c;
		:hover {
			color: white;
		}
		li.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0 #9a4029;
			a {
				background-color: #d69e68;
				line-height: 16pt;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
	}
}
</style>
