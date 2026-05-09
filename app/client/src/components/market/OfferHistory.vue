<template>
	<DZDisclaimer help :content="$t('market.historyView.lastOffers')" />
	<div class="df jcsb center">
		<DZButton @click="changeTab(2)">
			{{ $t('market.makeAnOffer') }}
		</DZButton>
		<DZSelect id="offer-history-filter-select" v-model="filter" :options="filterOptions" @change="changeFilter" />
	</div>
	<DZTable>
		<tr>
			<th class="dinoz-header">{{ $t('market.dinoz') }}</th>
			<th class="items-header">{{ $t('market.items') }}</th>
			<th></th>
			<th></th>
		</tr>
		<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" />
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import DZButton from '../utils/DZButton.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZSelect from '../utils/DZSelect.vue';
import DZTable from '../utils/DZTable.vue';
import OfferLine from './OfferLine.vue';
import { MarketService } from '../../services/market.service';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import { formatMarketOffers, MARKET_PAGE_SIZE } from '../../utils/market';
import type { EnhancedMarketOffer, MarketFilter } from '@dinorpg/core/models/market/market.js';

export default defineComponent({
	name: 'OfferHistory',
	components: { DZButton, DZTable, DZDisclaimer, OfferLine, DZSelect },
	props: {
		changeTab: {
			type: Function,
			required: true
		}
	},
	data() {
		return {
			now: Math.ceil(Date.now() / 1000),
			offers: [] as EnhancedMarketOffer[],
			filter: 'all' as MarketFilter,
			currentPage: 1,
			totalOffer: 0,
			totalPages: 0,
			userStore: userStore(),
			timer: null as ReturnType<typeof setInterval> | null
		};
	},
	computed: {
		filterOptions() {
			return [
				{ label: this.$t('market.all'), value: 'all' },
				{ label: this.$t('market.dinoz'), value: 'dinoz' },
				{ label: this.$t('market.items'), value: 'items' },
				{ label: this.$t('market.historyView.yourOwnOffers'), value: 'own' },
				{ label: this.$t('market.historyView.yourOwnBids'), value: 'bids' }
			];
		}
	},
	methods: {
		async fetchOffers() {
			try {
				const userId = this.userStore.id;
				const { offers, total } = await MarketService.getList(
					this.filter,
					this.filter === 'own' ? userId : null,
					this.filter === 'bids' ? userId : null,
					true,
					this.currentPage
				);
				this.offers = formatMarketOffers(offers).sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
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
		async previousPage() {
			if (this.currentPage <= 1) return;
			this.currentPage--;
			await this.fetchOffers();
		},
		async nextPage() {
			if (this.currentPage >= this.totalPages) return;
			this.currentPage++;
			await this.fetchOffers();
		}
	},
	async mounted() {
		await this.fetchOffers();
		this.timer = setInterval(() => {
			this.now = Math.ceil(Date.now() / 1000);
		}, 1_000);
	},
	beforeUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}
});
</script>

<style lang="scss" scoped>
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
		}
		.left,
		.right {
			height: auto;
			width: 10px;
		}
		.right {
			transform: rotate(180deg);
		}
	}
}
</style>
