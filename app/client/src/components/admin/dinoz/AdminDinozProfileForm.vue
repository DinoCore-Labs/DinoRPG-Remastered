<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Profil</h3>
				<div class="field">
					<label for="name">Nom :</label>
					<DZInput id="name" v-model="form.name" type="text" />
				</div>
				<div class="field">
					<label for="display">Display :</label>
					<DZInput id="display" v-model="form.display" type="text" />
				</div>
				<div class="field"><DZCheckbox id="canRename" v-model="form.canRename"> Peut être renommé </DZCheckbox></div>
				<DZButton type="button" @click="submit">Sauvegarder</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { UpdateAdminDinozProfilePayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import DZButton from '../../utils/DZButton.vue';
import DZCheckbox from '../../utils/DZCheckbox.vue';
import DZInput from '../../utils/DZInput.vue';
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
.field {
	display: flex;
	gap: 5px;
}
label {
	color: #8e3e26;
}
</style>
