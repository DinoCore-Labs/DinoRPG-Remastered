<template>
	<div class="dinozList">
		<Tippy class="dinoz" tag="div" v-for="(dinoz, index) in sortedDinozList" :key="index" theme="small" interactive>
			<Suspense>
				<DinozWithoutFlash :display="dinoz.display" :life="1" flip />
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
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, type PropType } from 'vue';
import { raceList } from '../../constants/race.js';
import { statusList } from '../../constants/status.js';
import { dinozPlacement } from '../../constants/dinozPlacement.js';
import type { DinozPublicFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { userStore } from '../../store/userStore.js';
import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import type { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';

type StatutId = DinozStatusId;

export default defineComponent({
	name: 'MyDinoz',
	components: {
		DinozWithoutFlash: defineAsyncComponent(() => import('../dinoz/DinozAnimation.vue'))
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
			//UnavailableReason,
			raceList: raceList,
			statusList: statusList,
			position: dinozPlacement,
			sortedDinozList: [] as DinozPublicFiche[]
		};
	},
	methods: {
		style(dinoz: DinozPublicFiche): string {
			const race = Object.entries(raceList).find(([k]) => Number(k) === dinoz.race.raceId)?.[1];

			const first = dinoz.display.charAt(0);
			const second = dinoz.display.charAt(1);

			// si display trop court / invalide
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
		goToDinoz(dinozId: number) {
			if (!this.myAccount) return;
			this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
		},
		unsortedDinozList() {
			this.sortedDinozList =
				this.profile?.dinoz.slice().sort((a, b) => {
					return a.level - b.level;
				}) ?? [];
		}
		/*updateSortedDinozList() {
			this.sortedDinozList =
				this.profile?.dinoz
					.slice()
					.sort((a, b) => {
						if (a.order === null) {
							a.order = a.id;
						}
						if (b.order === null) {
							b.order = b.id;
						}
						if (a.order === b.order) {
							return a.name.localeCompare(b.name);
						}
						return a.order - b.order;
					})
					.sort((a, b) => {
						if (a.isFrozen && !b.isFrozen) {
							return 1;
						} else if (!a.isFrozen && b.isFrozen) {
							return -1;
						}
						return 0;
					}) ?? [];
		}*/
	},
	watch: {
		profile: {
			immediate: true,
			handler() {
				this.unsortedDinozList();
			}
		}
	},
	mounted() {
		this.unsortedDinozList();
	}
});
</script>
<style lang="scss" scoped>
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
</style>
