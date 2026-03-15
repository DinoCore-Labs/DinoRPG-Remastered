<template>
	<div class="card">
		<div class="card-container">
			<h3>État</h3>

			<div class="field">
				<label for="state">State</label>
				<input id="state" v-model="form.state" type="text" />
			</div>

			<div class="field">
				<label for="stateTimer">State timer</label>
				<input id="stateTimer" v-model="form.stateTimer" type="datetime-local" />
			</div>

			<DZButton type="button" @click="submit">Sauvegarder</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { UpdateAdminDinozStatePayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import { AdminDinozService } from '../../../services/adminDinoz.service';
import DZButton from '../../utils/DZButton.vue';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const form = reactive<UpdateAdminDinozStatePayload>({
	state: null,
	stateTimer: null
});

watch(
	() => props.dinoz,
	value => {
		form.state = value.state;
		form.stateTimer = value.stateTimer ? value.stateTimer.slice(0, 16) : null;
	},
	{ immediate: true }
);

async function submit() {
	await AdminDinozService.updateDinozState(props.userId, props.dinoz.id, {
		state: form.state && form.state.length > 0 ? form.state : null,
		stateTimer: form.stateTimer ? new Date(form.stateTimer).toISOString() : null
	});

	emit('updated');
}
</script>
