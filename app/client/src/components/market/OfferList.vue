<template>
	<DZDisclaimer help :content="$t('market.disclaimer')" />
	<div class="header df aic jcsb center">
		<DZButton @click="changeTab(2)">
			{{ $t('market.makeAnOffer') }}
		</DZButton>
		<Tippy theme="small" tag="div" class="treasury-notes dz-golden-box no-shadow df aic g4 p2-4">
			<span>{{ userStore.treasureTicket }}</span>
			<img :src="getImgURL('icons', 'ticket')" :alt="$t('market.yourTreasuryNotes')" />
			<template #content>
				{{ $t('market.yourTreasuryNotes') }}
			</template>
		</Tippy>
		<DZSelect id="offer-filter-select" v-model="filter" :options="filterOptions" @change="changeFilter" />
	</div>
	<DZTable>
		<tr>
			<th class="dinoz-header">{{ $t('market.dinoz') }}</th>
			<th class="items-header">{{ $t('market.items') }}</th>
			<th>{{ $t('market.details') }}</th>
			<th class="bid-action-header"></th>
		</tr>
		<OfferLine
			v-for="offer in offers"
			:key="offer.id"
			:offer="offer"
			:now="now"
			:update-offer="updateOffer"
			@bid="onBid"
		/>
	</DZTable>
	<div class="pagination-controls">
		<button @click="previousPage" :disabled="currentPage === 1">
			<img class="left" src="/src/assets/button/button-back-arrow.webp" />
		</button>
		<span>{{ currentPage }} / {{ totalPages || 1 }}</span>
		<button @click="nextPage" :disabled="currentPage >= totalPages">
			<img class="right" src="/src/assets/button/button-back-arrow.webp" />
		</button>
	</div>
	<DZDisclaimer help :content="$t('market.currency')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Tippy } from 'vue-tippy';

import DZButton from '../utils/DZButton.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZSelect from '../utils/DZSelect.vue';
import DZTable from '../utils/DZTable.vue';
import OfferLine from './OfferLine.vue';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import { refreshTreasureTicket } from '../../utils/refreshGold';
import { formatMarketOffers, MARKET_PAGE_SIZE } from '../../utils/market';
import type { EnhancedMarketOffer, MarketFilter } from '@dinorpg/core/models/market/market.js';
import { MarketService } from '../../services';

export default defineComponent({
	name: 'OfferList',
	components: { DZButton, DZDisclaimer, DZSelect, DZTable, OfferLine, Tippy },
	props: {
		changeTab: {
			type: Function,
			required: true
		}
	},
	data() {
		return {
			userStore: userStore(),
			now: Math.ceil(Date.now() / 1000),
			offers: [] as EnhancedMarketOffer[],
			filter: 'all' as MarketFilter,
			currentPage: 1,
			totalOffer: 0,
			totalPages: 0,
			timeTimer: null as ReturnType<typeof setInterval> | null,
			refreshTimer: null as ReturnType<typeof setInterval> | null
		};
	},
	computed: {
		filterOptions() {
			return [
				{ label: this.$t('market.all'), value: 'all' },
				{ label: this.$t('market.dinoz'), value: 'dinoz' },
				{ label: this.$t('market.items'), value: 'items' }
			];
		}
	},
	methods: {
		async fetchOffers(silent = false) {
			try {
				const { offers, total } = await MarketService.getList(
					this.filter,
					null,
					null,
					false,
					this.currentPage,
					false,
					silent
				);
				this.offers = formatMarketOffers(offers);
				this.totalOffer = total;
				this.totalPages = Math.ceil(this.totalOffer / MARKET_PAGE_SIZE);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		},
		async changeFilter() {
			this.currentPage = 1;
			await this.fetchOffers();
		},
		updateOffer(offer: EnhancedMarketOffer) {
			this.offers = this.offers.map(current => (current.id === offer.id ? offer : current));
		},
		async previousPage() {
			if (this.currentPage <= 1) return;
			this.currentPage--;
			await this.fetchOffers();
		},
		async nextPage() {
			if (this.currentPage >= this.totalPages) return;
			this.currentPage++;
			await this.fetchOffers();
		},
		async onBid(payload: { offerId: number; bidValue: number }) {
			this.userStore.setTicket(Math.max(0, this.userStore.treasureTicket - payload.bidValue));
			await refreshTreasureTicket();
		}
	},
	async mounted() {
		await this.fetchOffers(false);
		await refreshTreasureTicket();
		this.timeTimer = setInterval(() => {
			this.now = Math.ceil(Date.now() / 1000);
		}, 1_000);
		this.refreshTimer = setInterval(async () => {
			await this.fetchOffers(true);
		}, 5_000);
	},
	beforeUnmount() {
		if (this.timeTimer) {
			clearInterval(this.timeTimer);
		}
		if (this.refreshTimer) {
			clearInterval(this.refreshTimer);
		}
	}
});
</script>

<style lang="scss" scoped>
.treasury-notes {
	color: #fce3bc;
}
select {
	background-color: #bc683c;
	border: none;
	color: #fce3bc;
	font-weight: bold;
}
.dinoz-header {
	width: 50px;
}
.items-header {
	width: 194px;
}
.bid-action-header {
	width: 80px;
}
.pagination-controls {
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	button {
		background-color: transparent;
		margin: 0 10px;
		padding: 5px 10px;
		border: none;
		cursor: pointer;
		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
		.left,
		.right {
			width: 10px;
			height: auto;
		}
		.right {
			transform: rotate(180deg);
		}
	}
}
</style>
