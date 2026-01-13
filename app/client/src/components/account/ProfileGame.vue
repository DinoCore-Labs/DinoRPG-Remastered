<template>
	<transition name="fade">
		<div class="profil" v-if="!option">
			<h3>
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
				{{ $t(`accountPage.profil`) }}
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
			</h3>
			<dl>
				<dt>
					{{ $t(`accountPage.player`) }}
				</dt>
				<dd>
					<DZUser :user="{ id: profile.id, name: profile.name }" :me="profile.id === uStore.id" :friend="false" />
				</dd>
				<dt>
					{{ $t(`accountPage.dinoz`) }}
				</dt>
				<dd>
					{{ userDinozCount !== null ? userDinozCount : '-' }}
				</dd>
				<dt>
					{{ $t(`accountPage.ranking`) }}
				</dt>
				<dd>
					<RouterLink
						v-if="userPosition !== null"
						:to="{
							name: 'RankingPlayers',
							params: { pageLoaded: Math.floor(userPosition / 20) + 1 }
						}"
						>{{ userPosition }}</RouterLink
					>
					<span v-if="userPoints !== null"> ({{ userPoints }} points)</span>
				</dd>
				<dt>
					{{ $t(`accountPage.inscription`) }}
				</dt>
				<dd>
					{{ formatDate(profile.createdAt) }}
				</dd>
				<!--
				<dt v-if="accountData.clan">
					{{ $t(`accountPage.clan`) }}
				</dt>
				<dd v-if="accountData.clan">
					<a @click="goToClan(accountData.clan.id)">{{ accountData.clan.name }}</a>
				</dd>-->
				<dt>
					{{ $t(`accountPage.completion`) }}
				</dt>
				<dd>
					<!--{{ accountData.completion.toFixed(2) }}-->
					%
				</dd>
			</dl>
			<div class="profilContent" v-if="!isEditOn">
				<!--<div v-html="customText" class="contentTexte" />-->
			</div>
			<!--<textarea v-if="isEditOn" v-model="customTextEdit" class="editTexte" />-->
			<div class="buttonLand" v-if="isMyAccount()">
				<DZButton @click="option = true">{{ $t(`accountPage.editAccount`) }}</DZButton>
				<!--<a v-if="hasPlume() && isEditOn" @click="setCustomText(customTextEdit)" class="tinybutton">OK</a>
				<a v-if="hasPlume() && !isEditOn" @click="isEditOn = true" class="tinybutton">{{ $t(`myAccount.edit`) }}</a>
				<DZButton href="" v-if="hasPMI()">{{ $t(`myAccount.quest`) }}</DZButton>-->
			</div>
		</div>
		<div class="profil" v-else>
			<h3>
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
				{{ $t(`accountPage.options.title`) }}
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
			</h3>
			<dl>
				<dt>
					{{ $t(`accountPage.options.todo`) }}
				</dt>
				<dd></dd>
				<dt>
					{{ $t(`accountPage.options.todo`) }}
				</dt>
				<dd></dd>
				<dt>
					{{ $t(`accountPage.options.todo`) }}
				</dt>
				<dd></dd>
				<dt>
					{{ $t(`accountPage.options.todo`) }}
				</dt>
				<dd></dd>
				<dt>
					{{ $t(`accountPage.options.todo`) }}
				</dt>
				<dd></dd>
			</dl>
			<div class="buttonLand" v-if="isMyAccount()">
				<!--<DZButton href="" @click="resetAccount()">{{ $t(`myAccount.options.reset`) }}</DZButton>-->
				<DZButton class="bSmall" back @click="option = false">{{ $t(`accountPage.options.retour`) }}</DZButton>
			</div>
		</div>
	</transition>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { userStore } from '../../store/userStore.js';
//import eventBus from '../../events/index.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { RankingService } from '../../services/ranking.service.js';
//import { dinozStore, localStore, playerStore } from '../../store/index.js';
//import { goTo } from '../../utils/goTo.js';
//import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import DZButton from '../utils/DZButton.vue';
//import { formatText } from '../../utils/formatText.js';
import { formatDate } from '../../utils/formatDate.js';
import DZUser from '../utils/DZUser.vue';
import { type UserProfile } from '@dinorpg/core/models/user/UserProfile.js';

export default defineComponent({
	name: 'Profile',
	data() {
		return {
			uStore: userStore(),
			isEditOn: false as boolean,
			//customText: this.accountData?.customText as string | null,
			//customTextEdit: this.accountData?.customText ?? '',
			userPosition: null as number | null,
			userPoints: null as number | null,
			userDinozCount: null as number | null,
			option: false as boolean
			//localStore: localStore(),
			//dinozStore: dinozStore()
		};
	},
	components: {
		DZUser,
		DZButton
	},
	props: {
		profile: {
			type: Object as PropType<UserProfile> | null,
			required: true
		},
		isOwner: {
			type: Boolean,
			required: true
		}
	},
	methods: {
		formatDate,
		isMyAccount(): boolean {
			return this.uStore.id === this.profile.id;
		},
		async fetchUserPosition() {
			if (!this.profile?.id) {
				this.userPosition = null;
				this.userPoints = null;
				return;
			}
			try {
				const res = await RankingService.getPositionRanking(this.profile.id);
				console.log('API ranking response =', res);
				this.userPosition = res.data.position ?? null;
				this.userPoints = res.data.points ?? null;
				this.userDinozCount = res.data.dinozCount ?? null;
			} catch (err) {
				this.userPosition = null;
				this.userPoints = null;
				this.userDinozCount = null;
				errorHandler.handle(err, this.$toast);
			}
		} /*,
		hasPlume(): boolean {
			return this.accountData.epicRewards.includes(Reward.PLUME);
		},
		hasPMI(): boolean {
			return this.accountData.epicRewards.includes(Reward.PMI);
		}*/
		/*
		async resetAccount() {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: 'Attention',
				icon: 'pi pi-trash'
			});
			EventBus.emit('isLoading', true);
			if (res) {
				try {
					const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
					await PlayerService.resetAccount();
					deleteCookie(`x-drpg-${channel}-token`);
					this.dinozStore.$reset();
					this.playerStore.$reset();
					this.$router.go(0);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
			EventBus.emit('isLoading', true);
		},
		async setCustomText(message: string): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				await PlayerService.setCustomText(message);
				EventBus.emit('isLoading', false);
				this.customText = message;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
			this.isEditOn = false;
		},
		goToRankingPage(e: Event) {
			e.preventDefault();
			goTo(this.$router, 'Ranking');
		},
		goToClan(id: number) {
			this.$router.push({ name: 'Clan', params: { id } });
		},
	}*/
	},
	watch: {
		'profile.id': {
			immediate: true,
			handler() {
				this.fetchUserPosition();
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.profil {
	background:
		url('../../assets/background/info_header.webp') no-repeat,
		url('../../assets/background/info_footer.webp') no-repeat,
		url('../../assets/background/info_center.webp') repeat-y;
	background-position-y: top, bottom;
	width: 305px;
	margin-bottom: 10px;
	text-shadow: 1px 1px 1px #383522;
	h3 {
		display: flex;
		justify-content: space-evenly;
		padding-top: 3px;
		font-family: Arial, sans-serif;
		font-size: 10pt;
		font-style: normal;
		font-variant-caps: small-caps;
		font-weight: 400;
		text-align: center;
		color: #ffee92; //!important;
		text-shadow: 1px 1px 1px #383522;
		margin-top: 2px;
		img {
			height: 7px;
			width: 7px;
			padding-top: 5px;
		}
	}
	dl {
		width: 245px;
		margin-left: 28px;
		margin-top: 10px;
		dt {
			float: left;
			position: relative;
			width: 135px;
			height: 19px;
			font-weight: bold;
			font-size: 9pt;
			font-variant: small-caps;
			color: #ffee92;
		}
		dd {
			min-height: 19px;
			height: auto;
			font-size: 10pt;
			text-align: right;
			color: #fce3bb;
			a {
				color: white;
				font-weight: normal;
				text-decoration: underline;
				cursor: pointer;
			}
		}
	}
}
.editTexte {
	width: 245px;
	height: 167px;
	overflow: auto;
	margin: 27px;
	margin-top: auto;
	margin-bottom: 10px;
	margin-top: 5px;
	position: relative;
	font-size: 8pt;
	background-color: #9a4029;
	border: 1px solid #fbdfba;
	color: #fce3bb;
	line-height: 20px;
	padding-left: 5px;
}
.profilContent {
	// top: 105px;
	width: 245px;
	height: 167px;
	overflow: auto;
	margin: auto;
	margin-top: auto;
	margin-bottom: 10px;
	margin-top: 5px;
	position: relative;
	font-size: 8pt;
	background-color: #9a4029;
	border: 1px solid #fbdfba;
}
.contentTexte {
	color: #fce3bb;
	line-height: 20px;
	padding-left: 5px;
}
.buttonLand {
	align-items: flex-start;
	flex-grow: row;
	justify-content: space-around;
	flex-wrap: wrap;
	display: flex;
	left: 25px;
	width: 250px;
	height: auto;
	margin: auto;
	margin-bottom: auto;
	align-items: center;
	margin-bottom: 5px;
	* {
		margin-bottom: 5px;
	}
}
.smallbutton {
	background-image: url('../../assets/design/button_small.webp');
	font-size: 9pt;
	line-height: 7pt;
	width: 80px;
	padding-top: 5px;
	padding-right: 5px;
	color: white;
	font-weight: normal;
	font-variant: small-caps;
	height: 24px;
	margin-top: 3px;
	margin-bottom: 2px;
	padding-left: 10px;
	cursor: pointer;
	&:hover {
		background-image: url('../../assets/design/button_small_hover.webp');
	}
}
.tinybutton {
	padding-left: 5px;
	padding-right: 5px;
	padding-top: 2px;
	padding-bottom: 2px;
	color: #ffee92 !important;
	font-size: 9pt;
	font-variant: small-caps;
	border: 1px solid #ffee92;
	outline: 1px solid #bc683c;
	background-color: #d65536;
	cursor: pointer;
	display: inline;
	top: 7px;
	width: 60px;
	text-align: center;
	text-transform: uppercase;
	font-size: 7.5pt;
	font-variant: normal;
	&:hover {
		color: white !important;
		background-color: #b0dd00 !important;
	}
}

.fade-enter-active {
	transition: all 1s 0.2s;
}

.fade-enter-from,
.fade-leave-to {
	transform: rotateY(-180deg);
	opacity: 0;
}
</style>
