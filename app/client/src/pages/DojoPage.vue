<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/pages/DojoHome.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-08-31.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.welcome`)" />
	<div class="wrapper">
		<div class="header df">
			<div class="buttons">
				<RouterLink
					to="/dojo/challenge"
					v-if="tournamentState && tournamentState.phase === TournamentPhase.QUALIFICATION"
				>
					<img
						:src="getImgURL('act', 'act_defi')"
						v-tippy="{
							content: formatContent($t('dojo.accessChallenges')),
							theme: 'small'
						}"
					/>
				</RouterLink>
				<RouterLink
					v-else-if="tournamentState"
					:to="{
						name: 'DojoTournament',
						params: { id: tournamentState.id, group: '0' }
					}"
				>
					<img
						:src="getImgURL('act', 'act_tournament')"
						v-tippy="{
							content: formatContent($t('dojo.tournaments')),
							theme: 'small'
						}"
					/>
				</RouterLink>
				<RouterLink to="/dojo/test/">
					<img
						:src="getImgURL('act', 'act_train')"
						v-tippy="{
							content: formatContent($t('dojo.testDinoz')),
							theme: 'small'
						}"
					/>
				</RouterLink>
				<RouterLink to="/dojo/history/">
					<img
						:src="getImgURL('act', 'act_history')"
						v-tippy="{
							content: formatContent($t('dojo.fightHistory')),
							theme: 'small'
						}"
					/>
				</RouterLink>
				<RouterLink to="/dojo/ranking/">
					<img
						:src="getImgURL('act', 'act_tournament')"
						v-tippy="{
							content: formatContent($t('dojo.ranking')),
							theme: 'small'
						}"
					/>
				</RouterLink>
				<RouterLink to="/dojo/tournaments">
					<img
						:src="getImgURL('act', 'act_fav')"
						v-tippy="{
							content: formatContent($t('dojo.tournamentHistory')),
							theme: 'small'
						}"
					/>
				</RouterLink>
				<RouterLink
					v-if="tournamentState && tournamentState.phase === TournamentPhase.QUALIFICATION"
					:to="{
						name: 'TournamentInfo'
					}"
				>
					<img
						:src="getImgURL('act', 'act_sun')"
						v-tippy="{
							content: formatContent($t('common.myTeam')),
							theme: 'small'
						}"
					/>
				</RouterLink>
			</div>
			<div class="header-text df jcsb">
				<p class="ttu">
					{{ $t('dojo.reputation') }} : {{ reputation }} {{ $t('dojo.points') }} - {{ $t('dojo.worth') }} : {{ worth }}%
				</p>
			</div>
		</div>
		<DojoTimer v-if="tournamentState" :state="tournamentState" />
	</div>
	<RouterView />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { dojoStore } from '../store/dojoStore.js';
import { localStore } from '../store/localStore.js';
import { DojoService } from '../services/dojo.service.js';
import { errorHandler } from '../utils/errorHandler.js';
import { TournamentPhase } from '@dinorpg/core/models/dojo/tournament.js';
import DojoTimer from '../components/dojo/DojoTimer.vue';
import { formatDateTime } from '../utils/formatDate.js';
import type { DinozDojoFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';

export default defineComponent({
	name: 'DojoHome',
	components: {
		DojoTimer,
		TitleHeader
	},
	data() {
		return {
			localStore: localStore(),
			myTeam: [] as DinozDojoFiche[],
			dojoStore: dojoStore()
		};
	},
	methods: {
		async displayTeam() {
			try {
				this.myTeam = await DojoService.getTournamentTeam();
				await this.refresh();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async deleteTeam() {
			try {
				this.myTeam = [] as DinozDojoFiche[];
				await DojoService.deleteTournamentTeam();
				await this.refresh();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async composeMyTeam(data: number[]) {
			try {
				await DojoService.createTournamentTeam(data);
				await this.refresh();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async refresh() {
			await this.dojoStore.update();

			if (!this.dojoStore.getState) {
				throw new Error(this.$t('Dojo not Found'));
			}
		},
		formatDate(oldDate: Date) {
			return formatDateTime(oldDate.toString());
		}
	},
	computed: {
		TournamentPhase() {
			return TournamentPhase;
		},
		worth() {
			return this.dojoStore.getWorth;
		},
		reputation() {
			return this.dojoStore.getReputation;
		},
		rank() {
			return this.dojoStore.getRank;
		},
		tournamentState() {
			return this.dojoStore.getState;
		}
	},
	async created() {
		try {
			if (!this.dojoStore) {
				throw new Error('Dojo not found');
			}
			await this.refresh();
		} catch (e) {
			errorHandler.handle(e, this.$toast);
			this.$router.push({ name: 'NewsPage' });
		}
	}
});
</script>

<style lang="scss" scoped>
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}

.wrapper {
	background-color: #4d2713;
	margin-bottom: 8px;
	border: 1px solid #bc683c;
	align-self: center;
	max-width: 530px;
	width: 95%;

	.header {
		background-image: url('../assets/background/home_dojo.webp');
		background-repeat: no-repeat;
		align-items: center;

		position: relative;
		height: 288px;
		flex-direction: column-reverse;

		.header-text {
			width: 96%;
			padding: 4px;
			height: 35px;
			color: #fff;
		}
	}

	.buttons {
		display: flex;
		gap: 8px;
		padding: 8px;
		height: 47px;
		align-self: baseline;

		img {
			display: block;
			cursor: pointer;
			flex-shrink: 0;
			flex-grow: 0;
			height: 50px;

			&.disabled {
				filter: grayscale(100%);
			}
		}
	}
}
.dinoz-button {
	max-width: 96px;
	margin: 4px;
	border-radius: 5px;
	text-align: center;
	border: 1px solid #874b2e;
	cursor: pointer;
	user-select: none;
	display: flex;
	flex-direction: column;
	background-image: url('../assets/battle/forcebrut.webp');
	background-repeat: no-repeat;
	background-size: cover;
	background-position-x: center;
	background-position-y: -4px;
	position: relative;

	.delete {
		position: absolute;
		right: 3px;
		top: 3px;

		&:hover {
			filter: brightness(120%);
		}
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
}
</style>
