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
				<SkillTooltip v-for="marketSkill in displayedSkills" :key="marketSkill.skillId" :skill="marketSkill.skill.id">
					<li>
						<span>{{ $t(`skill.name.${marketSkill.skill.name}`) }}</span>
					</li>
				</SkillTooltip>
			</ul>
		</td>
		<td>
			<template v-for="status in displayedStatuses" :key="status.statusId">
				<Tippy theme="normal">
					<img :src="getImgURL('status', `fx_${status.imgName}`)" :alt="status.imgName" />
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

type MarketSkill = {
	skillId: number;
	skill: (typeof skillList)[keyof typeof skillList];
};

type MarketStatus = {
	statusId: number;
	imgName: string;
};

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
		},
		displayedSkills(): MarketSkill[] {
			if (!this.offer.dinoz) {
				return [];
			}
			return this.offer.dinoz.skills.reduce<MarketSkill[]>((acc, currentSkill) => {
				const skill = skillList[currentSkill.skillId as keyof typeof skillList];
				if (!skill) {
					return acc;
				}
				acc.push({
					skillId: currentSkill.skillId,
					skill
				});
				return acc;
			}, []);
		},
		displayedStatuses(): MarketStatus[] {
			if (!this.offer.dinoz) {
				return [];
			}
			return this.offer.dinoz.status.reduce<MarketStatus[]>((acc, currentStatus) => {
				const displayedKey = currentStatus.statusId as keyof typeof statusList.displayed;
				const imgNameKey = currentStatus.statusId as keyof typeof statusList.imgName;
				const isDisplayed = statusList.displayed[displayedKey];
				const imgName = statusList.imgName[imgNameKey];
				if (!isDisplayed || !imgName) {
					return acc;
				}
				acc.push({
					statusId: currentStatus.statusId,
					imgName
				});
				return acc;
			}, []);
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

<style lang="scss" scoped>
.details {
	display: none;
}
.dinoz {
	position: relative;
	&.has-dinoz {
		&:before {
			content: attr(data-dinoz-level);
			display: block;
			position: absolute;
			top: 0px;
			left: -4px;
			border: 1px solid #ffee92;
			background-color: #c2381a;
			color: #ffee92;
			padding: 2px 4px;
		}
	}
}
.dinoz-details {
	.dinoz-name-race {
		text-align: center;

		.race {
			font-variant: small-caps;
		}
	}
	.status {
		list-style-type: none;
		margin-left: 12px;
		li {
			display: inline-block;
			&:not(:last-child) {
				margin-right: 1px;
			}
		}
	}
	.stats {
		list-style-type: none;
		margin-left: 4px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		li {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: space-around;
			min-width: 42px;
			font-size: 10pt;
			font-weight: bold;
			color: white;
			letter-spacing: -0.2pt;
			z-index: 2;
			padding-right: 4px;
			&:not(:last-child) {
				margin-right: 2px;
			}
			&::before {
				content: '';
				position: absolute;
				width: 80%;
				height: 13px;
				background-color: #90452c;
				left: 20%;
				top: 5px;
				border-radius: 10px;
				z-index: -1;
			}
			& > img {
				width: 22px;
			}
			span {
				margin-left: 2px;
			}
		}
	}
	.skills {
		list-style-type: none;
		margin-left: 12px;
		height: 150px;
		overflow-y: auto;
		li {
			display: flex;
			gap: 2px;
			font-size: 9pt;
			img {
				width: 13px;
			}
			span {
				color: #710;
			}
		}
	}
}

.items {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	justify-content: center;
	& > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 1px;
		padding: 1px;
		img {
			border: 1px solid #6e3d23;
		}
		span {
			color: #ffee92;
			font-size: 7pt;
		}
	}
}
.bid {
	color: #52646b;
	p {
		display: flex;
		align-items: center;
		justify-content: space-between;
		&:first-letter {
			font-size: inherit;
		}
		& > span:last-child {
			text-align: right;
		}
		.user {
			margin-left: 5px;
		}
		.bid-value {
			font-weight: bold;
			& + img {
				margin-left: 3px;
				margin-right: 3px;
			}
		}
	}
	.time {
		display: flex;
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

.bid-action {
	text-align: center;
	input {
		max-width: 80px;
		display: inline-block;
		margin-bottom: 5px;
	}
	:deep(a span) {
		display: flex;
		align-items: center;
		img {
			margin-left: 3px;
		}
	}
}
</style>
