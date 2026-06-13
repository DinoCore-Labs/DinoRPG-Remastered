<template>
	<TitleHeader
		v-if="clanStore.getClan"
		:title="$t('pageTitle.clan', { clan: clanStore.getClan.name })"
		:header="$t('clan.header.title', { name: clanStore.getClan.name })"
	></TitleHeader>
	<div class="wrapper">
		<div class="filler">
			<ClanHeader v-if="clanStore.getClan"></ClanHeader>
		</div>
	</div>

	<div class="dz-box pages topspace">
		<h3>
			<img :src="getImgURL('button', 'info_button')" alt="info_button" style="margin-right: 10px" />
			{{ $t('clan.tabs.pages') }}
			<img :src="getImgURL('button', 'info_button')" alt="info_button" style="margin-left: 10px" />
		</h3>
		<div class="tabs-list">
			<RouterLink
				class="tab"
				:to="{ name: 'ClanPages', params: { id: clanStore.getClanId } }"
				v-tippy="{
					content: formatContent($t('clan.tabs.pages')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('act', 'act_sun')" alt="Pages du clan" />
			</RouterLink>
			<RouterLink
				class="tab"
				:to="{ name: 'ClanMembers' }"
				v-tippy="{
					content: formatContent($t('clan.tabs.members')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('act', 'act_clan')" alt="Liste des membres" />
			</RouterLink>
			<RouterLink
				v-if="isClanMember"
				class="tab"
				:to="{ name: 'ClanTreasure' }"
				v-tippy="{
					content: formatContent($t('clan.tabs.treasure')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('act', 'act_treasure')" alt="Trésor de clan" />
			</RouterLink>
			<!-- <RouterLink
				class="tab"
				:to="{ name: 'ClanBuilds' }"
				v-tippy="{
					content: formatContent($t('clan.tabs.builds')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('icons', 'act_pac')" :alt="$t('clan.tabs.builds')" />
			</RouterLink> -->
			<RouterLink
				v-if="isClanMember"
				class="tab"
				:to="{ name: 'ClanHistory' }"
				v-tippy="{
					content: formatContent($t('clan.tabs.history')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('act', 'act_historique')" alt="Historique du clan" />
			</RouterLink>
			<RouterLink
				v-if="isClanMember && hasBannerEditRight"
				class="tab"
				:to="{ name: 'ClanParameters' }"
				v-tippy="{
					content: formatContent($t('clan.tabs.parameters')),
					theme: 'small'
				}"
			>
				<img :src="getImgURL('act', 'act_default')" alt="Paramètres du clan" />
			</RouterLink>
		</div>
		<div class="clan-page">
			<Router-view></Router-view>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TitleHeader from '../../components/utils/TitleHeader.vue';

import ClanHeader from '../../components/clan/ClanHeader.vue';

import { ClanService } from '../../services/clan.service.ts';
import { errorHandler } from '../../utils/errorHandler';

import { userStore } from '../../store/userStore';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { clanStore } from '../../store/clanStore';

export default defineComponent({
	name: 'Clan',
	components: {
		ClanHeader,
		TitleHeader
	},
	data() {
		return {
			userStore: userStore(),
			clanStore: clanStore(),
			isClanMember: false as boolean,
			hasBannerEditRight: false as boolean
		};
	},
	methods: {
		async getClan(): Promise<void> {
			try {
				await this.clanStore.loadClan(Number(this.$route.params.id));
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async getHasBannerEditRight() {
			try {
				this.hasBannerEditRight = await ClanService.getPlayerHasRight(
					Number(this.$route.params.id),
					ClanMemberRight.CLAN_EDIT_BANNER
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	},
	mounted(): void {
		this.isClanMember = this.userStore.clanId == Number(this.$route.params.id);
	},
	async created(): Promise<void> {
		await this.getClan();
		await this.getHasBannerEditRight();
	},
	watch: {
		// Reload page if player goes on another clan page
		'$route.params.id': async function (to) {
			if (to !== undefined && this.$route.name === 'Clan') {
				await this.getClan();
				this.isClanMember = this.userStore.clanId == Number(this.$route.params.id);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	display: flex;
	width: 95%;
	align-self: center;
	justify-content: space-between;
	gap: 10px;
	flex-wrap: wrap;
	padding-bottom: 5px;
}
.filler {
	width: 100%;
}
.tabs-list {
	margin-left: 10px;
	display: flex;
	font-size: 14px;
	.tab {
		padding: 0 2px;
	}
	img:hover {
		filter: brightness(1.2);
	}
	img {
		width: 32px;
		height: 32px;
	}
	.router-link-active {
		background-color: #c97d49;
		img {
			filter: brightness(1.2);
			margin-top: 4px;
		}
	}
}
.pages {
	width: 95%;
	align-self: center;
	height: auto;
	max-height: none;
	margin-bottom: 10px;
	h3 {
		margin-top: 0;
	}
	.clan-page {
		background-color: #fce3bb;
		margin: 3px;
	}
}
</style>
