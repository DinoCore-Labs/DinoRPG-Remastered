<template>
	<TitleHeader :title="$t('pageTitle.dinoz')" :header="$t('trainingCenter.title')" />

	<div class="training-center-page">
		<section class="training-card">
			<img class="logo" :src="getImgURL('background', 'cef')" alt="C.E.F." />

			<h2>{{ $t('trainingCenter.title') }}</h2>

			<p class="intro" v-html="$t('trainingCenter.subtitle')" />

			<img class="arena" :src="getImgURL('place', 's_cef')" alt="" />

			<p class="description">
				{{ $t('trainingCenter.description') }}
			</p>

			<DZDisclaimer help content="trainingCenter.warning" />

			<div class="programs">
				<button
					v-for="program in programs"
					:key="program.key"
					class="program"
					:class="{ selected: selectedProgram === program.key }"
					type="button"
					:disabled="!canStartFight"
					@click="start(program.key)"
				>
					<span class="name">{{ $t(program.labelKey) }}</span>

					<span class="program-description">
						{{ $t(program.descriptionKey) }}
					</span>

					<span class="price">
						{{ program.price }}
						<img :src="getImgURL('icons', 'small_gold')" alt="" />
					</span>

					<span v-if="program.xpMultiplier > 1" class="bonus">
						+{{ Math.round((program.xpMultiplier - 1) * 100) }}%
						{{ $t('trainingCenter.xpBonus') }}
					</span>
				</button>
			</div>

			<p class="note">
				{{ $t('trainingCenter.monstersNote') }}
			</p>
		</section>

		<!--<div v-if="loading" class="fight-wrapper">
			<Loading />
		</div>-->

		<div v-if="fightTransformed && fight" class="fight-wrapper">
			<Suspense>
				<FightAnimation :fight="fightTransformed" @animationEnded="fightEnded = true" />
				<template #fallback>
					<Loading />
				</template>
			</Suspense>
			<FightBounce v-if="fightEnded" :fight="fight" :dinozId="dinozId" />
		</div>
	</div>
</template>

<script lang="ts">
import type { FighterRecap, FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import type { preFightLoader } from '@dinorpg/core/models/fight/transpiler.js';
import {
	trainingCenterPrograms,
	type TrainingCenterProgramKey
} from '@dinorpg/core/models/trainingCenter/trainingCenter.js';
import { computed, defineAsyncComponent, defineComponent, getCurrentInstance, ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import FightBounce from '../components/fight/FightBounce.vue';
//import Loading from '../components/utils/Loading.vue';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { TrainingCenterService } from '../services/trainingCenter.service';
import { getImgURL } from '../utils/getImgURL';
import { errorHandler } from '../utils/errorHandler';
import { resolveFightingPlace, transpileFight } from '../fight/transpileFight';

export default defineComponent({
	name: 'TrainingCenterPage',
	components: {
		DZDisclaimer,
		FightBounce,
		FightAnimation: defineAsyncComponent(() => import('../components/fight/FightAnimation.vue')),
		//Loading,
		TitleHeader
	},
	setup() {
		const route = useRoute();
		const { t, locale } = useI18n();
		const instance = getCurrentInstance();

		const loading = ref(false);
		const fightEnded = ref(false);
		const fight = ref<FightResult | undefined>();
		const fightTransformed = ref<preFightLoader | undefined>();
		const selectedProgram = ref<TrainingCenterProgramKey | undefined>();

		const dinozId = computed(() => Number(route.params.id));
		const programs = Object.values(trainingCenterPrograms);

		const canStartFight = computed(() => {
			return !loading.value && (!fightTransformed.value || fightEnded.value);
		});

		async function start(program: TrainingCenterProgramKey) {
			if (!canStartFight.value) return;
			try {
				loading.value = true;
				fightEnded.value = false;
				fight.value = undefined;
				fightTransformed.value = undefined;
				selectedProgram.value = program;
				const result = await TrainingCenterService.startTrainingCenterFight(dinozId.value, program);
				fight.value = result;
				const fightSteps = result.history as FightStep[];
				const fighters = result.fighters as FighterRecap[];
				if (!fightSteps || !fighters) {
					return;
				}
				const nextFight = transpileFight(
					structuredClone(toRaw(fighters)),
					fightSteps,
					t,
					result.result,
					undefined,
					undefined,
					true
				);
				if (!nextFight) {
					return;
				}
				const initPlace = resolveFightingPlace(result.place, result.background);
				if (!initPlace) {
					return;
				}
				fightTransformed.value = {
					...initPlace,
					history: nextFight.filter(step => step !== undefined),
					lang: locale.value.toLocaleLowerCase(),
					statusReward: result.statusReward
				};
				instance?.proxy?.$refreshGold?.();
				fightEnded.value = true;
			} catch (error) {
				const toast = instance?.proxy?.$toast;
				if (toast) {
					errorHandler.handle(error, toast);
				} else {
					console.error(error);
				}
			} finally {
				loading.value = false;
			}
		}
		return {
			canStartFight,
			dinozId,
			fight,
			fightEnded,
			fightTransformed,
			getImgURL,
			loading,
			programs,
			selectedProgram,
			start
		};
	}
});
</script>

<style scoped lang="scss">
.training-center-page {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
}
.training-card {
	padding: 1rem;
	font-weight: 700;
	text-align: left;
	.logo {
		display: block;
		width: 122px;
		height: auto;
		margin: 0 auto 1rem;
		border: 1px solid #fff;
	}
	h2 {
		margin: 0 0 1rem;
		color: red;
		font-size: 1.15rem;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.intro,
	.description,
	.note {
		margin: 1rem 0;
		line-height: 1.35;
	}
	.arena {
		display: block;
		width: 100%;
		max-width: 422px;
		margin: 1.5rem auto;
		border: 1px solid #fff;
	}
}
.programs {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.75rem;
	margin-top: 1rem;
}
.program {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.35rem;
	padding: 0.75rem;
	background: #efb873;
	border: 2px solid #d36f35;
	color: #9e2100;
	font-weight: 700;
	cursor: pointer;
	&:hover,
	&.selected {
		background: #f8ca82;
	}
	&:disabled {
		cursor: wait;
		opacity: 0.65;
	}
	.name {
		font-size: 1rem;
	}
	.program-description {
		font-size: 0.8rem;
		text-align: center;
	}
	.price,
	.bonus {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
	.price img {
		width: 16px;
		height: 16px;
	}
	.bonus {
		color: #7d1400;
		font-size: 0.75rem;
	}
}
.fight-wrapper {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 1rem;
}
@media (max-width: 768px) {
	.programs {
		grid-template-columns: 1fr;
	}
}
</style>
