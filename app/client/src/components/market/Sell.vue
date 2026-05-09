<template>
	<DZDisclaimer help :content="$t('market.sellView.disclaimer')" />

	<h4>{{ $t('market.sellView.prepareYourOffer') }}</h4>

	<table>
		<tbody>
			<tr>
				<td>{{ $t('market.dinoz') }}</td>
				<td>
					<div class="df aic">
						<DZCheckbox id="sell-dinoz" v-model="sellDinoz" @change="toggleSellDinoz" />

						<label v-if="dinoz" for="sell-dinoz">
							{{ $t('market.sellView.sellYourDinoz') }}
							{{ dinoz.name }}
						</label>
					</div>
				</td>
			</tr>

			<tr>
				<td>{{ $t('market.sellView.itemsAndIngredients') }}</td>
				<td>
					<div class="df fww">
						<div v-for="ingredient in ingredients" :key="`ingredient-${ingredient.ingredientId}`" class="item">
							<Tippy tag="img" theme="normal" :src="getImgURL('ingredients', ingredient.name)">
								<p>{{ $t(`ingredients.name.${ingredient.name}`) }}</p>

								<template #content>
									<h1>{{ $t(`ingredients.name.${ingredient.name}`) }}</h1>
									<p>{{ $t(`ingredients.description.${ingredient.name}`) }}</p>
								</template>
							</Tippy>

							<div class="count">{{ selectedItems[ingredient.name]?.count || '' }}</div>

							<div class="change-count">
								<Tippy
									tag="img"
									theme="small"
									:src="getImgURL('icons', 'up', true)"
									@click="changeItemCount('ingredient', ingredient, 1)"
								>
									<template #content>{{ $t('market.sellView.add') }}</template>
								</Tippy>

								<Tippy
									tag="img"
									theme="small"
									:src="getImgURL('icons', 'down', true)"
									@click="changeItemCount('ingredient', ingredient, -1)"
								>
									<template #content>{{ $t('market.sellView.remove') }}</template>
								</Tippy>
							</div>
						</div>

						<div v-for="item in items" :key="`item-${item.itemId}`" class="item">
							<Tippy tag="img" theme="normal" :src="getImgURL('item', `item_${item.name}`)">
								<p>{{ $t(`items.name.${item.name}`) }}</p>

								<template #content>
									<h1>{{ $t(`items.name.${item.name}`) }}</h1>
									<p>{{ $t(`items.description.${item.name}`) }}</p>
								</template>
							</Tippy>

							<div class="count">{{ selectedItems[item.name]?.count || '' }}</div>

							<div class="change-count">
								<Tippy
									tag="img"
									theme="small"
									:src="getImgURL('icons', 'up', true)"
									@click="changeItemCount('item', item, 1)"
								>
									<template #content>{{ $t('market.sellView.add') }}</template>
								</Tippy>

								<Tippy
									tag="img"
									theme="small"
									:src="getImgURL('icons', 'down', true)"
									@click="changeItemCount('item', item, -1)"
								>
									<template #content>{{ $t('market.sellView.remove') }}</template>
								</Tippy>
							</div>
						</div>
					</div>
				</td>
			</tr>

			<tr>
				<td>{{ $t('market.sellView.offerMinimalValue') }}</td>
				<td>
					<DZDisclaimer help :content="$t('market.sellView.minimalValueDisclaimer', { minValue: MARKET_MIN_VALUE })" />

					<div class="total">
						<DZInput type="number" v-model="totalValue" />
					</div>
				</td>
			</tr>

			<tr>
				<td class="empty" />
				<td>
					<DZButton @click="createOffer">
						{{ $t('market.sellView.create') }}
					</DZButton>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts">
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import type { IngredientFiche } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import type { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { defineComponent } from 'vue';
import { Tippy } from 'vue-tippy';

import DZButton from '../utils/DZButton.vue';
import DZCheckbox from '../utils/DZCheckbox.vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZInput from '../utils/DZInput.vue';
import { InventoryService } from '../../services';
import { MarketService } from '../../services/market.service';
import { dinozStore } from '../../store/dinozStore';
import { errorHandler } from '../../utils/errorHandler';
import { formatText } from '../../utils/formatText';
import { MARKET_MAX_ITEMS, MARKET_MIN_VALUE } from '../../utils/market';

type SellableIngredient = IngredientFiche & { quantity: number };
type SellableItem = ItemFiche & { quantity: number };

export default defineComponent({
	name: 'Sell',
	components: { DZButton, DZCheckbox, DZDisclaimer, DZInput, Tippy },
	props: {
		changeTab: {
			type: Function,
			required: true
		}
	},
	data() {
		return {
			MARKET_MIN_VALUE,
			dStore: dinozStore(),
			dinoz: null as DinozFiche | null,
			ingredients: [] as SellableIngredient[],
			items: [] as SellableItem[],
			sellDinoz: false,
			selectedItems: {} as Record<string, { type: 'ingredient' | 'item'; count: number }>,
			totalValue: 0
		};
	},
	methods: {
		toggleSellDinoz() {
			this.totalValue = this.getTotalValue();
		},

		changeItemCount(type: 'ingredient' | 'item', item: SellableIngredient | SellableItem, value: number) {
			const name = item.name;
			if (!this.selectedItems[name]) {
				this.selectedItems[name] = { type, count: 0 };
			}
			const nextCount = this.selectedItems[name].count + value;
			if (nextCount < 0) return;
			if (nextCount > item.quantity) {
				this.$toast.open({
					message: formatText(this.$t('toast.market.notEnoughItems')),
					type: 'error'
				});
				return;
			}
			const positiveItems = Object.entries(this.selectedItems).filter(([, current]) => current.count > 0);
			if (value === 1 && nextCount === 1 && positiveItems.length >= MARKET_MAX_ITEMS) {
				this.$toast.open({
					message: formatText(this.$t('toast.market.tooManyItems', { items: MARKET_MAX_ITEMS })),
					type: 'error'
				});
				return;
			}
			this.selectedItems[name].count = nextCount;
			this.totalValue = this.getTotalValue();
		},
		getTotalValue() {
			let dinozValue = 0;
			if (this.sellDinoz && this.dinoz) {
				dinozValue = Math.ceil(this.dinoz.race.price * this.dinoz.level ** 0.5);
			}
			const contentValue = Object.entries(this.selectedItems).reduce((total, [name, selected]) => {
				if (selected.count <= 0) return total;
				if (selected.type === 'ingredient') {
					const ingredient = this.ingredients.find(current => current.name === name);
					return total + (ingredient?.price ?? 0) * selected.count;
				}
				const item = this.items.find(current => current.name === name);
				return total + (item?.price ?? 0) * selected.count;
			}, 0);
			return dinozValue + contentValue;
		},
		async createOffer() {
			const calculatedValue = this.getTotalValue();
			if (this.totalValue < calculatedValue || calculatedValue < MARKET_MIN_VALUE) {
				this.$toast.open({
					message: formatText(this.$t('toast.market.minimalValueError')),
					type: 'error'
				});
				return;
			}
			const ingredients = Object.entries(this.selectedItems)
				.filter(([, selected]) => selected.type === 'ingredient' && selected.count > 0)
				.map(([name, selected]) => {
					const ingredient = this.ingredients.find(current => current.name === name);
					return {
						ingredientId: ingredient!.ingredientId,
						quantity: selected.count
					};
				});
			const items = Object.entries(this.selectedItems)
				.filter(([, selected]) => selected.type === 'item' && selected.count > 0)
				.map(([name, selected]) => {
					const item = this.items.find(current => current.name === name);
					return {
						itemId: item!.itemId,
						quantity: selected.count
					};
				});
			try {
				await MarketService.createOffer({
					total: this.totalValue,
					dinozId: this.sellDinoz ? this.dinoz?.id : null,
					items,
					ingredients
				});
				this.$toast.open({
					message: formatText(this.$t('toast.market.offerCreated')),
					type: 'success'
				});
				this.changeTab(0);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		}
	},
	async mounted() {
		try {
			const currentDinozId = this.dStore.getCurrentDinozId;
			if (!currentDinozId) {
				this.$toast.open({
					message: formatText(this.$t('toast.selectADinozAtMarketFirst')),
					type: 'error'
				});
				this.$router.push({ name: 'NewsPage' });
				return;
			}
			const currentDinoz = this.dStore.getDinoz(currentDinozId);
			if (!currentDinoz) {
				this.$toast.open({
					message: formatText(this.$t('toast.unknownDinoz')),
					type: 'error'
				});
				this.$router.push({ name: 'NewsPage' });
				return;
			}
			this.dinoz = currentDinoz;
			const ingredients = await InventoryService.getAllIngredientsData();
			this.ingredients = ingredients
				.map(ingredient => ({
					...ingredientList[ingredient.ingredientId as keyof typeof ingredientList],
					quantity: ingredient.quantity
				}))
				.filter(ingredient => ingredient.quantity > 0);
			const items = await InventoryService.getAllItemsData();
			this.items = items
				.map(item => ({
					...itemList[item.itemId as keyof typeof itemList],
					quantity: item.quantity
				}))
				.filter(item => item.quantity > 0 && item.price && item.sellable !== false);
		} catch (error) {
			errorHandler.handle(error, this.$toast);
		}
	}
});
</script>

<style lang="scss" scoped>
h4 {
	background-color: #bc683c;
	color: #ffee92;
	font-variant: small-caps;
	padding: 2px 4px;
	font-weight: normal;
}
table {
	width: 95%;
	table-layout: fixed;
	align-self: center;
	td {
		font-size: 9pt;
		padding: 2px 4px;
		&:first-child {
			background-color: #ecbd84;
			color: #f8efa4;
			border-radius: 8px;
			padding: 4px 8px;
			text-align: center;
			width: 230px;
			&.empty {
				background-color: transparent;
			}
		}
		input[type='checkbox'] {
			margin-right: 5px;
		}
		label {
			cursor: pointer;
			user-select: none;
		}
		.item {
			display: flex;
			margin-right: 10px;
			& > img {
				background-color: #bc683c;
				padding: 1px;
			}
			.count {
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: #bc683c;
				padding: 1px;
				color: #ffee92;
				box-sizing: border-box;
				height: 34px;
				width: 34px;
				outline: 1px solid #ebd18b;
				outline-offset: -2px;
				margin-left: -1px;
				user-select: none;
			}
			.change-count {
				display: flex;
				flex-direction: column;
				justify-content: center;
				img {
					cursor: pointer;
					user-select: none;
					&:hover {
						outline: 1px solid white;
						outline-offset: -1px;
					}
				}
			}
		}
	}
}
</style>
