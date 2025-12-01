<template>
	<div class="homepage">
		<div class="homepage-container">
			<img class="homepage-banner" :src="getImgURL('background', 'background_alpha')" alt="DinoRPG" />
			<div class="homepage-content">
				<div class="homepage-menu">
					<DZButton href="" @click="openAuthMenu">{{ $t('homepage.connexion') }}</DZButton>
					<DZButton href="#last-news" :disabled="true">{{ $t('homepage.news') }}</DZButton>
				</div>
				<Suspense>
					<FightAnimation :key="$i18n.locale" :fight="getFight()" />
					<template #fallback> <Loading /> </template>
				</Suspense>
				<!--<div id="last-news" class="homepage-lastNews">
				</div>-->
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { getImgURL } from '../utils/getImgURL';
import eventBus from '../events';
import DZButton from '../components/utils/DZButton.vue';
import {
	DinoAction,
	EmoteBehaviour,
	EmoteList,
	EntranceEffect,
	FinishState,
	type preFightLoader
} from '@dinorpg/core/models/fight/transpiler';

export default defineComponent({
	name: 'HomePage',
	components: {
		DZButton,
		FightAnimation: defineAsyncComponent(() => import('../components/fight/FightAnimation.vue'))
	},
	methods: {
		getImgURL,
		openAuthMenu(e: any) {
			e.preventDefault();
			eventBus.emit('authMenu', {
				show: true,
				mode: 'login'
			});
		},
		getFight(): preFightLoader {
			return {
				bg: 's_dnv',
				top: 70,
				bottom: 0,
				ground: 0,
				history: [
					{
						action: DinoAction.ADD,
						fighter: {
							props: [],
							dino: true,
							life: 280,
							maxLife: 280,
							name: 'Matthieu83600',
							side: true,
							scale: 2.8,
							fid: 0,
							gfx: 'D9GXZgEZbBrLU000',
							entrance: EntranceEffect.GROW
						}
					},
					{
						action: DinoAction.ADD,
						fighter: {
							props: [],
							dino: true,
							life: 230,
							maxLife: 230,
							name: 'CcobraxX',
							side: true,
							scale: 1.8,
							fid: 1,
							gfx: '80tKclAvjjR7i010',
							entrance: EntranceEffect.JUMP
						}
					},
					{
						action: DinoAction.ADD,
						fighter: {
							props: [],
							dino: true,
							life: 170,
							name: 'Riri',
							maxLife: 170,
							side: true,
							scale: 1.7,
							fid: 2,
							gfx: 'D9MSk6bDjUgBN000',
							entrance: EntranceEffect.GROUND
						}
					},
					{
						action: DinoAction.ADD,
						fighter: {
							props: [],
							dino: true,
							life: 250,
							maxLife: 250,
							name: 'Degimboss',
							side: true,
							scale: 2.5,
							fid: 3,
							gfx: 'B9YUA2uXLiMtI000',
							entrance: EntranceEffect.GROUND
						}
					},
					{
						action: DinoAction.ADD,
						fighter: {
							props: [],
							dino: true,
							life: 280,
							maxLife: 280,
							name: 'Sonilax',
							side: true,
							scale: 2.8,
							fid: 4,
							gfx: '99Ypn3EsHV8k3000',
							entrance: EntranceEffect.GROUND
						}
					},
					{
						action: DinoAction.WAIT,
						time: 1000
					},
					{
						action: DinoAction.TEXT,
						message: this.$t('homepage.fight.message1')
					},
					{
						action: DinoAction.TEXT,
						message: this.$t('homepage.fight.message2')
					},
					{
						action: DinoAction.TEXT,
						message: this.$t('homepage.fight.message3')
					},
					{
						action: DinoAction.SHAKE,
						force: 20,
						frict: 0.9
					},
					{
						action: DinoAction.WAIT,
						time: 500
					},
					{
						action: DinoAction.EMOTE,
						fids: [0, 1, 2],
						emote: EmoteList.Question,
						behaviour: EmoteBehaviour.Float
					},
					{
						action: DinoAction.WAIT,
						time: 1000
					},
					{
						action: DinoAction.ADD,
						fighter: {
							props: [],
							dino: false,
							life: 100,
							maxLife: 100,
							name: 'Mandragore',
							side: false,
							scale: 1,
							fid: -1,
							gfx: 'mandragore',
							entrance: 1,
							x: 325,
							y: 260
						}
					},
					{
						action: DinoAction.TALK,
						fid: -1,
						message: this.$t('homepage.fight.message4')
					},
					{
						action: DinoAction.TALK,
						fid: -1,
						message: this.$t('homepage.fight.message5')
					},
					{
						action: DinoAction.WAIT,
						time: 300
					},
					{
						action: DinoAction.FINISH,
						left: FinishState.RUN,
						right: FinishState.ESCAPE
					}
				]
			};
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
	padding-bottom: 400px;
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
		top: 68%;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 30px;
	}
	&-menu {
		display: flex;
		gap: 12px;
	}
	&-lastNews {
		background-color: #000;
		margin-bottom: 10px;
		padding: auto;
		color: #fff;
		max-width: 490px;
	}
}
</style>
