<template>
	<template v-if="myExpiredOffers.length">
		<h4>{{ $t('market.transactionView.myExpiredOffers') }}</h4>
		<table>
			<tr>
				<td>{{ $t('market.transactionView.bid') }}</td>
				<td>
					<DZButton @click="claimOffer(myExpiredOffers[0].id)">
						{{ $t('market.transactionView.claimExpired') }}
					</DZButton>
				</td>
			</tr>
		</table>
		<DZTable>
			<OfferLine :offer="myExpiredOffers[0]" :now="now" />
		</DZTable>
	</template>
	<DZDisclaimer v-else help :content="$t('market.transactionView.noExpiredOffer')" />
	<template v-if="wonOffers.length">
		<h4>{{ $t('market.transactionView.yourWonOffer') }}</h4>
		<template v-for="offer in wonOffers" :key="offer.id">
			<table>
				<tr>
					<td>{{ $t('market.transactionView.bid') }}</td>
					<td>
						<p v-if="offer.bids.length" class="bid">
							<span>{{ offer.bids[0].value }}</span>
							<img :src="getImgURL('icons', 'ticket')" />
							<span>{{ $t('market.by') }}</span>
							<DZUser v-if="offer.bids[0].user" :user="offer.bids[0].user" />
						</p>
						<p v-else>{{ $t('market.transactionView.noBidYet') }}</p>
						<DZButton @click="claimOffer(offer.id)">
							{{ $t('market.transactionView.claim') }}
						</DZButton>
					</td>
				</tr>
			</table>
			<DZTable>
				<OfferLine :offer="offer" :now="now" />
			</DZTable>
		</template>
	</template>
	<DZDisclaimer v-else help :content="$t('market.transactionView.noWonOffer')" />
	<template v-if="ownOffer">
		<h4>{{ $t('market.transactionView.yourOngoingOffer') }}</h4>
		<table>
			<tr>
				<td>{{ $t('market.transactionView.bid') }}</td>
				<td>
					<p v-if="ownOffer.bids.length" class="bid">
						<span>{{ ownOffer.bids[0].value }}</span>
						<img :src="getImgURL('icons', 'ticket')" />
						<span>{{ $t('market.by') }}</span>
						<DZUser v-if="ownOffer.bids[0].user" :user="ownOffer.bids[0].user" />
					</p>
					<p v-else>{{ $t('market.transactionView.noBidYet') }}</p>
					<DZButton @click="cancelOffer">
						{{ $t('market.transactionView.cancel') }}
					</DZButton>
				</td>
			</tr>
			<tr>
				<td>{{ $t('market.timeLeft') }}</td>
				<td>
					<span class="time">
						<img :src="getImgURL('icons', 'small_chrono')" :alt="$t('market.timeLeft')" />
						<Tippy theme="small">
							{{ formatMarketTime(Math.ceil(ownOffer.endDate.getTime() / 1000) - now) }}
							<template #content>
								{{ ownOffer.endDate.toLocaleString() }}
							</template>
						</Tippy>
					</span>
				</td>
			</tr>
		</table>
		<DZTable>
			<OfferLine :offer="ownOffer" :now="now" />
		</DZTable>
	</template>
	<DZDisclaimer v-else help :content="$t('market.transactionView.noOnGoingOffer')" />
	<template v-if="offers.length">
		<h4>{{ $t('market.transactionView.yourActiveBids') }}</h4>
		<DZTable>
			<tr>
				<th class="dinoz-header">{{ $t('market.dinoz') }}</th>
				<th class="items-header">{{ $t('market.items') }}</th>
				<th>{{ $t('market.details') }}</th>
				<th class="bid-action-header"></th>
			</tr>
			<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" :update-offer="updateOffer" />
		</DZTable>
	</template>
	<DZDisclaimer v-else help :content="$t('market.transactionView.noActiveBid')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Tippy } from 'vue-tippy';

import DZButton from '../utils/DZButton.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZTable from '../utils/DZTable.vue';
import DZUser from '../utils/DZUser.vue';
import OfferLine from './OfferLine.vue';
import { MarketService } from '../../services/market.service';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import { formatText } from '../../utils/formatText';
import { refreshGold, refreshTreasureTicket } from '../../utils/refreshGold';
import { formatMarketOffers, formatMarketTime } from '../../utils/market';
import type { EnhancedMarketOffer } from '@dinorpg/core/models/market/market.js';

export default defineComponent({
	name: 'Transactions',
	components: { DZButton, DZDisclaimer, DZTable, DZUser, OfferLine, Tippy },
	data() {
		return {
			userStore: userStore(),
			now: Math.ceil(Date.now() / 1000),
			formatMarketTime,
			ownOffer: null as EnhancedMarketOffer | null,
			myExpiredOffers: [] as EnhancedMarketOffer[],
			offers: [] as EnhancedMarketOffer[],
			wonOffers: [] as EnhancedMarketOffer[],
			timeTimer: null as ReturnType<typeof setInterval> | null,
			refreshTimer: null as ReturnType<typeof setInterval> | null
		};
	},
	methods: {
		async fetchOffers(silent = false) {
			const userId = this.userStore.id;
			if (!userId) {
				this.$toast.open({
					message: formatText(this.$t('toast.missingUser')),
					type: 'error'
				});
				this.$router.push({ name: 'NewsPage' });
				return;
			}
			try {
				const { offers } = await MarketService.getList('all', null, userId, false, 1, false, silent);
				this.offers = formatMarketOffers(offers);
				const { offers: ownOffers } = await MarketService.getList('all', userId, null, false, 1, false, silent);
				this.ownOffer = formatMarketOffers(ownOffers)[0] ?? null;
				const { offers: wonOffers } = await MarketService.getList('all', null, userId, true, 1, true, silent);
				this.wonOffers = formatMarketOffers(wonOffers);
				const { offers: myExpiredOffers } = await MarketService.getList('all', userId, null, true, 1, true, silent);
				this.myExpiredOffers = formatMarketOffers(myExpiredOffers);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		},
		async cancelOffer() {
			if (!this.ownOffer) return;
			try {
				await MarketService.cancelOffer(this.ownOffer.id);
				this.ownOffer = null;
				this.$toast.open({
					message: formatText(this.$t('toast.market.offerCancelled')),
					type: 'success'
				});
				await this.fetchOffers();
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		},
		async claimOffer(offerId: number) {
			try {
				const data = await MarketService.claimOffer(offerId);
				if (data.discoveredSkills?.length) {
					this.userStore.addDiscoveredSkills(data.discoveredSkills);
				}
				if (data.rewardUnlocked) {
					this.userStore.unlockReward(data.rewardUnlocked);
				}
				await this.fetchOffers();
				await refreshGold();
				await refreshTreasureTicket();
				this.$toast.open({
					message: formatText(this.$t('toast.market.offerClaimed')),
					type: 'success'
				});
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		},
		updateOffer(offer: EnhancedMarketOffer) {
			this.offers = this.offers.map(current => (current.id === offer.id ? offer : current));
		}
	},
	async mounted() {
		await this.fetchOffers(false);
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
.dinoz-header {
	width: 50px;
}
h4 {
	background-color: #bc683c;
	color: #ffee92;
	font-variant: small-caps;
	padding: 2px 4px;
	font-weight: normal;
}
table {
	width: 95%;
	table-layout: fixed;
	align-self: center;
	td {
		font-size: 9pt;
		padding: 2px 4px;
		&:first-child {
			background-color: #ecbd84;
			color: #f8efa4;
			border-radius: 8px;
			padding: 4px 8px;
			text-align: center;
			width: 230px;
			vertical-align: middle;
		}
		.bid {
			display: flex;
			align-items: center;
			margin-bottom: 5px;
			img {
				margin-right: 5px;
				margin-left: 5px;
			}
			.user {
				margin-left: 5px;
			}
		}
		.time {
			display: inline-flex;
			align-items: center;
			color: white;
			background-color: #bc683c;
			margin-top: 3px;
			margin-bottom: 3px;
			padding-right: 4px;
			border-radius: 7px;
			img {
				margin-right: 5px;
			}
		}
	}
}
:deep(.dinoz) {
	width: 50px;
}
:deep(.items-td) {
	width: 194px;
}
:deep(.bid-action) {
	width: 80px;
}
</style>
