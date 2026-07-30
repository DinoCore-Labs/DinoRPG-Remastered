<template>
	<div class="admin-user-page">
		<TitleHeader v-if="user" title="Admin" header="User:" :sub-header="user.name ?? user.id" />
		<TitleHeader v-else title="Admin - User" />
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
			<AdminUserSanctionForm :user="user" @updated="reloadUser" />
			<AdminUserWalletForm v-if="uStore.isAdmin" :user="user" @updated="reloadUser" />
			<AdminUserUniqueSkillsForm v-if="uStore.isAdmin" :user="user" @updated="reloadUser" />
			<AdminUserInventoryForm v-if="uStore.isAdmin" :user="user" type="items" @updated="reloadUser" />
			<AdminUserInventoryForm v-if="uStore.isAdmin" :user="user" type="ingredients" @updated="reloadUser" />
			<AdminUserRewardsForm v-if="uStore.isAdmin" :user="user" @updated="reloadUser" />
			<AdminUserScenariosForm v-if="user && uStore.isAdmin" :user="user" @updated="reloadUser" />
			<AdminUserDinozList :user-id="user.id" :dinoz-list="dinozList" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { AdminDinozSummary, AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';

import AdminUserSearch from '../../components/admin/user/AdminUserSearch.vue';
import AdminUserSummaryCard from '../../components/admin/user/AdminUserSummaryCard.vue';
import AdminUserProfileForm from '../../components/admin/user/AdminUserProfileForm.vue';
import AdminUserSanctionForm from '../../components/admin/user/AdminUserSanctionForm.vue';
import AdminUserWalletForm from '../../components/admin/user/AdminUserWalletForm.vue';
import AdminUserUniqueSkillsForm from '../../components/admin/user/AdminUserUniqueSkillsForm.vue';
import AdminUserInventoryForm from '../../components/admin/user/AdminUserInventoryForm.vue';
import AdminUserRewardsForm from '../../components/admin/user/AdminUserRewardsForm.vue';
import AdminUserDinozList from '../../components/admin/user/AdminUserDinozList.vue';
import AdminUserScenariosForm from '../../components/admin/user/AdminUserScenariosForm.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { userStore } from '../../store/userStore';

import { AdminUserService } from '../../services/adminUsers.service';

const route = useRoute();
const router = useRouter();
const uStore = userStore();

const selectedUserId = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const user = ref<AdminUserDetails | null>(null);
const dinozList = ref<AdminDinozSummary[]>([]);

const routeUserId = computed(() => (typeof route.query.userId === 'string' ? route.query.userId : undefined));

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
		selectedUserId.value = userId;
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

	await router.replace({
		query: { userId }
	});

	await loadUser(userId);
}

async function reloadUser() {
	if (!user.value) return;
	await loadUser(user.value.id);
}

watch(
	routeUserId,
	async userId => {
		if (!userId) return;
		if (user.value?.id === userId) return;

		await loadUser(userId);
	},
	{ immediate: true }
);
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
