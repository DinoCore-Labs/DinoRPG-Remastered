<template>
	<DZDisclaimer content="ranking.disclaimer.clan" />

	<div class="wrapper">
		<DZTable>
			<tr>
				<th class="thPos">{{ $t('ranking.th.pos') }}</th>
				<th class="thClan">{{ $t('ranking.th.clans') }}</th>
				<th class="thPoints">{{ $t('ranking.th.points') }}</th>
			</tr>
			<tr class="select" @click="changePage(-1)" v-if="page > 1">
				<td class="pos" colspan="5" style="text-align: center">
					{{ $t('ranking.page.previous') }}
				</td>
			</tr>
			<tr
				v-for="(ranking, index) in rankings"
				:key="ranking.clan.id"
				class="select"
				:class="(ranking.clan.id + 1) % 2 === 0 ? 'even' : ''"
				@click="goToClan(ranking.clan.id)"
			>
				<td class="tdPos">
					{{ (page - 1) * 20 + (index + 1) }}
				</td>
				<td class="tdOther">
					<Flag v-for="lang in ranking.clan?.languages" :key="lang" :lang="lang.toLocaleLowerCase()" />
					{{ ranking.clan.name }}
				</td>
				<td class="tdOther">
					{{ ranking.totalPoints }}
				</td>
			</tr>
			<!-- TODO : A CORRIGER TR/TD NE PEUT PAS ETRE EN DEHORS DE TBODY -->
			<tr class="select" @click="changePage(1)" :class="{ hidden: rankings.length < 20 }">
				<td class="tdPos" colspan="5" style="text-align: center">
					{{ $t('ranking.page.next') }}
				</td>
			</tr>
		</DZTable>
	</div>
	<DZSearch background entityType="clan" placeHolder="ranking.placeholder.searchClan" @entity="goToSearchedClan" />
</template>

<script lang="ts">
import type { ClanRankingGetResponses } from '@dinorpg/core/models/ranking/rankingGetResponse.js';

import { defineComponent } from 'vue';
import { RankingService } from '../../services';
import { errorHandler } from '../../utils/errorHandler';
import DZUser from '../utils/DZUser.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZSearch from '../utils/DZSearch.vue';
import DZTable from '../utils/DZTable.vue';
import UserCard from '../modal/UserCard.vue';
import Flag from '../utils/Flag.vue';

export default defineComponent({
	name: 'PlayerRanking',
	components: {
		DZSearch,
		DZDisclaimer,
		DZTable,
		DZUser,
		UserCard,
		Flag
	},
	data() {
		return {
			rankings: [] as ClanRankingGetResponses,
			page: 1 as number,
			seeUser: false,
			selectedUser: undefined as undefined | number
		};
	},
	props: {
		pageLoaded: {
			type: Number,
			required: true
		}
	},
	methods: {
		leave() {
			this.seeUser = false;
		},
		goToSearchedClan(c: { id: string; name: string }) {
			this.$router.push({ name: 'clan', params: { id: c.id } });
		},
		goToClan(_id: number): void {
			this.$router.push({ name: 'Clan', params: { id: _id } });
		},
		async getRanking(): Promise<void> {
			try {
				this.rankings = await RankingService.getClanRanking('clanScore', this.page);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		changePage(i: number) {
			this.$router.push({ name: this.$route.name ?? '', params: { pageLoaded: (this.page += i) } });
		}
	},
	async created(): Promise<void> {
		this.page = Number(this.$route.params.pageLoaded ?? 1);
		await this.getRanking();
	},
	watch: {
		sort: 'getRanking',
		'$route.params.pageLoaded': async function (to) {
			if (to !== undefined && this.$route.name === 'RankingClans') {
				this.page = Number(to ?? 1);
			}
		},
		page() {
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
