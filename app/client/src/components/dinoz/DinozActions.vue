<template>
	<div class="actions">
		<Resurrect :enabled="resurrect" @close="resurrect = false" />
		<!--<NPCModal v-if="NPCModal" :text="NPCModal" :npcName="npcName" @close="continueMission()" />-->
		<div class="actions_top">
			<p>{{ $t('dinozPage.action') }}</p>
		</div>
		<div class="action_content">
			<template v-for="didi in dinozFullParty" :key="didi">
				<!--<MissionHUDVue
					v-if="didi.missionHUD && didi.missionId"
					:missionId="didi.missionId"
					:dinozName="didi.name"
					:dinozId="didi.id"
					@abort="endMission(didi.id)"
				/>-->
			</template>
			<!--<MissionRewardModal v-if="missionReward" :missionReward="missionReward" @close="validateMission()" />-->
			<Tippy tag="p" theme="small" class="follow" v-if="leaderDinoz" @click="goToLeader()">
				{{ $t('dinoz.hud.following') }}
				<template #content>
					{{ $t(`dinoz.hud.follow`, { leader: leaderDinoz.name }) }}
				</template>
			</Tippy>
			<!--
			<p class="follow" v-if="dinoz.tournament && dinoz.level >= dinoz.tournament.levelLimit">
				{{ $t('dinoz.hud.dojoTeam', { max: dinoz.tournament.levelLimit }) }}
			</p>-->
			<DZDisclaimer
				v-if="dinoz.state === DINOZ_STATE.unfreezing"
				:content="$t('dinoz.hud.unfreezeCountdown', { time: timeUntilMidnight })"
				help
			/>
			<DZDisclaimer
				v-if="dinoz.actions?.some(a => a.name === Action.STOP_REST) && !dinoz.rest?.maxed"
				:content="$t('dinoz.hud.resting', { hp: dinoz.rest?.regen ?? 1, min: restCountdown })"
				timer
			/>
			<DZDisclaimer
				v-if="dinoz.actions?.some(a => a.name === Action.STOP_REST) && !!dinoz.rest?.maxed"
				:content="$t('dinoz.hud.restEnd')"
				help
			/>
			<DZFollow v-if="dinoz.actions?.some(a => a.name === Action.FOLLOW)" :dinoz="dinozId"></DZFollow>
			<Tippy
				tag="div"
				theme="normal"
				class="action"
				v-for="action in dinoz.actions?.filter(a => a.name !== Action.FOLLOW)"
				:key="action"
				:id="action.imgName"
				@click="launch(action)"
			>
				<img :src="getImgURL('act', action.imgName)" :alt="action.imgName" />
				<p v-if="action.name === 'shop'">{{ $t(`shop.item.${getShopNameFromAction(action)}.name`) }}</p>
				<!--<p v-else-if="action.name === 'npc'">{{ $t(`npc.name.${npcDisplayName(+(action.prop ?? '0'))}`) }}</p>
				<p v-else-if="action.name === 'mission' && mission?.actionType === MissionEnum.FINISH_MISSION">
					{{ $t(`missions.actions.terminate`) }}
				</p>-->
				<!--<p v-else-if="action.name === 'mission'">{{ $t(`missions.npc.${action.prop}`) }}</p>-->
				<p v-else>
					{{ action.forDinoz ? `${dinoz.followers.find(f => f.id === action.forDinoz)?.name}: ` : '' }}
					{{ $t(`action.name.${action.name}`) }}
				</p>
				<template #content>
					<h1
						v-if="action.name === 'shop'"
						v-html="formatContent($t(`shop.item.${getShopNameFromAction(action)}.name`))"
					/>
					<!--<h1
						v-else-if="action.name === 'npc'"
						v-html="formatContent($t(`npc.name.${npcDisplayName(+(action.prop ?? '0'))}`))"
					/>
					<h1
						v-else-if="action.name === 'mission' && mission?.actionType === MissionEnum.FINISH_MISSION"
						v-html="formatContent($t(`missions.actions.terminate`))"
					/>
					<h1 v-else-if="action.name === 'mission'" v-html="formatContent($t(`missions.npc.${action.prop}`))" />-->
					<h1 v-else v-html="formatContent($t(`action.name.${action.name}`))" />

					<!-- DESCRIPTION ACTIONS -->
					<p
						v-if="action.name === 'shop'"
						v-html="formatContent($t(`shop.item.${getShopNameFromAction(action)}.description`))"
					/>
					<!--<p v-else-if="action.name === 'npc'" v-html="formatContent($t(`npc.description`))" />
					<p
						v-else-if="action.name === 'mission'"
						v-html="formatContent($t(`missions.tooltip`, { mission: $t(`missions.name.${missionName}`) }))"
					/>-->
					<p v-else v-html="formatContent($t(`action.description.${action.name}`))" />
				</template>
			</Tippy>
			<!--<DZDisclaimer timer v-if="isSelling()" class="selling" :content="$t('toast.isSelling')" />-->
		</div>
	</div>
</template>

<script lang="ts">
import { Action, type ActionFiche } from '@dinorpg/core/models/dinoz/dinozActions.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { DINOZ_STATE } from '@dinorpg/core/models/dinoz/dinozState.js';
import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
//import { ConditionEnum, RewardEnum } from '@dinorpg/core/models/enums/Parser.js';
//import { MissionHUD } from '@drpg/core/models/missions/missionHUD';
//import { npcList } from '@drpg/core/models/npc/NpcList';
//import type { Rewarder } from '@dinorpg/core/models/rewards/rewarder.js';
//import { orderDinozList, toSkillDetails } from '@drpg/core/utils/DinozUtils';
//import { getSpecialStat, SpecialStat } from '@drpg/core/utils/getSpecialStat';
import { defineComponent, type PropType } from 'vue';
import DZFollow from '../utils/DZFollow.vue';
//import MissionHUDVue from '../../components/dinoz/MissionHUD.vue';
//import MissionRewardModal from '../../components/modal/MissionRewardModal.vue';
//import NPCModal from '../../components/modal/NPCModal.vue';
import Resurrect from '../modal/ResurrectModal.vue';
//import { mixin } from '../../mixin/mixin.js';
import { FightService } from '../../services';
import { DinozService } from '../../services';
//import { MissionService } from '../../services/index.js';
import { dinozStore } from '../../store/dinozStore';
import { sessionStore } from '../../store/sessionStore';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import { GatherType } from '@dinorpg/core/models/enums/GatherType.js';
import { formatText } from '../../utils/formatText';
import eventBus from '../../events';
import { orderDinozList } from '@dinorpg/core/utils/dinozUtils.js';
import { itinerantShopNameList, shopNameList } from '../../constants/shop';
//import { DigResponse } from '@drpg/core/returnTypes/Dinoz';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			dinozId: this.dinoz.id,
			shopNameList: shopNameList,
			itinerantShopNameList: itinerantShopNameList,
			resurrect: false as boolean,
			//NPCModal: undefined as string | undefined,
			//npcName: undefined as string | undefined,
			//missionReward: undefined as Rewarder[] | undefined,
			sessionStore: sessionStore(),
			dinozStore: dinozStore(),
			//MissionEnum: ConditionEnum,
			//digRewards: undefined as DigResponse | undefined,
			Action,
			itinerantName: '' as string,
			dinozFullParty: [] as DinozFiche[],
			uStore: userStore(),
			timeUntilMidnight: '',
			restSecondsLeft: 0,
			intervals: [] as number[],
			DINOZ_STATE
			//mission: dinozStore().getDinozList.find(dinoz => dinoz.id.toString() === this.$route.params.id.toString())
			//	?.missionHUD
		};
	},
	components: {
		Resurrect,
		//MissionHUDVue,
		//NPCModal,
		//MissionRewardModal,
		DZDisclaimer,
		DZFollow
	},
	props: {
		dinoz: {
			type: Object as PropType<DinozFiche>,
			required: true
		},
		refreshDinoz: {
			type: Function as PropType<() => Promise<void>>,
			required: true
		}
	},
	methods: {
		/*computeTimeUntilMidnight() {
			const now = new Date();
			const nowMs = now.getTime();
			const midnightMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
			const timeRemainingMs = midnightMs - nowMs;
			const totalSeconds = Math.floor(timeRemainingMs / 1000);
			const safeSeconds = Math.max(0, totalSeconds);
			const hours = Math.floor(safeSeconds / 3600);
			const minutes = Math.floor((safeSeconds % 3600) / 60);
			const seconds = safeSeconds % 60;
			const h = hours.toString().padStart(2, '0');
			const m = minutes.toString().padStart(2, '0');
			const s = seconds.toString().padStart(2, '0');
			this.timeUntilMidnight = `${h}:${m}:${s}`;
		},*/
		updateRestCountdown() {
			if (this.dinoz.rest?.maxed) {
				this.restSecondsLeft = 0;
				return;
			}
			const nextIso = this.dinoz.rest?.next;
			if (!nextIso) {
				this.restSecondsLeft = 0;
				return;
			}
			const diff = Math.max(0, Math.floor((new Date(nextIso).getTime() - Date.now()) / 1000));
			this.restSecondsLeft = diff;
			// Quand on arrive à 0, on refresh pour appliquer le tick serveur
			if (diff === 0) {
				this.refreshDinoz();
			}
		},
		formatMMSS(totalSeconds: number) {
			const m = Math.floor(totalSeconds / 60)
				.toString()
				.padStart(2, '0');
			const s = (totalSeconds % 60).toString().padStart(2, '0');
			return `${m}:${s}`;
		},
		getShopNameFromAction(action: ActionFiche): string | undefined {
			if (typeof action.prop !== 'number') return undefined;
			return this.shopNameList[action.prop];
		},
		async launch(action: ActionFiche) {
			switch (action.name) {
				case Action.IRMA:
				case Action.IRMAS:
				case Action.ACTION:
					try {
						const toast = await DinozService.useIrma(this.dinozId);
						eventBus.emit('refreshInventory', true);
						if (toast.category === ItemEffect.ACTION && toast.value > 0) {
							const message = this.$t(`toast.${toast.category}`, { value: toast.value }, toast.value);
							this.$toast.open({
								message: formatText(message),
								type: 'info'
							});
						}
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					await this.refreshDinoz();
					break;
				case Action.LEVEL_UP:
					this.$router.push({
						name: 'Leveling',
						params: { id: this.dinozId.toString() }
					});
					break;
				case Action.SHOP:
					const name = this.getShopNameFromAction(action);
					if (!name) return;

					this.$router.push({
						name: 'ItemShopPage',
						params: { name }
					});
					break;
				case Action.ITINERANTSHOP:
					this.$router.push({
						name: 'ItinerantShopPage',
						params: { itinerantId: action.prop }
					});
					break;
				case Action.NPC:
					/*this.dinozStore.clearNpc(+this.$route.params.id);
					this.$router.push({
						name: 'NPC',
						params: { id: this.$route.params.id.toString(), npc: this.npcDisplayName(action.prop as number) }
					});*/
					break;
				case Action.FIGHT: {
					try {
						const fight = await FightService.processFight(this.dinozId);
						this.sessionStore.setFightResult(fight);

						this.$router.push({
							name: 'FightPage',
							params: { dinozId: this.dinozId.toString() }
						});
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				}
				case Action.RESURRECT:
					this.resurrect = true;
					break;
				case Action.MISSION:
					/*if (typeof this.dinoz.missionId !== 'number') {
						this.$toast.open({
							message: this.$t('toast.missingData'),
							type: 'error'
						});
						return;
					}
					if (this.mission && this.mission.actionType === ConditionEnum.FINISH_MISSION) {
						this.missionReward = await MissionService.finishMission(
							this.$route.params.id.toString(),
							this.dinoz.missionId
						);
					} else if (this.mission && this.mission.actionType === ConditionEnum.LAUNCH_FIGHT) {
						try {
							this.npcName = action.prop as string;
							const fight = await MissionService.startFightMission(
								this.$route.params.id.toString(),
								this.dinoz.missionId,
								action.prop as string
							);
							this.sessionStore.setFightResult(fight);
							this.$router.push({
								name: 'Fight',
								params: { dinozId: this.$route.params.id.toString() }
							});
						} catch (e) {
							errorHandler.handle(e, this.$toast);
						}
					} else {
						try {
							if (this.mission && 'npcName' in this.mission) {
								const npcName = this.mission.npcName;
								const dialog = await MissionService.interactMission(
									this.$route.params.id.toString(),
									this.dinoz.missionId,
									action.prop as string
								);
								this.$router.push({
									name: 'NPC',
									params: { id: this.$route.params.id.toString(), npc: npcName },
									query: { dialog: dialog }
								});
							} else {
								this.npcName = action.prop as string;
								this.NPCModal = await MissionService.interactMission(
									this.$route.params.id.toString(),
									this.dinoz.missionId,
									action.prop as string
								);
							}
						} catch (e) {
							errorHandler.handle(e, this.$toast);
						}
					}*/
					break;
				case Action.DIG:
					/*try {
						this.digRewards = await DinozService.dig(parseInt(this.$route.params.id.toString()));

						if (this.digRewards.fight) {
							this.sessionStore.setFightResult(this.digRewards.fight);
							this.$router.push({
								name: 'Fight',
								params: { dinozId: this.$route.params.id.toString() }
							});

							return;
						}

						for (const reward of this.digRewards.rewards) {
							if (reward.rewardType === RewardEnum.GOLD) {
								this.$toast.open({
									message: formatText(this.$t(`dig.gold`, { gold: reward.value })),
									type: 'reward'
								});
							} else if (reward.rewardType === RewardEnum.STATUS) {
								this.$toast.open({
									message: formatText(
										formatText(
											this.$t(`dig.status`, {
												item: mixin.methods.formatContent(this.$t(`status.name.${reward.value}`))
											})
										)
									),
									type: 'success'
								});
							} else if (reward.rewardType === RewardEnum.SCENARIO) {
								if (reward.value === 1 && reward.step === 5) {
									this.$toast.open({
										message: formatText(this.$t(`quest.dig_star_found`)),
										type: 'info'
									});
								}
							}
						}
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}*/
					await this.refreshDinoz();
					break;
				case Action.FISH:
				case Action.CUEILLE:
				case Action.ENERGY:
				case Action.SEEK:
				case Action.HUNT:
				case Action.XMAS:
				case GatherType.HUNT:
				case GatherType.SEEK:
				case GatherType.XMAS:
				case GatherType.TICTAC:
				case GatherType.LABO:
				case GatherType.ANNIV:
				case GatherType.PARTY:
				case Action.DAILY:
					this.$router.push({
						name: 'Gather',
						params: {
							dinozId: action.forDinoz ? action.forDinoz.toString() : this.dinozId.toString(),
							type: action.name
						}
					});
					break;
				case Action.CONCENTRATE:
					//await DinozService.cancelConcentration(parseInt(this.$route.params.id.toString()));
					await this.refreshDinoz();
					break;
				case Action.MARKET:
					/*this.$router.push({
						name: 'MarketPage',
						params: { tab: 0 }
					});*/
					break;
				case Action.FOLLOW: {
					if (!this.dinozStore.getDinozList) {
						this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
						return;
					}
					break;
				}
				case Action.UNFOLLOW: {
					try {
						await DinozService.unfollow(this.dinozId);
						// Refresh followed and following status
						const currentDinozList = this.dinozStore.getDinozList;
						if (!currentDinozList) {
							this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
							return;
						}
						const currentDinoz = currentDinozList.find(d => d.id === this.dinozId);
						if (!currentDinoz || !currentDinoz.leaderId) {
							this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
							return;
						}
						const leaderDinoz = currentDinozList.find(d => d.id === currentDinoz.leaderId);
						if (!leaderDinoz) {
							this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
							return;
						}
						// update relation
						currentDinoz.leaderId = null;
						const i = leaderDinoz.followers.findIndex(f => f.id === currentDinoz.id);
						if (i !== -1) leaderDinoz.followers.splice(i, 1);
						this.dinozStore.setDinozList(orderDinozList(currentDinozList));
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					await this.refreshDinoz();
					break;
				}
				case Action.DISBAND:
					try {
						await DinozService.disband(this.dinozId);
						let currentDinozList = this.dinozStore.getDinozList;
						if (!currentDinozList) {
							this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
							return;
						}
						const currentDinoz = currentDinozList.find(dinoz => dinoz.id === this.dinozId);
						if (!currentDinoz) {
							this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
							return;
						}
						const previousLeader = currentDinoz.id;
						const followingdinoz = currentDinozList
							.filter(dinoz => dinoz.leaderId === previousLeader && dinoz.id !== previousLeader)
							.map(d => d.id);
						currentDinozList = currentDinozList.map(dinoz => {
							if (dinoz.id === currentDinoz.id) {
								dinoz.followers = [];
							} else if (followingdinoz.includes(dinoz.id)) {
								dinoz.leaderId = null;
							}
							return dinoz;
						});
						this.dinozStore.setDinozList(orderDinozList(currentDinozList));
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.CHANGE_LEADER:
					try {
						const followerId = this.dinozId;
						const currentLeader = this.dinozStore.getDinozList.find(d => d.id === followerId)?.leaderId;
						if (!currentLeader) {
							this.$toast.open({ message: formatText(this.$t(`toast.noFollowers`)), type: 'error' });
							return;
						}
						await DinozService.changeLeader(followerId, currentLeader);
						const dinozList = this.dinozStore.getDinozList;
						if (!dinozList) {
							this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
							return;
						}
						this.dinozStore.setDinozList(orderDinozList(dinozList));
						this.$toast.open({ message: formatText(this.$t(`toast.leaderChanged`)), type: 'success' });
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.CONGEL:
					/*try {
						await DinozService.frozeDinoz(+this.$route.params.id);

						const currentDinozList = this.dinozStore.getDinozList;
						if (!currentDinozList) {
							this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
							return;
						}

						const currentDinoz = currentDinozList.findIndex(dinoz => dinoz.id === +this.$route.params.id);
						if (currentDinoz < 0) {
							this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
							return;
						}
						currentDinozList[currentDinoz].state = DINOZ_STATE.frozen;
						this.dinozStore.setDinozList(currentDinozList);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}*/
					break;
				case Action.STOP_CONGEL:
					/*try {
						await DinozService.unfrozeDinoz(+this.$route.params.id);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}*/
					break;
				case Action.REST:
					try {
						await DinozService.restDinoz(this.dinozId);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.STOP_REST:
					try {
						await DinozService.stopRestDinoz(this.dinozId);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.REINCARNATION:
					try {
						await DinozService.reincarnate(this.dinozId);
						await this.refreshDinoz();
						this.$toast.open({
							message: this.$t('toast.reincarnation'),
							type: 'info'
						});
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.FB_TOURNAMENT:
					/*this.$router.push({
						name: 'Forcebrute',
						query: { dinozId: +this.$route.params.id }
					});*/
					break;
				default:
					console.log(action.name);
					break;
			}
		} /*,
		continueMission() {
			this.NPCModal = undefined;
			this.$emit('continueMission');
		},
		endMission(dinozId: number) {
			this.missionReward = undefined;
			const dinozToUpdate = this.dinozStore.getDinoz(dinozId) as DinozFiche;
			dinozToUpdate.missionHUD = null;
			dinozToUpdate.missionId = undefined;
			this.dinozStore.setDinoz(dinozToUpdate);
			this.$emit('endMission');
		},
		async validateMission() {
			this.missionReward = undefined;
			await this.refreshDinoz();
			await this.$refreshGold();
		},
		npcDisplayName(npcId: number) {
			return Object.values(npcList).find(npc => npc.id === npcId)?.name;
		},
		isSelling() {
			const dinoz = this.dinozStore.getDinoz(+this.$route.params.id);
			if (!dinoz) return false;
			return dinoz.state === DINOZ_STATE.selling;
		},*/,
		goToLeader() {
			if (!this.leaderDinoz) return;
			this.$router.push({ name: 'DinozPage', params: { id: this.leaderDinoz.id } });
		},
		async loadComponent() {
			this.dinozFullParty = dinozStore().getDinozList.filter(dinoz =>
				this.dinoz?.followers.some(a => a.id === dinoz.id)
			);
			this.dinozFullParty.push(this.dinoz);
		}
	},
	computed: {
		/*missionName() {
			if (this.dinoz.missionId) {
				return missionsList[this.dinoz.missionId];
			}
			return undefined;
		},
		storeMission() {
			return dinozStore().getDinozList.find(dinoz => dinoz.id.toString() === this.$route.params.id)?.missionHUD || null;
		},*/
		leaderDinoz() {
			if (!this.dinoz.leaderId) return;
			return dinozStore().getDinoz(this.dinoz.leaderId);
		},
		restCountdown(): string {
			return this.formatMMSS(this.restSecondsLeft);
		}
	},
	watch: {
		/*storeMission: function (mission: MissionHUD) {
			this.mission = mission;
		},*/
		dinoz: {
			handler() {
				this.dinozId = this.dinoz.id;
				this.loadComponent();
				this.updateRestCountdown();
			},
			deep: false,
			immediate: true
		}
	},
	async mounted() {
		await this.loadComponent();
		//const intervalId = window.setInterval(() => this.computeTimeUntilMidnight(), 1000);
		const intervalId2 = window.setInterval(() => this.updateRestCountdown(), 1000);
		this.intervals.push(/*intervalId,*/ intervalId2);
	},
	unmounted() {
		this.intervals.forEach(clearInterval);
	}
});
</script>

<style lang="scss" scoped>
.follow {
	padding: 5px 5px 5px 20px;
	background-color: #bc683c;
	background-image: url('../../assets/icons/small_missAct.webp');
	background-position: 5px 8px;
	background-repeat: no-repeat;
	line-height: 10pt;
	overflow: hidden;
	cursor: pointer;
	font-style: italic;
	color: #fce3bc;
	font-size: 9pt;
	align-self: stretch;
}
.actions {
	background:
		url('../../assets/background/banniere_left.webp') no-repeat,
		url('../../assets/background/banniere_right.webp') no-repeat,
		url('../../assets/background/banniere_middle.webp') repeat-x;
	background-position-x: left, right, center;
	background-color: #d19860;
	background-size: auto;
	box-shadow: inset 0 0 1px 2px #d3a76a;
	border-style: hidden solid solid solid;
	border-width: 0 1px 1px 1px;
	border-color: #9f5841;
	min-height: 90px;
	max-width: 221px;
	color: white;
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	.action {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		margin-right: 5px;
		border-radius: 7px;
		font-size: 11pt;
		font-variant: small-caps;
		line-height: 10.5pt;
		font-weight: 700;
		width: 100%;
		& img {
			margin-left: 5px;
		}
		&:hover {
			background-color: #9a4029;
			cursor: pointer;
			img {
				outline: 1px solid white;
			}
		}
	}
	.actions_top {
		width: 185px;
		height: 28px;
		p {
			color: white;
			padding-left: 5px;
			font-size: 7.5pt;
			text-shadow: 0.5px 0 1px grey;
			text-transform: uppercase;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			font-weight: bold;
			margin-top: 2px;
		}
	}
	.action_content {
		margin-bottom: 5px;
		display: flex;
		flex-direction: column;
		align-items: baseline;
		gap: 2px;
		padding-left: 5px;
		padding-right: 5px;
	}
}
@media (max-width: 539px) {
	.actions {
		width: 95%;
		max-width: 100%;
		.action_content {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			flex-wrap: wrap;
			gap: 0.2rem;
			.action {
				width: 46%;
			}
			.follow {
				width: 100%;
			}
		}
	}
}
.selling {
	margin-right: 1px;
}
</style>
