<template>
	<TitleHeader :title="$t('pageTitle.items')" :header="$t(`topBar.userMenu.items`)" />
	<DZDisclaimer help round content="items.disclaimer" />
	<table>
		<tbody>
			<tr>
				<th class="icon"></th>
				<th class="name">{{ $t('items.tname') }}</th>
				<th class="stock">{{ $t('items.tstock') }}</th>
			</tr>
			<Tippy
				theme="normal"
				tag="tr"
				v-for="(item, index) in allItemsData"
				:key="item.name"
				:class="{
					full: (item.quantity ?? 0) >= item.maxQuantity,
					even: (index + 1) % 2 == 0
				}"
			>
				<td class="icon">
					<img :src="getImgURL('item', `item_${itemNameList[item.itemId]}`)" :alt="itemNameList[item.itemId]" />
				</td>
				<td class="name">{{ $t(`items.name.${item.name}`) }}</td>
				<td class="stock" v-if="item.quantity !== 0">{{ item.quantity }}/{{ item.maxQuantity }}</td>
				<template #content>
					<h1 v-html="formatContent($t(`items.name.${item.name}`))" />
					<p v-html="formatContent($t(`items.description.${item.name}`))" />
				</template>
			</Tippy>
		</tbody>
	</table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { InventoryService } from '../services/inventory.service.js';
import { errorHandler } from '../utils/errorHandler.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { itemNameList } from '@dinorpg/core/models/items/itemNameList.js';
import type { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { userStore } from '../store/userStore.js';
import DZButton from '../components/utils/DZButton.vue';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';

export default defineComponent({
	name: 'Inventory',
	components: {
		DZDisclaimer,
		DZButton,
		TitleHeader
	},
	data() {
		return {
			allItemsData: [] as Array<ItemFiche>,
			itemNameList: itemNameList,
			uStore: userStore()
		};
	},
	async mounted(): Promise<void> {
		await this.loadItems();
	},
	methods: {
		async loadItems() {
			try {
				const items = await InventoryService.getAllItemsData();
				console.log(items);
				this.allItemsData = items
					.map(item => {
						const key = item.id as Item;

						const base = itemList[key];
						if (!base) {
							return null;
						}
						return {
							...base,
							quantity: item.quantity,
							maxQuantity: item.maxQuantity
						};
					})
					.filter(Boolean) as Array<ItemFiche>;
				console.log(this.allItemsData);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
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
