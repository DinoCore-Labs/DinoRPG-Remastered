<template>
	<div class="homepage">
		<div class="homepage-container">
			<img class="homepage-banner" :src="getImgURL('background', 'background_alpha')" alt="DinoRPG" />
			<div class="homepage-content">
				<div class="homepage-menu">
					<Button href="" @click="openAuthMenu">Connexion</Button>
					<Button href="#last-news" :disabled="true">News</Button>
				</div>
				<!--
				<Suspense>
					<FullFightAnimation :key="$i18n.locale" :fight="getFight()" @animationEnded="autoLog = true" />
					<template #fallback> <Loading /> </template>
				</Suspense>
				<div id="last-news" class="homepage-last-news">
					<div>
						<h2>Dernière News :</h2>
						<p>
							Blabla<br />
							Blabla
						</p>
					</div>
				</div>
				-->
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getImgURL } from '../utils/getImgURL';
import eventBus from '../events';
import Button from '../components/utils/Button.vue';

export default defineComponent({
	name: 'HomePage',
	components: { Button },
	methods: {
		getImgURL,
		openAuthMenu(e: any) {
			e.preventDefault();
			eventBus.emit('authMenu', {
				show: true,
				mode: 'login'
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.homepage {
	position: relative;
	min-width: 100%;
	min-height: 100vh;
	background: #fff;
	&-container {
		position: relative;
		width: 100%;
		max-width: 1920px;
		margin: 0 auto;
	}
	&-banner {
		width: 100%;
		height: auto;
		display: block;
	}
	&-content {
		position: absolute;
		top: 62%;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
	&-menu {
		display: flex;
		gap: 12px;
	}
}
</style>
