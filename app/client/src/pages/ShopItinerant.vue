<template>
	<TitleHeader :title="$t('pageTitle.itinerant')" :header="formatContent($t(`shop.item.merchant.name`))" />
	<div class="shop">
		<div class="dz-box shopDesc">
			<h3 class="shopName">
				<img :src="getImgURL('design', 'info_button')" alt="info_button" />
				{{ $t(`shop.item.merchant.name`) }}
				<img :src="getImgURL('design', 'info_button')" alt="info_button" />
			</h3>
			<img class="art" :src="getImgURL('shop', 'shop_itinerant')" :alt="formatContent($t(`shop.item.merchant.name`))" />
			<p class="shopText" v-html="formatContent($t(`shop.item.merchant.description`))" />
		</div>
		<div class="list">
			<div v-if="ingredientList.length === 0" class="sundayMessage">
				<p v-html="formatContent($t(`shop.item.merchant.dimanche`))" />
			</div>
			<table v-if="ingredientList.length !== 0">
				<tbody>
					<tr>
						<th class="icon"></th>
						<th class="name">{{ $t('ingredients.tname') }}</th>
						<th class="stock">{{ $t('ingredients.tstock') }}</th>
						<th class="quantity">{{ $t('ingredients.tquantity') }}</th>
					</tr>
					<Tippy
						theme="normal"
						v-for="(ingredient, index) in ingredientList"
						:id="ingredientNameList[ingredient.ingredientId]"
						:key="ingredient.ingredientId"
						:class="{
							full: (ingredient.quantity ?? 0) >= ingredient.maxQuantity,
							even: (index + 1) % 2 == 0
						}"
						tag="tr"
					>
						<td class="icon">
							<img
								:src="getImgURL('ingredients', `${ingredientNameList[ingredient.ingredientId]}`)"
								:alt="ingredientNameList[ingredient.ingredientId]"
							/>
						</td>
						<td
							class="name"
							v-html="formatContent($t(`ingredients.name.${ingredientNameList[ingredient.ingredientId]}`))"
						/>
						<td class="stock" v-if="ingredient.quantity !== 0">
							{{ ingredient.quantity }}/{{ ingredient.maxQuantity }}
						</td>
						<td class="stock" v-else>--</td>
						<td class="quantity">
							<DZInput
								type="number"
								min="0"
								:max="ingredient.quantity"
								v-model="inputValuesById[ingredient.ingredientId]"
								@input="liveGold()"
							/>
						</td>

						<template #content>
							<h1 v-html="formatContent($t(`ingredients.name.${ingredientNameList[ingredient.ingredientId]}`))" />
							<p v-html="formatContent($t(`ingredients.description.${ingredientNameList[ingredient.ingredientId]}`))" />
							<p>
								{{ ingredient.price }}
								<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
							</p>
						</template>
					</Tippy>
				</tbody>
			</table>
		</div>
		<div v-if="ingredientList.length !== 0 && totalSell > 0" class="sell">
			<a
				class="button"
				v-html="formatContent($t('shop.item.sell', { gold: totalSell }))"
				@click="sellIngredientPopinConfirmChoice()"
			/>
		</div>
	</div>
</template>

<script lang="ts" scoped>
import type { IngredientFiche } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import { ingredientNameList } from '@dinorpg/core/models/ingredients/ingredientNameList.js';
import type { ShopDTO } from '@dinorpg/core/models/shop/shopFiche.js';
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { itinerantShopNameList } from '../constants/shop.js';
import { ShopService } from '../services/shop.service.js';
import { dinozStore } from '../store/dinozStore.js';
import { userStore } from '../store/userStore.js';
import { formatText } from '../utils/formatText.js';
import { errorHandler } from '../utils/errorHandler.js';
import DZInput from '../components/utils/DZInput.vue';

export default defineComponent({
	name: 'ShopItinerant',
	components: {
		TitleHeader,
		DZInput
	},
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: userStore(),
			itinerantShopNameList: itinerantShopNameList,
			ingredientNameList: ingredientNameList,
			ingredientList: [] as Array<IngredientFiche>,
			inputValuesById: {} as Record<number, number>,
			itinerantId: undefined as number | undefined,
			totalSell: 0 as number
		};
	},
	methods: {
		async sellIngredientPopinConfirmChoice(): Promise<void> {
			const res = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			const currentDinozId = this.dinozStore.currentDinozId;

			if (typeof currentDinozId !== 'number') {
				this.$toast.open({
					message: this.$t(`toast.missingData`),
					type: 'error'
				});
				return;
			}

			const sellingItems = this.ingredientList
				.map(ing => ({ itemId: ing.ingredientId, quantity: this.inputValuesById[ing.ingredientId] ?? 0 }))
				.filter(i => i.quantity > 0)
				.filter(i => (this.ingredientList.find(a => a.ingredientId === i.itemId)?.quantity ?? 0) >= i.quantity);
			if (sellingItems.length < 1) {
				this.$toast.open({
					message: this.$t(`toast.needIngredientToSell`),
					type: 'error'
				});
				return;
			}
			if (res) {
				try {
					const gold = await ShopService.sellIngredient(currentDinozId, sellingItems);
					this.ingredientList = await ShopService.getIngredientsFromIngredientsShop(currentDinozId);
					this.inputValuesById = Object.fromEntries(this.ingredientList.map(i => [i.ingredientId, 0]));
					this.totalSell = 0;
					const message = this.$t(`toast.ingredientSold`, { value: gold.gold });
					this.$toast.open({
						message: formatText(message),
						type: 'info'
					});
					this.playerStore.setGold(gold.gold);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		liveGold() {
			this.totalSell = this.ingredientList.reduce((sum, ing) => {
				const qty = this.inputValuesById[ing.ingredientId] ?? 0;
				return sum + (ing.price ?? 0) * qty;
			}, 0);
		}
	},
	async mounted(): Promise<void> {
		this.itinerantId = parseInt(this.$route.params.itinerantId as string);
		try {
			const currentDinozId = this.dinozStore.currentDinozId;
			if (typeof currentDinozId !== 'number') {
				this.$toast.open({
					message: this.$t(`toast.missingData`),
					type: 'error'
				});
				return;
			}
			this.ingredientList = await ShopService.getIngredientsFromIngredientsShop(currentDinozId);
			this.inputValuesById = Object.fromEntries(this.ingredientList.map(i => [i.ingredientId, 0]));
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.shop {
	display: flex;
	align-self: center;
	flex-direction: column;
	align-items: center;
	gap: 15px;
	.shopDesc {
		font-style: italic;
		color: #ffee92;
		font-size: 10pt;
		display: grid;
		grid-template-rows: 17px auto;
		grid-template-columns: 180px auto;
		grid-template-areas: 'top top ' 'left center';
		min-height: 160px;
		max-width: 95%;
		padding-right: 10px;
		padding-bottom: 10px;
		.art {
			grid-area: left;
			justify-self: center;
			margin-top: 15px;
		}
		.shopText {
			grid-area: center;
			margin: 0px;
			justify-self: center;
			margin-top: 15px;
		}
		.shopName {
			grid-area: top;
			justify-self: stretch;
			align-self: center;
			justify-content: space-evenly;
		}
	}
	.list {
		max-width: 95%;
		justify-self: center;
		align-self: center;
		.sundayMessage {
			margin: 20px auto;
			width: 80%;
			padding: 10px;
			border: 4px solid #9a4029;
			border-radius: 5px;
			text-align: center;
			color: #9a4029;
		}
		table {
			background-color: #ecbd84;
			border-collapse: separate;
			border-spacing: 1px;
			tr {
				display: table-row;
				cursor: help;
				th {
					font-size: 8pt;
					text-shadow: 1px 1px 0px #356847;
					height: 42px;
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
					&.icon {
						width: 32px;
					}
					&.name {
						padding-left: 4px;
						padding-right: 4px;
						padding-bottom: 8px;
						max-width: 120px;
					}
					&.stock {
						padding-left: 4px;
						padding-right: 4px;
						padding-bottom: 8px;
						max-width: 15px;
					}
					&.quantity {
						padding-left: 4px;
						padding-bottom: 8px;
						padding-right: 4px;
						max-width: 50px;
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
						width: 330px;
					}
					&.stock {
						padding: 1px 5px;
						width: 52px;
					}
					&.quantity {
						padding: 1px 12px;
						width: 40px;
						.input {
							width: 40px;
						}
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
	}
	.sell {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		.button {
			background-size: cover;
			font-size: 10pt;
			padding-top: 9px;
			width: 166px;
			height: 25px;
		}
		.disabled {
			opacity: 0.3;
		}
	}
}
</style>
