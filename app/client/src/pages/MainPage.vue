<template>
	<div class="mainpage">
		<div class="mainpage-header">
			<a @click="goToMainPage()" class="linkHome"></a>
			<LeftPanel />
			<div class="mainpage-center">
				<RouterView />
			</div>
		</div>
		<div class="mainpage-footer"></div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LeftPanel from '../components/common/LeftPanel.vue';

export default defineComponent({
	name: 'MainPage',
	components: { LeftPanel },
	methods: {
		async goToMainPage() {
			this.$router.push({
				name: 'MainPage'
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
