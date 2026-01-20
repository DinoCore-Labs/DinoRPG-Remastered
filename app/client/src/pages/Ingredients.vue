<template>
	<TitleHeader :title="$t('pageTitle.ingredients')" :header="$t(`topBar.userMenu.ingredients`)" />
	<DZDisclaimer help round content="ingredients.disclaimer" />
	<table>
		<tbody>
			<tr>
				<th class="icon"></th>
				<th class="name">{{ $t('ingredients.tname') }}</th>
				<th class="stock">{{ $t('ingredients.tstock') }}</th>
				<!--<th v-if="isClan" class="clan"></th>-->
			</tr>

			<Tippy
				theme="normal"
				tag="tr"
				v-for="(ingredient, index) in ingredientList"
				:key="ingredient.ingredientId"
				:class="{
					full: (ingredient.quantity ?? 0) >= ingredient.maxQuantity,
					even: (index + 1) % 2 == 0
				}"
			>
				<td class="icon">
					<img :src="getImgURL('ingredients', ingredient.name)" :alt="ingredient.name" />
				</td>
				<td class="name">{{ $t(`ingredients.name.${ingredient.name}`) }}</td>
				<td class="stock" v-if="ingredient.quantity !== 0">{{ ingredient.quantity }}/{{ ingredient.maxQuantity }}</td>
				<!--<td v-if="isClan" class="stock">
					<DZInput type="number" v-model="giveAway[index].quantity" :max="ingredient.quantity" min="0" />
				</td>
				<td class="stock" v-else>--</td>-->
				<template #content>
					<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name}`))" />
					<p v-html="formatContent($t(`ingredients.description.${ingredient.name}`))" />
				</template>
			</Tippy>
		</tbody>
	</table>
	<!--<DZButton v-if="isClan" @click="giveToClan()">{{ $t(`clan.ingredients.giveAway`) }}</DZButton>-->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { IngredientFiche } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { InventoryService } from '../services/inventory.service.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { errorHandler } from '../utils/errorHandler.js';
//import { userStore } from '../store/userStore.js';
import DZInput from '../components/utils/DZInput.vue';
import DZButton from '../components/utils/DZButton.vue';

import DZDisclaimer from '../components/utils/DZDisclaimer.vue';

export default defineComponent({
	name: 'Ingredients',
	components: {
		DZDisclaimer,
		DZButton,
		DZInput,
		TitleHeader
	},
	data() {
		return {
			ingredientList: [] as Array<IngredientFiche>
			//playerStore: userStore(),
			//bidValue: 0,
			//giveAway: [] as Array<IngredientFiche>
		};
	},
	async mounted(): Promise<void> {
		await this.load();
	},
	methods: {
		async load() {
			try {
				const data = await InventoryService.getAllIngredientsData();
				// data = [{ id, quantity, maxQuantity }]

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
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}

		/*async giveToClan() {
      const gold = this.giveAway
        .filter(a => (a.quantity ?? 0) > 0)
        .reduce(
          (acc, cur) =>
            acc +
            (Object.values(ingredientList).find(a => a.ingredientId === cur.ingredientId)?.price ?? 0) *
              (cur.quantity ?? 0),
          0
        );
      const res = await this.$confirm({
        message: this.$t(`ingredients.giveAway.confirm`, { gold: gold }),
        header: this.$t('popup.attention'),
        acceptLabel: this.$t('popup.accept'),
        rejectLabel: this.$t('popup.reject'),
        icon: 'pi pi-trash'
      });
      if (res) {
        if (!this.playerStore.getClanId) {
          this.$toast.error(this.$t('toast.missingData'));
          return;
        }
        try {
          await ClanService.giveIngredient(
            this.playerStore.getClanId,
            this.giveAway
              .filter(a => a.quantity && a.quantity > 0)
              .map(i => {
                return { itemId: i.ingredientId, quantity: i.quantity ?? 0 };
              })
          );
        } catch (err) {
          errorHandler.handle(err, this.$toast);
          return;
        }
        await this.load();
      }
    }
  },
  computed: {
    isClan(): boolean {
      if (this.playerStore.getClanId) {
        return true;
      } else {
        return false;
      }
    }
  }*/
	}
});
</script>

<style lang="scss" scoped>
table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		cursor: help;
		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;
			max-width: 222px;
			&.name {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
				max-width: 200px;
			}
			&.icon {
				width: 32px;
			}
			&.stock {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
				max-width: 15px;
			}
		}
		td {
			font-size: 16px;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
			&.name {
				padding: 1px 5px;
				max-width: 222px;
			}
			&.stock {
				padding: 1px 5px;
				width: 52px;
			}
		}
		&.full td {
			background-image: url('../assets/background/table_cell_hover.webp') !important;
			background-position: -10px 0px;
			color: #fffdba;
		}
		&.even td {
			background-image: url('../assets/background/table_cell_even.webp');
			background-position: -10px 0px;
		}
	}
}
</style>
