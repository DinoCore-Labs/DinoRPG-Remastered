<template>
	<Tippy theme="normal" tag="div" v-if="currentMission" class="mission" @click="getInformation()">
		<p class="dinozName">{{ dinozName }}</p>
		<p class="name">{{ $t(currentMission.nameKey) }}</p>
		<div v-if="currentGoalText" class="detail">
			{{ currentGoalText }}
		</div>
		<div v-if="previousStepText" class="previous-step">
			<p class="name">{{ $t('missions.lastDialog') }}</p>
			<p v-html="formatContent(previousStepText)" />
		</div>
		<template #content>
			<h1>{{ $t(currentMission.nameKey) }}</h1>
			<p v-html="formatContent($t(currentMission.beginKey).toString())" />
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
import type { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import type { DinozCurrentMission } from '@dinorpg/core/models/missions/missionCurrent.js';
import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';
import { defineComponent, type PropType } from 'vue';

import MissionInformationModal from '../../components/modal/MissionInformationModal.vue';

type MissionStatusView = 'available' | 'unavailable' | 'ongoing' | 'finished';
type GoalTextMode = 'current' | 'previous';

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
			const mission = this.currentMission;
			if (!mission) {
				return undefined;
			}
			return {
				missionId: mission.key,
				missionKey: mission.key,
				nameKey: mission.nameKey,
				beginKey: mission.beginKey,
				endKey: mission.endKey,
				status: 'ongoing',
				canStart: false,
				isCompleted: false,
				isActive: true,
				progression: mission.progression,
				tracking: mission.tracking
			};
		},
		missionDefinition() {
			const mission = this.currentMission;
			if (!mission) {
				return null;
			}
			return missionList.find(definition => definition.key === mission.key) ?? null;
		},
		currentGoal(): MissionGoal | null {
			return this.currentMission?.currentGoal ?? null;
		},
		currentGoalIndex(): number {
			const mission = this.currentMission;
			const definition = this.missionDefinition;
			const currentGoal = this.currentGoal;
			if (!mission || !definition || !currentGoal) {
				return -1;
			}
			if (
				typeof mission.currentGoalIndex === 'number' &&
				mission.currentGoalIndex >= 0 &&
				mission.currentGoalIndex < definition.goals.length
			) {
				return mission.currentGoalIndex;
			}
			const matchedIndex = definition.goals.findIndex(goal => this.areGoalsEquivalent(goal, currentGoal));
			if (matchedIndex !== -1) {
				return matchedIndex;
			}
			if (
				typeof mission.progression === 'number' &&
				mission.progression >= 0 &&
				mission.progression < definition.goals.length
			) {
				return mission.progression;
			}
			return -1;
		},
		previousGoal(): MissionGoal | null {
			const definition = this.missionDefinition;
			const tracking = this.currentMission?.tracking ?? 0;
			const currentIndex = this.currentGoalIndex;
			if (!definition || currentIndex <= 0) {
				return null;
			}
			for (let index = currentIndex - 1; index >= 0; index--) {
				const goal = definition.goals[index];

				if (this.getGoalText(goal, tracking, 'previous')) {
					return goal;
				}
			}
			return null;
		},
		currentGoalText(): string {
			const goal = this.currentGoal;
			const tracking = this.currentMission?.tracking ?? 0;
			if (!goal) {
				return '';
			}
			return this.getGoalText(goal, tracking, 'current') ?? '';
		},
		previousStepText(): string | null {
			const goal = this.previousGoal;
			const tracking = this.currentMission?.tracking ?? 0;
			if (!goal) {
				return null;
			}
			return this.getGoalText(goal, tracking, 'previous');
		}
	},
	methods: {
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
		getKillTargetNames(goal: Extract<MissionGoal, { type: 'KILL' }>): string {
			const monsterKeys = goal.kill.monsterKeys ?? [];
			if (monsterKeys.length === 0) {
				return this.$t('dinozMissions.goal.kill').toString();
			}
			const names = [...new Set(monsterKeys.map(monsterKey => this.$t(`monster.name.${monsterKey}`).toString()))];
			return names.join(', ');
		},
		areGoalsEquivalent(left: MissionGoal, right: MissionGoal): boolean {
			if (left.type !== right.type) {
				return false;
			}
			switch (left.type) {
				case 'AT':
					return (
						right.type === 'AT' &&
						left.place === right.place &&
						Boolean(left.hidden) === Boolean(right.hidden) &&
						(left.titleKey ?? null) === (right.titleKey ?? null)
					);
				case 'TALK':
					return right.type === 'TALK' && left.nameKey === right.nameKey && left.textKey === right.textKey;
				case 'ACTION':
					return (
						right.type === 'ACTION' && left.nameKey === right.nameKey && left.descriptionKey === right.descriptionKey
					);
				case 'KILL':
					return (
						right.type === 'KILL' &&
						left.kill.count === right.kill.count &&
						left.kill.displayNameKey === right.kill.displayNameKey
					);
				case 'VALIDATE':
					return (
						right.type === 'VALIDATE' &&
						left.npcKey === right.npcKey &&
						left.place === right.place &&
						left.nameKey === right.nameKey
					);
				default:
					return false;
			}
		},
		getGoalText(goal: MissionGoal, tracking: number, mode?: GoalTextMode): string | null {
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
					return this.$t('missions.goals.talk', {
						nameKey: this.$t(goal.nameKey).toString()
					}).toString();
				case 'ACTION':
					return this.$t('missions.goals.action', {
						nameKey: this.$t(goal.nameKey).toString()
					}).toString();
				case 'VALIDATE':
					return this.$t('missions.goals.validate', {
						nameKey: this.$t(goal.nameKey).toString()
					}).toString();
				case 'KILL': {
					const targetName = goal.kill.displayNameKey
						? this.$t(goal.kill.displayNameKey).toString()
						: this.getKillTargetNames(goal);
					return this.$t('missions.goals.kill', {
						current: tracking,
						count: goal.kill.count,
						nameKey: targetName
					}).toString();
				}
				default:
					return null;
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
	padding: 0px 5px 5px 20px;
	font-size: 10pt;
	background-color: #bc683c;
	background-image: url('../../assets/icons/small_missAct.webp');
	background-position: 5px 13px;
	background-repeat: no-repeat;
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
