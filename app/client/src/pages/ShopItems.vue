<template>
	<TitleHeader
		v-if="actualShop"
		:title="$t('pageTitle.shop', { shop: $t(`shop.item.${actualShop.name}.name`) })"
		:header="formatContent($t(`shop.item.title`))"
		:subHeader="formatContent($t(`shop.item.${actualShop.name}.name`))"
	/>
	<div class="shop" v-if="actualShop">
		<div class="dz-box shopDesc">
			<h3 class="shopName">
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
				{{ $t(`shop.item.${actualShop.name}.name`) }}
				<img :src="getImgURL('icons', 'info_button')" alt="info_button" />
			</h3>
			<img class="art" :src="getImgURL('shop', `shop_${actualShop.name}`)" :alt="actualShop.name" />
			<p class="shopText" v-html="formatContent($t(`shop.item.${actualShop.name}.description`))" />
		</div>
		<div class="shopShop">
			<div class="back">
				<div class="list">
					<template v-if="itemList.length > 0">
						<Tippy
							theme="small"
							class="name"
							v-for="(item, index) in itemList"
							:id="item.name"
							:key="index"
							tag="img"
							:src="getImgURL('item', `item_${item.name}`)"
							:alt="item.name"
							@click="selectItem(item.itemId)"
						>
							<template #content>
								<h2 v-html="formatContent($t(`items.name.${item.name}`))" />
								<p v-if="item.itemType === 'magical'">
									{{ formatContent($t(`shop.item.price`)) }}
									<img :src="getImgURL('item', 'item_golden_napodino')" alt="napodino" />
									{{ formatContent($t(`items.name.golden_napodino`)) }}
									x {{ item.price }}
								</p>
								<p v-else>
									{{ item.price }}
									<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
								</p>
							</template>
						</Tippy>
					</template>
					<template v-else>
						<Tippy
							theme="small"
							class="name"
							v-for="(item, index) in ingredientList"
							:id="item.name"
							:key="index"
							tag="img"
							:src="getImgURL('ingredients', item.name)"
							:alt="item.name"
							@click="selectItem(item.ingredientId)"
						>
							<template #content>
								<h2 v-html="formatContent($t(`ingredients.name.${item.name}`))" />
								<div>
									{{ item.price }} -> 1
									<img :src="getImgURL('icons', 'ticket')" alt="ticket" />
								</div>
							</template>
						</Tippy>
					</template>
				</div>
			</div>
			<div class="details">
				<div v-if="!selectedItem" id="shop_guide">
					<div class="shop_help">
						<img :src="getImgURL('background', `shop_arrow`)" alt="arrow" class="arrow" />
						<p v-html="formatContent($t('shop.item.help'))" />
					</div>

					<div class="ad" v-html="formatContent($t('shop.item.advice') + $t('shop.item.advice_1'))" />
				</div>
				<div
					v-if="selectedItem && selectedItem.type === ItemShopType.ITEM"
					id="item_"
					class="item"
					style="display: block"
				>
					<Tippy theme="small" tag="div" class="stock" v-if="!isFull(selectedItem)" @click="popinConfirmChoice(true)">
						{{ resolveItem(selectedItem).quantity }} / {{ resolveItem(selectedItem).maxQuantity }}
						<template #content>
							<div
								v-html="
									formatContent(
										$t('tooltip.shop.buyMaxTopNote', {
											own: selectedItem.quantity,
											max: resolveItem(selectedItem).maxQuantity
										})
									)
								"
							/>
							<div v-html="formatContent($t('tooltip.shop.buyMaxBottomNote'))" />
						</template>
					</Tippy>
					<Tippy
						theme="small"
						tag="div"
						class="stock"
						:class="{
							full: true
						}"
						v-else
					>
						{{ resolveItem(selectedItem).quantity }} / {{ resolveItem(selectedItem).maxQuantity }}
						<template #content>
							<div
								v-html="
									formatContent(
										$t('tooltip.shop.buyMaxTopNote', {
											own: selectedItem.quantity,
											max: resolveItem(selectedItem).maxQuantity
										})
									)
								"
							/>
							<div v-html="formatContent($t('tooltip.shop.buyMaxBottomNote'))" />
						</template>
					</Tippy>
					<div class="type">
						<Tippy
							theme="small"
							tag="img"
							v-if="resolveItem(selectedItem).canBeUsedNow"
							:src="getImgURL('icons', 'small_use')"
							alt="use"
						>
							<template #content>
								<p v-html="formatContent($t('tooltip.item.use'))" />
							</template>
						</Tippy>
						<Tippy theme="small" tag="img" v-else :src="getImgURL('icons', 'small_use_off')" alt="no use">
							<template #content>
								<p v-html="formatContent($t('tooltip.item.useOff'))" />
							</template>
						</Tippy>
						<Tippy
							theme="small"
							tag="img"
							v-if="resolveItem(selectedItem).canBeEquipped"
							:src="getImgURL('icons', 'small_equip')"
							alt="equip"
						>
							<template #content>
								<p v-html="formatContent($t('tooltip.item.equip'))" />
							</template>
						</Tippy>
						<Tippy theme="small" tag="img" v-else :src="getImgURL('icons', 'small_equip_off')" alt="un-equip">
							<template #content>
								<p v-html="formatContent($t('tooltip.item.equipOff'))" />
							</template>
						</Tippy>
					</div>
					<div class="infos">
						<label for="field_1">{{ $t('shop.item.quantity') }}</label>
						<DZInput type="number" v-model="selectedQuantity" :max="resolveItem(selectedItem).maxQuantity" min="0" />
						<a
							class="button"
							v-if="isSelectedQuantityValid(selectedQuantity, resolveItem(selectedItem))"
							@click="popinConfirmChoice(false)"
						>
							{{ $t(`shop.item.buy`) }}
						</a>
						<Tippy theme="small" tag="a" class="button disabled" v-else>
							<template #content>
								<div v-html="formatContent($t('tooltip.shop.invalidQuantity'))" />
								<div v-html="formatContent($t('tooltip.shop.invalidQuantity_foot'))" />
							</template>
							{{ $t(`shop.item.buy`) }}
						</Tippy>
					</div>
					<div class="header">
						<img
							class="icon"
							:src="getImgURL('item', `item_${resolveItem(selectedItem).name}`)"
							:alt="resolveItem(selectedItem).name"
						/>
						<div class="name">
							{{ $t(`items.name.${resolveItem(selectedItem).name}`) }}
						</div>
						<div v-if="selectedItem.itemType !== 'magical'" class="value">
							<span class="money">
								{{ resolveItem(selectedItem).price }}
								<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
							</span>
						</div>
					</div>
					<div class="clear"></div>
					<div v-if="selectedItem.itemType === 'magical'" class="objValue">
						{{ formatContent($t(`shop.item.price`)) }}
						<img :src="getImgURL('item', 'item_golden_napodino')" alt="napodino" />
						{{ formatContent($t(`items.name.golden_napodino`)) }}
						x {{ selectedItem.price }}
					</div>
					<div class="desc" v-html="formatContent($t(`items.description.${resolveItem(selectedItem).name}`))" />
				</div>
				<div
					v-if="selectedItem && selectedItem.type === ItemShopType.INGREDIENT"
					id="ingredient_"
					class="item"
					style="display: block"
				>
					<Tippy
						theme="small"
						tag="div"
						class="stock"
						:class="{
							full: isFull(selectedItem)
						}"
						:key="selectedItem.quantity"
						@click="popinConfirmChoice(true)"
					>
						{{ resolveIngredient(selectedItem).quantity }} / {{ resolveIngredient(selectedItem).maxQuantity }}
						<template #content>
							<div
								v-html="
									formatContent(
										$t('tooltip.shop.buyMaxTopNote', {
											own: selectedItem.quantity,
											max: resolveItem(selectedItem).maxQuantity
										})
									)
								"
							/>
							<div v-html="formatContent($t('tooltip.shop.buyMaxBottomNote'))" />
						</template>
					</Tippy>
					<div class="infos">
						<label for="field_1">{{ $t('shop.item.quantity') }}</label>
						<DZInput type="number" v-model="selectedQuantity" :max="selectedItem.quantity" min="0" />
						<a
							class="button"
							v-if="selectedQuantity > 0 && selectedQuantity * selectedItem.price <= (selectedItem.quantity ?? 0)"
							@click="popinConfirmChoice(false)"
						>
							{{ $t(`shop.item.buy`) }}
						</a>
						<Tippy theme="small" tag="a" class="button disabled" v-else>
							<template #content>
								<div v-html="formatContent($t('tooltip.shop.invalidQuantity'))" />
								<div v-html="formatContent($t('tooltip.shop.invalidQuantity_foot'))" />
							</template>
							{{ $t(`shop.item.buy`) }}
						</Tippy>
					</div>
					<div class="header">
						<img
							class="icon"
							:src="getImgURL('ingredients', resolveIngredient(selectedItem).name)"
							:alt="resolveIngredient(selectedItem).name"
						/>
						<div class="name">
							{{ $t(`ingredients.name.${resolveIngredient(selectedItem).name}`) }}
						</div>
						<div v-if="resolveItem(selectedItem).itemType !== 'magical'" class="value">
							<span class="money">
								{{ resolveItem(selectedItem).price }} -> 1
								<img :src="getImgURL('icons', 'ticket')" alt="ticket" />
							</span>
						</div>
					</div>
					<div class="clear"></div>
					<div v-if="resolveItem(selectedItem).itemType === 'magical'" class="objValue">
						{{ formatContent($t(`shop.item.price`)) }}
						<img :src="getImgURL('item', 'item_golden_napodino')" alt="napodino" />
						{{ formatContent($t(`item.name.golden_napodino`)) }}
						x {{ selectedItem.price }}
					</div>
					<div
						class="desc"
						v-html="formatContent($t(`ingredients.description.${resolveIngredient(selectedItem).name}`))"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import type { IngredientFiche } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import type { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { type ItemShopFiche, ItemShopType } from '@dinorpg/core/models/shop/shopFiche.js';
import { shopList } from '@dinorpg/core/models/shop/shopList.js';
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { ShopService } from '../services/shop.service.js';
import { dinozStore } from '../store/dinozStore.js';
import { userStore } from '../store/userStore.js';
import { formatText } from '../utils/formatText.js';
import { errorHandler } from '../utils/errorHandler.js';
import DZInput from '../components/utils/DZInput.vue';

export default defineComponent({
	name: 'ShopItems',
	data() {
		return {
			userStore: userStore(),
			dinozStore: dinozStore(),
			itemList: [] as Array<ItemFiche>,
			ingredientList: [] as IngredientFiche[],
			fullItems: [] as ItemShopFiche[],
			shopList: shopList,
			selectedItem: undefined as ItemShopFiche | undefined,
			selectedQuantity: 1,
			ItemShopType: ItemShopType
		};
	},
	components: {
		TitleHeader,
		DZInput
	},
	computed: {
		// Check if the quantity select is valid:
		// i.e a valid number or the player has enough room
		isSelectedQuantityValid(): {
			(selectedQuantity: number, selectedItem: ItemFiche): boolean;
		} {
			return (selectedQuantity: number, selectedItem: ItemFiche) => {
				return (
					selectedQuantity > 0 &&
					selectedQuantity <= selectedItem.maxQuantity - (selectedItem.quantity ?? 0) &&
					Number.isInteger(selectedQuantity)
				);
			};
		},
		actualShop() {
			const shop = Object.values(shopList).find(s => s.name === this.$route.params.name);
			if (!shop) {
				this.$toast.open({
					message: this.$t('toast.noShop'),
					type: 'error'
				});
				return;
			}
			return shop;
		}
	},
	methods: {
		isFull(item: ItemShopFiche): boolean {
			return (this.resolveItem(item).quantity ?? 0) >= this.resolveItem(item).maxQuantity;
		},
		// Buy n of the selected item
		async buyItems(itemId: number, quantity: number): Promise<void> {
			if (!this.actualShop || !this.selectedItem) return;
			try {
				const bought = await ShopService.buyItem(this.actualShop.shopId, itemId, quantity);
				let message = this.$t(`toast.itemBought`, {
					quantity: bought.quantity,
					itemName: this.$t(`items.name.${this.resolveItem(this.selectedItem).name}`)
				});
				if (this.actualShop.type === ShopType.FILOU) {
					message = this.$t(`toast.itemBought`, {
						quantity: bought.quantity,
						itemName: this.$t(`leftPanel.wallets.treasureTicket`)
					});
				}
				this.$toast.open({
					message: formatText(message),
					type: 'info'
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
			// Update player's money if the item purchased is non magical
			if (
				this.actualShop.type === ShopType.CLASSIC ||
				this.actualShop.type === ShopType.CURSED ||
				this.actualShop.type === ShopType.ITINERANT
			) {
				// Update the new quantity
				// Both values are forced to number to avoid them somehow being treated as a string
				this.selectedItem.quantity = (this.selectedItem.quantity ?? 0) + quantity;
				await this.$refreshGold();
			} else if (this.actualShop.type === ShopType.FILOU) {
				this.selectedItem = undefined;
				await this.$refreshTreasureTicket();
				await this.loadPage();
			}
		},
		async popinConfirmChoice(max: boolean): Promise<void> {
			if (!this.selectedItem || !this.actualShop) return;
			let quantity: number;
			let totalPrice;
			if (this.selectedItem.type === ItemShopType.INGREDIENT) {
				if (max) {
					quantity = Math.floor((this.selectedItem.quantity ?? 0) / this.selectedItem.price);
				} else {
					quantity = this.selectedQuantity;
				}
				if (quantity > (this.selectedItem.quantity ?? 0)) {
					quantity = Math.floor((this.selectedItem.quantity ?? 0) / this.selectedItem.price);
				}
				totalPrice = quantity * this.selectedItem.price;
			} else {
				const myGolds = this.userStore.gold;
				if (max) {
					quantity = this.resolveItem(this.selectedItem).maxQuantity - (this.selectedItem.quantity ?? 0);
				} else {
					quantity = this.selectedQuantity;
				}
				totalPrice = quantity * this.selectedItem.price;
				if (totalPrice > myGolds) {
					quantity = Math.floor(myGolds / this.selectedItem.price);
					totalPrice = quantity * this.selectedItem.price;
				}
			}
			const item =
				this.selectedItem.type === ItemShopType.ITEM
					? this.$t(`items.name.${this.resolveItem(this.selectedItem).name}`)
					: this.$t(`ingredients.name.${this.resolveIngredient(this.selectedItem).name}`);
			let text;
			switch (this.actualShop.type) {
				case ShopType.FILOU:
					text = this.$t('shop.confirm.filou', {
						quantity: quantity,
						item: item,
						sold: totalPrice
					});
					break;
				case ShopType.MAGICAL:
					text = this.$t('shop.confirm.magic', {
						item: item,
						sold: totalPrice
					});
					break;
				default:
					text = this.$t('shop.confirm.classic', {
						quantity: quantity,
						item: item,
						value: totalPrice
					});
			}
			const res: boolean = await this.$confirm({
				message: text,
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res && quantity > 0) {
				await this.buyItems(this.selectedItem.id, quantity);
			}
		},
		resolveItem(item: ItemShopFiche): ItemFiche {
			const realItem = Object.values(itemList).find(i => i.itemId === item.id);
			if (!realItem) throw new Error(`Unknown itemId ${item.id}`);
			return {
				...realItem,
				price: item.price,
				quantity: item.quantity ?? 0,
				maxQuantity:
					this.userStore.isShopkeeper && realItem?.itemType !== ItemType.MAGICAL
						? Math.round((realItem?.maxQuantity ?? 1) * 1.5)
						: realItem?.maxQuantity
			};
		},
		resolveIngredient(item: ItemShopFiche): IngredientFiche {
			const realIngredient = Object.values(ingredientList).find(i => i.ingredientId === item.id);
			return {
				...realIngredient,
				price: item.price,
				quantity: item.quantity ?? 0
			} as IngredientFiche;
		},
		selectItem(itemId: number) {
			this.selectedQuantity = 1;
			this.selectedItem = this.fullItems.find(i => i.id === itemId);
			if (this.selectedItem?.type === ItemShopType.ITEM) {
				this.selectedItem.itemType = this.itemList.find(i => i.itemId === itemId)?.itemType;
			}
		},
		async loadPage() {
			this.selectedItem = undefined;
			// Get shop and its items to display
			try {
				this.fullItems = await ShopService.getItemsFromItemShop(this.actualShop?.shopId ?? 0);
				this.itemList = this.fullItems
					.filter(i => i.type === ItemShopType.ITEM)
					.map(i => {
						return this.resolveItem(i);
					});
				this.ingredientList = this.fullItems
					.filter(i => i.type === ItemShopType.INGREDIENT)
					.map(i => {
						return this.resolveIngredient(i);
					});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				this.$router.push({
					name: 'DinozPage',
					params: { id: this.dinozStore.getCurrentDinozId }
				});
				return;
			}
		}
	},
	async mounted(): Promise<void> {
		await this.loadPage();
	},
	watch: {
		// Reload the item list if the player go on another shop page
		'$route.params.name': async function () {
			if (this.$route.name !== this.$options.name) return;
			await this.loadPage();
		}
	}
});
</script>

<style lang="scss" scoped>
@media (max-width: 524px) {
	.arrow {
		transform: rotate(90deg);
	}
}
.shopName {
	grid-area: top;
	justify-self: stretch;
	align-self: center;
	justify-content: space-evenly;
}
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
	}
	.shopShop {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 95%;
		align-self: center;
		.back {
			background: url('../assets/background/shop_bg_items.webp');
			width: 162px;
			height: 193px;
			.list {
				padding-right: 14px;
				padding-top: 12px;
				padding-left: 14px;
				display: flex;
				flex-wrap: wrap;
				gap: 2px;
				img {
					align-self: center;
					&:hover {
						outline: 1px solid white;
						cursor: pointer;
					}
				}
			}
		}
		.details {
			background: url('../assets/background/shop_bg_detail.webp') no-repeat;
			width: 306px;
			height: 266px;
			padding: 15px;
			#shop_guide {
				.shop_help {
					padding-left: 15px;
					display: flex;
					gap: 10px;
					img {
						object-fit: contain;
					}
					p {
						text-indent: 0px;
						color: #fce3bc;
						background-position: 0px 5px;
						background-repeat: no-repeat;
					}
				}
				.ad {
					margin-top: 70px;
					color: #ffee92;
					font-size: 9pt;
					line-height: 10pt;
					font-style: italic;
				}
			}
			.item {
				display: none;
			}
			.name {
				color: #ffee92;
				font-variant: small-caps;
				font-weight: bold;
				line-height: 9pt;
				padding-bottom: 4px;
				border-bottom: 1px solid #ffee92;
			}
			.noValue {
				height: 12px;
			}
			.value {
				color: white;
				font-size: 9pt;
				margin-top: 1px;
				span.money {
					background-color: transparent;
					border: 0px;
					color: #ffee92;
				}
				img {
					vertical-align: -5%;
				}
				.objValue {
					margin-top: 4px;
					padding: 3px;
					color: #ffee92;
					font-weight: bold;
					border-top: 1px solid #9a4029;
					border-bottom: 1px solid #9a4029;
					img {
						vertical-align: -50%;
					}
				}
			}
			.objValue {
				margin-top: 4px;
				padding: 3px;
				color: #ffee92;
				font-weight: bold;
				border-top: 1px solid #9a4029;
				border-bottom: 1px solid #9a4029;
				img {
					vertical-align: -50%;
				}
			}
			.type {
				position: absolute;
				z-index: 2;
				margin-top: 23px;
				margin-left: 230px;
				width: 65px;
				text-align: right;
				font-size: 0pt;
				line-height: 0pt;
				img {
					margin-left: 5px;
					cursor: help;
				}
			}
			.desc {
				color: #fce3bc;
				font-size: 11pt;
				line-height: 12pt;
			}
			.obj {
				margin-top: 0px;
			}
			.infos {
				position: absolute;
				margin-top: 143px;
				width: 294px;
				padding-top: 2px;
				border-top: 1px solid #ffee92;
				display: flex;
				flex-direction: revert;
				justify-content: space-between;
				input {
					align-self: center;
				}
			}
			.stock {
				position: absolute;
				width: 75px;
				margin-left: 220px;
				padding-right: 5px;
				text-align: right;
				color: #ffee92;
				font-size: 11pt;
				letter-spacing: -0.5pt;
				background-color: #b46843;
				border: 1px solid #ffee92;
				cursor: pointer;
				&:hover {
					border-color: white;
					background-color: #9f562b;
				}
			}
			img.icon {
				float: left;
				position: relative;
				border: 1px solid black;
				margin-right: 5px;
			}
			label {
				align-self: center;
				display: block;
				float: right;
				position: relative;
				margin-top: 4px;
				margin-bottom: 4px;
				margin-right: 2px;
				padding: 3px 6px;
				border-radius: 10px;
				-webkit-border-radius: 10px;
				font-size: 8pt;
				background-color: #9a4029;
				color: #ffee92;
			}
		}
	}
	.bg {
		margin: auto;
		width: 520px;
		height: 222px;
		background-image: url('../assets/background/shop_bg.webp');
		background-repeat: no-repeat;
		.list {
			position: absolute;
			width: 140px;
			margin-left: 20px;
			margin-top: 19px;
			font-size: 0pt;
			line-height: 0pt;
			a {
				display: block;
				float: left;
				position: relative;
				width: 32px;
				height: 32px;
				border: 1px solid #b37047;
				border-radius: 0px;
				-webkit-border-radius: 0px;
				cursor: pointer;
				&:hover {
					border-color: white;
					z-index: 3;
				}
			}
		}
		.full {
			.stock {
				color: yellow;
				font-weight: bold;
			}
			.button {
				opacity: 0.3;
			}
		}
		.details {
			position: absolute;
			width: 294px;
			height: 180px;
			margin-left: 200px;
			margin-top: 20px;
			#shop_guide {
				.ad {
					margin-top: 70px;
					color: #ffee92;
					font-size: 9pt;
					line-height: 10pt;
					font-style: italic;
				}
				p {
					padding-left: 40px;
					text-indent: 0px;
					color: #fce3bc;
					background-image: url('../assets/background/shop_arrow.webp');
					background-position: 0px 5px;
					background-repeat: no-repeat;
				}
			}
			.item {
				display: none;
			}

			.noValue {
				height: 12px;
			}
			.value {
				color: white;
				font-size: 9pt;
				margin-top: 1px;
				span.money {
					background-color: transparent;
					border: 0px;
					color: #ffee92;
				}
				img {
					vertical-align: -5%;
				}
				.objValue {
					margin-top: 4px;
					padding: 3px;
					color: #ffee92;
					font-weight: bold;
					border-top: 1px solid #9a4029;
					border-bottom: 1px solid #9a4029;
					img {
						vertical-align: -50%;
					}
				}
			}
			.objValue {
				margin-top: 4px;
				padding: 3px;
				color: #ffee92;
				font-weight: bold;
				border-top: 1px solid #9a4029;
				border-bottom: 1px solid #9a4029;
				img {
					vertical-align: -50%;
				}
			}
			.type {
				position: absolute;
				z-index: 2;
				margin-top: 23px;
				margin-left: 230px;
				width: 65px;
				text-align: right;
				font-size: 0pt;
				line-height: 0pt;
				img {
					margin-left: 5px;
					cursor: help;
				}
			}
			.desc {
				color: #fce3bc;
				font-size: 11pt;
				line-height: 12pt;
			}
			.obj {
				margin-top: 0px;
			}
			.infos {
				position: absolute;
				margin-top: 143px;
				width: 294px;
				padding-top: 2px;
				border-top: 1px solid #ffee92;
				display: flex;
				flex-direction: revert;
				justify-content: space-between;
				input {
					align-self: center;
				}
			}
			.stock {
				position: absolute;
				width: 60px;
				margin-left: 233px;
				padding-right: 5px;
				text-align: right;
				color: #ffee92;
				font-size: 11pt;
				letter-spacing: -0.5pt;
				background-color: #b46843;
				border: 1px solid #ffee92;
				cursor: pointer;
				&:hover {
					border-color: white;
					background-color: #9f562b;
				}
			}
			img.icon {
				float: left;
				position: relative;
				border: 1px solid black;
				margin-right: 5px;
			}
			label {
				align-self: center;
				display: block;
				float: right;
				position: relative;
				margin-top: 4px;
				margin-bottom: 4px;
				margin-right: 2px;
				padding: 3px 6px;
				border-radius: 10px;
				-webkit-border-radius: 10px;
				font-size: 8pt;
				background-color: #9a4029;
				color: #ffee92;
			}
		}
	}
	.bg2 {
		background-image: url('../assets/background/shop_bg2.webp');
		height: 304px;
	}
	p {
		line-height: 12pt;
		&:first-letter {
			font-weight: bold;
			font-size: 115%;
			color: white;
		}
	}
	.full {
		font-weight: bold;
	}
	.disabled {
		opacity: 0.3;
	}
	div {
		.clear {
			clear: both;
			height: 1px;
			font-size: 0pt;
			line-height: 0pt;
		}
	}
	// Does not work, so I changed in _general.scss
	/*& strong {
		color: white;
	}*/
}
</style>
