<template>
	<div class="dinozFilters">
		<label class="filter">
			<span>{{ $t('accountPage.dinozFilters.race') }}</span>
			<DZSelect id="account-dinoz-race-filter" v-model="selectedRaceId" :options="raceOptions" />
		</label>
		<label class="filter">
			<span>{{ $t('accountPage.dinozFilters.level') }}</span>
			<DZSelect id="account-dinoz-level-filter" v-model="selectedLevelRange" :options="levelRangeOptions" />
		</label>
		<label class="filter">
			<span>{{ $t('accountPage.dinozFilters.state') }}</span>
			<DZSelect id="account-dinoz-state-filter" v-model="selectedDinozState" :options="dinozStateOptions" />
		</label>
	</div>
	<div class="dinozList" v-if="filteredDinozList.length > 0">
		<Tippy class="dinoz" tag="div" v-for="dinoz in filteredDinozList" :key="dinoz.id" theme="small" interactive>
			<Suspense>
				<DinozAnimation :display="dinoz.display" :life="dinoz.life / dinoz.maxLife" flip :isFrozen="dinoz.isFrozen" />
				<template #fallback><Loading /></template>
			</Suspense>
			<RouterLink class="name" :to="`/dinoz/${dinoz.id}`" v-if="isOwner">
				<div class="link">
					{{ dinoz.name }}
				</div>
			</RouterLink>
			<div class="name" v-else>
				{{ dinoz.name }}
			</div>
			<div class="dinozInfo">
				{{ $t(`race.name.${raceList[dinoz.race.raceId]}`) }}
				{{ $t(`accountPage.level`) }} {{ dinoz.level }}
			</div>
			<template v-if="dinoz.status && dinoz.status.length > 0" #content>
				<template v-for="(status, index) in dinoz.status" :key="index">
					<img
						v-if="statusList.displayed[status as StatutId]"
						:src="getImgURL('status', `fx_${statusList.imgName[status as StatutId]}`)"
						:alt="statusList.imgName[status as StatutId]"
					/>
				</template>
			</template>
		</Tippy>
	</div>
	<div class="emptyDinozList" v-else>
		{{ $t('accountPage.dinozFilters.empty') }}
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, type PropType } from 'vue';

import { raceList } from '../../constants/race.js';
import { statusList } from '../../constants/status.js';
import { dinozPlacement } from '../../constants/dinozPlacement.js';

import type { DinozPublicFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import type { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';

import { orderDinozList } from '@dinorpg/core/utils/dinozUtils.js';

import DZSelect from '../utils/DZSelect.vue';

type StatutId = DinozStatusId;

type SelectOption<T extends string | number> = {
	value: T;
	label: string;
};

const DINOZ_LEVEL_RANGES = [
	{ value: '1-10', min: 1, max: 10 },
	{ value: '11-20', min: 11, max: 20 },
	{ value: '21-30', min: 21, max: 30 },
	{ value: '31-40', min: 31, max: 40 },
	{ value: '41-50', min: 41, max: 50 },
	{ value: '51-60', min: 51, max: 60 },
	{ value: '61-70', min: 61, max: 70 },
	{ value: '71-80', min: 71, max: 80 }
] as const;

type DinozLevelRange = 'all' | (typeof DINOZ_LEVEL_RANGES)[number]['value'];
type DinozStateFilter = 'all' | 'active' | 'frozen';

export default defineComponent({
	name: 'MyDinoz',
	components: {
		DZSelect,
		DinozAnimation: defineAsyncComponent(() => import('../dinoz/DinozAnimation.vue'))
	},
	props: {
		profile: {
			type: Object as PropType<UserProfile>,
			required: true
		},
		isOwner: { type: Boolean, required: true }
	},
	data() {
		return {
			raceList: raceList,
			statusList: statusList,
			position: dinozPlacement,
			sortedDinozList: [] as DinozPublicFiche[],
			selectedRaceId: 0,
			selectedLevelRange: 'all' as DinozLevelRange,
			selectedDinozState: 'all' as DinozStateFilter
		};
	},
	computed: {
		raceOptions(): SelectOption<number>[] {
			return [
				{
					value: 0,
					label: String(this.$t('accountPage.dinozFilters.allRaces'))
				},
				...Object.entries(raceList).map(([raceId, raceKey]) => ({
					value: Number(raceId),
					label: String(this.$t(`race.name.${raceKey}`))
				}))
			];
		},
		levelRangeOptions(): SelectOption<DinozLevelRange>[] {
			return [
				{
					value: 'all',
					label: String(this.$t('accountPage.dinozFilters.allLevels'))
				},
				...DINOZ_LEVEL_RANGES.map(range => ({
					value: range.value,
					label: `${range.min} - ${range.max}`
				}))
			];
		},
		dinozStateOptions(): SelectOption<DinozStateFilter>[] {
			return [
				{
					value: 'all',
					label: String(this.$t('accountPage.dinozFilters.allStates'))
				},
				{
					value: 'active',
					label: String(this.$t('accountPage.dinozFilters.active'))
				},
				{
					value: 'frozen',
					label: String(this.$t('accountPage.dinozFilters.frozen'))
				}
			];
		},
		filteredDinozList(): DinozPublicFiche[] {
			return this.sortedDinozList.filter(dinoz => {
				if (this.selectedRaceId !== 0 && dinoz.race.raceId !== this.selectedRaceId) {
					return false;
				}
				const levelRange = DINOZ_LEVEL_RANGES.find(range => range.value === this.selectedLevelRange);
				if (levelRange && (dinoz.level < levelRange.min || dinoz.level > levelRange.max)) {
					return false;
				}
				if (this.selectedDinozState === 'active' && dinoz.isFrozen) {
					return false;
				}
				if (this.selectedDinozState === 'frozen' && !dinoz.isFrozen) {
					return false;
				}
				return true;
			});
		}
	},
	methods: {
		style(dinoz: DinozPublicFiche): string {
			const race = Object.entries(raceList).find(([k]) => Number(k) === dinoz.race.raceId)?.[1];
			const first = dinoz.display.charAt(0);
			const second = dinoz.display.charAt(1);
			if (!first || !second) {
				return 'top: -15px; left: -15px;';
			}
			// TODO it's disabled because we disabled the vue dinoz
			if (race === 'moueffeDisabled' || race === 'pigmouDisabled') {
				const placement = dinozPlacement.noFliped[first];
				if (!placement) {
					return 'top: -15px; left: -15px;';
				}
				const taille = second === 'A' ? 9 : Number(second);
				const safeTaille = Number.isFinite(taille) ? taille : 0;
				const left = ((placement.adult.left - placement.baby.left) / 9) * safeTaille + placement.baby.left;
				const top = ((placement.adult.top - placement.baby.top) / 9) * safeTaille + placement.baby.top;
				return `position: absolute; left: ${left}px; top: ${top}px;`;
			}
			return 'top: -15px; left: -15px;';
		},
		updateSortedDinozList() {
			this.sortedDinozList = orderDinozList(this.profile?.dinoz.slice() ?? []);
		}
	},
	watch: {
		profile: {
			immediate: true,
			handler() {
				this.updateSortedDinozList();
			}
		}
	},
	mounted() {
		this.updateSortedDinozList();
	}
});
</script>

<style lang="scss" scoped>
.dinozFilters {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 8px;
	margin: 10px 0 12px;
	.filter {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 130px;
		font-size: 8pt;
		font-weight: bold;
		color: #bc683c;
	}
}
.dinozList {
	display: flex;
	gap: 5px;
	justify-content: space-evenly;
	flex-wrap: wrap;
	.dinoz {
		width: 170px;
		background-color: #fbdba8;
		cursor: default;
		border: 1px solid #fce3bc;
		border-radius: 10px;
		-webkit-border-radius: 10px;
		&:hover {
			border: 1px solid #f1c98e;
		}
		img {
			width: 100%;
		}
	}
}
.name {
	text-align: center;
	font-weight: bold;
	line-height: 10pt;
	color: #52646b;
	background-color: transparent;
	text-decoration: none;
}
.dinozInfo {
	text-align: center;
	font-size: 9pt;
	line-height: 10pt;
	color: #bc683c;
	width: 170px;
	margin-bottom: 8px;
}
.link:hover {
	text-decoration: underline;
	cursor: pointer;
}
.emptyDinozList {
	margin: 12px auto;
	text-align: center;
	font-size: 9pt;
	font-weight: bold;
	color: #bc683c;
}
</style>
