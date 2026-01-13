<template class="twinoid-goals">
	<div class="profil">
		<img class="headProfil" :src="getImgURL('background', 'ugoals_crown')" alt="info_button" />
		<h3>
			<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
			{{ $t(`accountPage.goals.title`) }}
			<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
		</h3>
		<div class="userGoals">
			<!--<div class="userGoals_points">{{ achievementsPoints + ' ' + $t(`account.goals.points`) }}</div>
			<div class="userGoals_top" v-if="topStats.length > 0">
				<template v-for="(stat, index) in topStats" :key="index">
					<div class="top_goals">
						<div class="top_countWrapper">
							<span class="top_points">{{ stat.quantity }}</span>
						</div>
						<div class="top_desc">
							<span
								><img class="achievements" :src="getImgURL('achievements', `${stat.stat}`)" alt="achievements"
							/></span>
							<p v-if="isLastAchievement(stat)" style="color: #ffee92">
								{{ getStatDetails(stat, 'name') }}
							</p>
							<p v-else>
								{{ getStatDetails(stat, 'name') }}
							</p>
						</div>
					</div>
				</template>
			</div>
			<div class="userGoals_top" v-else>
				<div class="top_goals">
					<div class="top_countWrapper">
						<span class="top_points">...</span>
					</div>
					<div class="top_desc">
						<span></span>
						<p></p>
					</div>
				</div>
				<div class="top_goals">
					<div class="top_countWrapper">
						<span class="top_points">...</span>
					</div>
					<div class="top_desc">
						<span></span>
						<p></p>
					</div>
				</div>
				<div class="top_goals">
					<div class="top_countWrapper">
						<span class="top_points">...</span>
					</div>
					<div class="top_desc">
						<span></span>
						<p></p>
					</div>
				</div>
			</div>-->
			<div class="userGoals_list">
				<a id="statsLink" :class="tab === 1 ? 'active-link' : ''" @click="tab = 1">{{
					$t('accountPage.goals.linkStats')
				}}</a>
				<a id="gainsLink" :class="tab === 2 ? 'active-link' : ''" @click="tab = 2">{{
					$t('accountPage.goals.linkGains')
				}}</a>
				<!--<div style="width: 100%" class="cadrelist_goals drpg-scrollbar">
					<table style="width: 100%" class="list_goals" v-if="tab === 1">
						<tbody>
							<Tippy theme="small" tag="tr" class="list" v-for="(stats, index) in accountStats" :key="index">
								<td class="icon">
									<img class="achievements" :src="getImgURL('achievements', `${stats.stat}`)" alt="achievements" />
								</td>
								<td v-if="isLastAchievement(stats)" style="color: #ffee92" class="name">
									{{ getStatDetails(stats, 'name') }}
								</td>
								<td v-else class="name">
									{{ getStatDetails(stats, 'name') }}
								</td>
								<td class="x">X</td>
								<td class="numb">{{ stats.quantity }}</td>
								<template #content>
									<p>{{ getStatDetails(stats, 'description') }}</p>
								</template>
							</Tippy>
						</tbody>
					</table>
					<template v-if="tab === 2">
						<ul style="width: 100%" class="list_gains" v-for="(stats, index) in accountStats" :key="index">
							<Tippy theme="small" tag="li" style="color: #ffee92">
								<img class="achievements" :src="getImgURL('achievements', `${stats.stat}`)" alt="achievements" />
								{{ getStatDetails(stats, 'name') }}
								<template #content>
									<p>
										{{ getStatDetails(stats, 'description') }}
									</p>
								</template>
							</Tippy>
							<template v-if="isUnlock(stats)">
								<Tippy theme="small" tag="li" v-for="won in getRewards(stats)" :key="won" class="name">
									{{ won.title?.[language] }}
									<template #content>
										<p>
											{{ $t(`achievements.reward`, { name: getStatDetails(stats, 'name'), quantity: won.count }) }}
										</p>
									</template>
								</Tippy>
							</template>
						</ul>
					</template>
				</div>-->
			</div>
			<template class="userGoals_help">
				<Tippy theme="small" tag="a">
					<a
						><u>{{ $t(`accountPage.goals.help.question`) }}</u></a
					>
					<template #content>
						<p v-html="formatContent($t(`accountPage.goals.help.response`))" />
						<p></p>
					</template>
				</Tippy>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
//import { PlayerStats } from '@drpg/core/models/player/PlayerStats';
import { defineComponent } from 'vue';
//import { localStore } from '../../store/index.js';
//import { Unlock } from '@drpg/core/models/goals/GoalsType';
//import { getGoal, getUnlockedGoals } from '@drpg/core/utils/twinoidGoals';

export default defineComponent({
	name: 'TwinoidGoals',
	data() {
		return {
			//topStats: [] as PlayerStats[],
			//language: localStore().getLanguage ?? 'fr',
			achievementsPoints: 0 as number,
			tab: 1 as number
			//wonRewards: [] as { stat: string; unlock: Unlock }[]
		};
	}
	/*props: {
		accountStats: {
			type: Object as PropType<PlayerStats[]>,
			required: true
		}
	},
	methods: {
		getTopStats(): void {
			const sortedStats = [...this.accountStats];
			sortedStats.sort((a, b) => b.quantity - a.quantity);
			this.topStats = sortedStats.slice(0, 3);
		},
		isLastAchievement(stat: PlayerStats): boolean {
			const last = getGoal(stat.stat).unlocks[getGoal(stat.stat).unlocks.length - 1];
			return (last?.count ?? 0) <= stat.quantity;
		},
		getStatDetails(stat: PlayerStats, detail: string) {
			const goal = getGoal(stat.stat);
			switch (detail) {
				case 'name':
					return goal.name[this.language];
				case 'description':
					if (goal.description) {
						return goal.description[this.language];
					} else {
						return;
					}
				case 'points':
					if (goal.description) {
						return goal.description[this.language];
					} else {
						return;
					}
				default:
					break;
			}
		},
		getRewards(stat: PlayerStats): Unlock[] {
			return this.wonRewards
				.filter(r => r.stat === stat.stat)
				.map(a => {
					return a.unlock;
				});
		},
		isUnlock(stat: PlayerStats): boolean {
			return this.wonRewards.find(r => r.stat === stat.stat) !== undefined;
		},
		updateStats() {
			this.getTopStats();
			this.achievementsPoints = this.accountStats
				.map(stat => {
					return getUnlockedGoals(stat)
						.map(a => {
							if (a.title) this.wonRewards.push({ unlock: a, stat: stat.stat });
							return a.points;
						})
						.reduce((total, a) => {
							return total + a;
						}, 0);
				})
				.reduce((total, a) => {
					return total + a;
				}, 0);
		}
	},
	watch: {
		accountStats: {
			handler() {
				this.updateStats();
			},
			deep: true,
			immediate: true
		}
	}*/
});
</script>

<style lang="scss" scoped>
.profil {
	background:
		url('../../assets/background/info_header.webp') no-repeat,
		url('../../assets/background/info_footer.webp') no-repeat,
		url('../../assets/background/info_center.webp') repeat-y;
	background-position-y: top, bottom;
	height: auto;
	width: 305px;
	display: flex;
	flex-direction: column;
	align-items: center;
	.headProfil {
		flex-shrink: 0;
		width: 125px;
		position: relative;
		top: -15px;
	}
	h3 {
		display: flex;
		justify-content: space-evenly;
		padding-top: 3px;
		font-family: Arial, sans-serif;
		font-size: 10pt;
		font-style: normal;
		font-variant-caps: small-caps;
		font-weight: 400;
		text-align: center;
		color: #ffee92;
		text-shadow: 1px 1px 1px #383522;
		position: relative;
		top: -16px;
		gap: 5px;
		img {
			height: 7px;
			width: 7px;
			padding-top: 5px;
		}
	}
	.userGoals {
		&_points {
			color: #ffee92;
			font-size: x-large;
			margin-top: 10px;
			margin-bottom: 15px;
			text-align: center;
			position: relative;
			top: -12px;
		}
		&_top {
			color: #ffee92;
			display: flex;
			font-size: 10pt;
			justify-content: space-evenly;
			margin-bottom: 15px;
			.top_goals {
				background-color: #9a4029;
				border: 3px solid #ffee92;
				position: relative;
				height: 92px;
				width: 85px;
				z-index: 0;
				.top_countWrapper {
					font-size-adjust: none;
					text-align: center;
					background-color: #9a4029;
					border: 3px solid #ffee92;
					z-index: 1;
					width: 66px;
					position: absolute;
					top: -10px;
					left: 7px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				.top_desc {
					color: #fce3bb;
					display: flex;
					flex-direction: column;
					text-align: center;
					padding-top: 18px;
				}
			}
		}
		&_list {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			justify-content: flex-end;
			padding-left: 5px;
			padding-right: 5px;
			& a {
				align-items: center;
				color: #ffee92;
				cursor: pointer;
				margin-right: 5px;
			}
			.cadrelist_goals {
				background-color: #9a4029;
				border: 1px solid #ffee92;
				padding-right: 20px;
				height: 300px;
				overflow-y: scroll;
				display: inline-block;
				padding: 5px 5px;
				&::-webkit-scrollbar {
					width: 7px;
				}
				&::-webkit-scrollbar-thumb {
					background-color: #fce3bb;
					border-radius: 4px;
				}
				scrollbar-width: thin;
				scrollbar-color: #fce3bb #9a4029;
				.list_goals {
					.list {
						.icon {
							width: 20px;
						}
						.name {
							color: #fce3bb;
							min-width: 182px;
						}
						.x {
							color: #fce3bb;
							width: 12px;
						}
						.numb {
							color: #fce3bb;
							width: 50px;
						}
					}
				}
				.list_gains {
					list-style: none;
					.icon {
						width: 20px;
					}
					.name {
						color: #fce3bb;
						min-width: 200px;
						margin-left: 20px;
					}
					.x {
						color: #fce3bb;
						width: 12px;
					}
					.numb {
						color: #fce3bb;
						width: 50px;
					}
				}
			}
		}
		&_help {
			display: flex;
			justify-content: flex-end;
			padding-right: 12px;
			margin-top: 10px;
			padding-bottom: 7px;
			& a {
				color: #ffee92;
				cursor: pointer;
			}
		}
	}
	.active-link {
		color: #ffee92;
		background-color: #9a4029;
		border-radius: 3px;
		padding: 3px;
	}
	.achievements {
		height: 14px;
		width: 14px;
	}
}
</style>
