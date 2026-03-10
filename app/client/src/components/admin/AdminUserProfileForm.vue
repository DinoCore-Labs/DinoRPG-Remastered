<template>
	<form class="card" @submit.prevent="submit">
		<h3>Profil</h3>

		<div class="field">
			<label for="customText">Custom text</label>
			<input id="customText" v-model="form.customText" type="text" />
		</div>

		<div class="field">
			<label for="role">Rôle</label>
			<input id="role" v-model="form.role" type="text" />
		</div>

		<button type="submit" :disabled="submitting">
			{{ submitting ? 'Enregistrement...' : 'Mettre à jour' }}
		</button>
	</form>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
// import { AdminService } from '@/services';

const props = defineProps<{
	user: AdminUserDetails;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const submitting = ref(false);

const form = reactive({
	customText: '',
	role: ''
});

function hydrateForm() {
	form.customText = props.user.customText ?? '';
	form.role = props.user.role;
}

watch(() => props.user, hydrateForm, { immediate: true });

async function submit() {
	submitting.value = true;

	try {
		// await AdminService.updateUserProfile(props.player.id, {
		// 	customText: form.customText,
		// 	quetzuBought: form.quetzuBought,
		// 	dailyGridRewards: form.dailyGridRewards,
		// 	role: form.role
		// });

		emit('updated');
	} finally {
		submitting.value = false;
	}
}
</script>

<style scoped lang="scss">
.card {
	padding: 16px;
	background: #ecbd84;
	border: 1px solid #bc683c;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
</style>
