<template>
	<div class="card">
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

			<div class="field">
				<label for="raceId">Race ID</label>
				<input id="raceId" v-model.number="form.raceId" type="number" min="1" />
			</div>

			<div class="checkbox">
				<label>
					<input v-model="form.canRename" type="checkbox" />
					Peut être renommé
				</label>
			</div>

			<DZButton type="button" @click="submit">Sauvegarder</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { UpdateAdminDinozProfilePayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import DZButton from '../../utils/DZButton.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const form = reactive<UpdateAdminDinozProfilePayload>({
	name: '',
	display: '',
	raceId: 1,
	canRename: false
});

watch(
	() => props.dinoz,
	value => {
		form.name = value.name;
		form.display = value.display;
		form.raceId = value.raceId;
		form.canRename = value.canRename;
	},
	{ immediate: true }
);

async function submit() {
	await AdminDinozService.updateDinozProfile(props.userId, props.dinoz.id, {
		name: form.name,
		display: form.display,
		raceId: form.raceId,
		canRename: form.canRename
	});

	emit('updated');
}
</script>
