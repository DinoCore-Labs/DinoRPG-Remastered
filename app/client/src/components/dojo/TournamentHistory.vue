<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/components/dojo/TournamentHistory.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-08-31.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<TitleHeader :title="$t('pageTitle.dojo')" />
	<DZTable>
		<tr>
			<th class="dinoz-header">{{ $t('dojo.history.tournamentType') }}</th>
			<th class="items-header">{{ $t('dojo.history.startDate') }}</th>
			<th class="items-header">{{ $t('dojo.history.link') }}</th>
		</tr>
		<tr v-for="tournament in history" :key="tournament.id">
			<td>{{ $t(`dojo.tournamentFormats.${tournament.formatName}`) }}</td>
			<td>{{ new Date(tournament.date).toLocaleDateString() }}</td>
			<td class="icons">
				<RouterLink :to="`/dojo/tournament/${tournament.id}/0`">
					<img
						:src="getImgURL('icons', 'small_follow')"
						v-tippy="{
							content: formatContent($t('dojo.history.seeFight')),
							theme: 'small'
						}"
					/>
				</RouterLink>
			</td>
		</tr>
	</DZTable>
	<tr class="pagination-controls">
		<button @click="previousPage" :disabled="currentPage === 1">
			<img class="left" :src="getImgURL('button', 'button-back-arrow')" />
		</button>
		<span>{{ currentPage }} / {{ totalPages }}</span>
		<button @click="nextPage" :disabled="currentPage === totalPages">
			<img class="right" :src="getImgURL('button', 'button-back-arrow')" />
		</button>
	</tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import { errorHandler } from '../../utils/errorHandler.js';
import DZTable from '../utils/DZTable.vue';
import { DojoService } from '../../services/dojo.service.js';
import type { TournamentHistory } from '@dinorpg/core/models/dojo/tournament.js';

export default defineComponent({
	name: 'TournamentHistory',
	components: {
		TitleHeader,
		DZTable
	},
	data() {
		return {
			currentPage: 1,
			history: [] as TournamentHistory[],
			totalPages: 0
		};
	},
	methods: {
		async getHistory() {
			try {
				const archive = await DojoService.getTournamentHistory(this.currentPage);
				this.history = archive.history;
				this.totalPages = Math.ceil(archive.count / 10);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async previousPage() {
			if (this.currentPage > 1) {
				try {
					this.currentPage--;
					await this.getHistory();
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		},
		async nextPage() {
			if (this.currentPage < this.totalPages) {
				try {
					this.currentPage++;
					await this.getHistory();
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		}
	},
	async mounted() {
		await this.getHistory();
	}
});
</script>

<style lang="scss" scoped>
li {
	list-style-type: none;
}
.icons {
	display: flex;
	justify-content: space-around;
	align-items: center;
	height: 100%;
	padding: 5px;
}
.pagination-controls {
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	button {
		background-color: transparent;
		margin: 0 10px;
		padding: 5px 10px;
		border: none;
		cursor: pointer;
		&:disabled {
			cursor: not-allowed;
		}
		.left,
		.right {
			height: auto;
			width: 10px;
		}
		.right {
			transform: rotate(180deg);
		}
	}
}
</style>
