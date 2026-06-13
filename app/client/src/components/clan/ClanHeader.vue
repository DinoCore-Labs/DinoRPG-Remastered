<template>
	<div class="dz-box header">
		<h3>
			<img :src="getImgURL('button', 'info_button')" alt="info_button" style="margin-right: 10px" />
			{{ $t('clan.header.infos') }}
			<img :src="getImgURL('button', 'info_button')" alt="info_button" style="margin-left: 10px" />
		</h3>
		<div class="top-info">
			<div class="top-info-element">
				<img
					:src="getImgURL('icons', 'small_member')"
					alt="members"
					v-tippy="{
						content: formatContent($t('clan.icons.members')),
						theme: 'small'
					}"
				/>
				{{ clanStore.getClan?.members?.length }}/{{ maxMembers }}
			</div>
			<div class="top-info-element">
				<img
					:src="getImgURL('icons', 'small_gold')"
					alt="gold"
					v-tippy="{
						content: formatContent($t('clan.icons.gold')),
						theme: 'small'
					}"
				/>
				{{ moneyLint(clanStore.getClan?.treasureValue ?? 0) }}
			</div>
			<div class="top-info-element">
				<Flag v-for="lang in clanStore.getClan?.languages" :key="lang" :lang="lang.toLocaleLowerCase()" />
			</div>
		</div>
		<div class="banner" v-if="bannerDataUrl">
			<img class="banner-img" :src="bannerDataUrl" alt="banner" />
		</div>
		<div class="bottom-info">
			<p class="creation-date">
				{{ $t('clan.header.creation_date', { date: DateToString(clanStore.getClan!.creationDate) }) }}
			</p>
			<div class="leader-name">
				<DZUser :user="clanStore.getClan!.leader" leader />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CLAN_MAX_MEMBERS_AMOUNT } from '@dinorpg/core/models/clan/constants.js';
import { API_BASE } from '../../utils/http.ts';
import { beautifulNumber } from '../../utils/beautifulNumber.js';
import { clanStore } from '../../store/clanStore';
import DZUser from '../utils/DZUser.vue';
import Flag from '../utils/Flag.vue';

export default defineComponent({
	name: 'ClanHeader',
	data() {
		return {
			API_BASE,
			maxMembers: CLAN_MAX_MEMBERS_AMOUNT,
			clanStore: clanStore(),
			bannerDataUrl: null as string | null
		};
	},
	components: { Flag, DZUser },
	methods: {
		moneyLint(quantity: number): string {
			return beautifulNumber(quantity);
		},
		DateToString(date: Date): string {
			return new Date(date).toLocaleString('fr-FR', { timeZone: 'GMT' });
		},
		loadBanner(): void {
			const bannerImg = new Image();
			bannerImg.crossOrigin = 'anonymous'; // To prevent tainted canvas issues
			bannerImg.src = `${API_BASE}/clan/${this.clanStore.getClanId}/banner`;

			bannerImg.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = bannerImg.width;
				canvas.height = bannerImg.height;
				const ctx = canvas.getContext('2d');
				ctx?.drawImage(bannerImg, 0, 0);
				this.bannerDataUrl = canvas.toDataURL();
				canvas.remove();
			};

			bannerImg.onerror = () => {
				this.bannerDataUrl = null;
			};
		}
	},
	watch: {
		'clanStore.getClanId': {
			handler(newVal: number | null) {
				if (newVal) {
					this.loadBanner();
				}
			},
			immediate: true
		}
	}
});
</script>

<style lang="scss" scoped>
.header {
	height: auto;
	max-height: 600px;
	margin-bottom: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
	h3 {
		margin-top: 0;
	}
}
.banner {
	max-width: 95%;
	height: 100px;
	border: 1px solid #fff798;
	.banner-img {
		width: 100%;
		height: 100%;
	}
}
.top-info {
	display: flex;
	padding-bottom: 1px;
	font-size: 14px;
	width: 95%;
	column-gap: 15px;
	row-gap: 3px;
	align-items: center;
	flex-wrap: wrap;
	justify-content: center;
	.top-info-element {
		background-color: #bc683c;
		color: white;
		padding: 0 2px;
		gap: 4px;
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		white-space: nowrap;
		flex-shrink: 0;
		img {
			max-width: 12px;
			max-height: 12px;
		}
	}
}
.bottom-info {
	width: 100%;
	display: flex;
	justify-content: space-around;
	color: #fff798;
	padding-top: 1px;
	padding-bottom: 15px;
	font-size: 14px;
	.creation-date {
		font-size: 12px;
	}
	.leader-name {
		display: flex;
		gap: 4px;
		align-items: center;
		span {
			color: #fff798;
			font-family: Arial, sans-serif;
			font-size: 10pt;
			font-style: normal;
			font-variant-caps: small-caps;
			font-weight: 400;
			text-shadow: 1px 1px 1px #383522;
			&:hover {
				color: #383522;
				text-shadow: 1px 1px 1px #fff798;
				cursor: pointer;
			}
		}
	}
}
</style>
