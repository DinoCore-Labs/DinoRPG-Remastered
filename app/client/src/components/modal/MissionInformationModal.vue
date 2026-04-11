<template>
	<Transition>
		<div v-if="enabled" class="modal-background">
			<div class="modal-box">
				<button class="modal-close" @click="$emit('close')">X</button>

				<p v-if="loading">
					{{ $t('common.loading') }}
				</p>

				<p v-else-if="descriptionHtml" v-html="descriptionHtml" />

				<div v-if="!loading" class="option">
					<a v-if="mission?.status === 'available' && detail?.canStart" class="button" @click="startMission()">
						{{ $t('missions.accept') }}
					</a>

					<p v-else-if="mission?.status === 'available' && !detail?.canStart">
						{{ $t('missions.already') }}
					</p>

					<p v-else-if="mission?.status === 'ongoing'">
						{{ $t('missions.ongoingInfo') }}
					</p>

					<!--
					TODO:
					Remettre le bouton abandon quand un endpoint backend existera.
					<a class="button" @click="stopMission()">
						{{ $t('missions.giveUp') }}
					</a>
					-->
				</div>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import type { DinozMissionDetailResponse } from '@dinorpg/core/models/missions/missionResponse.js';
import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { defineComponent, type PropType } from 'vue';

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

export default defineComponent({
	name: 'MissionInformationModal',
	props: {
		mission: Object as PropType<MissionListView | undefined>,
		enabled: Boolean,
		dinozId: { type: Number, required: true }
	},
	emits: ['close', 'reload'],
	data() {
		return {
			detail: null as DinozMissionDetailResponse | null,
			loading: false as boolean
		};
	},
	computed: {
		descriptionHtml(): string {
			if (!this.detail || !this.mission) {
				return '';
			}

			if (this.mission.status === 'available') {
				return formatText(this.$t(this.detail.beginKey).toString());
			}

			if (this.mission.status === 'ongoing') {
				const currentGoalText = this.detail.currentGoal ? this.formatGoal(this.detail.currentGoal) : '';
				return formatText(
					this.$t('missions.currentGoalText', {
						goal: currentGoalText
					}).toString()
				);
			}

			return '';
		}
	},
	watch: {
		enabled: {
			async handler(value: boolean) {
				if (value) {
					await this.loadMissionDetail();
				}
			},
			immediate: true
		},
		mission: {
			async handler() {
				if (this.enabled) {
					await this.loadMissionDetail();
				}
			}
		}
	},
	methods: {
		async loadMissionDetail() {
			if (!this.mission) {
				this.detail = null;
				return;
			}

			try {
				this.loading = true;
				this.detail = await MissionService.getDinozMissionDetail(this.dinozId, this.mission.missionKey);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			} finally {
				this.loading = false;
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

				case 'KILL':
					return `${this.$t('dinozMissions.goal.kill')} ${goal.kill.count}`;

				default:
					return goal.type;
			}
		},

		async startMission() {
			if (!this.mission) {
				this.$toast.open({
					message: this.$t('toast.missingData').toString(),
					type: 'error'
				});
				return;
			}

			try {
				await MissionService.startDinozMission(this.dinozId, this.mission.missionKey);

				this.$emit('reload');

				this.$router.push({
					name: 'DinozPage',
					params: { id: this.dinozId }
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.modal-background {
	position: fixed;
	background: transparentize(#09092d, 0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;

	.modal-box {
		background-image: url('../../assets/background/mission.webp');
		background-repeat: no-repeat;
		width: 394px;
		height: 296px;
		position: absolute;
		background-color: #fff0d1;
		border-radius: 3px;
		border: 1px solid #efbf86;
		box-shadow:
			0 0 0 1px #aa885f,
			0 0 5px 1px #aa885f;
		animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;

		p {
			margin-bottom: 5px;
			line-height: 12pt;
			padding-left: 35px;
			padding-right: 40px;
			padding-top: 25px;
			color: #9d6523;
			text-align: justify;
			font-size: 10pt;
		}

		.option {
			margin-left: 35px;
			margin-right: 35px;
			padding-top: 10px;
			border-top: 1px solid #e6b778;
			font-weight: bold;

			p {
				margin-bottom: 0;
				padding-left: 0;
				padding-right: 0;
				padding-top: 0;
				color: #9d6523;
				text-align: justify;
				font-size: 10pt;
			}

			.button {
				cursor: pointer;
			}
		}
	}
}

.v-enter-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
	animation-delay: 0.35s;
}

.v-leave-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
}

.v-enter-from {
	bottom: 0;
	opacity: 0;
}

.v-leave-to {
	bottom: 0;
	opacity: 0;
}

.modal-close {
	min-width: 31px;
	cursor: pointer;
	position: absolute;
	text-align: center;
	right: 0;
	top: 0;
	padding: 5px;
	background-color: #fadcb0;
	color: transparentize(brown, 0.4);
	font-size: 0.85em;
	letter-spacing: 0.03em;
	text-decoration: none;
	font-variant: small-caps;
	transition: all 0.15s;

	&:hover,
	&:focus,
	&:active {
		color: black;
	}
}

@keyframes blowUpModal {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}
</style>
