<template>
	<div class="card">
		<div class="card-container">
			<form class="card-container" @submit.prevent="submit">
				<h3>Profil</h3>
				<div class="field">
					<label for="role">Rôle</label>
					<DZSelect id="role" v-model="form.role" :options="roleOptions" />
				</div>
				<div class="field">
					<label for="description">Description</label>
					<textarea id="description" v-model="form.description" rows="4" />
				</div>
				<div class="field checkbox-field">
					<DZCheckbox id="removeAvatar" v-model="form.removeAvatar" label="Supprimer l’avatar" />
				</div>
				<DZButton @click="submit" :disabled="submitting">
					{{ submitting ? 'Enregistrement...' : 'Mettre à jour' }}
				</DZButton>
			</form>
			<form class="card-container password-form" @submit.prevent="submitPassword">
				<h3>Mot de passe</h3>
				<div class="field">
					<label for="newPassword">Nouveau mot de passe</label>
					<input id="newPassword" v-model="passwordForm.newPassword" type="password" autocomplete="new-password" />
				</div>
				<div class="field">
					<label for="confirmPassword">Confirmation</label>
					<input
						id="confirmPassword"
						v-model="passwordForm.confirmPassword"
						type="password"
						autocomplete="new-password"
					/>
				</div>
				<p v-if="passwordError" class="error">{{ passwordError }}</p>
				<DZButton @click="submitPassword" :disabled="submittingPassword">
					{{ submittingPassword ? 'Modification...' : 'Modifier le mot de passe' }}
				</DZButton>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import type {
	UpdateAdminUserPasswordPayload,
	UpdateAdminUserProfilePayload
} from '@dinorpg/core/models/admin/adminUserPayloads.js';
import { AdminUserService } from '../../../services/adminUsers.service';
import { UserRoles, type UserRole } from '@dinorpg/core/models/user/userRole.js';
import DZSelect, { type SelectOption } from '../../utils/DZSelect.vue';
import DZCheckbox from '../../utils/DZCheckbox.vue';
import DZButton from '../../utils/DZButton.vue';

const props = defineProps<{
	user: AdminUserDetails;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const submitting = ref(false);
const roleOptions = computed<SelectOption<UserRole>[]>(() =>
	UserRoles.map(role => ({
		value: role,
		label: role
	}))
);

const form = reactive<UpdateAdminUserProfilePayload>({
	role: props.user.role,
	description: props.user.profile?.description ?? null,
	removeAvatar: false
});

function hydrateForm() {
	form.role = props.user.role;
	form.description = props.user.profile?.description ?? null;
	form.removeAvatar = false;
}

const submittingPassword = ref(false);
const passwordError = ref<string | null>(null);

const passwordForm = reactive<UpdateAdminUserPasswordPayload>({
	newPassword: '',
	confirmPassword: ''
});

function resetPasswordForm() {
	passwordForm.newPassword = '';
	passwordForm.confirmPassword = '';
	passwordError.value = null;
}

async function submitPassword() {
	passwordError.value = null;
	if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
		passwordError.value = 'Veuillez remplir les deux champs.';
		return;
	}
	if (passwordForm.newPassword !== passwordForm.confirmPassword) {
		passwordError.value = 'Les mots de passe ne correspondent pas.';
		return;
	}
	submittingPassword.value = true;
	try {
		await AdminUserService.updateUserPassword(props.user.id, {
			newPassword: passwordForm.newPassword,
			confirmPassword: passwordForm.confirmPassword
		});
		resetPasswordForm();
		emit('updated');
	} finally {
		submittingPassword.value = false;
	}
}

watch(() => props.user, hydrateForm, { immediate: true });

async function submit() {
	submitting.value = true;
	try {
		await AdminUserService.updateUserProfile(props.user.id, {
			role: form.role,
			description: form.description?.trim() ? form.description.trim() : null,
			removeAvatar: form.removeAvatar
		});

		emit('updated');
	} finally {
		submitting.value = false;
	}
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
	flex-direction: column;
	gap: 4px;
}
.checkbox-field {
	flex-direction: row;
	align-items: center;
	& label {
		color: #bc683c !important;
	}
}
textarea {
	border: none;
	width: 100%;
	background-color: #ae6139;
	color: #ffee92;
}
textarea:focus {
	background-color: #9a4029;
}
.password-form {
	margin-top: 20px;
}
input {
	border: none;
	width: 100%;
	background-color: #ae6139;
	color: #ffee92;
	padding: 6px;
}
input:focus {
	background-color: #9a4029;
	outline: none;
}
.error {
	color: #8f1d12;
	font-weight: bold;
}
</style>
