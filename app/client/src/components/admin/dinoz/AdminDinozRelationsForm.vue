<template>
	<div class="card">
		<div class="card-container">
			<h3>Relations</h3>
			<div class="field">
				<label>Leader ID</label>
				<input v-model.number="form.leaderId" type="number" min="1" />
			</div>
			<div class="followers">
				<h4>Followers</h4>
				<ul v-if="dinoz.followers.length > 0">
					<li v-for="follower in dinoz.followers" :key="follower.id">
						{{ follower.name }} (#{{ follower.id }}) - niv. {{ follower.level }}
					</li>
				</ul>
				<p v-else>Aucun follower.</p>
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
	leaderId: null as number | null,
	seed: ''
});

watch(
	() => props.dinoz,
	value => {
		form.leaderId = value.leaderId;
	},
	{ immediate: true }
);

async function submit() {
	const payload: UpdateAdminDinozBody = {
		leaderId: form.leaderId
	};

	await AdminDinozService.updateAdminDinoz(props.dinoz.id, payload);
	emit('updated');
}
</script>
