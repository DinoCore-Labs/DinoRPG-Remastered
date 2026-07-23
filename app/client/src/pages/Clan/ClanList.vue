<template>
	<TitleHeader :title="$t('pageTitle.clansList')" :header="$t('clansList.title')"></TitleHeader>
	<DZDisclaimer help round :content="$t('clansList.disclaimer.text')" />

	<div class="wrapper">
		<ClanJoinRequest :joinRequest="joinRequest" @cancel="cancelRequest" />
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('clansList.th.name') }}</th>
					<th class="leader">{{ $t('clansList.th.leader') }}</th>
					<th class="members">{{ $t('clansList.th.members') }}</th>
					<th class="date">{{ $t('clansList.th.date') }}</th>
				</tr>
				<tr class="select" @click="changePage(-1)" v-if="page > 1">
					<td class="pos" colspan="5" style="text-align: center">
						{{ $t('ranking.page.previous') }}
					</td>
				</tr>
				<tr
					v-for="clan in clansList"
					:key="clan.id"
					class="select"
					:class="(clan.id + 1) % 2 === 0 ? 'even' : ''"
					@click="goToClan(clan.id)"
				>
					<td class="name">
						<Flag v-for="lang in clan.languages" :lang="lang.toLocaleLowerCase()" />
						{{ clan.name }}
					</td>
					<td class="leader other">
						{{ clan.leader?.name }}
					</td>
					<td class="members other">
						{{ clan.members.length }}
					</td>
					<td class="date other">
						{{ dateToString(clan.creationDate) }}
					</td>
				</tr>
				<tr class="select" @click="changePage(1)" :class="{ hidden: clansList.length < 20 }">
					<td class="pos" colspan="5" style="text-align: center">
						{{ $t('ranking.page.next') }}
					</td>
				</tr>
			</tbody>
		</table>
		<div class="bottom-elements">
			<DZSearch background entityType="clan" placeHolder="ranking.placeholder.searchClan" @entity="goToSearchedClan" />
			<a v-if="!alreadyHasClan" class="button bottom-element" @click="goToCreateClanPage()">
				{{ $t('clansList.button.create') }}</a
			>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { CLAN_CREATE_MONEY } from '@dinorpg/core/models/clan/constants.js';
import type { ClanLite } from '@dinorpg/core/models/clan/clan.js';
import type { JoinClanResponse } from '@dinorpg/core/models/clan/clanJoinRequest.js';
import axios from 'axios';
import DZDisclaimer from '../../components/utils/DZDisclaimer.vue';
import Flag from '../../components/utils/Flag.vue';
import DZSearch from '../../components/utils/DZSearch.vue';

import TitleHeader from '../../components/utils/TitleHeader.vue';
import { ClanService } from '../../services/clan.service.ts';
import { userStore } from '../../store/userStore.ts';
import { errorHandler } from '../../utils/errorHandler.ts';
import { formatNumber, formatText } from '../../utils/formatText';
import ClanJoinRequest from './ClanJoinRequest.vue';

export default defineComponent({
	name: 'ClansList',
	components: {
		Flag,
		DZDisclaimer,
		TitleHeader,
		ClanJoinRequest,
		DZSearch
	},
	data() {
		return {
			clansList: [] as ClanLite[],
			page: 1 as number,
			searchClanName: '' as string,
			joinRequest: null as JoinClanResponse | null,
			userStore: userStore(),
			alreadyHasClan: true as boolean,
			canCreateClan: false as boolean,
			creationCost: formatNumber(CLAN_CREATE_MONEY, '.'),
			cannotCreateText: formatText(
				this.$t('clansList.cannot_create_info', {
					money: formatNumber(CLAN_CREATE_MONEY, '.')
				})
			)
		};
	},
	methods: {
		goToClan(_id: number): void {
			this.$router.push({ name: 'Clan', params: { id: _id } });
		},
		dateToString(date: string | Date) {
			return new Date(date).toLocaleString('fr-FR', { timeZone: 'GMT' });
		},
		goToCreateClanPage() {
			this.$router.push({
				name: 'CreateClan'
			});
		},
		goToSearchedClan(c: { id: string; name: string }) {
			this.$router.push({ name: 'clan', params: { id: c.id } });
		},
		goToHelp() {
			this.$router.push({
				name: 'Help'
			});
		},
		async search() {
			this.page = 1;
			if (this.searchClanName != '') {
				await this.getClansListByName();
			} else {
				await this.getClansList();
			}
		},
		async changePage(n: number) {
			this.page += n;
			await this.getClansList();
		},
		async getClansList(): Promise<void> {
			try {
				this.clansList = await ClanService.getClansList(this.page);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async getClansListByName() {
			try {
				this.clansList = await ClanService.searchClansByName(this.searchClanName, this.page);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async getPlayerJoinRequest() {
			try {
				this.joinRequest = await ClanService.getSelfJoinRequest();
			} catch (err) {
				if (axios.isAxiosError(err) && err?.response?.status != 404) {
					errorHandler.handle(err, this.$toast);
				}
				return;
			}
		},
		async cancelRequest() {
			this.joinRequest = null;
		}
	},
	async created(): Promise<void> {
		await this.getClansList();
		await this.getPlayerJoinRequest();
		this.alreadyHasClan = this.userStore.clanId != undefined;
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	width: 95%;
	align-self: center;
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
				&.name {
					width: 40%;
				}
				&.leader {
					width: 20%;
				}
				&.members {
					width: 10%;
				}
				&.date {
					width: 30%;
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
				&.name {
					background-image: url('../../assets/background/table_cell.webp');
					background-position: 0px 0px;
					padding-left: 1.2em;
				}
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
				td.name {
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
	.bottom-elements {
		width: 100%;
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
		gap: 5px;
		.bottom-element {
			margin: auto 0;
		}
		.disabled {
			filter: grayscale(100%);
			&:hover {
				cursor: auto;
			}
		}
	}
}
input {
	width: 184px;
	height: 20px;
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 2px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	background-image: url('../../assets/background/form_field.webp');
	background-repeat: no-repeat;
	background-color: transparent;
}
.hidden {
	display: none !important;
}
</style>
