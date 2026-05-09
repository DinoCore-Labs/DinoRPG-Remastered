<template>
	<tr>
		<td v-if="offer.dinoz" :data-dinoz-level="offer.dinoz.level" :class="{ dinoz: true, 'has-dinoz': !!offer.dinoz }">
			<DinozMini :display="offer.dinoz.display" />
			<DZButton size="small" @click="details = !details">
				{{ $t('market.detail') }}
			</DZButton>
		</td>
		<td v-else />
		<td class="items-td">
			<div class="items">
				<div v-for="item in offer.items" :key="`${item.isIngredient}-${item.itemId}`" class="dz-golden-box">
					<Tippy tag="img" theme="normal" :src="getItemImage(item)" :alt="getItemLabel(item)">
						<p>{{ getItemLabel(item) }}</p>
						<template #content>
							<h1>{{ getItemLabel(item) }}</h1>
							<p>{{ getItemDescription(item) }}</p>
						</template>
					</Tippy>
					<span v-if="item.quantity > 1">x {{ item.quantity }}</span>
					<span v-else>&nbsp;</span>
				</div>
				<div v-for="i in Math.max(0, 5 - offer.items.length)" :key="i" class="dz-golden-box">
					<img :src="getImgURL('item', 'item_empty')" alt="empty" />
					<span>&nbsp;</span>
				</div>
			</div>
		</td>
		<td class="bid">
			<p>
				<span>{{ $t('market.seller') }}:</span>
				<DZUser v-if="offer.seller" :user="offer.seller" />
				<span v-else>{{ offer.sellerName }}</span>
			</p>
			<p>
				<span>{{ $t('market.timeLeft') }}:</span>
				<span class="time">
					<img :src="getImgURL('design', 'small_chrono')" :alt="$t('market.timeLeft')" />
					<Tippy theme="small">
						<span v-if="isExpired">{{ $t('market.auctionExpired') }}</span>
						<span v-else>{{ formatMarketTime(Math.ceil(offer.endDate.getTime() / 1000) - now) }}</span>
						<template #content>
							{{ offer.endDate.toLocaleString() }}
						</template>
					</Tippy>
				</span>
			</p>
			<p v-if="bestBid">
				<span>{{ $t('market.highestBid') }}:</span>
				<span>
					<span class="bid-value">{{ bestBid.value }}</span>
					<img :src="getImgURL('icons', 'ticket', true)" />
					<span>{{ $t('market.by') }} </span>
					<DZUser v-if="bestBid.user" :user="bestBid.user" />
					<span v-else>{{ bestBid.userName }}</span>
				</span>
			</p>
			<p v-else>
				<span>{{ $t('market.minimumPrice') }}:</span>
				<span>
					<span class="bid-value">{{ Math.ceil(offer.total / 1000) }}</span>
					<img :src="getImgURL('icons', 'ticket', true)" />
				</span>
			</p>
		</td>
		<td class="bid-action">
			<div v-if="!isExpired && !ownOffer">
				<DZInput type="number" min="1" v-model="bidValue" />
				<DZButton size="small" @click="bid">
					{{ $t('market.bid') }}
					<img :src="getImgURL('icons', 'ticket', true)" />
				</DZButton>
			</div>
		</td>
	</tr>
	<tr v-if="details && offer.dinoz" class="dinoz-details">
		<td class="dinoz-name-race">
			<h2>{{ offer.dinoz.name }}</h2>
			<p class="race">{{ raceName }}</p>
		</td>
		<td>
			<ul class="stats">
				<li>
					<img :src="getImgURL('elements', 'elem_fire')" alt="fire" />
					<span>{{ offer.dinoz.nbrUpFire }}</span>
				</li>
				<li>
					<img :src="getImgURL('elements', 'elem_water')" alt="water" />
					<span>{{ offer.dinoz.nbrUpWater }}</span>
				</li>
				<li>
					<img :src="getImgURL('elements', 'elem_wood')" alt="wood" />
					<span>{{ offer.dinoz.nbrUpWood }}</span>
				</li>
				<li>
					<img :src="getImgURL('elements', 'elem_lightning')" alt="lightning" />
					<span>{{ offer.dinoz.nbrUpLightning }}</span>
				</li>
				<li>
					<img :src="getImgURL('elements', 'elem_air')" alt="air" />
					<span>{{ offer.dinoz.nbrUpAir }}</span>
				</li>
			</ul>
		</td>
		<td>
			<ul class="skills">
				<SkillTooltip v-for="skill in offer.dinoz.skills" :key="skill.skillId" :skill="skillList[skill.skillId]?.id">
					<li>
						<span>{{ $t(`skill.name.${skillList[skill.skillId]?.name}`) }}</span>
					</li>
				</SkillTooltip>
			</ul>
		</td>
		<td>
			<template v-for="status in offer.dinoz.status" :key="status.statusId">
				<Tippy v-if="statusList.displayed[status.statusId]" theme="normal">
					<img
						:src="getImgURL('status', `fx_${statusList.imgName[status.statusId]}`)"
						:alt="statusList.imgName[status.statusId]"
					/>
					<template #content>
						<h1>{{ $t(`status.name.${status.statusId}`) }}</h1>
						<p>{{ $t(`status.description.${status.statusId}`) }}</p>
					</template>
				</Tippy>
			</template>
		</td>
	</tr>
</template>

<script lang="ts">
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { defineComponent } from 'vue';
import { Tippy } from 'vue-tippy';

import DinozMini from '../dinoz/DinozMini.vue';
import SkillTooltip from '../dinoz/SkillTooltip.vue';
import DZButton from '../utils/DZButton.vue';
import DZInput from '../utils/DZInput.vue';
import DZUser from '../utils/DZUser.vue';
import type { EnhancedMarketOffer, MarketOfferItem } from '@dinorpg/core/models/market/market.js';
import { MarketService } from '../../services';
import { statusList } from '../../constants/status';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import { formatMarketTime, getOfferMinimumBid, isOfferExpired } from '../../utils/market';

export default defineComponent({
	name: 'OfferLine',
	components: { DinozMini, DZButton, DZInput, DZUser, SkillTooltip, Tippy },
	props: {
		offer: {
			type: Object as () => EnhancedMarketOffer,
			required: true
		},
		updateOffer: {
			type: Function,
			required: false
		},
		now: {
			type: Number,
			required: true
		}
	},
	emits: ['bid'],
	data() {
		return {
			userStore: userStore(),
			formatMarketTime,
			statusList,
			skillList,
			bidValue: 0,
			details: false
		};
	},
	computed: {
		bestBid() {
			return this.offer.bids[0] ?? null;
		},
		isExpired() {
			return isOfferExpired(this.offer, this.now);
		},
		ownOffer() {
			return this.offer.seller?.id === this.userStore.id || this.offer.sellerId === this.userStore.id;
		},
		raceName() {
			if (!this.offer.dinoz) return '';
			const race = Object.values(raceList).find(currentRace => currentRace.raceId === this.offer.dinoz?.raceId);
			return race ? this.$t(`race.name.${race.name}`) : '';
		}
	},
	methods: {
		getItemImage(item: MarketOfferItem) {
			const name = item.name ?? '';
			return item.isIngredient ? this.getImgURL('ingredients', name) : this.getImgURL('item', `item_${name}`);
		},
		getItemLabel(item: MarketOfferItem) {
			const name = item.name ?? '';
			return item.isIngredient ? this.$t(`ingredients.name.${name}`) : this.$t(`items.name.${name}`);
		},
		getItemDescription(item: MarketOfferItem) {
			const name = item.name ?? '';
			return item.isIngredient ? this.$t(`ingredients.description.${name}`) : this.$t(`items.description.${name}`);
		},
		async bid() {
			if (!this.bidValue || this.bidValue <= 0) return;
			try {
				await MarketService.bidOffer(this.offer.id, this.bidValue);
				const nextOffer: EnhancedMarketOffer = {
					...this.offer,
					bids: [
						{
							value: this.bidValue,
							userId: this.userStore.id,
							userName: this.userStore.name ?? '',
							user:
								this.userStore.id && this.userStore.name ? { id: this.userStore.id, name: this.userStore.name } : null
						},
						...this.offer.bids
					]
				};
				this.updateOffer?.(nextOffer);
				this.$emit('bid', {
					offerId: this.offer.id,
					bidValue: this.bidValue
				});
				this.bidValue++;
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		}
	},
	mounted() {
		this.bidValue = getOfferMinimumBid(this.offer);
	}
});
</script>
