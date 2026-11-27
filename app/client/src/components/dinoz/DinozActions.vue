<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/dinoz/DinozActions.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2026-02-09 through 2026-08-04.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="actions">
		<MtDungeonMessageBox
			variant="notice"
			v-if="dungeonEntryMessage"
			:title="dungeonEntryMessage.title"
			:text="dungeonEntryMessage.text"
			confirm-label="Continuer"
			@confirm="dungeonEntryMessage = null"
			@close="dungeonEntryMessage = null"
		/>
		<Resurrect :enabled="resurrect" @close="resurrect = false" />
		<Reincarnate :enabled="reincarnate" :dinoz="dinoz" @close="reincarnate = false" />
		<MissionTalkModal
			v-if="missionTalkTextKey && missionTalkNameKey"
			:textKey="missionTalkTextKey"
			:nameKey="missionTalkNameKey"
			@close="closeMissionTalkModal"
		/>
		<div class="actions_top">
			<p>{{ $t('common.actions') }}</p>
		</div>
		<div class="action_content">
			<DZDisclaimer
				v-if="dinoz.state === DINOZ_STATE.clinic"
				:content="clinicNoticeKey"
				:params="clinicSecondsLeft !== null && clinicSecondsLeft > 0 ? { time: clinicCountdown } : {}"
				:timer="clinicSecondsLeft !== null && clinicSecondsLeft > 0"
				:help="clinicSecondsLeft === null || clinicSecondsLeft === 0"
			/>
			<DZDisclaimer v-if="dinozInDungeon" :content="$t('action.description.dungeon_status')" help />
			<template v-for="didi in dinozFullParty" :key="didi.id">
				<DinozMissionHUD
					v-if="!dinozInDungeon && didi.currentMission"
					:currentMission="didi.currentMission"
					:dinozName="didi.name"
					:dinozId="didi.id"
					@abort="endMission(didi.id)"
				/>
			</template>
			<MissionRewardModal
				v-if="missionReward"
				:missionNameKey="missionReward.missionNameKey"
				:textKey="missionReward.endKey"
				:rewards="missionReward.rewards"
				@close="closeMissionRewardModal"
			/>
			<Tippy tag="p" theme="small" class="follow" v-if="leaderDinoz && !dinozInDungeon" @click="goToLeader()">
				{{ $t('dinoz.hud.following') }}
				<template #content>
					{{ $t(`dinoz.hud.follow`, { leader: leaderDinoz.name }) }}
				</template>
			</Tippy>
			<p class="follow" v-if="dinoz.tournament" style="cursor: default">
				{{ $t('dinoz.hud.registeredTID') }}
			</p>
			<DZDisclaimer
				v-if="dinoz.state === DINOZ_STATE.unfreezing"
				:content="$t('dinoz.hud.unfreezeCountdown', { time: unfreezeCountdown })"
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
			<DZDisclaimer
				v-if="dinoz.actions?.some(a => a.name === Action.DEFENDING_DEVOURER)"
				:content="$t('dinoz.hud.defendingDevourer')"
			/>
			<DZFollow v-if="dinoz.actions?.some(a => a.name === Action.FOLLOW)" :dinoz="dinozId"></DZFollow>
			<template
				v-for="(action, index) in dinoz.actions?.filter(
					a => a.name !== Action.FOLLOW && a.name !== Action.DEFENDING_DEVOURER
				)"
				:key="(action.imgName || action.name) + '_' + index"
			>
				<!-- GROUP ACCORDION BUTTON & PANEL (for Leader or Follower) -->
				<template
					v-if="(action.name === Action.DISBAND && isLeader) || (action.name === Action.UNFOLLOW && isFollower)"
				>
					<div
						class="action group-toggle-action"
						:class="{ open: groupAccordionOpen }"
						@click="groupAccordionOpen = !groupAccordionOpen"
					>
						<img :src="getImgURL('act', 'act_leader')" alt="act_leader" />
						<p>{{ $t('common.group') }}</p>
					</div>
					<div v-show="groupAccordionOpen" class="group-panel">
						<!-- COMPANIONS IN GROUP (Leader only) -->
						<div v-if="isLeader && followerDinozList.length > 0" class="followers-grid">
							<div
								v-for="member in followerDinozList"
								:key="member.id"
								class="follower-card"
								:class="{ dead: member.life === 0 }"
								v-tippy="{ content: member.name, theme: 'small' }"
								@click="goToDinoz(member.id)"
							>
								<div class="mini-container">
									<DinozMini v-if="member.display" :display="member.display" :key="`${member.id}-${member.display}`" />
									<img
										v-if="canLevelUp(member)"
										class="lvlup-badge"
										:src="getImgURL('icons', 'small_lup')"
										alt="lvlup"
										v-tippy="{ content: $t('action.name.levelup'), theme: 'small' }"
									/>
									<img
										v-if="canLevelUp(member)"
										class="lvlup-badge"
										:src="getImgURL('icons', 'small_lup')"
										alt="lvlup"
										v-tippy="{ content: $t('action.name.levelup'), theme: 'small' }"
									/>
								</div>
								<div class="bars">
									<div class="bar-wrapper">
										<div class="bar-fill-pv" :style="{ width: `${getBarPercent(member.life, member.maxLife)}%` }"></div>
										<span class="bar-text">{{ member.life ?? 0 }}/{{ member.maxLife ?? 100 }}</span>
									</div>
									<div class="bar-wrapper">
										<div
											class="bar-fill-xp"
											:style="{ width: `${getBarPercent(member.experience, member.maxExperience)}%` }"
										></div>
										<span class="bar-text">{{ member.experience ?? 0 }}/{{ member.maxExperience ?? 100 }}</span>
									</div>
								</div>
							</div>
						</div>

						<!-- LEADER ACTION (Dissoudre le groupe) -->
						<template v-if="action.name === Action.DISBAND">
							<Tippy tag="div" theme="normal" class="action group-sub-action" @click="launch(action)">
								<img :src="getImgURL('act', action.imgName)" :alt="action.imgName" />
								<p>{{ $t(`action.name.${action.name}`) }}</p>
								<template #content>
									<h1 v-html="formatContent($t(`action.name.${action.name}`))" />
									<p v-html="formatContent($t(`action.description.${action.name}`))" />
								</template>
							</Tippy>
						</template>

						<!-- FOLLOWER ACTIONS (Devenir Leader & Ne plus suivre) -->
						<template v-else-if="action.name === Action.UNFOLLOW">
							<Tippy
								v-if="changeLeaderAction"
								tag="div"
								theme="normal"
								class="action group-sub-action"
								@click="launch(changeLeaderAction)"
							>
								<img :src="getImgURL('act', changeLeaderAction.imgName)" :alt="changeLeaderAction.imgName" />
								<p>{{ $t(`action.name.${changeLeaderAction.name}`) }}</p>
								<template #content>
									<h1 v-html="formatContent($t(`action.name.${changeLeaderAction.name}`))" />
									<p v-html="formatContent($t(`action.description.${changeLeaderAction.name}`))" />
								</template>
							</Tippy>
							<Tippy tag="div" theme="normal" class="action group-sub-action" @click="launch(action)">
								<img :src="getImgURL('act', action.imgName)" :alt="action.imgName" />
								<p>{{ $t(`action.name.${action.name}`) }}</p>
								<template #content>
									<h1 v-html="formatContent($t(`action.name.${action.name}`))" />
									<p v-html="formatContent($t(`action.description.${action.name}`))" />
								</template>
							</Tippy>
						</template>
					</div>
				</template>

				<!-- HIDE CHANGE_LEADER from top-level when follower (rendered inside group accordion) -->
				<template v-else-if="action.name === Action.CHANGE_LEADER && isFollower">
					<!-- Hidden: Rendered inside the UNFOLLOW group panel -->
				</template>

				<Tippy
					v-else
					tag="div"
					theme="normal"
					class="action"
					:class="{
						'long-text': isLongAction(action),
						'clan-action': action.name === Action.CLAN_ACTION,
						'disabled-action':
							action.name === Action.CLAN_ACTION &&
							(action.clanAction?.completed || !dinoz.fight || dinoz.state !== null || dinoz.life <= 0)
					}"
					:id="action.imgName"
					:data-tutorial-action="getTutorialActionKey(action)"
					@click="launch(action)"
				>
					<img :src="getImgURL('act', action.imgName)" :alt="action.imgName" />
					<p v-if="action.name === 'shop'">{{ $t(`shop.item.${getShopNameFromAction(action)}.name`) }}</p>
					<p v-else-if="action.name === Action.NPC">
						{{ getNpcActionName(action) }}
					</p>
					<p v-else-if="action.name === Action.MISSION">
						{{ getMissionActionName(action) }}
					</p>
					<p v-else-if="action.name === Action.CLAN_ACTION && action.clanAction" class="clan-action-label">
						{{ getActionLabel(action) }}
						<small>{{
							$t('action.clanAction.count', { progress: action.clanAction.progress, total: action.clanAction.total })
						}}</small>
					</p>
					<p v-else>
						{{ action.forDinoz ? `${dinoz.followers.find(f => f.id === action.forDinoz)?.name}: ` : '' }}
						{{ $t(`action.name.${action.name}`) }}
					</p>
					<template #content>
						<h1
							v-if="action.name === 'shop'"
							v-html="formatContent($t(`shop.item.${getShopNameFromAction(action)}.name`))"
						/>
						<h1 v-else-if="action.name === 'npc'">
							{{ getNpcActionName(action) }}
						</h1>
						<h1 v-else-if="action.name === Action.MISSION">
							{{ getMissionActionName(action) }}
						</h1>
						<h1 v-else-if="action.name === Action.CLAN_ACTION">{{ getActionLabel(action) }}</h1>
						<h1 v-else v-html="formatContent($t(`action.name.${action.name}`))" />
						<!-- DESCRIPTION ACTIONS -->
						<p
							v-if="action.name === 'shop'"
							v-html="formatContent($t(`shop.item.${getShopNameFromAction(action)}.description`))"
						/>
						<p v-else-if="action.name === Action.NPC" v-html="formatContent($t(`npc.description`))" />
						<p v-else-if="action.name === Action.MISSION" v-html="formatContent(getMissionActionDescription(action))" />
						<p v-else-if="action.name === Action.CLAN_ACTION && action.clanAction">
							{{
								$t('action.clanAction.description', {
									progress: action.clanAction.progress,
									total: action.clanAction.total
								})
							}}
						</p>
						<p v-else v-html="formatContent($t(`action.description.${action.name}`))" />
					</template>
				</Tippy>
			</template>
			<DZDisclaimer timer v-if="isSelling()" class="selling" :content="$t('toast.isSelling')" />
		</div>
	</div>
	<GatherRewardModal
		v-if="fastGatherOver && fastGatherResult"
		:rewards="fastGatherResult.rewards"
		:ingredientsAtMaxQuantity="fastGatherResult.ingredientsAtMaxQuantity"
		@close="closeFastGatherModal"
	/>
</template>

<script lang="ts">
import { Action, type ActionFiche } from '@dinorpg/core/models/dinoz/dinozActions.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { DINOZ_STATE } from '@dinorpg/core/models/dinoz/dinozState.js';
import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { defineComponent, type PropType } from 'vue';
import DZFollow from '../utils/DZFollow.vue';
import DinozMissionHUD from './DinozMissionHUD.vue';
import Resurrect from '../modal/ResurrectModal.vue';
import Reincarnate from '../modal/ReincarnateModal.vue';
import { FightService } from '../../services';
import { DinozService } from '../../services';
import { ClanService } from '../../services/clan.service.js';
import { dinozStore } from '../../store/dinozStore';
import { sessionStore } from '../../store/sessionStore';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import { GatherType } from '@dinorpg/core/models/enums/GatherType.js';
import { formatText } from '../../utils/formatText';
import { getClinicTreatmentCountdown } from '../../utils/clinicTreatmentCountdown';
import { getClinicNoticeKey } from '../../utils/clinicNotice';
import eventBus from '../../events';
import { orderDinozList } from '@dinorpg/core/utils/dinozUtils.js';
import { itinerantShopNameList, shopNameList } from '../../constants/shop';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { itemNameList } from '@dinorpg/core/models/items/itemNameList.js';
import MissionTalkModal from '../modal/MissionTalkModal.vue';
import { MissionService } from '../../services/mission.service';
import type {
	MissionInteractionRewardModal,
	MissionInteractionStartResponse
} from '@dinorpg/core/models/missions/missionInteraction.js';
import MissionRewardModal from '../modal/MissionRewardModal.vue';
import { GatherService } from '../../services/gather.service.js';
import { localStore } from '../../store/localStore.js';
import GatherRewardModal from '../modal/GatherRewardModal.vue';
import type { GatherResult } from '@dinorpg/core/models/gather/gatherResult.js';
import { DojoService } from '../../services/dojo.service.ts';
import { MtDungeonService } from '../../services/mtDungeon.service.js';
import MtDungeonMessageBox from '../dungeon/MtDungeonMessageBox.vue';
import DinozMini from './DinozMini.vue';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			dinozId: this.dinoz.id,
			shopNameList: shopNameList,
			itinerantShopNameList: itinerantShopNameList,
			resurrect: false as boolean,
			sessionStore: sessionStore(),
			dinozStore: dinozStore(),
			localStore: localStore(),
			Action,
			itinerantName: '' as string,
			uStore: userStore(),
			unfreezeSecondsLeft: 0,
			restSecondsLeft: 0,
			clinicSecondsLeft: null as number | null,
			clinicRefreshInFlight: false,
			clinicLastRefreshAt: 0,
			intervals: [] as number[],
			DINOZ_STATE,
			missionTalkTextKey: null as string | null,
			missionTalkNameKey: null as string | null,
			missionTalkDinozId: null as number | null,
			missionReward: null as MissionInteractionRewardModal | null,
			reincarnate: false as boolean,
			fastGatherOver: false,
			fastGatherResult: null as GatherResult | null,
			dungeonEntryMessage: null as { title: string; text: string } | null,
			clanActionBusy: false,
			groupAccordionOpen: false as boolean
		};
	},
	components: {
		Resurrect,
		DinozMissionHUD,
		MissionTalkModal,
		MissionRewardModal,
		DZDisclaimer,
		DZFollow,
		Reincarnate,
		GatherRewardModal,
		MtDungeonMessageBox,
		DinozMini
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
		updateUnfreezeCountdown() {
			if (this.dinoz.state !== DINOZ_STATE.unfreezing) {
				this.unfreezeSecondsLeft = 0;
				return;
			}
			const endIso = this.dinoz.stateTimer;
			if (!endIso) {
				this.unfreezeSecondsLeft = 0;
				return;
			}
			const diff = Math.max(0, Math.floor((new Date(endIso).getTime() - Date.now()) / 1000));
			this.unfreezeSecondsLeft = diff;
			if (diff === 0) {
				this.refreshDinoz();
			}
		},
		updateClinicCountdown() {
			const nowMs = Date.now();
			const countdown = getClinicTreatmentCountdown(
				this.dinoz.state === DINOZ_STATE.clinic,
				this.dinoz.clinic?.readyAt,
				nowMs
			);
			this.clinicSecondsLeft = countdown.secondsLeft;
			if (!countdown.shouldRefresh) {
				if (this.dinoz.state !== DINOZ_STATE.clinic) this.clinicLastRefreshAt = 0;
				return;
			}
			// Le temps écoulé ne prouve pas que le soin est terminé.
			// On réessaie côté serveur (max. une fois / 10 s) sans rafraîchissements parallèles.
			if (this.clinicRefreshInFlight || nowMs - this.clinicLastRefreshAt < 10_000) return;
			this.clinicLastRefreshAt = nowMs;
			this.clinicRefreshInFlight = true;
			void this.refreshDinoz()
				.catch(error => console.error('[clinic] Failed to refresh Dinoz clinic operation state', error))
				.finally(() => {
					this.clinicRefreshInFlight = false;
				});
		},
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
		formatHHMMSS(totalSeconds: number) {
			const h = Math.floor(totalSeconds / 3600)
				.toString()
				.padStart(2, '0');
			const m = Math.floor((totalSeconds % 3600) / 60)
				.toString()
				.padStart(2, '0');
			const s = (totalSeconds % 60).toString().padStart(2, '0');
			return `${h}:${m}:${s}`;
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
		translateI18nText(value?: string) {
			if (!value) return '';
			return this.$te(value) ? this.$t(value) : value;
		},
		getNpcActionName(action: ActionFiche) {
			const follower = action.forDinoz ? `${this.dinoz.followers?.find(f => f.id === action.forDinoz)?.name}: ` : '';
			let name = '';
			if (typeof action.label === 'string' && action.label.length > 0) {
				name = this.translateI18nText(action.label);
			} else if (typeof action.prop === 'string') {
				name = this.translateI18nText(action.prop);
			}
			return `${follower}${name}`;
		},
		getMissionActionName(action: ActionFiche) {
			const follower = action.forDinoz ? `${this.dinoz.followers?.find(f => f.id === action.forDinoz)?.name}: ` : '';
			let label = '';
			if (typeof action.label === 'string' && action.label.length > 0) {
				label = this.translateI18nText(action.label).toString();
			} else {
				label = this.$t('action.name.mission').toString();
			}
			return `${follower}${label}`;
		},
		getActionLabel(action: ActionFiche): string {
			if (action.name === Action.CLAN_ACTION && action.clanAction) {
				return this.$t(`action.clanAction.names.${action.clanAction.actionKey}`, {
					percentage: action.clanAction.percentage
				}).toString();
			}
			if (action.name === 'shop') {
				const shopName = this.getShopNameFromAction(action);
				return shopName ? this.$t(`shop.item.${shopName}.name`).toString() : '';
			}
			if (action.name === Action.NPC) {
				return this.getNpcActionName(action);
			}
			if (action.name === Action.MISSION) {
				return this.getMissionActionName(action);
			}
			const follower = action.forDinoz ? `${this.dinoz.followers?.find(f => f.id === action.forDinoz)?.name}: ` : '';
			return `${follower}${this.$t(`action.name.${action.name}`)}`;
		},
		isLongAction(action: ActionFiche): boolean {
			return this.getActionLabel(action).length >= 20;
		},
		getMissionActionDescription(action?: ActionFiche): string {
			const followerFiche = action?.forDinoz
				? (this.dinozStore.getDinoz(action.forDinoz) as DinozFiche | undefined)
				: null;
			const goal = followerFiche?.currentMission?.currentGoal ?? this.dinoz.currentMission?.currentGoal;
			if (!goal) {
				return this.$t('npc.description').toString();
			}
			switch (goal.type) {
				case 'TALK':
					if ('textKey' in goal && goal.textKey) {
						return this.$t(goal.textKey).toString();
					}
					return this.$t('npc.description').toString();
				case 'ACTION':
					return this.$t(goal.descriptionKey).toString();
				case 'FIGHT':
					return this.$t('missions.actions.fight').toString();
				case 'WAIT':
					return this.$t('action.description.wait').toString();
				case 'VALIDATE':
					return this.$t('missions.goals.validate', {
						nameKey: this.$t(goal.nameKey).toString()
					}).toString();
				default:
					return this.$t('npc.description').toString();
			}
		},
		closeMissionRewardModal() {
			this.missionReward = null;
		},
		getTutorialActionKey(action: ActionFiche): string | undefined {
			if (action.name !== Action.NPC || typeof action.prop !== 'string') {
				return undefined;
			}
			return `dialog:${action.prop}`;
		},
		async handleMissionInteractionResult(result: MissionInteractionStartResponse, dinozIdOverride?: number) {
			const targetDinozId = dinozIdOverride ?? this.dinozId;
			switch (result.mode) {
				case 'modal': {
					if (result.goalType === 'VALIDATE') {
						const completion = await MissionService.completeAction(targetDinozId);
						if (completion.rewardModal) {
							this.missionReward = completion.rewardModal;
						}
						await this.refreshDinoz();
						await this.$refreshGold();
						await this.$refreshTreasureTicket();
						return;
					}
					if (
						result.goalType === 'USE_ITEM' ||
						result.goalType === 'USE_MONEY' ||
						result.goalType === 'USE_INGREDIENT'
					) {
						const completion = await MissionService.completeAction(targetDinozId);
						await this.refreshDinoz();
						await this.$refreshGold();
						await this.$refreshTreasureTicket();
						eventBus.emit('refreshInventory', true);
						if (completion.rewardModal) {
							this.missionReward = completion.rewardModal;
							return;
						}
						if (!completion.completed) {
							const nextResult = await MissionService.startAction(targetDinozId, this.localStore.getAutoReequipItems);
							await this.handleMissionInteractionResult(nextResult, targetDinozId);
						}
						return;
					}
					this.missionTalkNameKey = result.nameKey;
					this.missionTalkTextKey = result.textKey ?? null;
					this.missionTalkDinozId = targetDinozId;
					return;
				}
				case 'dialog':
					this.$router.push({
						name: 'DialogPage',
						params: {
							id: targetDinozId.toString(),
							dialogId: result.dialogId
						},
						query: {
							...(targetDinozId !== this.dinozId ? { returnTo: this.dinozId.toString() } : {}),
							missionAction: '1',
							missionNameKey: result.nameKey,
							missionTextKey: result.textKey,
							missionGfx: result.gfx ?? '',
							missionBackground: result.background ?? '1',
							missionNpcNameKey: result.npcNameKey ?? ''
						}
					});
					return;
				case 'fight':
					this.sessionStore.setFightResult(result.fight);
					this.$router.push({
						name: 'FightPage',
						params: { dinozId: targetDinozId.toString() },
						query: targetDinozId !== this.dinozId ? { returnTo: this.dinozId.toString() } : undefined
					});
					return;
			}
		},
		async launch(action: ActionFiche) {
			if (action.name === Action.CLAN_ACTION) {
				if (!action.clanAction || action.clanAction.completed || this.clanActionBusy) return;
				if (!this.dinoz.fight || this.dinoz.state !== null || this.dinoz.life <= 0) {
					this.$toast.open({ message: this.$t('action.clanAction.noAction'), type: 'warning' });
					return;
				}
			}
			if (action.confirm) {
				const message = action.confirmMessageKey
					? this.$t(action.confirmMessageKey)
					: this.$t('action.popupConfirm', {
							action: this.$t(`action.name.${action.name}`)
						});
				const res = await this.$confirm({
					message,
					header:
						action.name === Action.DUNGEON_ENTER ? this.$t('action.name.dungeon_enter') : this.$t('popup.attention'),
					acceptLabel: this.$t('popup.accept'),
					rejectLabel: this.$t('popup.reject'),
					icon: 'pi pi-exclamation-triangle'
				});
				if (!res) return;
			}
			switch (action.name) {
				case Action.CLAN_ACTION: {
					const info = action.clanAction;
					if (!info || this.clanActionBusy) break;
					this.clanActionBusy = true;
					try {
						const result = await ClanService.contributeClanAction(info.clanId, info.actionKey, this.dinozId);
						this.$toast.success(
							this.$t(result.completed ? 'action.clanAction.finished' : 'action.clanAction.success', {
								remaining: result.remaining
							}).toString()
						);
						await this.refreshDinoz();
					} catch (error) {
						errorHandler.handle(error, this.$toast);
						await this.refreshDinoz();
					} finally {
						this.clanActionBusy = false;
					}
					break;
				}
				case Action.DUNGEON_ENTER:
					try {
						// Charger la phrase d'origine AVANT la création : une réponse vide ne doit pas créer une session silencieuse.
						const session = await MtDungeonService.startDungeon(this.dinozId);
						const dungeonId = session.mapId.split('_')[0];
						const definitions = await MtDungeonService.getCatalog(String(this.localStore.getLanguage ?? 'fr'));
						const definition = definitions.find(entry => entry.id === dungeonId);
						if (!definition) throw new Error('Donjon MT inconnu dans le catalogue.');
						await this.refreshDinoz();
						this.dungeonEntryMessage = { title: definition.name, text: definition.enter.text };
					} catch (error) {
						errorHandler.handle(error, this.$toast);
						await this.refreshDinoz();
					}
					break;
				case Action.DUNGEON:
					await this.$router.push({
						name: 'DungeonPage',
						params: {
							id: String(typeof action.prop === 'number' ? action.prop : (this.dinoz.leaderId ?? this.dinozId))
						}
					});
					break;
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
					if (this.dinoz?.tournament && this.dinoz.level >= this.dinoz.tournament.levelLimit) {
						this.$toast.error(this.$t('toast.tournamentMaxLevelLimitReached').toString());
						break;
					}
					this.$router.push({
						name: 'Leveling',
						params: { id: this.dinozId.toString() }
					});
					break;
				case Action.SHOP:
					const name = this.getShopNameFromAction(action);
					if (!name) return;
					this.$router.push({
						name: 'ShopItems',
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
					if (typeof action.prop !== 'string') return;
					this.$router.push({
						name: 'DialogPage',
						params: {
							id: (action.forDinoz ?? this.dinozId).toString(),
							dialogId: action.prop
						},
						query: {
							...(action.forDinoz ? { returnTo: this.dinozId.toString() } : {}),
							...(action.dialogPhaseId ? { phaseId: action.dialogPhaseId } : {})
						}
					});
					break;
				case Action.FIGHT: {
					try {
						const fight = await FightService.processFight(this.dinozId, this.localStore.getAutoReequipItems);
						this.sessionStore.setFightResult(fight);
						if (fight.autoReequipped && fight.autoReequipped.length > 0) {
							const itemsStr = fight.autoReequipped
								.map(item => `${item.count}x ${this.$t(`items.name.${itemNameList[item.itemId]}`)}`)
								.join(', ');
							this.$toast.success(formatText(this.$t('toast.autoReequipSuccess', { items: itemsStr })));
						}
						if (fight.missingReequip && fight.missingReequip.length > 0) {
							const itemsStr = fight.missingReequip
								.map(item => `${item.count}x ${this.$t(`items.name.${itemNameList[item.itemId]}`)}`)
								.join(', ');
							this.$toast.open({
								message: formatText(this.$t('toast.autoReequipMissing', { items: itemsStr })),
								type: 'warning'
							});
						}
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
					try {
						const targetDinozId = action.forDinoz ? Number(action.forDinoz) : this.dinozId;
						const result = await MissionService.startAction(targetDinozId, this.localStore.getAutoReequipItems);
						await this.handleMissionInteractionResult(result, targetDinozId);
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.DIG:
					try {
						const digResult = await DinozService.dig(this.dinozId);
						for (const reward of digResult.rewards) {
							switch (reward.type) {
								case 'gold':
									this.$toast.open({
										message: formatText(this.$t('dig.gold', { gold: reward.amount })),
										type: 'reward'
									});
									break;
								case 'status': {
									const statusKey = reward.statusId;
									this.$toast.open({
										message: formatText(
											this.$t('dig.status', {
												item: this.$t(`status.name.${statusKey}`)
											})
										),
										type: 'success'
									});
									break;
								}
								case 'item': {
									const item = itemList[reward.itemId as keyof typeof itemList];
									const itemName = item ? this.$t(`items.name.${item.name}`) : `#${reward.itemId}`;
									this.$toast.open({
										message: formatText(
											this.$t('dig.item', {
												item: itemName,
												quantity: reward.quantity
											})
										),
										type: 'success'
									});
									break;
								}
								case 'scenario':
									if (reward.messageKey) {
										this.$toast.open({
											message: this.$t(reward.messageKey),
											type: 'success'
										});
									}
									break;
							}
						}
						eventBus.emit('refreshInventory', true);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.FISH:
				case Action.CUEILLE:
				case Action.ENERGY:
				case Action.SEEK:
				case Action.HUNT:
				case Action.XMAS:
				case Action.TICTAC:
				case GatherType.LABO:
				case Action.ANNIV:
				case GatherType.PARTY:
				case Action.PARTY:
				case Action.DAILY:
					{
						const dId = action.forDinoz ? Number(action.forDinoz) : Number(this.dinozId);
						const gType = String(action.name);
						if (localStore().getBypassGatheringGrid) {
							await this.handleDirectGathering(dId, gType);
						} else {
							this.$router.push({
								name: 'Gather',
								params: {
									dinozId: dId.toString(),
									type: gType
								}
							});
						}
					}
					break;
				case Action.STOP_CONCEN:
					try {
						await DinozService.stopConcentration(this.dinozId);
						this.$toast.open({
							message: formatText(this.$t('toast.concentrationStopped')),
							type: 'success'
						});
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.ENTER_PORTAL:
					try {
						await DinozService.enterPortal(this.dinozId);
						this.$toast.open({
							message: formatText(this.$t('toast.darkPortalEntered')),
							type: 'success'
						});
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.TOWER_ATTACK:
					try {
						const res = await DinozService.devourerAttack(this.dinozId);
						if (res.fight) {
							this.sessionStore.setFightResult(res.fight);
							this.$router.push({
								name: 'FightPage',
								params: { dinozId: this.dinozId.toString() }
							});
						} else {
							this.$toast.open({
								message: formatText(this.$t('scenarios.devourer.texts.tower_won')),
								type: 'success'
							});
							eventBus.emit('refreshDevourerDefenders');
							await this.refreshDinoz();
						}
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.TOWER_DEFEND:
					try {
						const res = await DinozService.devourerAttack(this.dinozId);
						if (res.fight) {
							this.sessionStore.setFightResult(res.fight);
							this.$router.push({
								name: 'FightPage',
								params: { dinozId: this.dinozId.toString() }
							});
						} else {
							this.$toast.open({
								message: formatText(this.$t('scenarios.devourer.texts.tower_won')),
								type: 'success'
							});
							eventBus.emit('refreshDevourerDefenders');
							await this.refreshDinoz();
						}
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.STOP_DEFEND_TOWER:
					try {
						await DinozService.devourerDefendStop(this.dinozId);
						this.$toast.open({
							message: formatText(this.$t('scenarios.devourer.texts.stop_defend_tower')),
							type: 'success'
						});
						eventBus.emit('refreshDevourerDefenders');
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.MARKET:
					this.$router.push({
						name: 'MarketPage',
						params: { tab: 0 }
					});
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
						this.$toast.open({ message: formatText(this.$t(`toast.disband`)), type: 'success' });
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.CHANGE_LEADER:
					if (this.dinoz.life <= 0) {
						this.$toast.open({
							message: formatText(this.$t('toast.dinozGroupDead')),
							type: 'error'
						});
						return;
					}
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
					try {
						await DinozService.congel(this.dinozId);
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
						currentDinozList[currentDinoz].stateTimer = undefined;
						this.dinozStore.setDinozList(currentDinozList);
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
					break;
				case Action.STOP_CONGEL:
					try {
						const result = await DinozService.stopCongel(this.dinozId);
						this.dinoz.stateTimer = result.unfreezeAt ?? null;
						await this.refreshDinoz();
					} catch (e) {
						errorHandler.handle(e, this.$toast);
					}
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
					this.reincarnate = true;
					break;
				case Action.CEF:
					this.$router.push({
						name: 'TrainingCenterPage',
						params: {
							id: this.dinozId
						}
					});
					break;
				case Action.FB_TOURNAMENT:
					this.$router.push({
						name: 'ForcebrutPage',
						query: { dinozId: this.dinozId }
					});
					break;
				case Action.BUILD_DOJO:
					const res = await this.$confirm({
						message: this.$t('popup.dojoConfirmMessage'),
						acceptLabel: this.$t('popup.accept'),
						rejectLabel: this.$t('popup.reject'),
						icon: 'pi pi-exclamation-triangle'
					});
					if (res) {
						const dojo = await DojoService.buildDojo();
						userStore().setDojoId(dojo.dojoId);
						await this.$refreshGold();
						await this.refreshDinoz();
					}
					break;
				default:
					console.log(action.name);
					break;
			}
		},
		async handleDirectGathering(dinozId: number, gatherType: string): Promise<void> {
			try {
				const gridContext = await GatherService.getGatherGrid(dinozId, gatherType);

				if (!gridContext || !gridContext.grid || gridContext.gatherTurn <= 0) {
					this.$toast.open({
						message: this.$t('toast.gatherAlertError'),
						type: 'error'
					});
					return;
				}

				const clickedBox: number[][] = [];
				let availableTurns = gridContext.gatherTurn;

				for (let rowNum = 0; rowNum < gridContext.grid.length; rowNum++) {
					const row = gridContext.grid[rowNum];
					for (let colNum = 0; colNum < row.length; colNum++) {
						if (row[colNum] === 0) {
							clickedBox.push([rowNum, colNum]);
							availableTurns--;

							if (availableTurns === 0) {
								break;
							}
						}
					}
					if (availableTurns === 0) {
						break;
					}
				}

				const result = await GatherService.gatherWithDinoz(dinozId, gatherType, clickedBox);
				if (result && result.rewards) {
					this.fastGatherResult = result;
					this.fastGatherOver = true;

					await this.$refreshGold();
				}

				if (result?.isGridComplete) {
					const isDaily =
						gatherType?.toLowerCase() === 'daily' || result.rewards?.item?.some(item => item.id === Item.VOID_SPHERE);
					if (isDaily) {
						this.$toast.success(formatText(this.$t('toast.finishDailyGrid')));
					}
					if (result.gridCompletionGoldReward > 0) {
						this.$toast.success(formatText(this.$t('toast.finishGrid')));
					}
				}

				await this.refreshDinoz();
			} catch (e) {
				this.$toast.open({
					message: this.$t('toast.gatherAlertError'),
					type: 'error'
				});
			}
		},
		closeFastGatherModal() {
			this.fastGatherOver = false;
			this.fastGatherResult = null;
		},
		isSelling() {
			const dinoz = this.dinozStore.getDinoz(+this.$route.params.id);
			if (!dinoz) return false;
			return dinoz.state === DINOZ_STATE.selling;
		},
		goToLeader() {
			if (!this.leaderDinoz) return;
			this.$router.push({ name: 'DinozPage', params: { id: this.leaderDinoz.id } });
		},
		goToDinoz(dinozId: number) {
			this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
		},
		canLevelUp(dinoz: DinozFiche): boolean {
			return Boolean(dinoz.experience >= dinoz.maxExperience && dinoz.maxExperience > 0);
		},
		getBarPercent(actual?: number, max?: number): number {
			if (!actual || !max || max <= 0) return 0;
			const safeActual = Math.max(0, actual > max ? max : actual);
			return Math.round((safeActual / max) * 100);
		},
		getBarWidth(actual?: number, max?: number): string {
			if (!actual || !max || max <= 0) return 'width: 0px';
			const safeActual = actual > max ? max : actual;
			const width = Math.round((safeActual / max) * 36);
			return `width: ${width}px`;
		},
		async endMission(dinozId: number) {
			const dinozToUpdate = this.dinozStore.getDinoz(dinozId) as DinozFiche | undefined;
			if (dinozToUpdate) {
				this.dinozStore.setDinoz({
					...dinozToUpdate,
					currentMission: null
				});
			}
			try {
				await this.refreshDinoz();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async closeMissionTalkModal() {
			try {
				const dinozIdToComplete = this.missionTalkDinozId ?? this.dinozId;
				const result = await MissionService.completeAction(dinozIdToComplete);
				this.missionTalkTextKey = null;
				this.missionTalkNameKey = null;
				this.missionTalkDinozId = null;
				if (result.rewardModal) {
					this.missionReward = result.rewardModal;
				}
				await this.refreshDinoz();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	computed: {
		dinozInDungeon(): boolean {
			return this.dinoz.actions?.some(action => action.name === Action.DUNGEON) ?? false;
		},
		isLeader(): boolean {
			return (this.dinoz.followers?.length ?? 0) > 0;
		},
		isFollower(): boolean {
			return Boolean(this.dinoz.leaderId);
		},
		changeLeaderAction(): ActionFiche | undefined {
			return this.dinoz.actions?.find(a => a.name === Action.CHANGE_LEADER);
		},
		otherGroupDinozList(): DinozFiche[] {
			const list = this.dinozStore.getDinozList ?? [];
			const byId = new Map(list.map(dinoz => [dinoz.id, dinoz]));

			if (this.isLeader) {
				if (!this.dinoz.followers?.length) return [];
				return this.dinoz.followers
					.map(f => byId.get(f.id) ?? this.dinozStore.getDinoz(f.id))
					.filter((d): d is DinozFiche => d !== undefined);
			}

			if (this.isFollower && this.dinoz.leaderId) {
				const leader = byId.get(this.dinoz.leaderId) ?? this.dinozStore.getDinoz(this.dinoz.leaderId);
				if (!leader) return [];

				const coFollowers = (leader.followers ?? [])
					.filter(f => f.id !== this.dinoz.id)
					.map(f => byId.get(f.id) ?? this.dinozStore.getDinoz(f.id))
					.filter((d): d is DinozFiche => d !== undefined);

				return [leader, ...coFollowers];
			}

			return [];
		},
		followerDinozList(): DinozFiche[] {
			return this.otherGroupDinozList;
		},
		dinozFullParty(): DinozFiche[] {
			const list = this.dinozStore.getDinozList ?? [];
			const byId = new Map(list.map(dinoz => [dinoz.id, dinoz]));
			const followerIds = this.dinoz.followers.map(follower => follower.id);

			const followers = followerIds.map(id => byId.get(id)).filter((dinoz): dinoz is DinozFiche => dinoz !== undefined);

			const current = byId.get(this.dinoz.id) ?? this.dinoz;

			return [...followers, current];
		},
		leaderDinoz() {
			if (!this.dinoz.leaderId) return;
			return dinozStore().getDinoz(this.dinoz.leaderId);
		},
		unfreezeCountdown(): string {
			return this.formatHHMMSS(this.unfreezeSecondsLeft);
		},
		restCountdown(): string {
			return this.formatMMSS(this.restSecondsLeft);
		},
		clinicCountdown(): string {
			return this.formatHHMMSS(this.clinicSecondsLeft ?? 0);
		},
		clinicNoticeKey(): string {
			return getClinicNoticeKey(this.dinoz.clinic?.kind, this.clinicSecondsLeft);
		}
	},
	watch: {
		dinoz: {
			handler(newVal, oldVal) {
				if (newVal?.id !== oldVal?.id) {
					this.missionTalkTextKey = null;
					this.missionTalkNameKey = null;
					this.missionTalkDinozId = null;
					this.missionReward = null;
					this.reincarnate = false;
					this.resurrect = false;
					this.fastGatherOver = false;
					this.fastGatherResult = null;
					this.groupAccordionOpen = false;
				}
				this.dinozId = this.dinoz.id;
				this.updateRestCountdown();
				this.updateUnfreezeCountdown();
				this.updateClinicCountdown();
			},
			deep: false,
			immediate: true
		}
	},
	async mounted() {
		const intervalId = window.setInterval(() => this.updateUnfreezeCountdown(), 1000);
		const intervalId2 = window.setInterval(() => this.updateRestCountdown(), 1000);
		const clinicIntervalId = window.setInterval(() => this.updateClinicCountdown(), 1000);
		this.intervals.push(intervalId, intervalId2, clinicIntervalId);
	},
	unmounted() {
		this.intervals.forEach(clearInterval);
	}
});
</script>

<style lang="scss" scoped>
.follow {
	margin: 1px 0;
	padding: 2px 5px 2px 20px;
	background-color: #bc683c;
	background-image: url('../../assets/icons/small_missAct.webp');
	background-position: 5px center;
	background-repeat: no-repeat;
	line-height: 10pt;
	overflow: hidden;
	cursor: pointer;
	font-style: italic;
	color: #fce3bc;
	font-size: 9pt;
	align-self: stretch;
	transition: background-color 0.15s;
	&:hover {
		background-color: #9a4029;
	}
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
	width: 185px;
	max-width: 185px;
	box-sizing: border-box;
	color: white;
	display: flex;
	flex-direction: column;
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
		align-items: stretch;
		padding: 0 5px 5px;
		gap: 2px;
		overflow: hidden;
		:deep(.disclaimer) {
			margin: 2px 0 5px;
			padding: 5px;
			width: 100%;
			box-sizing: border-box;
			.content {
				min-width: 0;
				flex: 1;
			}
		}
		.action {
			&.clan-action {
				min-height: 46px;
				height: auto;
			}
			&.disabled-action {
				opacity: 0.65;
				&:hover {
					cursor: default;
					background-color: transparent;
				}
			}
			.clan-action-label {
				display: flex;
				flex-direction: column;
				font-size: 9pt;
				small {
					font-size: 8pt;
					font-variant: normal;
					font-weight: 400;
				}
			}
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 0.5rem;
			margin-right: 5px;
			border-radius: 7px;
			font-size: 11pt;
			font-variant: small-caps;
			line-height: 1.1;
			font-weight: 700;
			width: 100%;
			height: 35px;
			img {
				flex-shrink: 0;
			}
			&:hover {
				background-color: #9a4029;
				cursor: pointer;
			}
			&.long-text {
				font-size: 8.5pt;
				line-height: 1.05;
			}
		}
		.group-toggle-action {
			cursor: pointer;
			user-select: none;
			&.open {
				background-color: #9a4029;
			}
		}
		.group-panel {
			width: 100%;
			background-color: #be7546;
			border: 1px solid #8e3a20;
			border-radius: 5px;
			padding: 4px;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			gap: 4px;
			margin-top: 2px;
			margin-bottom: 3px;
			.followers-grid {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 4px;
				width: 100%;
			}
			.follower-card {
				background-color: #f2ca8e;
				border: 1px solid #bc683c;
				border-radius: 4px;
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 3px 4px 4px 4px;
				cursor: pointer;
				user-select: none;
				box-sizing: border-box;
				gap: 2px;
				overflow: hidden;
				&:hover {
					background-color: #f8db9f;
					border-color: #8e3a20;
				}
				&.dead {
					background-color: #a9a9a9;
					border-color: #7b7b7b;
					filter: grayscale(85%);
					opacity: 0.8;
					&:hover {
						background-color: #b8b8b8;
						border-color: #666;
					}
				}
				.mini-container {
					position: relative;
					width: 55px;
					height: 42px;
					overflow: hidden;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
					:deep(.dinoWrap) {
						transform: scale(0.78) translateY(-4px);
						transform-origin: center center;
					}
					.lvlup-badge {
						position: absolute;
						top: 1px;
						right: 1px;
						z-index: 2;
						pointer-events: auto;
					}
				}
				.bars {
					width: 100%;
					display: flex;
					flex-direction: column;
					gap: 2px;
					justify-content: center;
					.bar-wrapper {
						position: relative;
						height: 11px;
						background-color: #000;
						border: 1px solid #783515;
						border-radius: 2px;
						overflow: hidden;
						display: flex;
						align-items: center;
						width: 100%;
						box-sizing: border-box;
						.bar-fill-pv {
							height: 100%;
							background-color: yellow;
						}
						.bar-fill-xp {
							height: 100%;
							background-color: #ff54e4;
						}
						.bar-text {
							position: absolute;
							inset: 0;
							display: flex;
							align-items: center;
							justify-content: center;
							font-size: 7pt;
							font-family: Arial, sans-serif;
							font-weight: bold;
							color: #fff;
							text-shadow:
								1px 1px 1px #000,
								-1px -1px 1px #000,
								1px -1px 1px #000,
								-1px 1px 1px #000;
							line-height: 11px;
							white-space: nowrap;
							pointer-events: none;
							letter-spacing: -0.2px;
						}
					}
				}
			}
			.group-sub-action {
				margin-top: 2px;
				width: 100% !important;
			}
		}
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
			.action {
				width: 48%;
				margin-right: 0;
				overflow: hidden;
				gap: 0.35rem;
				p {
					white-space: normal;
					word-break: break-word;
				}
				&.long-text {
					font-size: 8pt;
					line-height: 1;
				}
			}
			.group-panel {
				width: 100% !important;
				.followers-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 6px;
				}
				.follower-card {
					padding: 4px 6px;
					gap: 3px;
					.mini-container {
						width: 60px;
						height: 46px;
						:deep(.dinoWrap) {
							transform: scale(0.85) translateY(-4px);
						}
					}
					.bars .bar-wrapper {
						height: 12px;
						.bar-text {
							font-size: 8pt;
							letter-spacing: normal;
						}
					}
				}
				.group-sub-action {
					width: 100% !important;
				}
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
