<template>
	<DZDisclaimer content="ranking.disclaimer.classic" help v-if="sort === 'classic'" />
	<DZDisclaimer content="ranking.disclaimer.average" help v-if="sort === 'average'" />
	<div class="wrapper">
		<DZTable>
			<tr>
				<th class="thPos">{{ $t('ranking.th.pos') }}</th>
				<th class="thPlayer">{{ $t('ranking.th.player') }}</th>
				<th class="thDinoz">Dinoz</th>
				<th class="thPoints">{{ $t('ranking.th.points') }}</th>
				<th class="thPoints">{{ $t('ranking.th.average') }}</th>
			</tr>
			<tr class="select" @click="changePage(-1)" v-if="page > 1">
				<td class="pos" colspan="5" style="text-align: center">
					{{ $t('ranking.page.previous') }}
				</td>
			</tr>
			<tr
				v-for="(ranking, index) in rankings"
				:key="ranking.user.id"
				class="select"
				:class="{
					even: (index + 1) % 2 === 0
				}"
				@click="selectedUser = ranking.user.id"
			>
				<td class="tdPos">
					{{ (page - 1) * 20 + (index + 1) }}
				</td>
				<td class="tdOther">
					<DZUser :user="ranking.user" :me="ranking.user.id === me" :friend="false" />
				</td>
				<td class="tdOther">
					{{ ranking.dinozCount }}
				</td>
				<td class="tdOther">
					{{ ranking.points }}
				</td>
				<td class="tdOther">
					{{ ranking.average }}
				</td>
			</tr>
			<UserCard v-if="seeUser && selectedUser" :userId="selectedUser" />
			<!-- TODO : A CORRIGER TR/TD NE PEUT PAS ETRE EN DEHORS DE TBODY -->
			<tr class="select" @click="changePage(1)" :class="{ hidden: rankings.length < 20 }">
				<td class="pos" colspan="5" style="text-align: center">
					{{ $t('ranking.page.next') }}
				</td>
			</tr>
		</DZTable>
	</div>
	<DZSearch background entityType="user" placeHolder="ranking.placeholder.searchUser" @entity="goToAccount" />
</template>

<script lang="ts">
import type { RankingGetResponses } from '@dinorpg/core/models/ranking/rankingGetResponse.js';

import { defineComponent, type PropType } from 'vue';
import { RankingService } from '../../services';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import DZUser from '../utils/DZUser.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZSearch from '../utils/DZSearch.vue';
import DZTable from '../utils/DZTable.vue';
import UserCard from '../modal/UserCard.vue';

export default defineComponent({
	name: 'PlayerRanking',
	components: {
		DZSearch,
		DZDisclaimer,
		DZTable,
		DZUser,
		UserCard
	},
	setup() {
		const uStore = userStore();
		return { uStore };
	},
	data() {
		return {
			rankings: [] as RankingGetResponses,
			page: 1 as number,
			me: userStore().id,
			seeUser: false,
			selectedUser: undefined as undefined | string
		};
	},
	props: {
		sort: {
			type: String as PropType<'classic' | 'average'>,
			required: true
		},
		pageLoaded: {
			type: Number,
			required: true
		}
	},
	methods: {
		leave() {
			this.seeUser = false;
		},
		goToAccount(user: { id: string; name: string }) {
			this.$router.push({ name: 'MyAccount', params: { id: user.id } });
		},
		async getRanking(): Promise<void> {
			try {
				this.rankings = await RankingService.getRanking(this.sort, this.page);
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
			if (to !== undefined && this.$route.name === 'RankingPlayers') {
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
.thPlayer {
	max-width: 150px;
}
.thDinoz {
	max-width: 15px;
}
.thPoints {
	max-width: 15px;
}
.tdPos {
	background-image: url('../../assets/background/table_cell.webp');
	background-position: 0px 0px;
	padding-left: 1.2em;
}
.tdOther {
	padding-left: 1em;
	background-image: url('../../assets/background/table_cell.webp');
	background-position: -10px 0px;
	max-width: 4px;
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
