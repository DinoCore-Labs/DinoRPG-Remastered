<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/pages/Ingredients.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2026-01-20 through 2026-06-13.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<TitleHeader :title="$t('pageTitle.ingredients')" :header="$t(`common.ingredients`)" />
	<DZDisclaimer help round content="ingredients.disclaimer" />
	<DZTable>
		<tr>
			<th class="thCategory" @mouseenter="onCategoryEnter" @mousemove="onCategoryEnter" @mouseleave="onCategoryLeave">
				{{ $t('common.type') }}
			</th>
			<th class="thIcon"></th>
			<th class="thName">{{ $t('common.ingredients') }}</th>
			<th class="thStock">{{ $t('common.stock') }}</th>
			<th v-if="isClan" class="thDonation">{{ $t('common.donation') }}</th>
		</tr>

		<template v-for="category in categorizedIngredients" :key="category.key">
			<Tippy
				theme="normal"
				tag="tr"
				v-for="(ingredient, index) in category.ingredients"
				:key="ingredient.ingredientId"
				:class="{
					full: (ingredient.quantity ?? 0) >= ingredient.maxQuantity,
					even: index % 2 === 1,
					clickable: isClan && (ingredient.quantity ?? 0) > 0
				}"
				:onShow="onTooltipShow"
				@click="toggleIngredient(ingredient)"
			>
				<th
					v-if="index === 0"
					scope="rowgroup"
					:rowspan="category.ingredients.length"
					class="tdCategory"
					@click.stop
					@mouseenter="onCategoryEnter"
					@mousemove="onCategoryEnter"
					@mouseleave="onCategoryLeave"
				>
					<span class="categoryName">{{ $t(`ingredients.categories.${category.key}`) }}</span>
				</th>
				<td class="tdIcon">
					<img :src="getImgURL('ingredients', ingredient.name)" :alt="ingredient.name" />
				</td>
				<td class="tdName">{{ $t(`ingredients.name.${ingredient.name}`) }}</td>
				<td class="tdStock" v-if="(ingredient.quantity ?? 0) !== 0">
					{{ ingredient.quantity }}/{{ ingredient.maxQuantity }}
				</td>
				<td class="tdStock" v-else>--</td>
				<td v-if="isClan" class="tdDonation" @click.stop>
					<DZInput
						type="number"
						v-model="giveAwayMap[ingredient.ingredientId]"
						:max="ingredient.quantity"
						min="0"
						:disabled="(ingredient.quantity ?? 0) === 0"
					/>
				</td>
				<template #content>
					<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name}`))" />
					<p v-html="formatContent($t(`ingredients.description.${ingredient.name}`))" />
				</template>
			</Tippy>
		</template>
	</DZTable>
	<div class="actions" v-if="isClan">
		<DZButton :disabled="!hasIngredientsInStock" @click="toggleSelectAll()">
			{{ isAllSelected ? $t('common.deselectAll') : $t('common.selectAll') }}
		</DZButton>
		<DZButton :disabled="totalGivenIngredients === 0" @click="giveToClan()">
			{{ $t(`clan.ingredients.giveAway`) }}
		</DZButton>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { hideAll } from 'vue-tippy';
import type { IngredientFiche } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { ingredientCategoryList, orderedIngredientIds } from '@dinorpg/core/models/ingredients/ingredientCategories.js';
import { InventoryService } from '../services/inventory.service.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { errorHandler } from '../utils/errorHandler.js';
import { userStore } from '../store/userStore.js';
import { ClanService } from '../services/clan.service.ts';
import DZInput from '../components/utils/DZInput.vue';
import DZButton from '../components/utils/DZButton.vue';
import DZTable from '../components/utils/DZTable.vue';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';

export default defineComponent({
	name: 'Ingredients',
	components: {
		DZDisclaimer,
		DZButton,
		DZInput,
		DZTable,
		TitleHeader
	},
	data() {
		return {
			ingredientList: [] as Array<IngredientFiche>,
			userStore: userStore(),
			//bidValue: 0,
			giveAwayMap: {} as Record<number, number>,
			isCategoryHovered: false
		};
	},
	async mounted(): Promise<void> {
		await this.load();
	},
	methods: {
		async load() {
			try {
				const data = await InventoryService.getAllIngredientsData();
				const quantitiesById = new Map(data.map((row: { id: number; quantity: number }) => [row.id, row.quantity]));

				this.ingredientList = orderedIngredientIds.map(ingredientId => {
					const ref = ingredientList[ingredientId];
					return {
						ingredientId: ref.ingredientId,
						name: ref.name.toLowerCase(),
						quantity: quantitiesById.get(ref.ingredientId) ?? 0,
						maxQuantity: ref.maxQuantity,
						price: ref.price
					} as IngredientFiche;
				});
				this.giveAwayMap = Object.fromEntries(this.ingredientList.map(ing => [ing.ingredientId, 0]));
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async giveToClan() {
			const itemsToGive = Object.entries(this.giveAwayMap)
				.filter(([, quantity]) => Number(quantity) > 0)
				.map(([ingredientId, quantity]) => ({
					itemId: Number(ingredientId),
					quantity: Number(quantity)
				}));

			const gold = itemsToGive.reduce((acc, { itemId, quantity }) => {
				const price = Object.values(ingredientList).find(a => a.ingredientId === itemId)?.price ?? 0;
				return acc + price * quantity;
			}, 0);

			const res = await this.$confirm({
				message: this.$t(`clan.ingredients.confirm`, { gold: gold }),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});

			if (!res) return;

			if (!this.userStore.getClanId) {
				this.$toast.error(this.$t('toast.missingData'));
				return;
			}

			try {
				await ClanService.giveIngredient(this.userStore.getClanId, itemsToGive);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}

			await this.load();
		},
		onCategoryEnter(): void {
			this.isCategoryHovered = true;
			hideAll();
		},
		onCategoryLeave(): void {
			this.isCategoryHovered = false;
		},
		onTooltipShow(): boolean {
			if (
				this.isCategoryHovered ||
				(typeof document !== 'undefined' && Boolean(document.querySelector('.tdCategory:hover, .thCategory:hover')))
			) {
				return false;
			}
			return true;
		},
		toggleIngredient(ingredient: IngredientFiche): void {
			if (!this.isClan) return;
			const stock = ingredient.quantity ?? 0;
			if (stock <= 0) return;
			const current = Number(this.giveAwayMap[ingredient.ingredientId] ?? 0);
			if (current === stock) {
				this.giveAwayMap[ingredient.ingredientId] = 0;
			} else {
				this.giveAwayMap[ingredient.ingredientId] = stock;
			}
		},
		toggleSelectAll(): void {
			if (this.isAllSelected) {
				for (const ing of this.availableIngredients) {
					this.giveAwayMap[ing.ingredientId] = 0;
				}
			} else {
				for (const ing of this.availableIngredients) {
					this.giveAwayMap[ing.ingredientId] = ing.quantity ?? 0;
				}
			}
		}
	},
	computed: {
		isClan(): boolean {
			return Boolean(this.userStore.getClanId);
		},
		availableIngredients(): IngredientFiche[] {
			return this.ingredientList.filter(i => (i.quantity ?? 0) > 0);
		},
		hasIngredientsInStock(): boolean {
			return this.availableIngredients.length > 0;
		},
		isAllSelected(): boolean {
			if (this.availableIngredients.length === 0) return false;
			return this.availableIngredients.every(
				ing => Number(this.giveAwayMap[ing.ingredientId] ?? 0) === (ing.quantity ?? 0)
			);
		},
		totalGivenIngredients(): number {
			return Object.values(this.giveAwayMap).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
		},
		categorizedIngredients(): Array<{
			key: string;
			ingredients: IngredientFiche[];
		}> {
			const ingredientsById = new Map(this.ingredientList.map(ing => [ing.ingredientId, ing]));
			return ingredientCategoryList.map(cat => ({
				key: cat.key,
				ingredients: cat.ingredientIds
					.map(id => ingredientsById.get(id))
					.filter((ing): ing is IngredientFiche => ing !== undefined)
			}));
		}
	}
});
</script>

<style lang="scss" scoped>
th {
	vertical-align: middle !important;
	padding-top: 0 !important;
	padding-bottom: 0 !important;
}
td {
	vertical-align: middle;
}
:deep(tr.clickable) {
	cursor: pointer;
}
.thCategory {
	width: 85px;
	text-align: center;
}
.thName {
	padding-left: 4px;
	padding-right: 4px;
	max-width: 200px;
}
.thIcon,
.tdIcon {
	width: 32px;
}
.thStock {
	padding-left: 4px;
	padding-right: 4px;
	max-width: 52px;
	text-align: center;
}
.thDonation {
	width: 70px;
	max-width: 70px;
	text-align: center;
	padding-left: 4px;
	padding-right: 4px;
}
.tdDonation {
	width: 70px;
	max-width: 70px;
	text-align: center;
	padding: 1px 4px;
	cursor: default;

	:deep(input) {
		width: 58px;
		min-width: 40px;
		padding: 2px 4px 0 4px;
		text-align: center;
	}
}
.tdCategory {
	width: 85px;
	text-align: center;
	vertical-align: middle !important;
	background: linear-gradient(to right, #add347 0%, #9fca35 45%, #84b82b 100%) !important;
	border: 1px solid #356847 !important;
	color: #fffdba !important;
	text-shadow: 1px 1px 0px #356847;
	font-size: 8pt;
	font-weight: bold;
	text-transform: uppercase;
	letter-spacing: 1pt;
	padding: 4px 2px;
	cursor: default;

	.categoryName {
		display: block;
		line-height: 1.2;
	}
}
.tdIcon {
	display: flex;
	align-items: center;
	justify-content: center;
}
.tdName {
	padding: 1px 5px;
	max-width: 222px;
}
.tdStock {
	padding: 1px 5px;
	width: 52px;
	text-align: center;
}
.actions {
	display: flex;
	justify-content: center;
	gap: 10px;
	margin-top: 15px;
	flex-wrap: wrap;
}
</style>
