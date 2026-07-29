<template>
	<div class="card">
		<div class="card-container sanction-form">
			<h3>Sanctions (Ban / Mute)</h3>
			<div class="field">
				<label>Banni jusqu'au :</label>
				<input type="datetime-local" v-model="bannedUntil" />
				<input
					v-if="bannedUntil"
					type="text"
					v-model="banReason"
					placeholder="Motif (optionnel, ex: Multicomptes)"
					class="reason-input"
				/>
				<button class="btn btn-small" @click="clearBan">Effacer</button>
			</div>
			<div class="field">
				<label>Muet jusqu'au :</label>
				<input type="datetime-local" v-model="mutedUntil" />
				<input
					v-if="mutedUntil"
					type="text"
					v-model="muteReason"
					placeholder="Motif (optionnel, ex: Insultes)"
					class="reason-input"
				/>
				<button class="btn btn-small" @click="clearMute">Effacer</button>
			</div>
			<div class="actions">
				<button class="btn" :disabled="loading" @click="submit">Enregistrer les sanctions</button>
				<span v-if="success" class="success-msg">Sauvegardé !</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';

import { AdminUserService } from '../../../services/adminUsers.service';

const props = defineProps<{
	user: AdminUserDetails;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const bannedUntil = ref<string>('');
const mutedUntil = ref<string>('');
const banReason = ref<string>('');
const muteReason = ref<string>('');
const loading = ref(false);
const success = ref(false);

function formatDateForInput(d: Date | string | null | undefined) {
	if (!d) return '';
	const date = new Date(d);
	if (isNaN(date.getTime())) return '';
	return date.toISOString().slice(0, 16);
}

watch(
	() => props.user,
	newUser => {
		bannedUntil.value = formatDateForInput(newUser.bannedUntil);
		mutedUntil.value = formatDateForInput(newUser.mutedUntil);
		banReason.value = (newUser as any).banReason || '';
		muteReason.value = (newUser as any).muteReason || '';
		success.value = false;
	},
	{ immediate: true }
);

function clearBan() {
	bannedUntil.value = '';
}

function clearMute() {
	mutedUntil.value = '';
}

async function submit() {
	loading.value = true;
	success.value = false;
	try {
		await AdminUserService.updateUserSanction(props.user.id, {
			bannedUntil: bannedUntil.value ? new Date(bannedUntil.value).toISOString() : null,
			mutedUntil: mutedUntil.value ? new Date(mutedUntil.value).toISOString() : null,
			banReason: bannedUntil.value && banReason.value.trim() ? banReason.value.trim() : null,
			muteReason: mutedUntil.value && muteReason.value.trim() ? muteReason.value.trim() : null
		});
		success.value = true;
		emit('updated');
	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
}
</script>

<style scoped lang="scss">
.card {
	width: 100%;
	box-sizing: border-box;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	padding: 5px;
	&-container {
		border: 2px solid #bc683c;
		padding: 20px;
		box-sizing: border-box;
	}
}
.sanction-form {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.field {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;

		label {
			width: 150px;
		}

		input {
			padding: 4px;
		}
	}
}
.actions {
	margin-top: 15px;
}
.success-msg {
	color: green;
	margin-left: 10px;
}
</style>
