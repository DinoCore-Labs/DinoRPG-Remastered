<template>
	<TitleHeader :title="$t('pageTitle.ingredients')" :header="$t(`topBar.userMenu.ingredients`)" />
	<DZDisclaimer help round content="ingredients.disclaimer" />
	<DZTable>
		<tr>
			<th class="thIcon"></th>
			<th class="thName">{{ $t('ingredients.tname') }}</th>
			<th class="thStock">{{ $t('ingredients.tstock') }}</th>
			<th v-if="isClan" class="clan"></th>
		</tr>

		<Tippy
			theme="normal"
			tag="tr"
			v-for="(ingredient, index) in filteredIngredientList"
			:key="ingredient.ingredientId"
			:class="{
				full: (ingredient.quantity ?? 0) >= ingredient.maxQuantity,
				even: (index + 1) % 2 == 0
			}"
		>
			<td class="tdIcon">
				<img :src="getImgURL('ingredients', ingredient.name)" :alt="ingredient.name" />
			</td>
			<td class="tdName">{{ $t(`ingredients.name.${ingredient.name}`) }}</td>
			<td class="tdStock" v-if="ingredient.quantity !== 0">{{ ingredient.quantity }}/{{ ingredient.maxQuantity }}</td>
			<td v-if="isClan" class="stock">
				<DZInput type="number" v-model="giveAwayMap[ingredient.ingredientId]" :max="ingredient.quantity" min="0" />
			</td>
			<td class="stock" v-else>--</td>
			<template #content>
				<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name}`))" />
				<p v-html="formatContent($t(`ingredients.description.${ingredient.name}`))" />
			</template>
		</Tippy>
	</DZTable>
	<DZButton v-if="isClan" @click="giveToClan()">{{ $t(`clan.ingredients.giveAway`) }}</DZButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { IngredientFiche } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
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
			giveAwayMap: {} as Record<number, number>
		};
	},
	async mounted(): Promise<void> {
		await this.load();
	},
	methods: {
		async load() {
			try {
				const data = await InventoryService.getAllIngredientsData();

				const ingredientsById = new Map(Object.values(ingredientList).map(ing => [ing.ingredientId, ing]));

				this.ingredientList = data.map((row: { id: number; quantity: number; maxQuantity: number }) => {
					const ref = ingredientsById.get(row.id);
					if (!ref) {
						// fallback si l'id n'existe pas dans le core
						return {
							ingredientId: row.id,
							name: 'unknown',
							quantity: row.quantity,
							maxQuantity: row.maxQuantity
						} as unknown as IngredientFiche;
					}
					return {
						ingredientId: ref.ingredientId,
						name: ref.name.toLowerCase(),
						quantity: row.quantity,
						maxQuantity: row.maxQuantity
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
				.filter(([, quantity]) => quantity > 0)
				.map(([ingredientId, quantity]) => ({
					itemId: Number(ingredientId),
					quantity
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
		}
	},
	computed: {
		isClan(): boolean {
			if (this.userStore.getClanId) {
				return true;
			} else {
				return false;
			}
		},
		filteredIngredientList(): IngredientFiche[] {
			return this.ingredientList.filter(i => (i.quantity ?? 0) > 0);
		}
	}
});
</script>

<style lang="scss" scoped>
.thName {
	padding-left: 4px;
	padding-right: 4px;
	padding-bottom: 8px;
	max-width: 200px;
}
.thIcon,
.tdIcon {
	width: 32px;
}
.thStock {
	padding-left: 4px;
	padding-right: 4px;
	padding-bottom: 8px;
	max-width: 15px;
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
}
</style>
