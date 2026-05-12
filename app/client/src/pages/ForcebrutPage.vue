<template>
	<TitleHeader :title="$t('pageTitle.fb_tournament')" :header="$t('fb_tournament.title')" />
	<DZDisclaimer help round :content="$t('fb_tournament.disclaimer')" />
	<div v-if="dinoz && opponent && !fightTransformed" class="fb">
		<div class="dinoz">
			<div class="dinozCard">
				<DinozWithoutFlash :display="dinoz.display" flip :key="dinoz.display" :life="1" />
				<div class="dinozInfo">
					<p class="name">{{ dinoz.name }}</p>
					<p class="lvl">{{ $t('accountPage.level') }} {{ dinoz.level }}</p>
				</div>
			</div>
		</div>
		<div class="vs">
			<img :src="getImgURL('background', 'vs')" alt="" />
			<span class="stage">{{ $t('fb_tournament.stage', { stage: opponent.step }) }}</span>
		</div>
		<div class="opponent">
			<div class="opponentCard">
				<DinozWithoutFlash :display="opponent.display" :flip="false" :key="opponent.display" :life="1" />
				<div class="opponentInfo">
					<p class="name">{{ opponentFullName }}</p>
					<p class="lvl">{{ $t('accountPage.level') }} {{ opponent.level }}</p>
				</div>
			</div>
		</div>
	</div>
	<div class="fight" v-if="!fightTransformed && opponent">
		<button class="launch-fight" @click="launchFight">
			<img :src="getImgURL('act', 'act_attack')" alt="" />
			<span>{{ $t('fb_tournament.fight', { opponent: opponentFullName }) }}</span>
		</button>
	</div>
	<div class="wrapper" v-if="fightTransformed && fight">
		<Suspense>
			<FullFightAnimation :fight="fightTransformed" @animationEnded="fightEnded = true" />
			<template #fallback>
				<Loading />
			</template>
		</Suspense>
		<FightBounce v-if="fightEnded" :fight="fight" :dinozId="dinozId" />
	</div>
</template>

<script lang="ts">
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import type { FighterRecap } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import type { preFightLoader } from '@dinorpg/core/models/fight/transpiler.js';
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';

import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
import FightBounce from '../components/fight/FightBounce.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { ForcebrutService } from '../services/forcebrutTournament.service';
import type { ForcebrutOpponent } from '@dinorpg/core/models/forcebrut/forcebrutOpponent.js';
import { dinozStore } from '../store/dinozStore';
import { sessionStore } from '../store/sessionStore';
import { userStore } from '../store/userStore';
import { errorHandler } from '../utils/errorHandler';
import { resolveFightingPlace, transpileFight } from '../fight/transpileFight';
import { localStore } from '../store/localStore';
import { getForcebrutTournamentName } from '../constants/forcebrutName';

export default defineComponent({
	name: 'ForcebrutPage',
	components: {
		DZDisclaimer,
		DinozWithoutFlash: defineAsyncComponent(() => import('../components/dinoz/DinozAnimation.vue')),
		FightBounce,
		TitleHeader,
		FullFightAnimation: defineAsyncComponent(() => import('../components/fight/FightAnimation.vue'))
	},
	data() {
		return {
			dinozStore: dinozStore(),
			sessionStore: sessionStore(),
			userStore: userStore(),
			dinoz: undefined as DinozFiche | undefined,
			opponent: undefined as ForcebrutOpponent | undefined,
			fight: undefined as any,
			fightTransformed: undefined as preFightLoader | undefined,
			fightEnded: false,
			lang: (localStore().getLanguage ?? 'fr').toLowerCase()
		};
	},
	computed: {
		dinozId(): number {
			return Number(this.$route.params.id);
		},
		opponentFullName(): string {
			if (!this.opponent) {
				return '';
			}
			return getForcebrutTournamentName({
				name: this.opponent.name,
				display: this.opponent.display,
				step: this.opponent.step
			});
		}
	},
	methods: {
		async loadData() {
			this.dinoz = this.dinozStore.getDinoz(this.dinozId);
			this.opponent = await ForcebrutService.getOpponent(this.dinozId);
		},

		async launchFight() {
			try {
				this.fight = await ForcebrutService.fight(this.dinozId);
				this.sessionStore.setFightResult(this.fight);
				const fightSteps = this.fight.history as FightStep[];
				const fighters = this.fight.fighters as FighterRecap[];
				const transformedFight = transpileFight(
					structuredClone(toRaw(fighters)),
					fightSteps,
					this.$t,
					this.fight.result,
					undefined,
					undefined,
					true
				);
				if (!transformedFight) return;
				this.fightTransformed = {
					...resolveFightingPlace(PlaceEnum.FORCEBRUT),
					history: transformedFight.filter(Boolean),
					lang: this.lang,
					statusReward: this.fight.statusReward
				};
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		try {
			await this.loadData();
		} catch (e) {
			errorHandler.handle(e, this.$toast);
			this.$router.push({ name: 'DinozPage', params: { id: this.dinozId } });
		}
	}
});
</script>

<style scoped lang="scss">
.fb {
	display: flex;
	align-self: center;
	overflow: hidden;
	position: relative;
}
.dinoz,
.opponent {
	width: 100%;
	height: auto;
	background-color: #bc683c;
	border: 3px solid #bc683c;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	padding-block: 15px;
	padding-inline: 15px;
	img {
		width: 100%;
	}
}
.dinozCard,
.opponentCard {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	overflow: hidden;
}
.dinozInfo,
.opponentInfo {
	display: flex;
	flex-direction: column;
	gap: 8px;
	text-align: center;
	color: #fce3bc;
	.name {
		text-align: center;
		font-weight: bold;
		line-height: 10pt;
		background-color: transparent;
		margin-top: -5px;
		align-self: center;
	}
	.lvl {
		font-size: 9pt;
	}
}
.vs {
	background-color: #fce3bc;
	width: 30px;
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: center;
	& img {
		position: relative;
		left: 11.3px;
		top: -1px;
	}
	.stage {
		position: relative;
		top: 55px;
		left: -60px;
		right: 0;
		text-align: center;
		font-size: 10pt;
		font-weight: bold;
		color: black;
	}
}
.fight {
	background-color: #bc683c;
	border: 3px solid #bc683c;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	display: flex;
	align-items: center;
	align-self: center;
	justify-content: center;
	margin-top: 10px;
	width: 80%;
	height: 50px;
}
.launch-fight {
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #7a4528;
	border-radius: 10px;
	padding-right: 5px;
	gap: 10px;
	min-height: 30px;
	cursor: pointer;
	& span {
		color: #fce3bc;
		font-size: 12pt;
	}
	&:hover {
		background-color: #53260e;
	}
}
@media (max-width: 580px) {
	.fb {
		width: 90%;
	}
	.fight {
		width: 90%;
	}
	.launch-fight {
		width: 80%;
		gap: 5px;
		padding: 0 5px 0 0;
	}
}
.wrapper {
	align-self: center;
}
</style>
