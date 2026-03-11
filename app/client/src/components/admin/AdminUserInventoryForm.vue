<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>{{ inventoryTitle }}</h3>
				<ul class="inventory-list">
					<li v-for="entry in inventoryList" :key="entryKey(entry)" class="inventory-row">
						<img class="inventory-icon" :src="entryIcon(entry)" :alt="entryName(entry)" />
						<div class="inventory-info">
							<strong>{{ entryName(entry) }}</strong>
							<span>ID: {{ entryId(entry) }}</span>
						</div>
						<div class="inventory-quantity">× {{ entry.quantity }}</div>
					</li>
				</ul>
				<form class="inventory-form" @submit.prevent="submit">
					<div class="field">
						<label for="inventorySelect">{{ inventoryLabel }}</label>
						<DZSelect id="inventorySelect" v-model="form.id" :options="selectOptions" />
					</div>
					<div class="field">
						<label for="inventoryQuantity">Quantité</label>
						<DZInput id="inventoryQuantity" v-model="form.quantity" type="number" min="1" />
					</div>
					<div class="field">
						<label>Opération</label>
						<div class="radio-group">
							<DZRadio
								id="inventoryAdd"
								name="inventoryOperation"
								v-model="form.operation"
								value="add"
								label="Ajouter"
							/>
							<DZRadio
								id="inventoryRemove"
								name="inventoryOperation"
								v-model="form.operation"
								value="remove"
								label="Retirer"
							/>
						</div>
					</div>
					<DZButton type="submit" :disabled="submitting">
						{{ submitting ? 'Enregistrement...' : 'Modifier' }}
					</DZButton>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import { itemNameList } from '@dinorpg/core/models/items/itemNameList.js';
import { ingredientNameList } from '@dinorpg/core/models/ingredients/ingredientNameList.js';

import { AdminUserService } from '../../services/adminUsers.service';
import { getImgURL } from '../../utils/getImgURL';

import DZSelect from '../utils/DZSelect.vue';
import type { SelectOption } from '../utils/DZSelect.vue';
import DZInput from '../utils/DZInput.vue';
import DZRadio from '../utils/DZRadio.vue';
import DZButton from '../utils/DZButton.vue';

type InventoryType = 'items' | 'ingredients';

type ItemEntry = {
	itemId: number;
	quantity: number;
};

type IngredientEntry = {
	ingredientId: number;
	quantity: number;
};

type InventoryEntry = ItemEntry | IngredientEntry;

const props = defineProps<{
	user: AdminUserDetails;
	type: InventoryType;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const submitting = ref(false);

const form = reactive({
	id: 0,
	quantity: 1,
	operation: 'add' as 'add' | 'remove'
});

const inventoryTitle = computed(() => (props.type === 'items' ? 'Items' : 'Ingrédients'));
const inventoryLabel = computed(() => (props.type === 'items' ? 'Item' : 'Ingrédient'));

const inventoryList = computed<InventoryEntry[]>(() =>
	props.type === 'items' ? props.user.items : props.user.ingredients
);

const selectOptions = computed<SelectOption<number>[]>(() => {
	if (props.type === 'items') {
		return Object.entries(itemNameList).map(([id, name]) => ({
			value: Number(id),
			label: String(name)
		}));
	}

	return Object.entries(ingredientNameList).map(([id, name]) => ({
		value: Number(id),
		label: String(name)
	}));
});

function entryId(entry: InventoryEntry): number {
	return props.type === 'items' ? (entry as ItemEntry).itemId : (entry as IngredientEntry).ingredientId;
}

function entryKey(entry: InventoryEntry): string {
	return `${props.type}-${entryId(entry)}`;
}

function entryName(entry: InventoryEntry): string {
	if (props.type === 'items') {
		const itemId = (entry as ItemEntry).itemId;
		return itemNameList[itemId] ?? `item_${itemId}`;
	}

	const ingredientId = (entry as IngredientEntry).ingredientId;
	return ingredientNameList[ingredientId] ?? `ingredient_${ingredientId}`;
}

function entryIcon(entry: InventoryEntry): string {
	if (props.type === 'items') {
		const id = (entry as ItemEntry).itemId;
		const name = itemNameList[id] ?? `item_${id}`;
		return getImgURL('item', `item_${name}`);
	}

	const id = (entry as IngredientEntry).ingredientId;
	const name = ingredientNameList[id] ?? `ingredient_${id}`;
	return getImgURL('ingredients', name);
}

async function submit() {
	submitting.value = true;

	try {
		if (props.type === 'items') {
			await AdminUserService.updateUserItems(props.user.id, {
				id: form.id,
				quantity: form.quantity,
				operation: form.operation
			});
		} else {
			await AdminUserService.updateUserIngredients(props.user.id, {
				id: form.id,
				quantity: form.quantity,
				operation: form.operation
			});
		}

		emit('updated');
	} finally {
		submitting.value = false;
	}
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

.inventory-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin: 0 0 16px;
	padding: 0;
	list-style: none;
}

.inventory-row {
	display: grid;
	grid-template-columns: 32px 1fr auto;
	align-items: center;
	gap: 10px;
	padding: 6px 8px;
	border: 1px solid #bc683c;
	background: #f3ca92;
}

.inventory-icon {
	width: 24px;
	height: 24px;
	object-fit: contain;
}

.inventory-info {
	display: flex;
	flex-direction: column;
	color: #710;

	span {
		font-size: 8pt;
		opacity: 0.8;
	}
}

.inventory-quantity {
	font-weight: bold;
	color: #710;
}

.inventory-form {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.radio-group {
	display: flex;
	align-items: center;
	gap: 12px;
}
</style>
