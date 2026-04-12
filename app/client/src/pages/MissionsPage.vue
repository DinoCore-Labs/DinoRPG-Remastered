<template>
	<TitleHeader :title="`${$t('pageTitle.missions')}`" :header="formatContent($t(`missions.header`))" />
	<DZTable>
		<tr>
			<th class="name">{{ $t('missions.th.title') }}</th>
			<th class="status">{{ $t('missions.th.status') }}</th>
		</tr>
		<tr v-for="mission in missionList" :key="mission.missionId" :class="mission.status">
			<td class="name" @click="getInformation(mission)">
				<img v-if="mission.status === 'ongoing'" :src="getImgURL('icons', `small_missAct`)" alt="small_missAct" />
				<img v-if="mission.status === 'available'" :src="getImgURL('icons', `small_right`)" alt="small_missNew" />
				<img v-if="mission.status === 'finished'" :src="getImgURL('icons', `small_missDone`)" alt="small_missDone" />
				<Tippy
					v-if="mission.status === 'unavailable'"
					tag="img"
					:src="getImgURL('icons', `help${getLanguage()}`)"
					theme="normal"
					class="help"
				>
					<template #content>
						<h1 v-html="formatContent($t(`missions.unavailable.title`))" />
						<p v-html="formatContent($t(`missions.unavailable.description`))" />
					</template>
				</Tippy>
				{{ $t(mission.nameKey) }}
			</td>
			<td class="status">{{ $t(`missions.status.${mission.status}`) }}</td>
		</tr>
	</DZTable>
	<MissionInformationModal
		:enabled="information"
		:mission="mission"
		:dinozId="dinozId"
		@close="information = !information"
		@reload="reload()"
	/>
</template>

<script lang="ts">
import type { DinozMissionGroupItem } from '@dinorpg/core/models/missions/missionResponse.js';
import { defineComponent } from 'vue';

import { MissionService } from '../services/mission.service.js';
import { errorHandler } from '../utils/errorHandler.js';
import { formatText } from '../utils/formatText.js';
import { getImgURL } from '../utils/getImgURL.js';
import MissionInformationModal from '../components/modal/MissionInformationModal.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZTable from '../components/utils/DZTable.vue';

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
	name: 'Missions',
	components: {
		MissionInformationModal,
		TitleHeader,
		DZTable
	},
	data() {
		return {
			missionList: [] as Array<MissionListView>,
			information: false as boolean,
			mission: undefined as MissionListView | undefined
		};
	},
	methods: {
		getImgURL,
		formatContent(text: string): string {
			return formatText(text);
		},
		getInformation(mission: MissionListView): void {
			if (mission.status === 'ongoing' || mission.status === 'available') {
				this.mission = mission;
				this.information = !this.information;
			}
		},
		async loadMissions(): Promise<void> {
			const dinozId = this.$route.params.id.toString();

			try {
				const response = await MissionService.getDinozMissionGroup(Number(dinozId), this.group);

				this.missionList = response.missions.map(mission => ({
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
				}));
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async reload(): Promise<void> {
			await this.loadMissions();
			this.information = !this.information;
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		}
	},
	computed: {
		dinozId(): number {
			return Number(this.$route.params.id);
		},
		group(): string {
			return this.$route.params.group.toString();
		}
	},
	async mounted(): Promise<void> {
		await this.loadMissions();
	}
});
</script>

<style lang="scss" scoped>
.help {
	border: 1px solid #bc683c;
	cursor: help;
	margin-left: 5px;
	&:hover {
		outline: 1px solid white;
	}
}
tr {
	display: table-row;
	th {
		font-size: 8pt;
		text-shadow: 1px 1px 0 #356847;
		padding-left: 4px;
		padding-right: 4px;
		padding-bottom: 8px;
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
		&.status {
			min-width: 70px;
		}
	}
	td {
		font-size: 10pt;
		padding-right: 5px;
		padding-top: 1px;
		padding-bottom: 1px;
		color: #710;
		background-color: #f3ca92;
		border: 1px solid #c88f44;
		&.name {
			background-image: url('../assets/background/table_cell.webp');
			background-position: 0px 0px;
			padding-left: 15px;
			p {
				padding-top: 4px;
			}
			img {
				float: left;
				position: relative;
				margin-right: 5px;
				vertical-align: bottom;
			}
		}
		&.status {
			font-weight: bold;
			text-align: center;
			color: #bc683c;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
			max-width: 4px;
		}
		background-image: url('../assets/background/table_cell.webp');
		background-position: -10px 0px;
	}
	&.available {
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: #710;
		font-style: normal;
	}
	&.available:hover {
		td {
			color: white;
			border-color: #9a4029;
		}
	}
	&.unavailable {
		font-style: normal;
		td {
			background-image: url('../assets/background/table_cell_off.webp');
			color: #db9c57;
			border-color: #e6b57b;
			font-style: italic;
		}
	}
	&.ongoing {
		td {
			background-image: url('../assets/background/table_cell_hover.webp');
			border-color: #7a261b;
			font-style: italic;
			color: #fffdba;
			font-weight: bold;
			cursor: pointer;
		}
	}
}
</style>
