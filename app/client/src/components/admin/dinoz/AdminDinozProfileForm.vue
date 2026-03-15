<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Profil</h3>
				<div class="field">
					<label for="name">Nom</label>
					<input id="name" v-model="form.name" type="text" />
				</div>
				<div class="field">
					<label for="display">Display</label>
					<input id="display" v-model="form.display" type="text" />
				</div>
				<DZButton type="button" @click="submit">Sauvegarder</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { AdminDinozDetails, UpdateAdminDinozBody } from '@dinorpg/core/models/admin/adminDinoz.js';

import DZButton from '../../utils/DZButton.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service';

const props = defineProps<{
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const form = reactive({
	name: '',
	display: ''
});

watch(
	() => props.dinoz,
	value => {
		form.name = value.name;
		form.display = value.display;
	},
	{ immediate: true }
);

async function submit() {
	const payload: UpdateAdminDinozBody = {
		name: form.name,
		display: form.display
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
