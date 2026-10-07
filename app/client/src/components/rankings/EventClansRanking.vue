<template>
	<div class="wrapper">
		<DZTable>
			<tr>
				<th class="thPos">{{ $t('ranking.th.pos') }}</th>
				<th class="thPlayer">{{ $t('common.clan') }}</th>
				<th class="thPoints">{{ $t('ranking.th.totalKills') }}</th>
				<th class="thPoints">{{ $t('ranking.th.average') }}</th>
			</tr>
			<tr class="select" @click="changePage(-1)" v-if="page > 1">
				<td class="pos" colspan="4" style="text-align: center">
					{{ $t('ranking.page.previous') }}
				</td>
			</tr>
			<tr
				v-for="(ranking, index) in rankings"
				:key="ranking.clanId"
				class="select"
				:class="(index + 1) % 2 === 0 ? 'even' : ''"
				@click="goToClan(ranking.clanId)"
			>
				<td class="tdPos">
					{{ ranking.position }}
				</td>
				<td class="tdOther">
					<Flag v-for="lang in ranking.languages" :key="lang" :lang="lang.toLocaleLowerCase()" />
					{{ ranking.clanName }}
				</td>
				<td class="tdOther">
					{{ ranking.totalKills }}
				</td>
				<td class="tdOther">
					{{ ranking.averageKills }}
				</td>
			</tr>
			<tr class="select" @click="changePage(1)" :class="{ hidden: rankings.length < pageSize }">
				<td class="tdPos" colspan="4" style="text-align: center">
					{{ $t('ranking.page.next') }}
				</td>
			</tr>
		</DZTable>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RankingService } from '../../services';
import { errorHandler } from '../../utils/errorHandler';
import DZTable from '../utils/DZTable.vue';
import Flag from '../utils/Flag.vue';

export default defineComponent({
	name: 'EventClansRanking',
	components: {
		DZTable,
		Flag
	},
	data() {
		return {
			rankings: [] as any[],
			page: 1 as number,
			pageSize: 50 as number
		};
	},
	props: {
		eventId: {
			type: String,
			required: true
		},
		pageLoaded: {
			type: Number,
			required: true
		},
		edition: {
			type: Number,
			required: false
		}
	},
	methods: {
		async getRanking(): Promise<void> {
			try {
				const response = await RankingService.getEventClansRanking(this.eventId, this.pageLoaded, this.edition);
				this.rankings = response.ranking;
				this.page = response.page;
				this.pageSize = response.pageSize;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		changePage(i: number) {
			this.$router.push({
				name: this.$route.name ?? '',
				params: { pageLoaded: this.page + i },
				query: {
					...this.$route.query
				}
			});
		},
		goToClan(id: number | undefined) {
			if (id) {
				this.$router.push({ name: 'Clan', params: { id } });
			}
		}
	},
	mounted() {
		this.page = this.pageLoaded;
		this.getRanking();
	},
	watch: {
		pageLoaded(val) {
			this.page = val;
			this.getRanking();
		},
		edition() {
			this.getRanking();
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	position: relative;
}
.thPos {
	width: 5em;
}
.thClan {
	max-width: 150px;
}
.thPoints {
	max-width: 15px;
}
.tdPos {
	background-image: url('../../assets/background/table_cell.webp');
	background-position: 0px 0px;
	padding-left: 1.2em;
	cursor: pointer;
}
.tdOther {
	padding-left: 1em;
	background-image: url('../../assets/background/table_cell.webp');
	background-position: -10px 0px;
	max-width: 4px;
	cursor: pointer;
}
.select:hover {
	td {
		color: white;
		border-color: #9a4029;
	}
}
.hidden {
	display: none !important;
}
</style>
