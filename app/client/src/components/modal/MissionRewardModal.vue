<template>
	<Transition>
		<div v-if="textKey" class="modal-background" @click="$emit('close')">
			<div class="modal-box" @click.stop>
				<div class="result">
					{{ completionTitle }}
				</div>
				<p v-html="formatContent($t(textKey).toString())" />
				<ul>
					<li v-for="(reward, index) in rewards" :key="`${reward.type}-${index}`">
						<template v-if="reward.type === 'XP'">
							<img :src="getImgURL('icons', 'small_xp')" alt="xp" />
							{{ reward.value }}
						</template>
						<template v-else-if="reward.type === 'GOLD'">
							<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
							{{ reward.value }}
						</template>
						<template v-else-if="reward.type === 'ITEM'">
							<img
								class="item"
								:src="getImgURL('item', `item_${getItemImageKey(reward.itemKey)}`)"
								:alt="getItemLabel(reward.itemKey)"
							/>
							{{ getItemLabel(reward.itemKey) }} x {{ reward.quantity }}
						</template>
						<template v-else-if="reward.type === 'COLLECTION'">
							<img
								class="item"
								:src="getImgURL('epicRewards', `collec_${getCollectionImageKey(reward.collectionKey)}`)"
								:alt="getCollectionLabel(reward.collectionKey)"
							/>
							{{ getCollectionLabel(reward.collectionKey) }}
						</template>

						<template v-else-if="reward.type === 'INGREDIENT'">
							{{ getIngredientLabel(reward.ingredientKey) }} x {{ reward.quantity }}
						</template>

						<template v-else-if="reward.type === 'EFFECT'">
							{{ reward.effectKey }}
						</template>

						<template v-else-if="reward.type === 'REMOVE_EFFECT'">
							{{ reward.effectKey }}
						</template>

						<template v-else-if="reward.type === 'USER_VAR'">
							{{ reward.userVarKey }}
						</template>

						<template v-else-if="reward.type === 'GAME_VAR'">
							{{ reward.gameVarKey }}
						</template>
					</li>
				</ul>

				<div class="option">
					<DZButton class="continue" @click="$emit('close')">
						{{ continueLabel }}
					</DZButton>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import type { MissionReward } from '@dinorpg/core/models/missions/missionReward.js';
import { defineComponent, type PropType } from 'vue';

import DZButton from '../utils/DZButton.vue';
import { itemList } from '@dinorpg/core/models/items/itemList.js';

export default defineComponent({
	name: 'MissionRewardModal',
	components: {
		DZButton
	},
	props: {
		missionNameKey: {
			type: String,
			required: true
		},
		textKey: {
			type: String,
			required: true
		},
		rewards: {
			type: Array as PropType<MissionReward[]>,
			required: true
		}
	},
	emits: ['close'],
	computed: {
		completionTitle(): string {
			const missionName = this.$t(this.missionNameKey).toString();
			if (this.$te('missions.status.over')) {
				return this.$t('missions.status.over', { mission: missionName }).toString();
			}
			return missionName;
		},
		continueLabel(): string {
			return this.$te('missions.continue')
				? this.$t('missions.continue').toString()
				: this.$t('npc.continue').toString();
		}
	},
	methods: {
		translateWithFallback(keys: string[], fallback: string): string {
			for (const key of keys) {
				if (this.$te(key)) {
					return this.$t(key).toString();
				}
			}
			return fallback;
		},
		getItemLabel(itemKey: string): string {
			return this.translateWithFallback([`item.name.${itemKey}`, `items.name.${itemKey}`], itemKey);
		},
		getItemImageKey(itemKey: string): string {
			const item = Object.values(itemList).find(entry => entry.name === itemKey);
			if (!item) {
				return itemKey;
			}
			return item.name;
		},
		getCollectionLabel(collectionKey: string): string {
			return this.translateWithFallback(
				[`rewards.name.${collectionKey}`, `collections.name.${collectionKey}`],
				collectionKey
			);
		},
		getCollectionImageKey(collectionKey: string): string {
			return collectionKey;
		},
		getIngredientLabel(ingredientKey: string): string {
			return this.translateWithFallback(
				[`ingredient.name.${ingredientKey}`, `ingredients.name.${ingredientKey}`],
				ingredientKey
			);
		}
	}
});
</script>

<style lang="scss" scoped>
@use 'sass:color';
.modal-background {
	position: fixed;
	background: color.adjust(#09092d, $alpha: -0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;
	.modal-box {
		background-image: url('../../assets/background/bg_mission.webp');
		background-repeat: no-repeat;
		width: 394px;
		min-height: 296px;
		position: absolute;
		background-color: #fff0d1;
		border-radius: 3px;
		border: 1px solid #efbf86;
		box-shadow:
			0 0 0 1px #aa885f,
			0 0 5px 1px #aa885f;
		animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
		.result {
			font-size: 10pt;
			text-align: justify;
			line-height: 12pt;
			padding-bottom: 5px;
			margin: 25px 40px 5px 35px;
			color: black;
			font-weight: bold;
			border-bottom: 1px solid #e6b778;
		}
		p {
			margin-bottom: 5px;
			line-height: 12pt;
			padding-left: 35px;
			padding-right: 40px;
			color: #9d6523;
			text-align: justify;
			font-size: 10pt;
		}
		ul {
			width: 250px;
			list-style: none;
			margin-bottom: 15px;
			padding-left: 35px;
			padding-right: 40px;
			li {
				color: #ffee92;
				padding-left: 10px;
				padding-top: 4px;
				padding-bottom: 4px;
				margin-bottom: 4px;
				font-size: 10pt;
				background-color: #bc683c;
				border-radius: 10px;
				display: flex;
				align-items: center;
				gap: 6px;
			}
		}
		.option {
			margin-left: 35px;
			margin-right: 35px;
			padding-top: 10px;
			padding-bottom: 20px;
			border-top: 1px solid #e6b778;
		}
	}
}
.item {
	width: 15px;
	height: 15px;
}
.v-enter-active,
.v-leave-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
}
.v-enter-from,
.v-leave-to {
	bottom: 0;
	opacity: 0;
}
@keyframes blowUpModal {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}
</style>
