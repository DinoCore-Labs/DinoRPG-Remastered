<template>
	<Transition name="bounce">
		<div class="wrapper">
			<div class="debrief">
				<p
					:class="{ 'fight-history': true, 'drpg-scrollbar': true, visible: displayFightHistory }"
					v-html="fightHistory"
				/>
				<div class="debrief-stats">
					<img
						v-if="fight.result"
						:src="getImgURL('design/fight', `large_fight_win`)"
						alt="win"
						v-tippy="{
							content: formatContent($t(`fight.win`)),
							theme: 'small'
						}"
					/>
					<img
						v-else
						:src="getImgURL('design/fight', `large_fight_lose`)"
						alt="lose"
						v-tippy="{
							content: formatContent($t(`fight.lose`)),
							theme: 'small'
						}"
					/>
					<div class="result">
						<span class="text">{{ $t(`fight.life`) }}</span>
						<img :src="getImgURL('icons', `small_pv`)" />
						<span class="data">{{ fight.totalHpLost }}</span>
					</div>
					<div class="result">
						<span class="text">{{ $t(`fight.experience`) }}</span>
						<img :src="getImgURL('icons', `small_xp`)" />
						<span class="data">
							{{ fight.xpEarned }}
							<img
								v-if="fight.levelUp"
								:src="getImgURL('icons', `small_lup`)"
								alt="lup"
								v-tippy="{
									content: formatContent($t(`fight.lvlup`)),
									theme: 'small'
								}"
							/>
						</span>
					</div>
					<div class="result">
						<span class="text">{{ $t(`fight.gold`) }}</span>
						<img :src="getImgURL('icons', `small_gold`)" />
						<span class="data">
							{{ fight.goldEarned }}
						</span>
					</div>
					<img v-if="!wonItemImgSrc" :src="getImgURL('design/fight', `large_empty`)" alt="empty" />
					<Tippy theme="small" tag="img" v-else :src="wonItemImgSrc" :alt="wonItem!.name">
						<template #content>
							<p v-html="formatContent($t(`fight.event.${wonItem!.name}`))" />
						</template>
					</Tippy>
				</div>
			</div>
			<DZButton @click="returnToDinoz()">{{ $t(`fight.continue`) }}</DZButton>
			<DZButton @click="toggleFightHistory()">{{
				$t(`fight.history.${displayFightHistory ? 'hide' : 'display'}`)
			}}</DZButton>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import DZButton from '../utils/DZButton.vue';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import translateFightStep from '../../fight/translateFightStep.js';
import { dinozStore } from '../../store/dinozStore.js';
import { getItemFiche } from '@dinorpg/core/models/items/getItemFiche.js';
import type { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';

export default defineComponent({
	name: 'FightBounce',
	computed: {
		itemList() {
			return itemList;
		},
		wonItem(): ItemFiche | null {
			return getItemFiche(this.fight.itemWon) ?? null;
		},
		wonItemImgKey(): string | null {
			return this.wonItem ? `item_${this.wonItem.name}` : null;
		},
		wonItemImgSrc(): string | null {
			return this.wonItemImgKey ? this.getImgURL('items', this.wonItemImgKey) : null;
		}
	},
	components: { DZButton },
	props: {
		fight: { type: Object as PropType<FightResult>, required: true },
		dinozId: { type: Number, required: true }
	},
	data() {
		return {
			dinozStore: dinozStore(),
			displayFightHistory: false,
			fightHistory: undefined as string | undefined,
			npcSpeech: undefined as string | undefined,
			npcName: undefined as string | undefined
		};
	},
	methods: {
		returnToDinoz() {
			if (this.npcSpeech && this.fight.result) {
				this.$router.push({
					name: 'NPC',
					params: { id: this.dinozId.toString(), npc: this.npcName }
				});
			} else {
				//this.dinozStore.clearNpc(this.dinozId);
				this.$router.push({ name: 'DinozPage', params: { id: this.dinozId.toString() } });
			}
		},
		toggleFightHistory(): void {
			if (this.displayFightHistory) {
				this.displayFightHistory = false;
				return;
			}

			if (!this.fightHistory) {
				this.fightHistory = this.fight.history
					.flatMap(step => translateFightStep(step, this.$t))
					.filter(Boolean)
					.join('<br />');
			}
			this.displayFightHistory = true;
		}
	} /*,
	mounted() {
		if (this.fight.result) {
			this.npcSpeech = this.dinozStore.getNpc(this.dinozId)?.npcSpeech;
			this.npcName = this.dinozStore.getNpc(this.dinozId)?.npcName;
		} else {
			this.dinozStore.clearNpc(this.dinozId);
		}
	}*/
});
</script>

<style scoped lang="scss">
.debrief {
	flex-basis: 100%;
	color: #ffee92;
	background:
		url('../../assets/background/debriefing/top-left.webp') top left no-repeat,
		url('../../assets/background/debriefing/top-right.webp') top right no-repeat,
		url('../../assets/background/debriefing/bottom-left.webp') bottom left no-repeat,
		url('../../assets/background/debriefing/bottom-right.webp') bottom right no-repeat,
		url('../../assets/background/debriefing/middle-left.webp') left center repeat-y,
		url('../../assets/background/debriefing/middle-right.webp') right center repeat-y,
		url('../../assets/background/debriefing/top-middle.webp') top center repeat-x,
		url('../../assets/background/debriefing/bottom-middle.webp') bottom center repeat-x;
	background-color: #d5a167;
	.fight-history {
		text-align: left;
		overflow: auto;
		height: 0;
		margin-right: 3px;
		padding: 0;
		transition:
			height 0.5s ease-in-out,
			padding 0.5s ease-in-out;
		color: #8e3e26;
		font-size: 12px;
		:deep(strong) {
			color: inherit;
		}
		:deep(img) {
			width: 15px;
			vertical-align: bottom;
		}
		&.visible {
			height: 150px;
			padding: 4px 8px;
			overflow: auto;
			border-bottom: #cc8a51 1px solid;
		}
	}
	.debrief-stats {
		padding: 12px 0;
		display: flex;
		flex-wrap: wrap;
		align-self: center;
		width: 100%;
		justify-content: space-around;
		align-items: center;
		img {
			flex-shrink: 0;
			align-self: center;
		}
		.result {
			background-color: #cc8a51;
			width: 87px;
			height: 40px;
			border-radius: 8px;
			display: grid;
			grid-template-columns: 30% 1fr;
			grid-template-rows: 35% 1fr;
			grid-template-areas: 'top top' 'left center';
			.text {
				grid-area: top;
				align-self: center;
				justify-self: center;
				white-space: nowrap;
				font-weight: 1000;
				font-variant: all-petite-caps;
				font-size: smaller;
				color: #ffda97;
			}
			.data {
				grid-area: center;
				align-self: center;
				text-align: left;
				font-size: 13.5pt;
				color: #fff;
			}
			img {
				grid-area: left;
				align-self: center;
				justify-self: center;
				padding-left: 1px;
			}
		}
	}
}
.filler {
	height: 180px;
	width: 550px;
}
.wrapper {
	display: flex;
	justify-content: space-around;
	gap: 10px;
	flex-wrap: wrap;
	margin-top: -4px;
	max-width: 488px;
	animation: bounce2 1s;
}
@keyframes bounce2 {
	0% {
		transform: translateY(-30px);
		opacity: 0;
	}
	20% {
		transform: translateY(0);
		opacity: 1;
	}
	40% {
		transform: translateY(-15px);
		opacity: 0.8;
	}
	60% {
		transform: translateY(0);
		opacity: 1;
	}
	80% {
		transform: translateY(-5px);
	}
	100% {
		transform: translateY(0px);
	}
}
</style>
