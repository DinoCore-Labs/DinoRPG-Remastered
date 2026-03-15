<template>
	<div class="card">
		<div class="card-container">
			<h3>Items</h3>

			<div v-for="(entry, index) in formEntries" :key="index" class="row">
				<input v-model.number="entry.itemId" type="number" min="1" placeholder="Item ID" />
				<DZButton type="button" @click="removeEntry(index)">Supprimer</DZButton>
			</div>

			<DZButton type="button" @click="addEntry">Ajouter une ligne</DZButton>
			<DZButton type="button" @click="submit">Sauvegarder</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';

import DZButton from '../../utils/DZButton.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const formEntries = ref<{ itemId: number }[]>([]);

watch(
	() => props.dinoz.items,
	value => {
		formEntries.value = value.map(entry => ({
			itemId: entry.itemId
		}));
	},
	{ immediate: true }
);

function addEntry() {
	formEntries.value.push({
		itemId: 1
	});
}

function removeEntry(index: number) {
	formEntries.value.splice(index, 1);
}

async function submit() {
	await AdminDinozService.updateDinozItems(props.userId, props.dinoz.id, {
		entries: formEntries.value
	});

	emit('updated');
}
</script>
