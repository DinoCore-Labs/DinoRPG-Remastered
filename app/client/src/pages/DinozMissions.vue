<template>
	<TitleHeader :title="$t('pageTitle.dinozMissions')" :header="$t(`dinozMissions.title`)" />
	<DZDisclaimer content="dinozMissions.disclaimer" />
	<table>
		<tbody>
			<tr>
				<th class="dinoz">{{ $t('dinozMissions.dinoz') }}</th>
				<th class="missions">{{ $t('dinozMissions.missions') }}</th>
				<th class="see" />
			</tr>
			<!--<tr v-for="dinoz in dinozMissionsWithRewards" :key="dinoz.id">
				<td class="dinoz">{{ dinoz.name }}</td>
				<td class="missions">
					<ul>
						<Tippy tag="li" theme="normal" v-for="mission in dinoz.missions" :key="mission.npc">
							<img :src="getImgURL('design', 'info_button')" alt="info_button" />
							<span>
								{{ mission.missions.length }}/{{
									npcMissions.find(npc => npc.name === mission.npc)?.missions?.length ?? 0
								}}
								{{ $t(`npc.name.${mission.npc}`) }}
							</span>
							<template #content>
								<h1 v-html="formatContent($t('dinozMissions.missionsFrom', { npc: mission.npc }))"></h1>
								<ul class="missions-summary">
									<li v-for="innerMission in mission.missions" :key="innerMission.id">
										<span class="center">
											<img :src="getImgURL('design', 'info_button')" alt="info_button" />
											<span>{{ $t(`missions.name.${innerMission.name}`) }}</span>
										</span>
										<table v-if="innerMission.rewards">
											<tbody>
												<tr>
													<td v-if="innerMission.xp">
														<div class="center">
															<span class="xp">{{ innerMission.xp }}</span>
															<img :src="getImgURL('icons', 'small_xp')" alt="xp" />
														</div>
													</td>
													<td v-if="innerMission.gold">
														<div class="center">
															<span class="gold">{{ innerMission.gold }}</span>
															<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
														</div>
													</td>
													<td v-if="innerMission.items.length">
														<div class="center" v-for="item in innerMission.items" :key="item.value">
															<span class="item">{{ item.quantity }}</span>
															<img
																:src="getImgURL('item', `item_${itemNameList[item.value]}`)"
																:alt="itemNameList[item.value]"
															/>
														</div>
													</td>
												</tr>
											</tbody>
										</table>
									</li>
								</ul>
							</template>
						</Tippy>
						<li>
							<img :src="getImgURL('design', 'info_button')" alt="info_button" />
							<span>
								{{ $t('dinozMissions.total') }}
								<span class="total">
									{{ dinoz.missions.reduce((acc, mission) => acc + mission.missions.length, 0) }}/{{ totalMissions }}
								</span>
							</span>
						</li>
					</ul>
				</td>
				<td class="see">
					<router-link :to="{ name: 'DinozPage', params: { id: dinoz.id } }" class="see-button">
						{{ $t('dinozMissions.see') }}
					</router-link>
				</td>
			</tr>-->
		</tbody>
	</table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
//import { playerStore } from '../store/index.js';
//import { MissionsPageData } from '@drpg/core/returnTypes/Dinoz';
//import { MissionService } from '../services/MissionService.js';
//import { npcMissions } from '@drpg/core/models/npc/NpcMissions';
//import { RewardEnum } from '@drpg/core/models/enums/Parser';
//import { itemNameList } from '@drpg/core/models/item/ItemNameList';
//import { errorHandler } from '../utils/errorHandler.js';
//import { formatText } from '../utils/formatText.js';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';

export default defineComponent({
	name: 'DinozMissions',
	components: {
		DZDisclaimer,
		TitleHeader
	},
	data() {
		return {
			//playerStore: playerStore(),
			//data: [] as MissionsPageData,
			//npcMissions,
			//totalMissions: npcMissions.reduce((acc, npc) => acc + (npc.missions?.length || 0), 0),
			//RewardEnum,
			//itemNameList
		};
	},
	computed: {
		/*dinozMissionsWithRewards() {
			return this.data.map(dinoz => ({
				...dinoz,
				missions: dinoz.missions.map(mission => ({
					...mission,
					missions: mission.missions.map(innerMission => {
						const rewards =
							this.npcMissions
								.find(npc => npc.name === mission.npc)
								?.missions?.find(m => m.missionId === innerMission.id)?.rewards || [];
						const xp = rewards.find(r => r.rewardType === this.RewardEnum.EXPERIENCE);
						const gold = rewards.find(r => r.rewardType === this.RewardEnum.GOLD);
						const items = rewards.filter(r => r.rewardType === this.RewardEnum.ITEM);
						return {
							...innerMission,
							rewards,
							xp: xp ? ('value' in xp ? xp.value : 0) : 0,
							gold: gold ? ('value' in gold ? gold.value : 0) : 0,
							items
						};
					})
				}))
			}));
		}
	},
	async mounted(): Promise<void> {
		// Redirect to last page if no PDA
		if (!this.playerStore.playerOptions.hasPMI) {
			this.$toast.open({
				message: formatText(this.$t(`toast.noPMI`)),
				type: 'error'
			});
			this.$router.back();
			return;
		}

		// Fetch data
		try {
			this.data = await MissionService.getGlobalMissions();
		} catch (error) {
			errorHandler.handle(error, this.$toast);
			return;
		}*/
	}
});
</script>

<style lang="scss" scoped>
.disclaimer {
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
}

table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;

	tr {
		display: table-row;
		cursor: help;

		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
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
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;

			&.dinoz {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
			}

			&.missions {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
			}
		}

		td {
			font-size: 16px;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;

			&.dinoz {
				padding: 1px 5px;
				font-variant: small-caps;
			}

			&.missions {
				font-size: 9pt;
				padding: 1px 5px;
				font-weight: bold;

				ul {
					list-style-type: none;
					background-color: #f4d9a8;
					border-radius: 5px;
					margin: 4px 8px;
					padding: 4px 8px;

					img {
						padding-right: 8px;
						padding-left: 4px;
					}

					.total {
						color: #ea0000;
					}
				}
			}

			.see-button {
				margin-left: 8px;
				border-color: #c85d3f;
				border-style: double;
				background-color: #c85d3f;
				color: #f3ca92;
				background-clip: padding-box;
				font-variant: small-caps;
				font-size: 9pt;
				padding: 0px 4px;
				text-decoration: none;

				&:hover {
					background-color: #f3ca92;
					color: #c85d3f;
				}
			}
		}
	}
}

.missions-summary {
	list-style-type: none;
	color: white;
	margin-left: 4px;

	li {
		img {
			width: 7px;
			margin-right: 8px;
			margin-left: 4px;
		}

		span {
			font-size: 9pt;
		}

		table {
			width: auto;
			margin: 2px 0;
			margin-left: 18px;

			td {
				padding: 0px 2px;

				img {
					width: 8px;
				}

				.item + img {
					width: 24px;
				}
			}
		}
	}
}
</style>
