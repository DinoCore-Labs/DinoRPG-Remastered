<template>
	<div id="accountList">
		<div class="money">
			<span class="moneyValue">
				{{ beautifulNumber(displayedAmount) }}
			</span>
			<img :src="walletIcon" :alt="selectedWallet" />
		</div>
		<DZSelect id="wallet-select" class="moneySelect" v-model="selectedWallet" :options="walletOptions" />
		<div class="iconMenu">
			<RouterLink to="/bank" class="link" :title="$t('button.bank')">
				<img :src="getImgURL('act', 'act_shop')" alt="shop" />
			</RouterLink>
			<RouterLink to="/shop/flying" class="link" :title="$t('button.shop')">
				<img :src="getImgURL('act', 'act_boutique')" alt="shop" />
			</RouterLink>
			<RouterLink :to="`/clan/${user.clanId}`" class="link" :title="$t('button.clan')" v-if="user.clanId">
				<img :src="getImgURL('act', 'act_castle')" alt="clan" />
			</RouterLink>
			<RouterLink :to="`/clans`" class="link" :title="$t('button.clan')" v-if="!user.clanId">
				<img :src="getImgURL('act', 'act_castle')" alt="clan" />
			</RouterLink>
			<span class="link linkDisabled" :title="$t('button.unavailable')" aria-disabled="true">
				<img :src="getImgURL('act', 'act_dojo')" alt="dojo" />
			</span>
			<!--
			<RouterLink class="link" :to="`/dojo`">
				<img :src="getImgURL('act', 'act_dojo')" alt="dojo" />
			</RouterLink>
			-->
		</div>
		<div class="place" v-if="place" @click="goToDinozPage()">
			<div class="img-wrapper">
				<img :src="getPlaceImage(place)" :alt="$t(`place.name.${place}`)" />
			</div>
			<p class="place-name">{{ $t(`place.name.${place}`) }}</p>
		</div>
		<div class="dinozCapacity" :class="{ full: activeDinozCount >= user.maxDinoz }">
			{{ $t('leftPanel.dinozCapacity', { current: activeDinozCount, max: user.maxDinoz }) }}
		</div>
		<DinozList :currentDinozId="currentDinozId()"></DinozList>
		<a v-if="user.canManageDinozOrder" class="overviewButton" @click="goToPage('ManageDinoz')">
			<img :src="getImgURL('icons', 'small_edit')" alt="edit" />
			<span>{{ $t('button.sortDinoz') }}</span>
		</a>
		<a v-if="user.canAccessSkillsPage" class="overviewButton" @click="goToPage('SkillTreesPage')">
			<img :src="getImgURL('icons', `clipboard`)" alt="skills" />
			<span>{{ $t('button.skills') }}</span>
		</a>
		<!--<a v-if="hasPMI" class="overviewButton" @click="goToPage('DinozMissions')">
			<img :src="getImgURL('icons', `small_right`)" alt="missions" />
			<span>{{ $t('button.dinozMissions') }}</span>
		</a>-->
		<DZButton @click="goToPage('ShopDinoz')">
			{{ $t('button.buyDinoz') }}
		</DZButton>
	</div>
</template>

<script lang="ts">
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { DINOZ_STATE } from '@dinorpg/core/models/dinoz/dinozState.js';
import { defineComponent } from 'vue';

import { placeList } from '../../constants/place';
import { dinozStore } from '../../store/dinozStore';
import { userStore } from '../../store/userStore';
import { beautifulNumber } from '../../utils/beautifulNumber';
import DinozList from '../dinoz/DinozList.vue';
import DZButton from '../utils/DZButton.vue';
import DZSelect from '../utils/DZSelect.vue';

type WalletKey = 'GOLD' | 'TREASURE_TICKET';

export default defineComponent({
	name: 'LeftPanel',
	components: {
		DZButton,
		DZSelect,
		DinozList
	},
	data() {
		return {
			user: userStore(),
			dinoz: dinozStore(),
			selectedWallet: 'GOLD' as WalletKey,
			isRefreshingDinozMenu: false,
			lastDinozMenuRefreshAt: 0
		};
	},
	computed: {
		walletOptions() {
			return [
				{ value: 'GOLD' as const, label: this.$t('leftPanel.wallets.gold') },
				{ value: 'TREASURE_TICKET' as const, label: this.$t('leftPanel.wallets.treasureTicket') }
			];
		},
		displayedAmount(): number {
			if (this.selectedWallet === 'TREASURE_TICKET') return (this.user as any).treasureTicket ?? 0;
			return (this.user as any).gold ?? 0;
		},
		walletIcon(): string {
			return this.selectedWallet === 'TREASURE_TICKET'
				? this.getImgURL('icons', 'ticket')
				: this.getImgURL('icons', 'gold');
		},
		place(): string | null {
			const currentDinozId = this.currentDinozId();
			if (!currentDinozId) return null;
			const currentDinoz = this.dinoz.getDinoz(currentDinozId) as DinozFiche | undefined;
			if (!currentDinoz) return null;
			const place = Object.values(placeList).find(place => place.placeId === currentDinoz.placeId);
			if (!place) return null;
			return place.name;
		},
		activeDinozCount(): number {
			return this.dinoz.getDinozList.filter(dinoz => dinoz.state !== DINOZ_STATE.frozen).length;
		}
	},
	watch: {
		'$route.fullPath': {
			async handler() {
				await this.refreshDinozMenu();
			}
		}
	},
	async mounted() {
		await this.refreshDinozMenu(true);
		document.addEventListener('visibilitychange', this.refreshDinozMenuOnVisibilityChange);
	},
	beforeUnmount() {
		document.removeEventListener('visibilitychange', this.refreshDinozMenuOnVisibilityChange);
	},
	methods: {
		beautifulNumber,
		async refreshDinozMenu(force = false) {
			if (!this.user.isLogged) return;
			const now = Date.now();
			if (this.isRefreshingDinozMenu) return;
			// évite de relancer l'endpoint à chaque micro-navigation
			if (!force && now - this.lastDinozMenuRefreshAt < 10_000) return;
			this.isRefreshingDinozMenu = true;
			try {
				await this.dinoz.refreshDinozMenu({
					silent: true
				});
				this.lastDinozMenuRefreshAt = now;
			} finally {
				this.isRefreshingDinozMenu = false;
			}
		},
		async refreshDinozMenuOnVisibilityChange() {
			if (document.visibilityState !== 'visible') return;
			await this.refreshDinozMenu(true);
		},
		goToPage(pageName: string) {
			this.$router.push({ name: pageName });
		},
		goToDinozPage() {
			const currentDinozId = this.currentDinozId();
			if (!currentDinozId) return;
			this.$router.push({
				name: 'DinozPage',
				params: { id: currentDinozId }
			});
		},
		currentDinozId(): number | undefined {
			return this.dinoz.getCurrentDinozId;
		},
		changeTimezone(date: Date, ianatz: string) {
			const invdate = new Date(
				date.toLocaleString('en-US', {
					timeZone: ianatz
				})
			);
			const diff = date.getTime() - invdate.getTime();
			return new Date(date.getTime() - diff);
		},
		getPlaceImage(place: string | null) {
			if (!place) return;
			const today = this.changeTimezone(new Date(), 'GMT').getDay();
			if (place === 'marais' && !(today === 1 || today === 2 || today === 5)) {
				return new URL(`/src/assets/place/marais_fog.webp`, import.meta.url).toString();
			}
			return new URL(`/src/assets/place/${place}.webp`, import.meta.url).toString();
		}
	}
});
</script>

<style lang="scss" scoped>
.dinozCapacity {
	margin: 0 0 4px;
	padding: 2px 4px;
	text-align: center;
	font-size: 8pt;
	font-weight: bold;
	color: #8e3e26;
	background: #f7d99b;
	border: 1px solid #d69e68;
	&.full {
		color: #b53018;
	}
}
.link {
	display: flex;
	flex-direction: column;
	-moz-box-pack: center;
	justify-content: center;
	-moz-box-align: center;
	align-items: center;
	cursor: pointer;
	&:hover {
		filter: brightness(130%);
	}
	&.linkDisabled {
		cursor: not-allowed;
		opacity: 0.65;
		filter: grayscale(1);
		&:hover {
			filter: grayscale(1);
		}
	}
}
.overviewButton {
	color: #8e3e26;
	font-variant: small-caps;
	font-weight: bold;
	display: flex;
	align-items: center;
	margin-bottom: 1px;
	padding-top: 1px;
	padding-bottom: 1px;
	padding-left: 5px;
	font-size: 8pt;
	line-height: 10pt;
	text-decoration: none;
	border: 1px solid #d69e68;
	border-radius: 0px;
	-webkit-border-radius: 0px;
	cursor: pointer;
	img {
		width: 8px;
		padding-right: 3px;
	}
	&:hover {
		color: #d69e68;
	}
}
#accountList {
	grid-area: left;
	justify-self: end;
	margin-top: 20px;
	margin-right: 20px;
	max-width: min-content;
	display: flex;
	flex-direction: column;
	.namePlace {
		text-align: center;
		font-size: 9pt;
		text-transform: none;
		letter-spacing: 0pt;
		color: #8e3a20;
	}
	.money {
		margin: 10px;
		width: 137px;
		height: 25px;
		margin-bottom: 34px;
		padding: 0px;
		padding-top: 6px;
		margin-left: -5px;
		text-align: center;
		font-size: 10pt !important;
		color: #ffee92;
		border: 0px;
		background-color: transparent;
		background-image: url('../../assets/background/goldbox.webp');
		background-repeat: no-repeat;
		cursor: help;
		font-weight: bold;
		img {
			vertical-align: -5%;
		}
	}
	.moneySelect {
		margin-top: -12px;
		margin-bottom: 10px;
	}
	.iconMenu {
		width: 143px;
		height: 32px;
		margin-bottom: 10px;
		display: flex;
		justify-content: space-evenly;
		&:hover {
			cursor: pointer;
		}
	}
}
@media (max-width: 875px) {
	#accountList {
		display: none;
	}
}
.place {
	padding: 2px;
	background-color: #fbdca5;
	margin-bottom: 8px;
	cursor: pointer;
	.img-wrapper {
		height: 109px;
		overflow: hidden;
		width: 140px;
		img {
			width: 100%;
			border: 1px solid #9a4029;
			box-sizing: border-box;
		}
	}
	.place-name {
		color: #bc683c;
		text-align: center;
		font-size: 9pt;
		font-style: italic;
		&:first-letter {
			font-weight: normal;
			font-size: 9pt;
		}
	}
}
</style>
