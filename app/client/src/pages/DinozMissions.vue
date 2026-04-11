<template>
	<TitleHeader :title="$t('pageTitle.dinozMissions')" :header="$t('dinozMissions.title')" />
	<DZDisclaimer content="dinozMissions.disclaimer" />
	<div v-if="loading" class="state">{{ $t('common.loading') }}</div>
	<div v-else-if="errorMessage" class="state error">{{ errorMessage }}</div>
	<table v-else-if="groupData && currentDinoz">
		<tbody>
			<tr>
				<th class="dinoz">{{ $t('dinozMissions.dinoz') }}</th>
				<th class="missions">{{ $t('dinozMissions.missions') }}</th>
			</tr>
			<tr>
				<td class="dinoz">
					<div class="dinoz-name">{{ currentDinoz.name }}</div>
				</td>
				<td class="missions">
					<div class="group-summary">
						<span class="summary-line">
							{{ $t('dinozMissions.groupName') }} :
							<strong>{{ groupData.group }}</strong>
						</span>

						<span class="summary-line">
							{{ $t('dinozMissions.progress') }} :
							<strong>{{ getCompletedCount(groupData) }}/{{ groupData.missions.length }}</strong>
						</span>

						<span class="summary-line" v-if="groupData.activeMissionKey">
							{{ $t('dinozMissions.activeMission') }} :
							<strong>{{ getMissionName(groupData.activeMissionKey) }}</strong>
						</span>
					</div>
					<ul class="mission-list">
						<li v-for="mission in groupData.missions" :key="mission.key">
							<div class="mission-main">
								<span class="mission-name">{{ $t(mission.nameKey) }}</span>
								<span class="mission-status" :class="mission.status.toLowerCase()">
									{{ $t(`dinozMissions.status.${mission.status.toLowerCase()}`) }}
								</span>
							</div>
							<div class="mission-meta">
								<span v-if="mission.isActive">
									{{ $t('dinozMissions.currentProgress') }} :
									{{ mission.progression ?? 0 }}
								</span>
								<span v-if="mission.isCompleted">
									{{ $t('dinozMissions.completed') }}
								</span>
							</div>
							<div class="mission-actions">
								<button class="small-button" @click="loadMissionDetail(mission.key)">
									{{ $t('dinozMissions.details') }}
								</button>
								<button v-if="mission.canStart" class="small-button start" @click="startMission(mission.key)">
									{{ $t('dinozMissions.start') }}
								</button>
							</div>
							<div v-if="selectedMissionDetail && selectedMissionDetail.key === mission.key" class="mission-detail">
								<p>
									<strong>{{ $t(selectedMissionDetail.nameKey) }}</strong>
								</p>
								<p>{{ $t(selectedMissionDetail.beginKey) }}</p>
								<p v-if="selectedMissionDetail.currentGoal">
									<strong>{{ $t('dinozMissions.currentGoal') }} :</strong>
									{{ formatGoal(selectedMissionDetail.currentGoal) }}
								</p>
								<p>
									<strong>{{ $t('dinozMissions.statusLabel') }} :</strong>
									{{ $t(`dinozMissions.status.${selectedMissionDetail.status.toLowerCase()}`) }}
								</p>
								<p v-if="selectedMissionDetail.progression !== null">
									<strong>{{ $t('dinozMissions.progression') }} :</strong>
									{{ selectedMissionDetail.progression }}
								</p>
								<p v-if="selectedMissionDetail.tracking !== null">
									<strong>{{ $t('dinozMissions.tracking') }} :</strong>
									{{ selectedMissionDetail.tracking }}
								</p>
							</div>
						</li>
					</ul>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts">
import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import type {
	DinozMissionDetailResponse,
	DinozMissionGroupResponse
} from '@dinorpg/core/models/missions/missionResponse.js';
import { defineComponent } from 'vue';

import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { MissionService } from '../services/mission.service.js';
import { dinozStore } from '../store/dinozStore.js';
import { errorHandler } from '../utils/errorHandler.js';

const MISSION_GROUP = 'papy_joe';

export default defineComponent({
	name: 'DinozMissions',
	components: {
		DZDisclaimer,
		TitleHeader
	},
	data() {
		return {
			dinozStore: dinozStore(),
			loading: false,
			errorMessage: '',
			groupData: null as DinozMissionGroupResponse | null,
			selectedMissionDetail: null as DinozMissionDetailResponse | null
		};
	},
	computed: {
		dinozId(): number {
			return Number(this.$route.params.id);
		},
		currentDinoz() {
			return this.dinozStore.getCurrentDinozId;
		}
	},
	async mounted() {
		await this.loadMissionGroup();
	},
	methods: {
		async loadMissionGroup() {
			this.loading = true;
			this.errorMessage = '';

			try {
				this.groupData = await MissionService.getDinozMissionGroup(this.dinozId, MISSION_GROUP);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				this.errorMessage = this.$t('dinozMissions.loadError').toString();
			} finally {
				this.loading = false;
			}
		},

		async loadMissionDetail(missionKey: string) {
			try {
				this.selectedMissionDetail = await MissionService.getDinozMissionDetail(this.dinozId, missionKey);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		},

		async startMission(missionKey: string) {
			try {
				await MissionService.startDinozMission(this.dinozId, missionKey);

				await this.loadMissionGroup();
				this.selectedMissionDetail = await MissionService.getDinozMissionDetail(this.dinozId, missionKey);

				this.$toast.open({
					message: this.$t('dinozMissions.startSuccess').toString(),
					type: 'success'
				});
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		},

		getCompletedCount(group: DinozMissionGroupResponse) {
			return group.missions.filter(mission => mission.isCompleted).length;
		},

		getMissionName(missionKey: string) {
			const mission = this.groupData?.missions.find(entry => entry.key === missionKey);
			return mission ? this.$t(mission.nameKey).toString() : missionKey;
		},

		formatGoal(goal: MissionGoal) {
			switch (goal.type) {
				case 'AT':
					return goal.titleKey ? this.$t(goal.titleKey).toString() : this.$t('dinozMissions.goal.at').toString();

				case 'TALK':
					return `${this.$t('dinozMissions.goal.talk')} ${this.$t(goal.nameKey).toString()}`;

				case 'ACTION':
					return `${this.$t(goal.nameKey).toString()} - ${this.$t(goal.descriptionKey).toString()}`;

				case 'KILL':
					return `${this.$t('dinozMissions.goal.kill')} ${goal.kill.count}`;

				default:
					return goal.type;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.state {
	margin-top: 10px;
	padding: 8px;
	font-size: 9pt;
	background: #f3ca92;
	border: 1px solid #c88f44;
	color: #710;

	&.error {
		color: #a40000;
	}
}

table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;

	tr {
		display: table-row;

		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;

			&.dinoz,
			&.missions {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
			}
		}

		td {
			font-size: 14px;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
			vertical-align: top;

			&.dinoz {
				padding: 6px 8px;
				font-variant: small-caps;
				width: 180px;
			}

			&.missions {
				padding: 6px 8px;
			}
		}
	}
}

.dinoz-name {
	font-weight: bold;
}

.group-summary {
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-bottom: 8px;
	font-size: 9pt;
}

.mission-list {
	list-style: none;
	margin: 0;
	padding: 0;

	li {
		padding: 6px 0;
		border-top: 1px solid rgba(120, 70, 20, 0.2);

		&:first-child {
			border-top: none;
		}
	}
}

.mission-main {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 8px;
}

.mission-name {
	font-weight: bold;
	font-size: 9pt;
}

.mission-status {
	font-size: 8pt;
	font-weight: bold;
	text-transform: uppercase;

	&.locked {
		color: #666;
	}

	&.available {
		color: #1b6d2a;
	}

	&.in_progress {
		color: #a45b00;
	}

	&.completed {
		color: #0060a4;
	}
}

.mission-meta {
	margin-top: 4px;
	font-size: 8pt;
}

.mission-actions {
	display: flex;
	gap: 6px;
	margin-top: 6px;
}

.small-button {
	border-color: #c85d3f;
	border-style: double;
	background-color: #c85d3f;
	color: #f3ca92;
	background-clip: padding-box;
	font-variant: small-caps;
	font-size: 9pt;
	padding: 0px 6px;
	text-decoration: none;
	cursor: pointer;

	&:hover {
		background-color: #f3ca92;
		color: #c85d3f;
	}
}

.mission-detail {
	margin-top: 8px;
	padding: 8px;
	background: rgba(255, 248, 220, 0.55);
	border: 1px solid #c88f44;
	font-size: 8.5pt;

	p {
		margin: 4px 0;
	}
}
</style>
