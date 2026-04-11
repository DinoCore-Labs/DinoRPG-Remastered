<template>
	<Tippy theme="normal" tag="div" v-if="mission && detail" class="mission" @click="getInformation()">
		<p class="dinozName">{{ dinozName }}</p>
		<p class="name">
			{{ $t(mission.nameKey) }}
		</p>
		<div class="detail">
			{{ currentGoalText }}
		</div>

		<template #content>
			<h1>{{ $t(mission.nameKey) }}</h1>
			<p v-html="formatContent($t(mission.beginKey))" />
			<div class="previous-step" v-if="currentGoalText">
				<h2>{{ $t('missions.currentGoal') }}</h2>
				<p>{{ currentGoalText }}</p>
			</div>
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
import type {
	DinozMissionDetailResponse,
	DinozMissionGroupItem
} from '@dinorpg/core/models/missions/missionResponse.js';
import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { missionList as allMissionDefinitions } from '@dinorpg/core/models/missions/data/index.js';
import { defineComponent } from 'vue';

import MissionInformationModal from '../../components/modal/MissionInformationModal.vue';
import { MissionService } from '../../services/mission.service.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { formatText } from '../../utils/formatText.js';

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

function toMissionStatus(status: DinozMissionGroupItem['status']): MissionStatusView {
	switch (status) {
		case 'AVAILABLE':
			return 'available';
		case 'LOCKED':
			return 'unavailable';
		case 'IN_PROGRESS':
			return 'ongoing';
		case 'COMPLETED':
			return 'finished';
	}
}

export default defineComponent({
	name: 'DinozMissionHUD',
	components: {
		MissionInformationModal
	},
	emits: ['abort'],
	props: {
		dinozName: { type: String, required: true },
		dinozId: { type: Number, required: true }
	},
	data() {
		return {
			information: false as boolean,
			mission: undefined as MissionListView | undefined,
			detail: null as DinozMissionDetailResponse | null
		};
	},
	computed: {
		missionGroups(): string[] {
			return [...new Set(allMissionDefinitions.map(mission => mission.group))];
		},
		currentGoalText(): string {
			if (!this.detail?.currentGoal) {
				return '';
			}

			return this.formatGoal(this.detail.currentGoal);
		}
	},
	watch: {
		dinozId: {
			async handler() {
				await this.loadCurrentMission();
			},
			immediate: true
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

		async loadCurrentMission(): Promise<void> {
			try {
				let activeMission: MissionListView | undefined;

				for (const group of this.missionGroups) {
					const response = await MissionService.getDinozMissionGroup(this.dinozId, group);
					const activeMissionKey = response.activeMissionKey;

					if (!activeMissionKey) {
						continue;
					}

					const mission = response.missions.find(entry => entry.key === activeMissionKey);

					if (!mission) {
						continue;
					}

					activeMission = {
						missionId: mission.key,
						missionKey: mission.key,
						nameKey: mission.nameKey,
						beginKey: mission.beginKey,
						endKey: mission.endKey,
						status: toMissionStatus(mission.status),
						canStart: mission.canStart,
						isCompleted: mission.isCompleted,
						isActive: mission.isActive,
						progression: mission.progression,
						tracking: mission.tracking
					};

					break;
				}

				if (!activeMission) {
					this.mission = undefined;
					this.detail = null;
					return;
				}

				this.mission = activeMission;
				this.detail = await MissionService.getDinozMissionDetail(this.dinozId, activeMission.missionKey);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},

		async reload(): Promise<void> {
			await this.loadCurrentMission();
			this.information = false;

			if (!this.mission) {
				this.$emit('abort');
			}
		},

		formatGoal(goal: MissionGoal): string {
			switch (goal.type) {
				case 'AT':
					return goal.titleKey ? this.$t(goal.titleKey).toString() : this.$t('dinozMissions.goal.at').toString();

				case 'TALK':
					return `${this.$t('dinozMissions.goal.talk')} ${this.$t(goal.nameKey).toString()}`;

				case 'ACTION':
					return `${this.$t(goal.nameKey).toString()} - ${this.$t(goal.descriptionKey).toString()}`;

				case 'KILL': {
					const progress = this.detail?.tracking ?? 0;
					const total = goal.kill.count;
					const targetName = goal.kill.displayNameKey
						? this.$t(goal.kill.displayNameKey).toString()
						: this.$t('dinozMissions.goal.kill').toString();

					return `${progress}/${total} ${targetName}`;
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
	padding: 5px 5px 5px 20px;
	font-size: 10pt;
	background-color: #bc683c;
	background-image: url('../../assets/icons/small_missAct.webp');
	background-position: 5px 8px;
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
