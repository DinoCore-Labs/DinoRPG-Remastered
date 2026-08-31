<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/components/dojo/DojoRanking.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-08-31.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<DZTable>
		<tr>
			<th class="pos">{{ $t('ranking.th.pos') }}</th>
			<th class="player">{{ $t('ranking.th.player') }}</th>
			<th>{{ $t('dojo.worth') }}</th>
			<th>{{ $t('dojo.points') }}</th>
		</tr>
		<tr
			v-for="(ranking, index) in rankings"
			:key="ranking.user?.id"
			class="select"
			:class="{
				even: (index + 1) % 2 === 0
			}"
		>
			<td class="pos">
				{{ (page - 1) * 20 + (index + 1) }}
			</td>
			<td><DZUser :user="ranking.user" :me="ranking.user.id === me" :friend="false" /></td>
			<td>{{ ranking.user.worth }}%</td>
			<td>{{ ranking.dojo }}</td>
		</tr>
	</DZTable>
	<tr class="pagination-controls">
		<button @click="previousPage" :disabled="page === 1">
			<img class="left" src="/src/assets/button/button-back-arrow.webp" />
		</button>
		<span>{{ page }} </span>
		<button @click="nextPage">
			<img class="right" src="/src/assets/button/button-back-arrow.webp" />
		</button>
	</tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZTable from '../utils/DZTable.vue';
import { userStore } from '../../store/userStore.js';
import { RankingService } from '../../services/index.js';
import { errorHandler } from '../../utils/errorHandler.js';
import type { DojoRankingEntry } from '@dinorpg/core/models/ranking/rankingEntry.js';
import DZUser from '../utils/DZUser.vue';

export default defineComponent({
	name: 'DojoRanking',
	components: { DZUser, DZTable },
	data() {
		return {
			page: 1 as number,
			me: userStore().id,
			rankings: [] as DojoRankingEntry[]
		};
	},
	methods: {
		async getRanking(): Promise<void> {
			try {
				this.rankings = await RankingService.getDojoRanking('dojo', this.page);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async previousPage() {
			if (this.page > 1) {
				try {
					this.page--;
					await this.getRanking();
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		},
		async nextPage() {
			try {
				this.page++;
				await this.getRanking();
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		}
	},
	async mounted() {
		await this.getRanking();
	}
});
</script>

<style scoped lang="scss">
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
