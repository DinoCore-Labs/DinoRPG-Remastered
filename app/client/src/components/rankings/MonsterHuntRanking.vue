<template>
	<div class="monster-hunt-ranking">
		<div v-if="editionOptions.length > 0" class="edition-selector">
			<span>{{ $t('ranking.monsterHunt.edition') }}</span>
			<DZSelect
				id="monster-hunt-ranking-edition"
				v-model="selectedHuntId"
				:options="editionOptions"
				@change="changeEdition"
			/>
		</div>
		<DZDisclaimer
			v-if="selectedEdition && selectedEdition.status !== 'ACTIVE'"
			round
			help
			content="ranking.monsterHunt.archive"
		/>
		<div v-if="selectedEdition" class="hunt-header">
			<strong>{{ getEditionName(selectedEdition.name) }}</strong>
			<span class="hunt-dates">
				{{
					$t('ranking.monsterHunt.period', {
						start: formatDate(selectedEdition.startAt),
						end: formatDate(selectedEdition.endAt)
					})
				}}
			</span>
		</div>
		<div v-if="myRank" class="my-ranking">
			{{ $t('ranking.monsterHunt.myRank') }}
			<strong>
				{{
					$t('ranking.monsterHunt.myRankValue', {
						position: myRank.position,
						points: myRank.points,
						objects: myRank.objects
					})
				}}
			</strong>
		</div>
		<div v-if="rankings.length > 0" class="wrapper">
			<DZTable>
				<tr>
					<th class="thPos">
						{{ $t('ranking.th.pos') }}
					</th>
					<th class="thPlayer">
						{{ $t('common.master') }}
					</th>
					<th class="thPoints">
						{{ $t('ranking.th.points') }}
					</th>
					<th class="thObjects">
						{{ $t('ranking.monsterHunt.objects') }}
					</th>
				</tr>
				<tr v-if="page > 1" class="select" @click="changePage(-1)">
					<td colspan="4" class="pagination">
						{{ $t('ranking.page.previous') }}
					</td>
				</tr>
				<tr
					v-for="(ranking, index) in rankings"
					:key="ranking.user.id"
					class="select"
					:class="{
						even: (index + 1) % 2 === 0,
						me: ranking.user.id === user.id
					}"
				>
					<td class="tdPos">
						{{ ranking.position }}
					</td>
					<td class="tdOther">
						<Tippy theme="normal">
							<DZUser :user="ranking.user" :me="ranking.user.id === user.id" :friend="false" />
							<template #content>
								<div class="hunt-title">
									<h1>
										{{ $t('ranking.monsterHunt.lootDetails') }}
									</h1>
								</div>
								<div v-if="ranking.loot.length > 0" class="hunt-loot-list">
									<div v-for="loot in ranking.loot" :key="loot.lootKey" class="hunt-loot-line">
										<p>
											{{ loot.count }} ×
											{{ $t(loot.nameKey) }}
										</p>
										<p>
											{{
												$t('ranking.monsterHunt.lootPoints', {
													points: loot.pointsEarned
												})
											}}
										</p>
									</div>
								</div>
								<span v-else>
									{{ $t('ranking.monsterHunt.noLoot') }}
								</span>
							</template>
						</Tippy>
					</td>
					<td class="tdNumber">
						{{ ranking.points }}
					</td>
					<td class="tdNumber">
						{{ ranking.objects }}
					</td>
				</tr>
				<tr v-if="hasNextPage" class="select" @click="changePage(1)">
					<td colspan="4" class="pagination">
						{{ $t('ranking.page.next') }}
					</td>
				</tr>
			</DZTable>
		</div>
		<DZDisclaimer v-else-if="loaded && selectedEdition" round content="ranking.monsterHunt.empty" />
		<DZDisclaimer v-else-if="loaded && editions.length === 0" round content="ranking.monsterHunt.noEdition" />
	</div>
</template>

<script lang="ts">
import type { MonsterHuntRankingEdition, MonsterHuntRankingEntry } from '@dinorpg/core/models/ranking/rankingEntry.js';

import { defineComponent } from 'vue';

import { RankingService } from '../../services';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';

import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZSelect, { type SelectOption } from '../utils/DZSelect.vue';
import DZTable from '../utils/DZTable.vue';
import DZUser from '../utils/DZUser.vue';

type MyMonsterHuntRank = {
	position: number;
	points: number;
	objects: number;
};

export default defineComponent({
	name: 'MonsterHuntRanking',
	components: {
		DZDisclaimer,
		DZSelect,
		DZTable,
		DZUser
	},
	props: {
		pageLoaded: {
			type: Number,
			required: true
		}
	},
	setup() {
		const user = userStore();
		return {
			user
		};
	},
	data() {
		return {
			editions: [] as MonsterHuntRankingEdition[],
			rankings: [] as MonsterHuntRankingEntry[],
			selectedHuntId: undefined as string | undefined,
			page: this.pageLoaded,
			pageSize: 50,
			total: 0,
			myRank: null as MyMonsterHuntRank | null,
			loaded: false
		};
	},
	computed: {
		editionOptions(): SelectOption<string>[] {
			return this.editions.map(edition => ({
				value: edition.id,
				label: this.getEditionName(edition.name)
			}));
		},
		selectedEdition(): MonsterHuntRankingEdition | undefined {
			return this.editions.find(edition => edition.id === this.selectedHuntId);
		},
		hasNextPage(): boolean {
			return this.page * this.pageSize < this.total;
		}
	},
	methods: {
		async loadEditions(): Promise<void> {
			try {
				const response = await RankingService.getMonsterHuntEditions();
				this.editions = response.editions;
				if (this.editions.length === 0) {
					this.selectedHuntId = undefined;
					this.loaded = true;
					return;
				}
				const requestedHuntId = typeof this.$route.query.huntId === 'string' ? this.$route.query.huntId : undefined;
				const requestedEdition = requestedHuntId
					? this.editions.find(edition => edition.id === requestedHuntId)
					: undefined;
				const activeEdition = this.editions.find(edition => edition.status === 'ACTIVE');
				const selected = requestedEdition ?? activeEdition ?? this.editions[0];
				this.selectedHuntId = selected.id;
				if (requestedHuntId !== selected.id) {
					await this.$router.replace({
						name: 'RankingMonsterHunt',
						params: {
							pageLoaded: 1
						},
						query: {
							...this.$route.query,
							huntId: selected.id
						}
					});
				}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async loadRanking(): Promise<void> {
			if (!this.selectedHuntId) {
				return;
			}
			try {
				const response = await RankingService.getMonsterHuntRanking(this.selectedHuntId, this.page);

				this.rankings = response.ranking;
				this.total = response.total;
				this.page = response.page;
				this.pageSize = response.pageSize;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async loadMyRank(): Promise<void> {
			if (!this.selectedHuntId || !this.user.id) {
				this.myRank = null;
				return;
			}
			try {
				this.myRank = await RankingService.getMonsterHuntUserRank(this.selectedHuntId, this.user.id);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		async refresh(): Promise<void> {
			if (!this.selectedHuntId) {
				this.loaded = true;
				return;
			}
			this.loaded = false;
			await Promise.all([this.loadRanking(), this.loadMyRank()]);
			this.loaded = true;
		},
		getEditionName(name: string): string {
			return this.$te(name) ? this.$t(name).toString() : name;
		},
		async changeEdition(): Promise<void> {
			if (!this.selectedHuntId) {
				return;
			}
			await this.$router.push({
				name: 'RankingMonsterHunt',
				params: {
					pageLoaded: 1
				},
				query: {
					huntId: this.selectedHuntId
				}
			});
		},
		changePage(offset: number): void {
			if (!this.selectedHuntId) {
				return;
			}
			const targetPage = this.page + offset;
			if (targetPage < 1) {
				return;
			}
			this.$router.push({
				name: 'RankingMonsterHunt',
				params: {
					pageLoaded: targetPage
				},
				query: {
					huntId: this.selectedHuntId
				}
			});
		},
		formatDate(value: string): string {
			return new Intl.DateTimeFormat(undefined, {
				dateStyle: 'medium',
				timeStyle: 'short'
			}).format(new Date(value));
		}
	},
	async mounted() {
		this.page = this.pageLoaded;
		await this.loadEditions();
		await this.refresh();
	},
	watch: {
		pageLoaded: {
			async handler(value: number) {
				this.page = value;
				if (this.selectedHuntId) {
					await this.refresh();
				}
			}
		},
		'$route.query.huntId': {
			async handler(value) {
				if (typeof value !== 'string') {
					return;
				}
				if (value === this.selectedHuntId) {
					return;
				}
				const edition = this.editions.find(entry => entry.id === value);
				if (!edition) {
					return;
				}
				this.selectedHuntId = edition.id;
				this.page = Number(this.$route.params.pageLoaded ?? 1);
				await this.refresh();
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.monster-hunt-ranking {
	margin: 5px;
}
.edition-selector {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}
.hunt-header {
	display: flex;
	flex-direction: column;
	margin: 8px 2px;
}
.hunt-dates {
	font-size: 0.9em;
}
.my-ranking {
	margin: 8px 2px;
	padding: 6px 8px;
	background-image: url('../../assets/background/table_cell.webp');
}
.wrapper {
	position: relative;
}
.thPos {
	width: 5em;
}
.thPlayer {
	max-width: 150px;
}
.thPoints,
.thObjects {
	width: 75px;
}
.tdPos {
	background-position: 0 0;
	padding-left: 1.2em;
}
.tdOther,
.tdNumber {
	background-position: -10px 0;
}
.tdOther {
	padding-left: 1em;
}
.tdNumber {
	text-align: center;
}
.pagination {
	text-align: center;
	cursor: pointer;
}
.select:hover td {
	color: white;
	border-color: #9a4029;
}
.me td {
	font-weight: bold;
}
.hunt-title {
	display: flex;
	padding-left: 140px;
}
.hunt-loot-list {
	display: flex;
	flex-direction: column;
	padding: 6px;
	gap: 4px;
	color: #f9f1a6;
}
.hunt-loot-line {
	display: flex;
	flex-direction: column;
	small {
		opacity: 0.85;
	}
}
</style>
