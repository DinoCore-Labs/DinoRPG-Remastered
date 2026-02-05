<template>
	<div class="inventory">
		<p class="wrapperMenu" @click="hidden = !hidden">{{ $t('dinozPage.inventory.sortBy') }}</p>
		<div ref="butt" class="wrapper" :class="hidden ? 'hidden' : 'shown'">
			<div class="label">
				<DZSelect class="sort-select" id="sort" v-model="sortOption" :options="sortOptions" @change="sortItems()" />
			</div>
		</div>
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('dinozPage.inventory.itemName') }}</th>
					<th class="qty">{{ $t('dinozPage.inventory.stock') }}</th>
					<th class="act">{{ $t('dinozPage.inventory.actions') }}</th>
				</tr>
				<tr v-for="(item, index) in allItemsData" :class="index % 2 === 1 ? 'even' : ''" :key="index">
					<Tippy class="name" tag="td" theme="normal">
						<img :src="getImgURL('item', `item_${itemNameList[item.itemId]}`)" :alt="itemNameList[item.itemId]" />
						<p v-html="$t(`items.name.${itemNameList[item.itemId]}`)" />
						<template #content>
							<h1 v-html="formatContent($t(`items.name.${itemNameList[item.itemId]}`))" />
							<h2>{{ $t(`tooltip.item.maxQuantity`) }} {{ item.maxQuantity }}</h2>
							<p v-html="formatContent($t(`items.description.${itemNameList[item.itemId]}`))" />
						</template>
					</Tippy>
					<td
						class="qty"
						:class="{
							full: isFull(item)
						}"
						v-tippy="{
							content: isFull(item) ? formatContent($t(`dinozPage.inventory.full`)) : '',
							theme: 'small'
						}"
					>
						<div>
							{{ item.quantity }}
						</div>
					</td>
					<td class="act">
						<a
							class="on"
							v-if="item.canBeUsedNow"
							v-tippy="{
								content: formatContent($t('tooltip.item.use')),
								theme: 'small'
							}"
						>
							<img :src="getImgURL('icons', 'small_use')" alt="small_use" />
						</a>
						<a
							class="off"
							v-else
							v-tippy="{
								content: formatContent($t('tooltip.item.useOff')),
								theme: 'small'
							}"
						>
							<img :src="getImgURL('icons', 'small_use_off')" alt="small_use_off" />
						</a>
						<a
							class="on"
							v-if="item.canBeEquipped"
							v-tippy="{
								content: formatContent($t('tooltip.item.equipTitle')),
								theme: 'small'
							}"
						>
							<img :src="getImgURL('icons', 'small_equip')" alt="small_equip" />
						</a>
						<a
							class="off"
							v-else
							v-tippy="{
								content: formatContent($t('tooltip.item.equipOff')),
								theme: 'small'
							}"
						>
							<img :src="getImgURL('icons', 'small_equip_off')" alt="small_equip_off" />
						</a>
					</td>
				</tr>
			</tbody>
		</table>
		<a class="button" @click="goToItemShop()">{{ $t(`button.shop`) }}</a>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue';
import type { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { InventoryService } from '../../services/inventory.service.js';
import { errorHandler } from '../../utils/errorHandler.js';
//import eventBus from '../../events/index.js';
//import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
//import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { dinozStore } from '../../store/dinozStore.js';
import { userStore } from '../../store/userStore.js';
//import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { itemNameList } from '@dinorpg/core/models/items/itemNameList.js';
//import { formatText } from '../../utils/formatText.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import DZSelect from '../utils/DZSelect.vue';

export default defineComponent({
	name: 'InventoryTab',
	components: {
		DZSelect
	},
	data() {
		return {
			dinozStore: dinozStore(),
			allItemsData: [] as Array<ItemFiche>,
			itemNameList: itemNameList,
			userStore: userStore(),
			sortOption: userStore().getSortOption,
			sortOptions: ['default', 'nameAsc', 'nameDesc', 'priceAsc', 'priceDesc', 'qtyAsc', 'qtyDesc'].map(o => ({
				value: o,
				label: this.$t(`dinozPage.inventory.sort.${o}`)
			})),
			hidden: true as boolean
		};
	},
	methods: {
		goToItemShop() {
			this.$router.push({
				name: 'ItemShopPage',
				params: { name: 'flying' }
			});
		},
		isFull(item: ItemFiche): boolean {
			return (item.quantity ?? 0) >= (item.maxQuantity ?? 0);
		},
		/*async refreshDinozList(): Promise<void> {
			const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList;

			const commonData: PlayerCommonData = await PlayerService.getLoggedInData();

			const newDinozList = commonData.dinoz.map(d => d.id);
			const oldDinozList = dinozList.map(d => d.id);
			this.dinozStore.setDinozList(commonData.dinoz);

			this.$router.push({ name: 'DinozPage', params: { id: newDinozList.find(x => !oldDinozList.includes(x)) } });
		},*/
		/*async useItem(item: ItemFiche): Promise<void> {
			if ((item.quantity ?? 0) > 0) {
				const dinozId = this.$route.params.id as string;
				try {
					const toast = await InventoryService.useInventoryItem(item.itemId, +dinozId);
					await this.resfreshInventory();
					if (toast.category === ItemEffect.EGG) {
						await this.refreshDinozList();
					} else if (toast.category === ItemEffect.GOLD) {
						await this.$refreshGold();
					} else {
						EventBus.emit('refreshDinoz', true);
					}

					let message: string;
					switch (toast.category) {
						case ItemEffect.SPECIAL:
							message = this.$t(`toast.special.${toast.value}`, {
								value: this.$t(`item.name.${toast.effect}`),
								qty: toast.quantity
							});
							break;
						case ItemEffect.SPHERE:
							message = this.$t(`toast.sphere`, { value: this.$t(`skill.name.${toast.value}`) });
							break;
						case ItemEffect.QUEST:
							message = this.$t(`quest.${toast.value}`);
							break;
						case ItemEffect.RESURRECT:
							message = this.$t(`toast.${toast.category}`);
							break;
						case ItemEffect.EGG:
							message = this.$t(`toast.${toast.category}`, { value: this.$t(`race.name.${toast.value}`) });
							break;
						default:
							message =
								typeof toast.value === 'number'
									? this.$t(`toast.${toast.category}`, { value: toast.value }, toast.value)
									: this.$t(`toast.${toast.category}`, { value: toast.value });
							break;
					}

					this.$toast.open({
						message: formatText(message),
						type: 'info'
					});
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		},*/
		/*async equipItem(item: ItemFiche): Promise<void> {
			if ((item.quantity ?? 0) > 0) {
				const dinozId = parseInt(this.$route.params.id as string);
				try {
					const items = await InventoryService.equipInventoryItem(dinozId, item.itemId, true);
					await this.resfreshInventory();
					EventBus.emit('equipItem', items);
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		},*/
		sortItems() {
			switch (this.sortOption) {
				case 'nameAsc':
					this.allItemsData.sort((a, b) =>
						this.$t(`item.name.${this.itemNameList[a.itemId]}`).localeCompare(
							this.$t(`item.name.${this.itemNameList[b.itemId]}`)
						)
					);
					break;
				case 'nameDesc':
					this.allItemsData.sort((a, b) =>
						this.$t(`item.name.${this.itemNameList[b.itemId]}`).localeCompare(
							this.$t(`item.name.${this.itemNameList[a.itemId]}`)
						)
					);
					break;
				case 'priceAsc':
					this.allItemsData.sort((a, b) => a.price - b.price);
					break;
				case 'priceDesc':
					this.allItemsData.sort((a, b) => b.price - a.price);
					break;
				case 'qtyAsc':
					this.allItemsData.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
					break;
				case 'qtyDesc':
					this.allItemsData.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
					break;
				default:
					this.allItemsData.sort((a, b) => a.itemId - b.itemId);
			}
			this.userStore.setSortOption(this.sortOption);
		},
		async resfreshInventory(): Promise<void> {
			const items = await InventoryService.getAllItemsData();
			this.allItemsData = items.map(i => {
				const itemId = i.id as Item;
				return {
					...itemList[itemId],
					maxQuantity: i.maxQuantity,
					quantity: i.quantity
				};
			});
			//console.log(this.allItemsData);
			this.sortOption = this.userStore.getSortOption;
			this.sortItems();
		}
	},
	async mounted(): Promise<void> {
		try {
			await this.resfreshInventory();
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
		/*EventBus.on('refreshInventory', async () => {
			await this.resfreshInventory();
		});*/
	} /*,
	unmounted() {
		EventBus.off('refreshInventory');
	}*/
});
</script>

<style lang="scss" scoped>
.inventory {
	width: 95%;
	table {
		width: 100%;
		margin-top: 10px;
		margin-bottom: 5px;
		tr {
			th {
				background-color: #ddb084;
				color: #874b2e;
				font-size: 10pt;
				font-variant: small-caps;
				padding-left: 5px;
				border-bottom: 1px solid #874b2e;
			}
			&.even {
				background-color: #ddb084;
			}
			&:hover td {
				background-color: #734945;
			}
		}
		td {
			vertical-align: top;
			height: 34.5px;
		}
	}
}
.wrapperMenu {
	padding-left: 5px;
	padding-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
	font-size: 8pt;
	border: 1px dashed rgba(0, 0, 0, 0.1);
	text-align: center;
	cursor: pointer;
	&:hover {
		background-color: #9a4029;
		color: #fce3bc;
	}
}
.hidden {
	max-height: 0;
}
.shown {
	max-height: 54px;
}
.wrapper {
	overflow: hidden;
	transition: max-height 0.2s ease-out;
	padding-left: 5px;
	padding-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
	font-size: 8pt;
	.label {
		display: flex;
		justify-content: space-around;
	}
	&.shown {
		overflow: visible;
	}
	.sort-select {
		width: 100%;
	}
}
.name {
	color: white;
	min-width: 163px;
	font-size: 10pt !important;
	line-height: 11pt;
	font-variant: small-caps;
	cursor: help;
	img {
		float: left;
		position: relative;
		margin-right: 5px;
		border: 1px solid #ae6733;
		vertical-align: bottom;
	}
}
.type {
	font-weight: bold;
	text-align: center;
	color: #bc683c;
}
.full {
	color: yellow !important;
	cursor: help;
}
.act {
	padding-left: 5px;
	display: flex;
	justify-content: center;
	align-content: space-evenly;
	align-items: center;
	a {
		height: fit-content;
	}
	img {
		padding-left: 5px;
		padding-right: 5px;
	}
}
.qty {
	color: white;
	font-weight: bold;
	text-align: center;
	padding-left: 4px;
	padding-right: 4px;
	vertical-align: center;
	& > div {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
.off:hover {
	background-color: transparent;
}
.on:hover {
	cursor: pointer;
}
</style>
