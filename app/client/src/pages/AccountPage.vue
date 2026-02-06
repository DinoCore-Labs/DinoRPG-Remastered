<template>
	<TitleHeader :title="`${$t('pageTitle.account')}`" :header="accountTitle"></TitleHeader>
	<div class="wrapper" v-if="dataLoaded && profile">
		<div class="profile">
			<ProfileCard :profile="profile" :isOwner="isOwner" @updated="onProfileUpdated" />
		</div>
		<div class="cards">
			<GoalsCard :profileStats="profile.stats" :isOwner="isOwner" />
			<div class="profilCard">
				<ProfileGame :profile="profile" :isOwner="isOwner" />
				<EpicRewardsCard :epicRewards="profile.rewards" :isOwner="isOwner" />
			</div>
		</div>
		<div>
			<ul class="onglets">
				<li :class="tabSelected === 1 ? 'active' : ''">
					<a @click="sStore.setTabAccount(1)">{{ $t('accountPage.tabs.dinoz') }}</a>
				</li>
				<li :class="tabSelected === 2 ? 'active' : ''">
					<a @click="sStore.setTabAccount(2)">{{ $t('accountPage.tabs.friends') }}</a>
				</li>
			</ul>
			<MyDinoz v-if="tabSelected === 1" :profile="profile" :isOwner="isOwner" />
			<!--<MyFriends v-if="tabSelected === 2" :profile="profile" :isOwner="isOwner" />-->
		</div>
		<div class="mandragore">
			<img :src="getImgURL('design', 'mandragore')" alt="Mandragore" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import ProfileCard from '../components/account/ProfileCard.vue';
import GoalsCard from '../components/account/GoalsCard.vue';
import EpicRewardsCard from '../components/account/EpicRewardsCard.vue';
import ProfileGame from '../components/account/ProfileGame.vue';
import MyDinoz from '../components/account/MyDinoz.vue';
import { UserService } from '../services';
import { userStore } from '../store/userStore';
import { sessionStore } from '../store/sessionStore';
import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import { getImgURL } from '../utils/getImgURL';

export default defineComponent({
	name: 'AccountPage',
	setup() {
		const uStore = userStore();
		const sStore = sessionStore();
		return { sStore, uStore };
	},
	data() {
		return {
			profile: null as UserProfile | null,
			isOwner: false,
			dataLoaded: false as boolean
		};
	},
	components: {
		TitleHeader,
		ProfileCard,
		GoalsCard,
		ProfileGame,
		EpicRewardsCard,
		MyDinoz
	},
	computed: {
		accountTitle(): string {
			if (!this.profile) return '';
			return this.isOwner
				? this.$t('accountPage.title').toString()
				: this.$t('accountPage.userTitle', { name: this.profile.name }).toString();
		},
		tabSelected(): number {
			return this.sStore.getTabAccount;
		}
	},
	methods: {
		getImgURL,
		async loadProfile() {
			this.dataLoaded = false;
			const routeId = this.$route.params.id as string | undefined;
			let profile: UserProfile;
			if (routeId) {
				profile = await UserService.getPublicProfile(routeId as string);
			} else {
				profile = await UserService.getMyProfile();
			}
			this.profile = profile;
			//console.log(profile);
			this.isOwner = this.profile.id === this.uStore.id;
			//console.log(this.profile.id);
			//console.log(this.uStore.id);
			//console.log(this.isOwner);
			this.dataLoaded = true;
		},
		async onProfileUpdated() {
			await this.loadProfile();
		}
	},
	watch: {
		'$route.params.id': {
			handler() {
				this.loadProfile();
			},
			immediate: true
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	display: flex;
	justify-content: space-between;
	gap: 10px;
	flex-direction: column;
	max-height: max-content;
	.profile {
		margin-bottom: 10px;
	}
	.cards {
		display: flex;
		width: 100%;
		max-height: 100%;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		.profilCard {
			display: flex;
			flex-direction: column;
		}
	}
	.mandragore {
		align-self: flex-end;
		margin-block-start: -420px;
		margin-inline-end: -140px;
		width: 30%;
	}
}
.onglets {
	list-style: none;
	height: 20px;
	align-self: center;
	background-color: transparent;
	background-image: url('../assets/design/tabs/tabsBg.webp');
	background-repeat: no-repeat;
	border-bottom: 1.2px solid #ffe7aa;
	li {
		float: left;
		position: relative;
		margin-right: 5px;
		cursor: pointer;
		:hover {
			color: white;
		}
		&.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0px #9a4029;
			a {
				background-color: #d69e68;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
		a {
			color: #fce3bc;
			text-decoration: none;
			padding-left: 5px;
			padding-right: 5px;
			background-color: #bc683c;
			border-right: 1px solid black;
			border-left: 1px solid #d39a65;
			border-top: 1px solid #d39a65;
			font-size: 10pt;
			border-radius: 0px;
		}
	}
}
@media (max-width: 790px) {
	.wrapper {
		.mandragore {
			display: none;
		}
	}
}
@media (max-width: 540px) {
	.wrapper {
		.filler {
			display: none;
		}
		.mandragore {
			display: none;
		}
	}
}
@media (max-width: 539px) {
	.onglets {
		width: 95%;
	}
}
</style>
