<template>
	<div id="shareFight">
		<TitleHeader :title="$t('pageTitle.dojo')" />
		<FightersHeader :leftPlayer="leftPlayer" :rightPlayer="rightPlayer" />
		<template v-if="fightTransformed">
			<div v-show="loaded" class="content">
				<Suspense>
					<FullFightAnimation :fight="fightTransformed" />
					<template #fallback> <Loading /> </template>
				</Suspense>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import { errorHandler } from '../../utils/errorHandler.js';
import { DojoService } from '../../services/dojo.service.js';
import type { preFightLoader } from '@dinorpg/core/models/fight/transpiler.js';
import { resolveFightingPlace, transpileFight } from '../../fight/transpileFight.js';
import type { FightStep } from '@dinorpg/core/models/fight/FightStep.js';
import type { FighterRecap } from '@dinorpg/core/models/fight/FightResult.js';
import FightersHeader from '../fight/FightHeader.vue';

export default defineComponent({
	name: 'ShareFight',
	components: {
		TitleHeader,
		FightersHeader,
		FullFightAnimation: defineAsyncComponent(() => import('../fight/FightAnimation.vue'))
	},
	data() {
		return {
			fightTransformed: undefined as undefined | preFightLoader,
			loaded: false,
			leftPlayer: null as null | { id: string; name: string },
			rightPlayer: null as null | { id: string; name: string }
		};
	},
	methods: {},
	async mounted() {
		const archiveId = this.$route.params.archive.toString();

		try {
			const fightResult = await DojoService.getSharedFight(archiveId);
			const fightSteps = fightResult.fight.history as FightStep[];
			const fighters = fightResult.fight.fighters as FighterRecap[];
			if (!fightSteps || !fighters) return;

			const nexFight = transpileFight(
				structuredClone(toRaw(fighters)),
				fightSteps,
				this.$t,
				fightResult.fight.result,
				undefined,
				undefined,
				true
			);
			if (!nexFight) {
				return;
			}
			const initPlace = resolveFightingPlace(fightResult.fight.place);
			this.fightTransformed = {
				...initPlace,
				history: nexFight.filter(n => n != undefined)
				// lang: this.lang
			};
			this.leftPlayer = fightResult.fight.leftPlayer;
			this.rightPlayer = fightResult.fight.rightPlayer;
			this.loaded = true;
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style lang="scss" scoped>
#shareFight {
	align-self: center;
}
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}
.preparation {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}
.wrapper {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;

	.dinoz-button {
		width: 96px;
		margin: 4px;
		border-radius: 5px;
		text-align: center;
		border: 1px solid #874b2e;
		cursor: pointer;
		user-select: none;

		.background {
			background-image: url('../../assets/battle/forcebrut.webp');
			background-repeat: no-repeat;
			background-size: cover;
		}

		.textbox {
			background: rgb(255 249 0);
			background: linear-gradient(180deg, rgb(255 249 0) 0%, rgb(176 153 20) 100%);
			border-top: 1px solid #874b2e;
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			font-size: 10px;
			font-weight: bold;

			.name {
				color: #874b2e;
			}

			.level {
				color: #fce3bc;
			}
		}

		&.not-selected {
			filter: grayscale(100%);
		}
	}
}
.content {
	display: flex;
	justify-content: center;
}
</style>
