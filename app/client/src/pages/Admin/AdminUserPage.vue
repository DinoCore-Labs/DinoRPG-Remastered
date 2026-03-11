<template>
	<div class="admin-user-page">
		<AdminUserSearch
			:model-value="selectedUserId"
			@update:model-value="selectedUserId = $event"
			@select="handleSelectUser"
		/>
		<p v-if="loading">Chargement...</p>
		<p v-else-if="error" class="red">{{ error }}</p>
		<template v-else-if="user">
			<AdminUserSummaryCard :user="user" />
			<AdminUserProfileForm :user="user" @updated="reloadUser" />
			<AdminUserWalletForm :user="user" @updated="reloadUser" />
			<AdminUserUniqueSkillsForm :user="user" @updated="reloadUser" />
			<AdminUserDinozList :user-id="user.id" :dinoz-list="dinozList" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminUserSearch from '../../components/admin/AdminUserSearch.vue';
import AdminUserSummaryCard from '../../components/admin/AdminUserSummaryCard.vue';
import AdminUserProfileForm from '../../components/admin/AdminUserProfileForm.vue';
import AdminUserWalletForm from '../../components/admin/AdminUserWalletForm.vue';
import AdminUserUniqueSkillsForm from '../../components/admin/AdminUserUniqueSkillsForm.vue';
import AdminUserDinozList from '../../components/admin/AdminUserDinozList.vue';

import type { AdminDinozSummary, AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import { AdminUserService } from '../../services/adminUsers.service';

const selectedUserId = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const user = ref<AdminUserDetails | null>(null);
const dinozList = ref<AdminDinozSummary[]>([]);

async function loadUser(userId: string) {
	loading.value = true;
	error.value = null;

	try {
		const [userData, dinozData] = await Promise.all([
			AdminUserService.getUserDetails(userId),
			AdminUserService.getUserDinoz(userId)
		]);

		if (!userData) {
			throw new Error("Ce joueur n'existe pas.");
		}

		user.value = userData as AdminUserDetails;
		dinozList.value = dinozData;
	} catch (err) {
		user.value = null;
		dinozList.value = [];
		error.value = err instanceof Error ? err.message : 'Erreur inconnue';
	} finally {
		loading.value = false;
	}
}

async function handleSelectUser(userId: string) {
	selectedUserId.value = userId;
	await loadUser(userId);
}

async function reloadUser() {
	if (!user.value) return;
	await loadUser(user.value.id);
}
</script>

<style scoped lang="scss">
.admin-user-page {
	display: flex;
	flex-direction: column;
}

.red {
	color: red;
}
</style>
