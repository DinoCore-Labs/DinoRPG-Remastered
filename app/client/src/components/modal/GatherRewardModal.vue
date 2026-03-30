<template>
	<Transition>
		<div class="modal-background">
			<div v-if="rewardList.ingredients.length === 0 && rewardList.item.length === 0 && rewardList.gold === 0">
				<span class="nothing">{{ $t('gather.nothing') }}</span>
			</div>

			<div v-if="rewardList.gold > 0" class="item-container">
				<Tippy theme="normal" tag="img" :src="getImgURL('item', 'item_gold')" alt="gold">
					<template #content>
						<h1 v-html="formatContent($t('items.name.gold'))" />
						<p v-html="formatContent($t('items.description.gold', { quantity: rewardList.gold }))" />
					</template>
				</Tippy>
				<div class="name-info">
					<span>{{ rewardList.gold }} </span>
					<span>{{ formatContent($t('items.name.gold')) }}</span>
				</div>
			</div>

			<div v-for="ingredient in rewardList.ingredients" :key="ingredient.ingredientId" class="ingredient-container">
				<Tippy
					theme="normal"
					tag="img"
					:src="getImgURL('ingredients', ingredient.name)"
					:alt="ingredient.name"
					class="ingredient-image"
				>
					<template #content>
						<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name?.toLowerCase()}`))" />
						<p v-html="formatContent($t(`ingredients.description.${ingredient.name?.toLowerCase()}`))" />
					</template>
				</Tippy>
				<div :class="{ 'name-info': true, 'is-max': isMaxQuantity(ingredient.ingredientId) }">
					<span v-if="ingredient.quantity && ingredient.quantity > 1">x{{ ingredient.quantity }} </span>
					<span>
						{{ formatContent($t(`ingredients.name.${ingredient.name}`)) }}
					</span>
					<span class="ingredient-count">
						({{ `${getIngredientCount(ingredient.ingredientId)}/${ingredient.maxQuantity}` }})
					</span>
				</div>
			</div>

			<div v-for="item in rewardList.item" :key="item.id" class="item-container">
				<Tippy
					theme="normal"
					tag="img"
					:src="getImgURL('item', `item_${getItemImageKey(item.id)}`)"
					:alt="getItemName(item.id)"
				>
					<template #content>
						<h1 v-html="formatContent($t(`items.name.${getItemName(item.id)}`))" />
						<p
							v-html="
								formatContent($t(`items.description.${getItemDescriptionKey(item.id)}`, { quantity: item.price }))
							"
						/>
					</template>
				</Tippy>
				<div class="name-info">
					<span v-if="item.quantity && item.quantity > 1">x{{ item.quantity }} </span>
					<span>{{ formatContent($t(`items.name.${getItemName(item.id)}`)) }}</span>
				</div>
			</div>

			<a class="button" @click="$emit('close')">
				{{ $t('modal.continue') }}
			</a>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { GatherRewards } from '@dinorpg/core/models/gather/gatherRewards.js';
import { userStore } from '../../store/userStore';
import { itemList } from '@dinorpg/core/models/items/itemList.js';

export default defineComponent({
	name: 'GatherRewardModal',
	props: {
		rewards: { type: Object as PropType<GatherRewards>, required: true },
		ingredientsAtMaxQuantity: {
			type: Array as PropType<{ ingredientId: number; quantity: number; isMaxQuantity: boolean }[]>,
			required: true
		}
	},
	data() {
		return {
			userStore: userStore(),
			rewardList: { item: [], ingredients: [], gold: 0 } satisfies GatherRewards as GatherRewards,
			itemList: itemList
		};
	},
	mounted() {
		this.rewardList = this.rewards;

		if (this.rewardList.gold > 0) {
			this.userStore.setGold(this.rewardList.gold);
		}
	},
	methods: {
		getItemById(itemId: number) {
			return Object.values(this.itemList).find(item => item.itemId === itemId);
		},
		getItemImageKey(itemId: number): string {
			return this.getItemById(itemId)?.name.toLowerCase() ?? 'unknown';
		},
		getItemName(itemId: number): string {
			return this.getItemById(itemId)?.name.toLowerCase() ?? 'unknown';
		},
		getItemDescriptionKey(itemId: number) {
			return this.getItemById(itemId)?.name ?? 'unknown';
		},
		isMaxQuantity(ingredientId: number) {
			const ingredient = this.ingredientsAtMaxQuantity.find(ingre => ingre.ingredientId === ingredientId);
			if (ingredient) {
				return ingredient.isMaxQuantity;
			}
			return false;
		},
		getIngredientCount(ingredientId: number) {
			const ingredient = this.ingredientsAtMaxQuantity.find(ingre => ingre.ingredientId === ingredientId);
			if (ingredient) {
				return ingredient.quantity;
			}
			return 0;
		}
	}
});
</script>

<style lang="scss" scoped>
@use 'sass:color';
.modal-background {
	position: absolute;
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
	flex-direction: column;
	img {
		margin-top: 15px;
	}
	.button {
		margin-top: 25px;
	}
	.nothing {
		display: block;
		text-align: center;
		color: white;
	}
}
.ingredient-container,
.item-container {
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 0 6px;
}
.name-info {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-top: 15px;
	font-size: 14px;
	span {
		color: white;
	}
	&.is-max {
		span {
			color: red;
		}
	}
	.ingredient-count {
		font-size: 12px;
		color: #cccccc;
	}
}
.v-enter-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
	animation-delay: 0.35s;
}
.v-leave-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
}
.v-enter-from {
	bottom: 0;
	opacity: 0;
}
.v-leave-to {
	bottom: 0;
	opacity: 0;
}
.modal-close {
	min-width: 31px;
	cursor: pointer;
	position: absolute;
	text-align: center;
	right: 0;
	top: 0;
	padding: 5px;
	background-color: #fadcb0;
	color: color.adjust(brown, $alpha: -0.4);
	font-size: 0.85em;
	letter-spacing: 0.03em;
	text-decoration: none;
	font-variant: small-caps;
	transition: all 0.15s;
	&:hover,
	&:focus,
	&:active {
		color: black;
	}
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
