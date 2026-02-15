<template>
	<TitleHeader :title="$t('pageTitle.fight')" :header="$t(`fight.pageName`)" />
	<div v-show="loaded" class="content">
		<Suspense>
			<FightAnimation :fight="fightTransformed" @animationEnded="onFightEnd" />
			<template #fallback>
				<Loading />
			</template>
		</Suspense>
		<FightBounce v-if="fight" :fight="fight" :dinozId="dinozId" />
	</div>
</template>

<script lang="ts">
import type { FighterRecap, FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import type { preFightLoader } from '@dinorpg/core/models/fight/transpiler.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { resolveFightingPlace, transpileFight } from '../fight/transpileFight.js';
import { defineAsyncComponent, defineComponent, type PropType, toRaw } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { formatText } from '../utils/formatText.js';
import FightBounce from '../components/fight/FightBounce.vue';
import { dinozStore } from '../store/dinozStore.js';
import { localStore } from '../store/localStore.js';
import { sessionStore } from '../store/sessionStore.js';
import { userStore } from '../store/userStore.js';

export default defineComponent({
	name: 'FightPage',
	computed: {
		itemList() {
			return itemList;
		}
	},
	components: {
		FightBounce,
		TitleHeader,
		FightAnimation: defineAsyncComponent(() => import('../components/fight/FightAnimation.vue'))
	},
	data() {
		return {
			uStore: userStore(),
			dinozStore: dinozStore(),
			sessionStore: sessionStore(),
			fight: null as FightResult | null,
			dinozId: Number(this.$route.params.dinozId as string),
			lang: localStore().getLanguage ?? 'fr',
			fightEnded: false,
			fightTransformed: {} satisfies preFightLoader as preFightLoader,
			loaded: false,
			moneyGiven: false
		};
	},
	props: {
		display: { type: Object as PropType<FightResult>, required: false }
	},
	methods: {
		onFightEnd() {
			this.fightEnded = true;
		}
	},
	created(): void {
		const fightResult = this.sessionStore.getFightResult;
		if (fightResult === undefined) {
			this.$toast.open({
				message: this.$t('toast.noFight'),
				type: 'error'
			});
			this.$router.push({
				name: 'DinozPage',
				params: { id: this.dinozId }
			});
			return;
		}
		if (fightResult) {
			this.fight = fightResult;
		}

		const fightSteps = fightResult.history as FightStep[];
		const fighters = fightResult.fighters as FighterRecap[];
		if (!fightSteps || !fighters) return;

		const nexFight = transpileFight(
			structuredClone(toRaw(fighters)),
			fightSteps,
			this.$t,
			fightResult.result,
			fightResult.startText,
			fightResult.endText
		);
		if (!nexFight) {
			return;
		}
		if (this.fight) {
			const initPlace = resolveFightingPlace(this.fight.place);
			this.fightTransformed = {
				...initPlace,
				history: nexFight.filter(n => n != undefined),
				lang: this.lang,
				statusReward: this.fight.statusReward
			};
		}

		this.loaded = true;
		/*if (this.uStore.getPlayerOptions.skipFight) {
			this.onFightEnd();
		}*/
	},
	unmounted(): void {
		this.$refreshGold();

		// Comment this to replay fight with refresh
		this.loaded = false;
		const dinozList = this.dinozStore.getDinozList;

		if (!dinozList) {
			this.$toast.open({
				message: formatText(this.$t(`toast.missingData`)),
				type: 'error'
			});
			return;
		}
		this.dinozStore.setDinozList(
			dinozList.map(dinoz => {
				if (dinoz.id === this.dinozId || dinoz.leaderId === this.dinozId) {
					// Update dinoz HP
					dinoz.life -= this.fight?.hpLost.find(hpLost => hpLost.id === dinoz.id)?.hpLost || 0;
				}
				return dinoz;
			})
		);
		this.sessionStore.setFightResult(undefined);
	}
});
</script>

<style lang="scss" scoped>
.content {
	display: flex;
	flex-flow: column;
	align-items: center;
}
</style>
