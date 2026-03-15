<template>
	<div class="card">
		<div class="card-container">
			<h3>Position</h3>

			<div class="field">
				<label for="placeId">Place ID</label>
				<input id="placeId" v-model.number="placeId" type="number" min="1" />
			</div>

			<DZButton type="button" @click="submit">Téléporter</DZButton>
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

const placeId = ref<number>(1);

watch(
	() => props.dinoz.placeId,
	value => {
		placeId.value = value;
	},
	{ immediate: true }
);

async function submit() {
	await AdminDinozService.teleportDinoz(props.userId, props.dinoz.id, {
		placeId: placeId.value
	});

	emit('updated');
}
</script>
