<template>
	<TitleHeader :title="$t('pageTitle.items')" :header="$t(`topBar.userMenu.items`)" />
	<DZDisclaimer help round content="items.disclaimer" />
	<DZTable>
		<tr>
			<th class="thIcon"></th>
			<th class="thName">{{ $t('items.tname') }}</th>
			<th class="thStock">{{ $t('items.tstock') }}</th>
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
			<td class="tdIcon">
				<img :src="getImgURL('item', `item_${itemNameList[item.itemId]}`)" :alt="itemNameList[item.itemId]" />
			</td>
			<td class="tdName">{{ $t(`items.name.${item.name}`) }}</td>
			<td class="tdStock" v-if="item.quantity !== 0">{{ item.quantity }}/{{ item.maxQuantity }}</td>
			<template #content>
				<h1 v-html="formatContent($t(`items.name.${item.name}`))" />
				<p v-html="formatContent($t(`items.description.${item.name}`))" />
			</template>
		</Tippy>
	</DZTable>
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
import DZTable from '../components/utils/DZTable.vue';

export default defineComponent({
	name: 'Inventory',
	components: {
		DZDisclaimer,
		DZButton,
		DZTable,
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
				//console.log(items);
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
					.sort((a, b) => (a?.itemId ?? 0) - (b?.itemId ?? 0))
					.filter(Boolean) as Array<ItemFiche>;
				//console.log(this.allItemsData);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
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
	padding: 2px 5px;
	max-width: 222px;
}
.tdStock {
	padding: 2px 5px;
	width: 52px;
}
</style>
