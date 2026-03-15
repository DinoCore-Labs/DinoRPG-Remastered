<template>
	<div class="card">
		<div class="card-container">
			<h3>Status</h3>

			<ul v-if="dinoz.status.length > 0">
				<li v-for="entry in dinoz.status" :key="entry.id">
					Status #{{ entry.statusId }}
					<DZButton type="button" @click="removeStatus(entry.statusId)">Supprimer</DZButton>
				</li>
			</ul>
			<p v-else>Aucun status.</p>

			<div class="field">
				<label for="statusId">Ajouter un status</label>
				<input id="statusId" v-model.number="newStatusId" type="number" min="1" />
			</div>

			<DZButton type="button" @click="addStatus">Ajouter</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

const newStatusId = ref<number>(1);

async function addStatus() {
	await AdminDinozService.addDinozStatus(props.userId, props.dinoz.id, {
		statusId: newStatusId.value
	});

	emit('updated');
}

async function removeStatus(statusId: number) {
	await AdminDinozService.removeDinozStatus(props.userId, props.dinoz.id, {
		statusId
	});

	emit('updated');
}
</script>
