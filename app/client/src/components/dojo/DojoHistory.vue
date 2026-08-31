<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/components/dojo/DojoHistory.vue
  
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
			<th class="dinoz-header">{{ $t('dojo.history.myDinoz') }}</th>
			<th class="items-header">{{ $t('dojo.history.ennemis') }}</th>
			<th class="items-header">{{ $t('dojo.history.link') }}</th>
		</tr>
		<tr v-for="fight in history" :key="fight.id">
			<td>
				<li v-for="dino in getDinozFighters(fight.fighters, true)" :key="dino.id">
					{{ dino.name }}
				</li>
			</td>
			<td>
				<li v-for="dino in getDinozFighters(fight.fighters, false)" :key="dino.id">
					{{ dino.name }}
				</li>
			</td>
			<td class="icons">
				<img
					:src="getImgURL('icons', 'clipboard')"
					@click="copyToClipBoard(fight.id)"
					v-tippy="{
						content: formatContent($t('dojo.history.copyLink')),
						theme: 'small'
					}"
				/>
				<RouterLink :to="`/dojo/share/${fight.id}`">
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
import { DojoService } from '../../services/dojo.service.js';
import DZTable from '../utils/DZTable.vue';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import type { FighterRecap } from '@dinorpg/core/models/fight/fightResult.js';

export default defineComponent({
	name: 'DojoHistory',
	components: {
		TitleHeader,
		DZTable
	},
	data() {
		return {
			currentPage: 1,
			history: [] as { id: string; fighters: FighterRecap[] }[],
			totalPages: 0,
			FighterType
		};
	},
	methods: {
		copyToClipBoard(id: string) {
			navigator.clipboard.writeText(`${window.location.origin}/dojo/share/${id}`);
		},
		async getHistory() {
			try {
				const archive = await DojoService.getMyHistory(this.currentPage);
				this.history = archive.archive;
				this.totalPages = Math.ceil(archive.quantity / 10);
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
		},
		getDinozFighters(fighters: FighterRecap[], attacker: boolean): FighterRecap[] {
			return fighters.filter(
				(fighter: FighterRecap) => fighter.attacker === attacker && fighter.type === FighterType.DINOZ
			);
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
	text-align: center;
	& img {
		padding: 5px;
		vertical-align: middle;
	}
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
