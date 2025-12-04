<template>
	<DZDisclaimer content="ranking.disclaimer.classic" help v-if="sort === 'classic'" />
	<DZDisclaimer content="ranking.disclaimer.average" help v-if="sort === 'average'" />
	<div class="wrapper">
		<table>
			<tbody>
				<tr>
					<th class="pos">{{ $t('ranking.th.pos') }}</th>
					<th class="player">{{ $t('ranking.th.player') }}</th>
					<th class="dinoz">Dinoz</th>
					<th class="points">{{ $t('ranking.th.points') }}</th>
					<th class="points">{{ $t('ranking.th.average') }}</th>
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
					<td class="pos">
						{{ (page - 1) * 20 + (index + 1) }}
					</td>
					<td class="other">
						<DZUser :user="ranking.user" :me="ranking.user.id === me" :friend="false" />
					</td>
					<td class="other">
						{{ ranking.dinozCount }}
					</td>
					<td class="other">
						{{ ranking.points }}
					</td>
					<td class="other">
						{{ ranking.average }}
					</td>
				</tr>
				<UserCard v-if="seeUser && selectedUser" :userId="selectedUser" />
			</tbody>
			<!-- TODO : A CORRIGER TR/TD NE PEUT PAS ETRE EN DEHORS DE TBODY -->
			<tr class="select" @click="changePage(1)" :class="{ hidden: rankings.length < 20 }">
				<td class="pos" colspan="5" style="text-align: center">
					{{ $t('ranking.page.next') }}
				</td>
			</tr>
		</table>
	</div>
	<DZSearch background entityType="user" placeHolder="ranking.placeholder.searchUser" @entity="goToAccount" />
</template>

<script lang="ts">
import type { RankingGetResponses } from '@dinorpg/core/models/ranking/rankingGetResponse.js';

import { defineComponent, type PropType } from 'vue';
//import eventBus from '../../events/index.js';
import { RankingService } from '../../services';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import DZUser from '../utils/DZUser.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZSearch from '../utils/DZSearch.vue';
import UserCard from '../modal/UserCard.vue';

export default defineComponent({
	name: 'PlayerRanking',
	components: {
		DZSearch,
		DZDisclaimer,
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
			//EventBus.emit('isLoading', true);
			try {
				this.rankings = await RankingService.getRanking(this.sort, this.page);
				//EventBus.emit('isLoading', false);
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
	table {
		width: 100%;
		margin-top: 10px;
		margin-bottom: 5px;
		margin-bottom: 10px;
		border: 2px solid #f3d6b1;
		background-color: #ecbd84;
		border-collapse: separate;
		border-spacing: 1px;
		tr {
			display: table-row;
			th {
				font-size: 8pt;
				letter-spacing: 0pt;
				text-shadow: 1px 1px 0px #356847;
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
				height: 41px;
				vertical-align: bottom;
				color: #fffdba;
				text-transform: uppercase;
				font-weight: bold;
				letter-spacing: 1pt;
				text-align: left;
				white-space: nowrap;
				border: 1px solid #356847;
				background-color: #c64e36;
				background-image: url('../../assets/background/table_header.webp');
				background-position: left bottom;
				max-width: 222px;
				&.pos {
					width: 5em;
				}
				&.player {
					max-width: 150px;
				}
				&.dinoz {
					max-width: 15px;
				}
				&.points {
					max-width: 15px;
				}
			}
			td {
				font-size: 9pt;
				padding-right: 5px;
				padding-top: 1px;
				padding-bottom: 1px;
				color: #710;
				background-color: #f3ca92;
				border: 1px solid #c88f44;
				cursor: pointer;
				&.pos {
					background-image: url('../../assets/background/table_cell.webp');
					background-position: 0px 0px;
					padding-left: 1.2em;
				}
				&.other {
					padding-left: 1em;
					background-image: url('../../assets/background/table_cell.webp');
					background-position: -10px 0px;
					max-width: 4px;
				}
			}
			&.even {
				td.pos {
					background-image: url('../../assets/background/table_cell_even.webp');
					background-position: 0px 0px;
				}
				td.other {
					background-image: url('../../assets/background/table_cell_even.webp');
					background-position: -10px 0px;
				}
			}
			&.select:hover {
				td {
					color: white;
					border-color: #9a4029;
				}
			}
		}
	}
}
.hidden {
	display: none !important;
}
</style>
