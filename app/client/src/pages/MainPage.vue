<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/pages/MainPage.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2025-11-21 through 2026-03-22.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="mainpage">
		<div class="mainpage-header">
			<a @click="goToNewsPage()" class="linkHome"></a>
			<LeftPanel v-if="showLeftPanel" />
			<div class="mainpage-center">
				<TutorialObjective />
				<RouterView />
			</div>
		</div>
		<div class="mainpage-footer"></div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LeftPanel from '../components/common/LeftPanel.vue';
import TutorialObjective from '../components/common/TutorialObjective.vue';
import { userStore } from '../store/userStore';

export default defineComponent({
	name: 'MainPage',
	components: { LeftPanel, TutorialObjective },
	computed: {
		showLeftPanel(): boolean {
			const user = userStore();
			const hide = this.$route.matched.some(r => r.meta.showLeftPanel === false);
			return user.isLogged ? true : !hide;
		}
	},
	methods: {
		async goToNewsPage() {
			this.$router.push({
				name: 'NewsPage'
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.mainpage {
	background-image: url('../assets/background/bg_ciel.webp');
	background-repeat: repeat-x;
	&-header {
		min-height: 100%;
		background:
			url('../assets/background/full_bg.webp') no-repeat,
			url('../assets/background/full_core_bg.webp') repeat-y;
		background-position-x: calc(50% + 247px);
		background-position-y: top;
		padding-bottom: 50px;
		.linkHome {
			grid-area: top;
			cursor: pointer;
			height: 6rem;
			width: 100%;
			max-width: 540px;
		}
	}
	&-center {
		grid-area: center;
		width: 100%;
		max-width: 640px;
		display: flex;
		flex-direction: column;
		z-index: 1;
		margin-top: -15px;
	}
	&-footer {
		background-image: url('../assets/background/full_footer.webp');
		background-color: white;
		background-repeat: no-repeat;
		background-position-x: calc(50% + 248px);
		min-height: 128px;
	}
}
@media (min-width: 875px) {
	.mainpage-header {
		display: grid;
		grid-template-areas: 'left top top' 'left center center';
		padding-top: 15px;
		grid-template-columns: 1fr 540px 1fr;
		grid-template-rows: 110px 1fr;
	}
}
@media (max-width: 875px) {
	.mainpage-header {
		display: flex;
		align-items: center;
		flex-direction: column;
	}
}
</style>
