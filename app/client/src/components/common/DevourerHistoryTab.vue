<template>
	<div class="devourerHistory">
		<DZTable>
			<tr>
				<th class="date-header">{{ $t('scenarios.devourer.journal.date') }}</th>
				<th class="user-header">{{ $t('scenarios.devourer.journal.attack') }}</th>
				<th class="user-header">{{ $t('scenarios.devourer.journal.defense') }}</th>
				<th class="action-header">{{ $t('scenarios.devourer.journal.action') }}</th>
			</tr>
			<tr v-for="fight in history" :key="fight.id">
				<td class="center-text">
					{{ new Date(fight.createdDate).toLocaleString() }}
				</td>
				<td class="center-text">
					<DZUser v-if="fight.leftUser" :user="fight.leftUser" />
				</td>
				<td class="center-text">
					<DZUser v-if="fight.rightUser" :user="fight.rightUser" />
					<span v-else>{{ $t('scenarios.devourer.name') }}</span>
				</td>
				<td class="action-cell">
					<div class="icons">
						<img
							:src="getImgURL('icons', 'clipboard')"
							@click="copyToClipBoard(fight.id)"
							v-tippy="{
								content: formatContent($t('scenarios.devourer.journal.copyLink')),
								theme: 'small'
							}"
						/>
						<RouterLink :to="{ name: 'DevourerShareFight', params: { archive: fight.id } }">
							<img
								:src="getImgURL('icons', 'small_follow')"
								v-tippy="{
									content: formatContent($t('scenarios.devourer.journal.watchFight')),
									theme: 'small'
								}"
							/>
						</RouterLink>
					</div>
				</td>
			</tr>
		</DZTable>
		<div class="pagination-controls" v-if="totalPages > 1">
			<button @click="previousPage" :disabled="currentPage === 1">
				<img class="left" :src="getImgURL('button', 'button-back-arrow')" />
			</button>
			<span>{{ currentPage }} / {{ totalPages }}</span>
			<button @click="nextPage" :disabled="currentPage === totalPages">
				<img class="right" :src="getImgURL('button', 'button-back-arrow')" />
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, type PropType } from 'vue';
import { DevourerService, type DevourerHistoryEntry } from '../../services/devourer.service';
import { errorHandler } from '../../utils/errorHandler';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import DZTable from '../utils/DZTable.vue';

const DZUser = defineAsyncComponent(() => import('../utils/DZUser.vue'));

export default defineComponent({
	name: 'DevourerHistoryTab',
	props: {
		dinozData: { type: Object as PropType<DinozFiche>, required: true }
	},
	components: {
		DZTable,
		DZUser
	},
	data() {
		return {
			currentPage: 1,
			history: [] as DevourerHistoryEntry[],
			totalPages: 0
		};
	},
	methods: {
		copyToClipBoard(id: string) {
			navigator.clipboard.writeText(`${window.location.origin}/devourer/share/${id}`);
			this.$toast.success(this.$t('scenarios.devourer.journal.linkCopied'));
		},
		async getHistory() {
			try {
				const archive = await DevourerService.getHistory(this.dinozData.placeId, this.currentPage);
				this.history = archive.fights;
				this.totalPages = Math.ceil(archive.total / 10);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		nextPage() {
			this.currentPage++;
			this.getHistory();
		},
		previousPage() {
			this.currentPage--;
			this.getHistory();
		}
	},
	mounted() {
		this.getHistory();
	}
});
</script>

<style lang="scss" scoped>
.devourerHistory {
	width: 100%;
}
.date-header {
	width: 50px;
}
.center-text {
	text-align: center;
}
.action-cell {
	padding: 0 !important;
	height: 1px;
}
.icons {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
	gap: 8px;
	img {
		cursor: pointer;
	}
	a {
		display: flex;
		align-items: center;
	}
}
.pagination-controls {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 15px;
	margin-top: 10px;
	button {
		background: none;
		border: none;
		cursor: pointer;
		img {
			width: 13px;
			&.right {
				transform: scaleX(-1);
			}
		}
		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
}
</style>
