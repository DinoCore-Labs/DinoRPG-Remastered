<template>
	<div class="password-modal-overlay">
		<div class="password-modal">
			<h3>{{ title }}</h3>
			<div v-if="withOldPassword" class="field">
				<label for="oldPassword">Ancien mot de passe</label>
				<input id="oldPassword" v-model="form.oldPassword" type="password" autocomplete="current-password" />
			</div>
			<div class="field">
				<label for="newPassword">Nouveau mot de passe</label>
				<input id="newPassword" v-model="form.newPassword" type="password" autocomplete="new-password" />
			</div>
			<div class="field">
				<label for="confirmPassword">Confirmer le nouveau mot de passe</label>
				<input id="confirmPassword" v-model="form.confirmPassword" type="password" autocomplete="new-password" />
			</div>
			<p v-if="localError" class="password-error">{{ localError }}</p>
			<p v-else-if="error" class="password-error">{{ error }}</p>
			<div class="buttonLand">
				<DZButton class="bSmall" @click="submit">
					{{ loading ? 'Modification...' : 'Valider' }}
				</DZButton>
				<DZButton class="bSmall" back @click="$emit('close')">Retour</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

import DZButton from '../utils/DZButton.vue';

const props = withDefaults(
	defineProps<{
		title?: string;
		loading?: boolean;
		error?: string | null;
		withOldPassword?: boolean;
	}>(),
	{
		title: 'Modifier le mot de passe',
		loading: false,
		error: null,
		withOldPassword: true
	}
);

const emit = defineEmits<{
	close: [];
	submit: [
		payload: {
			oldPassword?: string;
			newPassword: string;
			confirmPassword: string;
		}
	];
}>();

const localError = ref<string | null>(null);

const form = reactive({
	oldPassword: '',
	newPassword: '',
	confirmPassword: ''
});

function submit() {
	localError.value = null;
	if (props.withOldPassword && !form.oldPassword) {
		localError.value = 'Veuillez renseigner l’ancien mot de passe.';
		return;
	}
	if (!form.newPassword || !form.confirmPassword) {
		localError.value = 'Veuillez remplir les deux champs.';
		return;
	}
	if (form.newPassword !== form.confirmPassword) {
		localError.value = 'Les nouveaux mots de passe ne correspondent pas.';
		return;
	}
	emit('submit', {
		oldPassword: props.withOldPassword ? form.oldPassword : undefined,
		newPassword: form.newPassword,
		confirmPassword: form.confirmPassword
	});
}
</script>

<style scoped lang="scss">
.password-modal-overlay {
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, 0.55);
}
.password-modal {
	width: min(420px, calc(100% - 32px));
	background-color: #ecbd84;
	border: 2px solid #bc683c;
	padding: 20px;
	color: #7b3f22;
	h3 {
		margin-top: 0;
		color: #9a4029;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 12px;
	}
	input {
		border: none;
		background-color: #ae6139;
		color: #ffee92;
		padding: 6px;
	}
	input:focus {
		background-color: #9a4029;
		outline: none;
	}
}
.password-error {
	color: #8f1d12;
	font-weight: bold;
}
</style>
