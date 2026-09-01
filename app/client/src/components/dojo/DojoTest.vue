<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/components/dojo/ChallengeFriend.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors on 2026-08-31.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<TitleHeader :title="$t('pageTitle.dojo')" />
	<div class="preparation" v-if="!fightTransformed">
		<DZDisclaimer round help :content="$t('dojo.challengeFriend.disclaimer')" />
		<DZDisclaimer round help :content="$t('dojo.challengeFriend.selectYourDinoz')" />
		<SelectDinoz :dinozList="myDinoz" :selectLimit="6" @validate="composeMyTeam"></SelectDinoz>
		<DZDisclaimer round help :content="$t('dojo.challengeFriend.selectOpponentDinoz')" />
		<DZButton v-for="friend in clanMembers" :key="friend.user.id" @click="selectPlayer(friend.user.id)">
			{{ friend.user.name }}</DZButton
		>
		<template v-if="opponentDinoz.length > 0">
			<SelectDinoz :dinozList="opponentDinoz" :selectLimit="6" @validate="composeEnnemyTeam"></SelectDinoz>
		</template>
		<div class="fight-options" v-if="myTeam.length > 0 && opponentTeam.length > 0">
			<DZButton :class="{ active: enablePoison }" @click="enablePoison = !enablePoison">
				{{ $t('dojo.poison') }}: {{ enablePoison ? $t('dojo.on') : $t('dojo.off') }}
			</DZButton>

			<DZButton :class="{ active: enableItems }" @click="enableItems = !enableItems">
				{{ $t('dojo.items') }}: {{ enableItems ? $t('dojo.on') : $t('dojo.off') }}
			</DZButton>
		</div>
		<div
			class="fight"
			@click="startFight()"
			v-if="myTeam.length > 0 && opponentTeam.length > 0"
			v-html="formatContent($t('dojo.challengeFriend.startFight', { gold: fightCost }))"
		/>
	</div>
	<template v-if="fightTransformed">
		<div id="fightContent">
			<FightersHeader :leftPlayer="leftPlayer" :rightPlayer="rightPlayer" />
			<div v-show="loaded" class="content">
				<Suspense>
					<FullFightAnimation :fight="fightTransformed" />
					<template #fallback> <Loading /> </template>
				</Suspense>
			</div>
		</div>
		<DZButton style="align-self: center" @click="returnToFighterSelection()">{{ $t('dojo.return') }}</DZButton>
		<Transition name="bounce">
			<FightRecap :stats="fightStat" />
		</Transition>
		<DZInput disabled type="text" v-model="shareLink" />
	</template>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, toRaw } from 'vue';
import TitleHeader from '../utils/TitleHeader.vue';
import { userStore } from '../../store/userStore.js';
import { dinozStore } from '../../store/dinozStore.js';
import { errorHandler } from '../../utils/errorHandler.js';
import DZButton from '../utils/DZButton.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZInput from '../utils/DZInput.vue';
import { ClanService, UserService, DojoService } from '../../services/index.js';
import SelectDinoz from './SelectDinoz.vue';
import { resolveFightingPlace, transpileFight } from '../../fight/transpileFight.js';
import FightRecap from './FightRecap.vue';
import FightersHeader from '../fight/FightHeader.vue';
import { dojoStore } from '../../store/dojoStore.ts';
import type { ClanMember } from '@dinorpg/core/models/clan/clanMember.js';
import type { DinozDojoFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { preFightLoader } from '@dinorpg/core/models/fight/transpiler.js';
import type { FighterRecap, FullFightStats } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { DINOZ_STATE } from '@dinorpg/core/models/dinoz/dinozState.js';

export default defineComponent({
	name: 'ChallengeFriend',
	components: {
		DZButton,
		DZDisclaimer,
		DZInput,
		TitleHeader,
		SelectDinoz,
		FightersHeader,
		FightRecap,
		FullFightAnimation: defineAsyncComponent(() => import('../fight/FightAnimation.vue'))
	},
	data() {
		return {
			userStore: userStore(),
			selectedDinoz: [] as number[],
			clanMembers: [] as Array<ClanMember>,
			myDinoz: [] as DinozDojoFiche[],
			opponentDinoz: [] as DinozDojoFiche[],
			myTeam: [] as number[],
			opponentTeam: [] as number[],
			fightCost: 0 as number,
			opponentId: undefined as undefined | string,
			fightTransformed: undefined as undefined | preFightLoader,
			loaded: false,
			shareLink: '',
			fightStat: {} as FullFightStats,
			leftPlayer: null as null | { id: string; name: string },
			rightPlayer: null as null | { id: string; name: string },
			enablePoison: true,
			enableItems: true,
			dojoStore: dojoStore()
		};
	},
	methods: {
		async selectPlayer(playerId: string) {
			this.opponentDinoz = [];
			this.opponentTeam = [];
			try {
				const player = await UserService.getPublicProfile(playerId);
				this.opponentDinoz = player.dinoz
					.filter(d => !d.isFrozen)
					.map(d => {
						return {
							id: d.id,
							name: d.name,
							display: d.display,
							level: d.level
						};
					})
					.sort((a, b) => b.level - a.level);
				this.opponentId = playerId;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async startFight() {
			if (!this.opponentId) return;
			if (this.myTeam.some(dinoz => this.opponentTeam.includes(dinoz))) {
				this.$toast.open({ message: this.$t('dojo.challengeFriend.doubleDinoz'), type: 'error' });
				return;
			}
			try {
				const rawFight = await DojoService.fightTest(
					this.myTeam,
					this.opponentTeam,
					this.opponentId,
					this.enablePoison,
					this.enableItems
				);
				const fightResult = rawFight.fight;
				this.fightStat = rawFight.stats;
				const fightSteps = fightResult.history as FightStep[];
				const fighters = fightResult.fighters as FighterRecap[];
				if (!fightSteps || !fighters) return;

				const nextFight = transpileFight(
					structuredClone(toRaw(fighters)),
					fightSteps,
					this.$t,
					fightResult.result,
					undefined,
					undefined,
					true
				);
				if (!nextFight) {
					return;
				}
				const initPlace = resolveFightingPlace(fightResult.place);
				this.fightTransformed = {
					...initPlace,
					history: nextFight.filter(n => n != undefined)
					// lang: this.lang
				};
				this.leftPlayer = fightResult.leftPlayer;
				this.rightPlayer = fightResult.rightPlayer;
				this.loaded = true;
				this.shareLink = `${window.location.origin}/dojo/share/${fightResult.id}`;
				await this.$refreshGold();
				dojoStore().incrementCashPrice(this.fightCost);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		returnToFighterSelection() {
			this.selectedDinoz = [];
			this.opponentDinoz = [];
			this.myTeam = [];
			this.opponentTeam = [];
			this.fightCost = 0;
			this.leftPlayer = null;
			this.rightPlayer = null;
			this.opponentId = undefined;
			this.fightTransformed = undefined;
			this.loaded = false;
			this.shareLink = '';
		},
		composeMyTeam(data: number[]) {
			this.myTeam = data;
			this.fightCost = (this.myTeam.length + this.opponentTeam.length) * 50;
		},
		composeEnnemyTeam(data: number[]) {
			this.opponentTeam = data;
			this.fightCost = (this.myTeam.length + this.opponentTeam.length) * 50;
		}
	},
	async mounted() {
		const myClan = this.userStore.getClanId;
		if (!myClan) {
			this.$router.push({ path: '/dojo' });
			return;
		}
		this.myDinoz = dinozStore()
			.getDinozList.filter(d => d.state !== DINOZ_STATE.frozen)
			.map(d => {
				return {
					id: d.id,
					name: d.name,
					display: d.display,
					level: d.level
				};
			})
			.sort((a, b) => b.level - a.level);

		try {
			this.clanMembers = await ClanService.getClanMembersList(myClan);
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style lang="scss" scoped>
#fightContent {
	align-self: center;
}
.fight {
	padding-top: 6px;
	box-sizing: border-box;
	background-image: url('../../assets/design/dojo/combat.webp');
	width: 112px;
	height: 59px;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	color: white;
	text-transform: uppercase;
	font-size: 13pt;
	font-weight: bold;
	text-shadow: 1px 1px 0px #000000;
	gap: 4px;
	&:hover {
		filter: saturate(120%);
	}
}
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}
.preparation {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}
.wrapper {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;

	.dinoz-button {
		width: 96px;
		margin: 4px;
		border-radius: 5px;
		text-align: center;
		border: 1px solid #874b2e;
		cursor: pointer;
		user-select: none;

		.background {
			background-image: url('../../assets/place/forcebrut.webp');
			background-repeat: no-repeat;
			background-size: cover;
		}

		.textbox {
			background: rgb(255 249 0);
			background: linear-gradient(180deg, rgb(255 249 0) 0%, rgb(176 153 20) 100%);
			border-top: 1px solid #874b2e;
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			font-size: 10px;
			font-weight: bold;

			.name {
				color: #874b2e;
			}

			.level {
				color: #fce3bc;
			}
		}

		&.not-selected {
			filter: grayscale(100%);
		}
	}
}
.content {
	display: flex;
	justify-content: center;
}
</style>
