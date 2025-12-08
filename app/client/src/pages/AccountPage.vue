<template>
	<TitleHeader :title="`${$t('pageTitle.account')}`" :header="accountTitle"></TitleHeader>
	<div class="wrapper" v-if="dataLoaded && profile">
		<div class="profile">
			<ProfileCard :profile="profile" :isOwner="isOwner" @updated="onProfileUpdated" />
		</div>
		<div class="cards">
			<GoalsCard />
			<div class="profilCard">
				<ProfileGame :profile="profile" :isOwner="isOwner" />
				<EpicRewardsCard :epicRewards="profile.rewards" :isOwner="isOwner" />
			</div>
		</div>
		<!-- Tabs : dinoz & friends -->
		<!--<MyDinoz :profile="profile" :isOwner="isOwner" />-->
		<!--<MyFriends :profile="profile" :isOwner="isOwner" />-->
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
import { UserService } from '../services';
import { userStore } from '../store/userStore';
import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import { getImgURL } from '../utils/getImgURL';

export default defineComponent({
	name: 'AccountPage',
	setup() {
		const uStore = userStore();
		return { uStore };
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
		EpicRewardsCard
	},
	computed: {
		accountTitle(): string {
			if (!this.profile) return '';
			return this.isOwner
				? this.$t('accountPage.title').toString()
				: this.$t('accountPage.userTitle', { name: this.profile.name }).toString();
		}
	},
	methods: {
		getImgURL,
		async loadProfile() {
			this.dataLoaded = false;
			const routeId = this.$route.params.id;
			let profile: UserProfile;
			if (routeId) {
				profile = await UserService.getPublicProfile(routeId as string);
			} else {
				profile = await UserService.getMyProfile();
			}
			this.profile = profile;
			//console.log(profile);
			this.isOwner = this.profile.userId === this.uStore.id;
			//console.log(this.profile.userId);
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
</style>
