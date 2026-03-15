<template>
	<div class="card">
		<div class="card-container">
			<h3>État / Position</h3>
			<div class="field">
				<label>Place ID</label>
				<input v-model.number="form.placeId" type="number" min="1" />
			</div>
			<div class="field">
				<label>State</label>
				<input v-model="form.state" type="text" />
			</div>
			<div class="field">
				<label>State timer</label>
				<input v-model="form.stateTimer" type="datetime-local" />
			</div>
			<div class="checkbox">
				<label>
					<input v-model="form.fight" type="checkbox" />
					Fight activé
				</label>
			</div>
			<div class="checkbox">
				<label>
					<input v-model="form.gather" type="checkbox" />
					Gather activé
				</label>
			</div>
			<DZButton type="button" @click="submit">Sauvegarder</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { AdminDinozDetails, UpdateAdminDinozBody } from '@dinorpg/core/models/admin/adminDinoz.js';

import DZButton from '../../utils/DZButton.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service.js';

const props = defineProps<{
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const form = reactive({
	placeId: 1,
	state: '' as string | null,
	stateTimer: '' as string | null,
	fight: true,
	gather: true
});

watch(
	() => props.dinoz,
	value => {
		form.placeId = value.placeId;
		form.state = value.state;
		form.stateTimer = value.stateTimer ? value.stateTimer.slice(0, 16) : null;
		form.fight = value.fight;
		form.gather = value.gather;
	},
	{ immediate: true }
);

async function submit() {
	const payload: UpdateAdminDinozBody = {
		placeId: form.placeId,
		state: form.state && form.state.length > 0 ? form.state : null,
		stateTimer: form.stateTimer ? new Date(form.stateTimer).toISOString() : null,
		fight: form.fight,
		gather: form.gather
	};

	await AdminDinozService.updateAdminDinoz(props.dinoz.id, payload);
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
</style>
