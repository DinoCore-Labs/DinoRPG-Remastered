<template>
	<div class="equip">
		<template v-for="(item, index) in items" :key="index">
			<Tippy
				theme="normal"
				tag="img"
				v-if="item"
				:src="getImgURL('item', `item_${itemNameList[item]}`)"
				:alt="itemNameList[item]"
				@click="unequip(item)"
			>
				<template #content>
					<h1 v-html="formatContent($t(`items.name.${itemNameList[item]}`))" />
					<p v-html="formatContent($t(`items.description.${itemNameList[item]}`))" />
				</template>
			</Tippy>
			<Tippy theme="small" tag="img" v-else :src="getImgURL('item', `item_empty`)" alt="empty">
				<template #content>
					<p v-html="formatContent($t(`items.empty`))" />
				</template>
			</Tippy>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { itemNameList } from '@dinorpg/core/models/items/itemNameList.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { InventoryService } from '../../services/inventory.service.js';
import eventBus from '../../events/index.js';
import { dinozStore } from '../../store/dinozStore.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { formatText } from '../../utils/formatText.js';
import type { DinozItems } from '@dinorpg/core/models/dinoz/dinozItems.js';

export default defineComponent({
	name: 'DinozEquip',
	props: {
		dinozData: { type: Object as PropType<DinozFiche>, required: true }
	},
	data() {
		return {
			items: [] as (number | undefined)[],
			dinozStore: dinozStore()
		};
	},
	computed: {
		itemNameList() {
			return itemNameList;
		}
	},
	watch: {
		'dinozData.items': {
			handler(newItems: number[] | undefined) {
				if (!this.dinozData || newItems === undefined) {
					console.error(formatText(this.$t(`toast.dinozDataMissing`)));
					return;
				}
				this.items = new Array(this.dinozData.maxItems);
				newItems.forEach((item, index) => (this.items[index] = item));
			},
			immediate: true
		},
		'dinozData.maxItems': {
			handler(newMaxItems: number | undefined) {
				if (!this.dinozData || newMaxItems === undefined) {
					console.error(formatText(this.$t(`toast.dinozDataMissing`)));
					return;
				}
				this.items = new Array(newMaxItems);
				this.dinozData.items?.forEach((item, index) => (this.items[index] = item));
			},
			immediate: true
		}
	},
	methods: {
		applyEquippedItems(backPack: Array<DinozItems>) {
			if (!this.dinozData?.maxItems) return;

			this.items = new Array(this.dinozData.maxItems);
			backPack.forEach((it, index) => (this.items[index] = it.itemId));
		},
		async unequip(item: number) {
			if (!this.dinozData) {
				this.$toast.open({
					message: formatText(this.$t(`toast.dinozDataMissing`)),
					type: 'error'
				});
				return;
			}
			const dinozId = parseInt(this.$route.params.id as string);
			try {
				const backPack = await InventoryService.equipInventoryItem(dinozId, item, false);
				this.items = new Array(this.dinozData.maxItems);
				backPack.forEach((item, index) => (this.items[index] = item.itemId));
				eventBus.emit('refreshDinozStats', true);
				eventBus.emit('refreshInventory', true);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		}
	},
	mounted() {
		if (!this.dinozData) {
			this.$toast.open({
				message: formatText(this.$t(`toast.dinozDataMissing`)),
				type: 'error'
			});
			return;
		}
		this.items = new Array(this.dinozData.maxItems);
		this.dinozData.items.forEach((item, index) => (this.items[index] = item));
		// ✅ écoute l’event envoyé par InventoryTab
		eventBus.on('equipItem', this.applyEquippedItems);
	},
	unmounted() {
		eventBus.off('equipItem', this.applyEquippedItems);
	}
});
</script>

<style lang="scss" scoped>
.equip {
	grid-area: equip;
	align-self: center;
	justify-self: center;
	width: 83px;
	height: 115px;
	background: url('../../assets/background/equipment_box.webp') no-repeat;
	display: flex;
	flex-wrap: wrap;
	row-gap: 3px;
	column-gap: 3px;
	padding-top: 23px;
	padding-left: 17px;
	align-items: self-start;
	align-content: flex-start;
	img {
		object-fit: contain;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		&:hover {
			outline: 1px solid white;
			cursor: pointer;
		}
	}
}
</style>
