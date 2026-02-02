<template>
	<div class="dinoz">
		<TitleHeader :title="$t('pageTitle.dinoz', { dinoz: dinozData.name })" />
		<div class="navigation">
			<router-link v-if="getDinozId(-1)" :to="{ name: 'DinozPage', params: { id: prevId } }" class="see-button">
				<img :src="getImgURL('background', 'left')" />
			</router-link>
			<span class="title">
				{{ dinozData.name }}
			</span>
			<router-link v-if="getDinozId(1)" :to="{ name: 'DinozPage', params: { id: nextId } }" class="see-button">
				<img :src="getImgURL('background', 'right')" />
			</router-link>
		</div>
		<Tippy theme="normal" tag="div" id="dinozVisual">
			<Suspense>
				<DinozAnimation
					:display="dinozData.display"
					:life="dinozData.life / dinozData.maxLife"
					flip
					:race="dinozData.race.raceId"
					:key="dinozData.life || dinozData.display"
					:isFrozen="dinozData.remaining === 12"
				/>
				<template #fallback> <Loading /> </template>
			</Suspense>
			<template #content>
				<h1>{{ $t(`race.name.${dinozRace}`) }}</h1>
				<p>
					{{ $t(`race.description.${dinozRace}`) }}
				</p>
			</template>
		</Tippy>
		<DinozElements :dinozData="dinozData" />
		<DinozBars :dinozData="dinozData" />
		<DinozEquip :dinozData="dinozData" />
		<DinozStatus :dinozStatus="dinozData.status" />
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, type PropType } from 'vue';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { dinozPlacement } from '../../constants/dinozPlacement.js';
import { raceList } from '../../constants/race.js';
import { dinozStore } from '../../store/dinozStore.js';
import DinozElements from './DinozElements.vue';
import DinozBars from './DinozBars.vue';
import DinozEquip from './DinozEquip.vue';
import DinozStatus from './DinozStatus.vue';
import TitleHeader from '../utils/TitleHeader.vue';
import type DinozAnimation from './DinozAnimation.vue';
//import { UnavailableReason } from '@drpg/prisma/enums';

export default defineComponent({
	name: 'DinozDisplay',
	components: {
		DinozElements,
		DinozBars,
		DinozEquip,
		DinozStatus,
		TitleHeader,
		DinozAnimation: defineAsyncComponent(() => import('./DinozAnimation.vue'))
	},
	data() {
		return {
			//UnavailableReason,
			dinozStore: dinozStore(),
			nameChoosen: undefined as boolean | undefined,
			position: dinozPlacement
		};
	},
	props: { dinozData: { type: Object as PropType<DinozFiche>, required: true } },
	computed: {
		dinozRace(): string {
			return Object.entries(raceList).find(race => parseInt(race[0]) === this.dinozData.race?.raceId)?.[1] ?? '';
		},
		prevId(): number | null {
			return this.getDinozId(-1);
		},
		nextId(): number | null {
			return this.getDinozId(1);
		}
	},
	methods: {
		style(dinoz?: string): string {
			if (!dinoz || dinoz.length < 2) {
				return 'top: -15px;';
			}

			if (this.dinozRace === 'moueffe' || this.dinozRace === 'pigmou') {
				const sizeChar = dinoz[1];
				if (!sizeChar) return 'top: -15px;';

				const taille = parseInt(sizeChar === 'A' ? '9' : sizeChar, 10);
				if (Number.isNaN(taille)) return 'top: -15px;';

				const key = dinoz[0] as keyof typeof dinozPlacement.fliped;
				const fliped = dinozPlacement.fliped[key];
				if (!fliped) return 'top: -15px;';

				const left = ((fliped.adult.left - fliped.baby.left) / 9) * taille + fliped.baby.left;
				const top = ((fliped.adult.top - fliped.baby.top) / 9) * taille + fliped.baby.top;

				return `position: absolute; left: ${left}px; top: ${top}px;`;
			}

			return 'top: -15px;';
		},
		getDinozId(shift: number): number | null {
			const list = this.dinozStore.getDinozList ?? [];
			if (list.length === 0) return null;

			const currentIndex = list.findIndex(d => d.id === this.dinozData.id);
			if (currentIndex === -1) return null;

			const newIndex = currentIndex + shift;

			if (newIndex < 0) return list[list.length - 1]!.id;
			if (newIndex >= list.length) return list[0]!.id;

			return list[newIndex]!.id;
		}
	}
});
</script>

<style lang="scss" scoped>
.dinoz {
	background-image: url('../../assets/background/dinoz_bg_cut.webp');
	background-repeat: no-repeat;
	display: grid;
	padding-top: 15px;
	height: 250px;
	grid-template-columns: [first] 180px [line1] 225px [line2] 100px [end];
	grid-template-rows: [first] 40px [row1] 40px [row2] 100px [row3] 40px [row4] 30px [end];
	column-gap: 2px;
	row-gap: 2px;
	grid-template-areas:
		'. . . '
		'dinoz name name '
		'dinoz status equip '
		'vie elements equip ';
	width: fit-content;
	align-self: center;
}
@media (max-width: 539px) {
	.dinoz {
		grid-template-columns: [first] 2.5% [line1] 26% [line2] 8% [line3] 13% [line3] 1%[line4] 13% [line5] 8% [line6] 26% [line7] 2.5% [end];
		grid-template-rows: [first] 40px [row2] 120px [row3] 20px [row4] 30px [row5] auto [row6] 3px [row7] auto [end];
		column-gap: 0;
		row-gap: 0;
		width: 100%;
		height: auto;
		grid-template-areas:
			'. . name name name name name . .'
			'. dinoz dinoz dinoz dinoz dinoz equip equip .'
			'. vie vie vie vie vie equip equip .'
			'. vie vie vie vie vie . . .'
			'. elements elements elements elements elements elements elements .'
			'. . . . . . . . .'
			'. status status status status status status status .';
		margin-bottom: 5px;
	}
}
.navigation {
	grid-area: name;
	align-self: center;
	justify-self: center;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 33px;
	gap: 5px;
	.title {
		background: url('../../assets/background/name_box.webp') no-repeat;
		width: 222px;
		height: 33px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 15pt;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 1pt;
		color: #fce3bc;
		text-shadow:
			-1px -1px 0px #68361b,
			1px 1px 0px #ddad8c;
	}
}
#dinozVisual {
	grid-area: dinoz;
	align-self: center;
	justify-self: center;
	width: fit-content;
	height: fit-content;
	display: flex;
	align-items: center;
	justify-content: center;
	max-width: 150px;
}
</style>
