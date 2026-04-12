<template>
	<Tippy theme="normal" tag="div" v-if="currentMission" class="mission" @click="getInformation()">
		<p class="dinozName">{{ dinozName }}</p>
		<p class="name">
			{{ $t(currentMission.nameKey) }}
		</p>
		<div class="detail" v-if="currentGoalText">
			{{ currentGoalText }}
		</div>
		<template #content>
			<h1>{{ $t(currentMission.nameKey) }}</h1>
			<p v-html="formatContent($t(currentMission.beginKey))" />
		</template>
	</Tippy>
	<MissionInformationModal
		:enabled="information"
		:mission="mission"
		:dinozId="dinozId"
		@close="information = false"
		@reload="reload()"
	/>
</template>

<script lang="ts">
import type { DinozCurrentMission } from '@dinorpg/core/models/missions/missionCurrent.js';
import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { defineComponent, type PropType } from 'vue';

import MissionInformationModal from '../../components/modal/MissionInformationModal.vue';
import { formatText } from '../../utils/formatText.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';
import type { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

type MissionStatusView = 'available' | 'unavailable' | 'ongoing' | 'finished';

type MissionListView = {
	missionId: string;
	missionKey: string;
	nameKey: string;
	beginKey: string;
	endKey: string;
	status: MissionStatusView;
	canStart: boolean;
	isCompleted: boolean;
	isActive: boolean;
	progression: number | null;
	tracking: number | null;
};

export default defineComponent({
	name: 'MissionHUD',
	components: {
		MissionInformationModal
	},
	emits: ['abort'],
	props: {
		currentMission: {
			type: Object as PropType<DinozCurrentMission | null>,
			required: false,
			default: null
		},
		dinozName: { type: String, required: true },
		dinozId: { type: Number, required: true }
	},
	data() {
		return {
			information: false as boolean
		};
	},
	computed: {
		mission(): MissionListView | undefined {
			if (!this.currentMission) {
				return undefined;
			}
			return {
				missionId: this.currentMission.key,
				missionKey: this.currentMission.key,
				nameKey: this.currentMission.nameKey,
				beginKey: this.currentMission.beginKey,
				endKey: this.currentMission.endKey,
				status: 'ongoing',
				canStart: false,
				isCompleted: false,
				isActive: true,
				progression: this.currentMission.progression,
				tracking: this.currentMission.tracking
			};
		},
		currentGoalText(): string {
			if (!this.currentMission?.currentGoal) {
				return '';
			}
			return this.formatGoal(this.currentMission.currentGoal, this.currentMission.tracking);
		}
	},
	methods: {
		formatContent(text: string): string {
			return formatText(text);
		},
		getInformation(): void {
			if (this.mission) {
				this.information = true;
			}
		},
		async reload(): Promise<void> {
			this.information = false;
			this.$emit('abort');
		},
		getPlaceName(placeId: PlaceEnum | null): string {
			if (placeId == null) {
				return this.$t('missions.goals.atHidden').toString();
			}
			const place = placeListv2[placeId];
			if (!place) {
				return String(placeId);
			}
			return this.$t(`place.name.${place.name}`).toString();
		},
		formatGoal(goal: MissionGoal, tracking: number): string {
			switch (goal.type) {
				case 'AT': {
					if (goal.titleKey) {
						return this.$t(goal.titleKey).toString();
					}
					if (goal.hidden) {
						return this.$t('missions.goals.atHidden').toString();
					}
					return this.$t('missions.goals.atPlace', {
						place: this.getPlaceName(goal.place)
					}).toString();
				}
				case 'TALK':
					return `${this.$t('dinozMissions.goal.talk')} ${this.$t(goal.nameKey).toString()}`;
				case 'ACTION':
					return `${this.$t(goal.nameKey).toString()} - ${this.$t(goal.descriptionKey).toString()}`;
				case 'KILL': {
					const targetName = goal.kill.displayNameKey
						? this.$t(goal.kill.displayNameKey).toString()
						: this.$t('dinozMissions.goal.kill').toString();
					return `${tracking}/${goal.kill.count} ${targetName}`;
				}
				default:
					return goal.type;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.dinozName {
	color: #ffee92;
	font-variant: small-caps;
	font-weight: bold;
}
.mission {
	padding: 5px;
	font-size: 10pt;
	background-color: #bc683c;
	line-height: 10pt;
	overflow: hidden;
	color: #774828;
	cursor: pointer;
	align-self: stretch;
}
.name {
	font-variant: small-caps;
	font-weight: bold;
	color: white;
}
.detail {
	font-style: italic;
	color: #fce3bc;
	font-size: 9pt;
}
.previous-step {
	margin-top: 8px;
	h2 {
		text-align: left;
		padding-left: 8px;
	}
	p {
		font-size: 9pt !important;
		line-height: 10.5pt !important;
		font-style: italic;
		color: #fdf1c4;
	}
}
@media (max-width: 539px) {
	.mission {
		width: 100%;
	}
}
</style>
