<template>
	<div class="card">
		<div class="card-container">
			<h3>Leader</h3>

			<div class="field">
				<label for="leaderSelect">Leader</label>
				<DZSelect id="leaderSelect" v-model="selectedLeaderId" :options="leaderOptions" />
			</div>

			<DZButton type="button" @click="submit">Sauvegarder</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';

import DZButton from '../../utils/DZButton.vue';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const selectedLeaderId = ref<number | null>(null);

const leaderOptions = computed<SelectOption<number | null>[]>(() => [
	{ value: null, label: 'Aucun leader' },
	...props.dinoz.leaderOptions.map(option => ({
		value: option.id,
		label: `${option.name} (#${option.id}) - niv. ${option.level}`
	}))
]);

watch(
	() => props.dinoz.leaderId,
	value => {
		selectedLeaderId.value = value;
	},
	{ immediate: true }
);

async function submit() {
	await AdminDinozService.updateDinozLeader(props.userId, props.dinoz.id, {
		leaderId: selectedLeaderId.value
	});

	emit('updated');
}
</script>
