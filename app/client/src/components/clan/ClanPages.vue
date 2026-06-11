<template>
	<div class="wrapper">
		<div class="pages-titles-container">
			<a
				class="page-title"
				:class="{ selected: pageIsSelected(page.id), private: !page.public }"
				v-for="page in pages"
				:key="page.id"
				@click="goToClanPage(page.id)"
			>
				<img v-if="page.home" :src="getImgURL('icons', 'small_home')" alt="info_button" class="home-icon" />
				{{ page.name }}
			</a>
		</div>
	</div>
	<div>
		<Router-view :key="String($route.params.pageId)"></Router-view>
	</div>
	<div class="bottom-buttons">
		<div v-if="hasPageManageRight">
			<a class="button" @click="createClanPage()">{{ $t('clan.clanPages.button.create') }}</a>
			<a v-if="$route.params.pageId != undefined" class="button" @click="enterEditMode()">{{
				$t('clan.clanPages.button.edit')
			}}</a>
			<a
				v-if="$route.params.pageId != undefined && homePageId != Number($route.params.pageId)"
				class="button"
				@click="deleteClanPage()"
				>{{ $t('clan.clanPages.button.delete') }}</a
			>
		</div>
		<div
			v-if="!alreadyHasClan && !joinRequest"
			v-tippy="{
				content: joinClanTip,
				theme: 'small'
			}"
		>
			<a class="button" @click="joinClan()">
				{{ $t('clan.clanPages.button.join_clan') }}
			</a>
		</div>
		<ClanJoinRequest :joinRequest="joinRequest" @cancel="cancelRequest" />
		<!-- <div
			class="report-container"
			@click="reportClan"
			v-if="clanStore.getClan && userStore.getClanId !== clanStore.getClanId"
		>
			<a class="button">{{ $t('report.clan') }}</a>
		</div> -->
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanService } from '../../services/clan.service.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { userStore } from '../../store/userStore.js';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { CLAN_JOIN_MONEY } from '@dinorpg/core/models/clan/constants.js';
import { formatNumber } from '../../utils/formatText';
import { formatText } from '../../utils/formatText.js';
import type { ClanPage } from '@dinorpg/core/models/clan/clanPage.js';
import type { JoinClanResponse } from '@dinorpg/core/models/clan/clanJoinRequest.js';
import axios from 'axios';
import ClanJoinRequest from '../../pages/Clan/ClanJoinRequest.vue';
import { clanStore } from '../../store/clanStore';
//import EventBus from '../../events/index.js';

export default defineComponent({
	name: 'ClanPages',
	components: {
		ClanJoinRequest
	},
	data() {
		return {
			pages: [] as ClanPage[],
			userStore: userStore(),
			alreadyHasClan: true as boolean,
			joinRequest: undefined as JoinClanResponse | undefined,
			hasPageManageRight: false as boolean,
			homePageId: undefined as number | undefined,
			clanStore: clanStore(),
			joinClanTip: formatText(this.$t('clan.clanPages.join_clan', { money: formatNumber(CLAN_JOIN_MONEY, '.') }))
		};
	},
	methods: {
		async joinClan() {
			try {
				this.joinRequest = await ClanService.joinClan(Number(this.$route.params.id));
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		// reportClan(): void {
		// 	const clan = this.clanStore.getClan;
		// 	if (clan) {
		// 		EventBus.emit('reportClan', { id: clan.id, name: clan.name });
		// 	}
		// },
		async getClanPages() {
			try {
				const tmpPages = await ClanService.getClanPages(Number(this.$route.params.id));
				this.pages = tmpPages
					.filter((p: ClanPage) => p.public)
					.concat(tmpPages.filter((p: ClanPage) => !p.public))
					.sort((a: ClanPage, b: ClanPage) => a.id - b.id);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async getPlayerJoinRequest() {
			try {
				const selfJoinRequest = await ClanService.getSelfJoinRequest();
				if (selfJoinRequest) {
					this.joinRequest = selfJoinRequest;
					return;
				}
			} catch (err) {
				if (axios.isAxiosError(err) && err.response?.status != 404) {
					errorHandler.handle(err, this.$toast);
				}
				return;
			}
		},
		async cancelRequest() {
			this.joinRequest = undefined;
		},
		async deleteClanPage() {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				try {
					await ClanService.deleteClanPage(Number(this.$route.params.pageId), Number(this.$route.params.id));

					await this.getClanPages();
					this.$router.push({ name: 'Clan', params: { id: Number(this.$route.params.id) } });
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		async getHasPageManageRight() {
			try {
				this.hasPageManageRight = await ClanService.getPlayerHasRight(
					Number(this.$route.params.id),
					ClanMemberRight.PAGE_MANAGE
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		goToClanPage(id: number) {
			this.$router.push({ name: 'ClanPage', params: { pageId: id } });
		},
		goToClan(id: number) {
			if (id != Number(this.$route.params.id)) {
				this.$router.push({ name: 'Clan', params: { id } });
			}
		},
		createClanPage() {
			this.$router.push({ name: 'ClanCreatePage' });
		},
		enterEditMode() {
			this.$router.push({
				name: 'ClanEditPage',
				params: { pageId: Number(this.$route.params.pageId) }
			});
		},
		pageIsSelected(pageId: number) {
			return pageId == Number(this.$route.params.pageId);
		}
	},
	async mounted() {
		await this.getPlayerJoinRequest();
		await this.getHasPageManageRight();
		await this.getClanPages();
		this.alreadyHasClan = this.userStore.getClanId != undefined;
		this.homePageId = this.pages.find(p => p.home)?.id;
		if (!this.$route.params.pageId) {
			if (this.homePageId) {
				this.goToClanPage(this.homePageId);
			}
		}
	},
	watch: {
		// Reload page if player goes on another clan page
		'$route.params.id': async function (to) {
			if (to !== undefined && this.$route.name === 'Clan') {
				await this.getClanPages();
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
}
.pages-titles-container {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	.page-title {
		background-color: #bc683c;
		cursor: pointer;
		color: #fff798;
		font-size: 14px;
		padding: 4px 8px;
		border-radius: 4px;
		&.private {
			background-color: #5e4335;
			color: white;
		}
		&:hover {
			filter: brightness(120%);
		}
	}
	.selected {
		background-color: #fff798;
		color: #bc683c;
		&.private {
			background-color: white;
			color: #5e4335;
		}
	}
}
.home-icon {
	height: 12px;
}
.bottom-buttons {
	padding: 8px;
}

.report-container {
	margin-top: 10px;
}

/*.disclaimer {
	border-radius: 16px;
	padding: 5px;
	padding-left: 5px;
	padding-left: 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-repeat: no-repeat;
	a {
		color: #fff192;
		cursor: pointer;
		text-decoration: underline;
	}
}*/
</style>
