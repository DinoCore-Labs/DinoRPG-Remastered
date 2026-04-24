<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Items équipés</h3>
				<div class="section">
					<label class="title">Items actuels :</label>
					<div v-if="dinoz.items.length > 0" class="items-list">
						<div v-for="entry in dinoz.items" :key="entry.id" class="item-entry">
							<div class="item-main">
								<img
									v-if="hasItem(entry.itemId)"
									:src="getImgURL('item', `item_${getItemNameKey(entry.itemId)}`)"
									:alt="getItemNameKey(entry.itemId)"
								/>
								<span v-if="hasItem(entry.itemId)">
									{{ t(`items.name.${getItemNameKey(entry.itemId)}`) }}
								</span>
								<span v-else class="error-item"> Unknown item (ID: {{ entry.itemId }}) </span>
							</div>
						</div>
					</div>
					<p v-else>Aucun item équipé.</p>
				</div>
				<div class="section">
					<label class="title" for="dinozItems">Modifier les items :</label>
					<div>
						<DZSelect id="dinozItems" v-model="selectedItemId" :options="itemOptions" />
						<div class="operations">
							<DZRadio id="itemOperationAdd" name="itemOperation" v-model="itemOperation" value="add">
								Ajouter
							</DZRadio>
							<DZRadio id="itemOperationRemove" name="itemOperation" v-model="itemOperation" value="remove">
								Retirer
							</DZRadio>
						</div>
					</div>
				</div>
				<DZButton type="button" :disabled="selectedItemId === NO_ITEM" @click="submit"> Sauvegarder </DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';

import { AdminDinozService } from '../../../services/adminDinoz.service';
import { getImgURL } from '../../../utils/getImgURL';
import DZButton from '../../utils/DZButton.vue';
import DZRadio from '../../utils/DZRadio.vue';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const { t } = useI18n();

const NO_ITEM = 0;

const itemOperation = ref<'add' | 'remove'>('add');
const selectedItemId = ref<number>(NO_ITEM);

const currentItemIds = computed(() => props.dinoz.items.map(entry => entry.itemId));

const allItemIds = computed(() =>
	Object.values(itemList)
		.filter(item => item.canBeEquipped)
		.map(item => item.itemId)
		.sort((a, b) => a - b)
);

const itemListFiltered = computed(() => {
	if (itemOperation.value === 'add') {
		return allItemIds.value.filter(itemId => !currentItemIds.value.includes(itemId));
	}

	return allItemIds.value.filter(itemId => currentItemIds.value.includes(itemId));
});

const itemOptions = computed<SelectOption<number>[]>(() => [
	{
		value: NO_ITEM,
		label: 'Sélectionner un item'
	},
	...itemListFiltered.value.map(itemId => ({
		value: itemId,
		label: hasItem(itemId) ? t(`items.name.${getItemNameKey(itemId)}`) : `Unknown item (#${itemId})`
	}))
]);

watch(itemOperation, () => {
	selectedItemId.value = NO_ITEM;
});

function hasItem(itemId: number) {
	return itemId in itemList;
}

function getItemNameKey(itemId: number) {
	const item = itemList[itemId as keyof typeof itemList];
	return item?.name ?? String(itemId);
}

async function submit() {
	if (selectedItemId.value === NO_ITEM) return;

	let nextItemIds: number[];

	if (itemOperation.value === 'add') {
		nextItemIds = [...currentItemIds.value, selectedItemId.value];
	} else {
		nextItemIds = currentItemIds.value.filter(itemId => itemId !== selectedItemId.value);
	}

	await AdminDinozService.updateDinozItems(props.userId, props.dinoz.id, {
		entries: nextItemIds.map(itemId => ({
			itemId
		}))
	});

	selectedItemId.value = NO_ITEM;
	emit('updated');
}
</script>

<style scoped lang="scss">
.card {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	padding: 5px;
	&-container {
		border: 2px solid #bc683c;
		padding: 20px;
	}
}
.section + .section {
	margin-top: 14px;
}
.title {
	display: block;
	margin-bottom: 6px;
	font-weight: bold;
}
.items-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.item-entry {
	padding: 6px 8px;
	border: 1px solid #bc683c;
	background: rgb(255 255 255 / 12%);
}
.item-main {
	display: flex;
	align-items: center;
	gap: 8px;
	img {
		width: 24px;
		height: 24px;
		display: block;
	}
}
.operations {
	display: flex;
	margin: 5px;
	gap: 8px;
	min-width: 120px;
}
.error-item {
	color: #a11;
	font-weight: bold;
}
</style>
