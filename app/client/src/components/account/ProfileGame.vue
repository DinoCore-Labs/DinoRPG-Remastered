<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/data/Profile.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2026-01-20 through 2026-06-13.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
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
					{{ $t(`ranking.title`) }}
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
				<dt v-if="profile.clan">
					{{ $t(`accountPage.clan`) }}
				</dt>
				<dd v-if="profile.clan">
					<a @click="goToClan(profile.clan.id)">{{ profile.clan.name }}</a>
				</dd>
				<dt>
					{{ $t(`ranking.tabs.completion`) }}
				</dt>
				<dd>
					{{ profile.completion.toFixed(2) }}
					%
				</dd>
			</dl>
			<div class="profilContent" v-if="!isEditOn">
				<div class="contentTexte">{{ customText }}</div>
			</div>
			<textarea
				v-if="canEditProfileDescription && isEditOn"
				v-model="customTextEdit"
				class="editTexte"
				maxlength="1000"
			/>
			<div class="buttonLand" v-if="isMyAccount()">
				<DZButton @click="option = true">{{ $t(`accountPage.editAccount`) }}</DZButton>
				<DZButton v-if="canEditProfileDescription && isEditOn" @click="setCustomText(customTextEdit)" class="bSmall"
					>OK</DZButton
				>
				<DZButton v-if="canEditProfileDescription && !isEditOn" @click="startProfileTextEdit" class="bSmall">
					{{ $t(`accountPage.edit`) }}
				</DZButton>
				<!-- <DZButton href="" v-if="hasPMI()">{{ $t(`myAccount.quest`) }}</DZButton> -->
			</div>
		</div>
		<div class="profil" v-else>
			<h3>
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
				{{ $t(`accountPage.options.title`) }}
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
			</h3>
			<div class="buttonLand" v-if="isMyAccount()">
				<DZButton class="no-first-letter btn-wide" @click="openPasswordModal">{{
					$t(`accountPage.options.mdp`)
				}}</DZButton>
				<DZButton class="no-first-letter btn-wide" @click="openResetModal">{{
					$t(`accountPage.options.reset`)
				}}</DZButton>
				<DZButton class="no-first-letter btn-wide" @click="openDeleteModal">{{
					$t(`accountPage.options.delete`)
				}}</DZButton>
				<DZButton class="bSmall no-first-letter" back @click="option = false">{{ $t(`common.back`) }}</DZButton>
			</div>
		</div>
	</transition>
	<ChangePasswordModal
		v-if="passwordModalOpen"
		:loading="passwordLoading"
		:error="passwordError"
		:with-old-password="true"
		@close="closePasswordModal"
		@submit="submitPasswordChange"
	/>
	<ConfirmActionModal
		v-if="confirmActionModalOpen"
		:title="confirmActionConfig.title"
		:description="confirmActionConfig.description"
		:actionType="confirmActionConfig.actionType"
		:loading="confirmActionLoading"
		:error="confirmActionError"
		@close="closeConfirmActionModal"
		@submit="submitConfirmAction"
	/>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, type PropType } from 'vue';
import { userStore } from '../../store/userStore.js';
//import eventBus from '../../events/index.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { RankingService } from '../../services/ranking.service.js';
//import { goTo } from '../../utils/goTo.js';
//import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import DZButton from '../utils/DZButton.vue';
//import { formatText } from '../../utils/formatText.js';
import { formatDate } from '../../utils/formatDate.js';
import { type UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import ChangePasswordModal from '../modal/ChangePasswordModal.vue';
import { UserService } from '../../services/user.service.js';

export default defineComponent({
	name: 'Profile',
	data() {
		return {
			uStore: userStore(),
			isEditOn: false as boolean,
			customText: this.profile?.customText as string | null,
			customTextEdit: this.profile?.customText ?? '',
			userPosition: null as number | null,
			userPoints: null as number | null,
			userDinozCount: null as number | null,
			option: false as boolean,
			//localStore: localStore(),
			//dinozStore: dinozStore()
			passwordModalOpen: false,
			passwordLoading: false,
			passwordError: null as string | null,
			confirmActionModalOpen: false,
			confirmActionLoading: false,
			confirmActionError: null as string | null,
			confirmActionConfig: {
				title: '',
				description: '',
				actionType: 'delete' as 'delete' | 'reset'
			}
		};
	},
	components: {
		DZUser: defineAsyncComponent(() => import('../utils/DZUser.vue')),
		DZButton,
		ChangePasswordModal,
		ConfirmActionModal: defineAsyncComponent(() => import('../modal/ConfirmActionModal.vue'))
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
				//console.log('API ranking response =', res);
				this.userPosition = res.position ?? null;
				this.userPoints = res.points ?? null;
				this.userDinozCount = res.dinozCount ?? null;
			} catch (err) {
				this.userPosition = null;
				this.userPoints = null;
				this.userDinozCount = null;
				errorHandler.handle(err, this.$toast);
			}
		},
		openPasswordModal() {
			this.passwordError = null;
			this.passwordModalOpen = true;
		},
		closePasswordModal() {
			if (this.passwordLoading) {
				return;
			}
			this.passwordError = null;
			this.passwordModalOpen = false;
		},
		async submitPasswordChange(payload: { oldPassword?: string; newPassword: string; confirmPassword: string }) {
			this.passwordError = null;
			this.passwordLoading = true;
			try {
				await UserService.changePassword(payload.oldPassword ?? '', payload.newPassword, payload.confirmPassword);
				this.passwordModalOpen = false;
				this.$toast?.success?.('Mot de passe modifié avec succès.');
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			} finally {
				this.passwordLoading = false;
			}
		},
		openResetModal() {
			this.confirmActionConfig = {
				title: this.$t('accountPage.options.reset'),
				description: this.$t('accountPage.options.resetDescription'),
				actionType: 'reset'
			};
			this.confirmActionError = null;
			this.confirmActionModalOpen = true;
		},
		openDeleteModal() {
			this.confirmActionConfig = {
				title: this.$t('accountPage.options.delete'),
				description: this.$t('accountPage.options.deleteDescription'),
				actionType: 'delete'
			};
			this.confirmActionError = null;
			this.confirmActionModalOpen = true;
		},
		closeConfirmActionModal() {
			if (this.confirmActionLoading) return;
			this.confirmActionError = null;
			this.confirmActionModalOpen = false;
		},
		async submitConfirmAction(payload: { password: string }) {
			this.confirmActionError = null;
			this.confirmActionLoading = true;
			try {
				if (this.confirmActionConfig.actionType === 'delete') {
					await UserService.deleteAccount(payload.password);
				} else {
					await UserService.resetAccount(payload.password);
				}
				this.confirmActionModalOpen = false;

				// Clear the user store to trigger a logout state
				this.uStore.clearUser();
				// Redirect to home
				window.location.href = '/';
			} catch (err: any) {
				const errMsg = err?.response?.data?.message || err?.message;
				if (errMsg === 'userInClan') {
					this.confirmActionError =
						"Vous ne pouvez pas faire ça car vous êtes dans un clan. Veuillez d'abord le quitter.";
				} else if (errMsg === 'invalidConfirmation') {
					this.confirmActionError = 'Mot de passe incorrect.';
				} else {
					errorHandler.handle(err, this.$toast);
					this.confirmActionError = 'Une erreur est survenue.';
				}
			} finally {
				this.confirmActionLoading = false;
			}
		},
		startProfileTextEdit() {
			this.customTextEdit = this.customText ?? '';
			this.isEditOn = true;
		},
		async setCustomText(message: string): Promise<void> {
			try {
				const customText = message.trim() || null;
				await UserService.updateProfile({
					customText
				});
				this.customText = customText ?? '';
				this.customTextEdit = customText ?? '';
				this.isEditOn = false;
				this.$toast.open({
					message: this.$t('accountPage.descriptionUpdated'),
					type: 'success'
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		/*,
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
		},*/
		goToClan(id: number) {
			this.$router.push({ name: 'Clan', params: { id } });
		}
	},
	computed: {
		canEditProfileDescription(): boolean {
			return this.isMyAccount() && this.uStore.canEditProfileDescription;
		}
	},
	watch: {
		'profile.id': {
			immediate: true,
			handler() {
				this.fetchUserPosition();
			}
		},
		'profile.customText': {
			immediate: true,
			handler(customText: string | null) {
				this.customText = customText ?? '';
				this.customTextEdit = customText ?? '';
				this.isEditOn = false;
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
	> * {
		margin-bottom: 5px;
	}
}
.btn-wide {
	width: auto !important;
	min-width: 145px;
	padding: 0 15px;
	background-size: 100% 100% !important;
}
.no-first-letter {
	&::first-letter {
		color: inherit !important;
	}
	:deep(span::first-letter) {
		color: inherit !important;
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
