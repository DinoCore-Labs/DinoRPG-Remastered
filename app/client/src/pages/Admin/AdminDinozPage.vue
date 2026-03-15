<template>
	<div class="admin-dinoz-page">
		<TitleHeader title="Admin - Dinoz" />

		<p v-if="loading">Chargement...</p>
		<p v-else-if="error" class="red">{{ error }}</p>

		<template v-else-if="dinoz && userId">
			<AdminDinozProfileForm :user-id="userId" :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozStatsForm :user-id="userId" :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozStateForm :user-id="userId" :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozPlaceForm :user-id="userId" :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozLeaderForm :user-id="userId" :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozStatusForm :user-id="userId" :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozSkillsForm :user-id="userId" :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozItemsForm :user-id="userId" :dinoz="dinoz" @updated="reloadDinoz" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';

import TitleHeader from '../../components/utils/TitleHeader.vue';
import { AdminDinozService } from '../../services/adminDinoz.service';
import AdminDinozItemsForm from '../../components/admin/dinoz/AdminDinozItemsForm.vue';
import AdminDinozLeaderForm from '../../components/admin/dinoz/AdminDinozLeaderForm.vue';
import AdminDinozPlaceForm from '../../components/admin/dinoz/AdminDinozPlaceForm.vue';
import AdminDinozProfileForm from '../../components/admin/dinoz/AdminDinozProfileForm.vue';
import AdminDinozSkillsForm from '../../components/admin/dinoz/AdminDinozSkillsForm.vue';
import AdminDinozStateForm from '../../components/admin/dinoz/AdminDinozStateForm.vue';
import AdminDinozStatsForm from '../../components/admin/dinoz/AdminDinozStatsForm.vue';
import AdminDinozStatusForm from '../../components/admin/dinoz/AdminDinozStatusForm.vue';

const route = useRoute();

const loading = ref(false);
const error = ref('');
const dinoz = ref<AdminDinozDetails | null>(null);

const userId = computed(() => (typeof route.query.playerId === 'string' ? route.query.playerId : undefined));

const dinozId = computed(() => {
	if (typeof route.query.dinozId !== 'string') return undefined;
	const parsed = Number(route.query.dinozId);
	return Number.isInteger(parsed) ? parsed : undefined;
});

async function loadDinoz() {
	if (!userId.value || !dinozId.value) {
		error.value = 'Paramètres invalides.';
		return;
	}

	loading.value = true;
	error.value = '';

	try {
		dinoz.value = await AdminDinozService.getDinozDetails(userId.value, dinozId.value);
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de charger le Dinoz.';
	} finally {
		loading.value = false;
	}
}

async function reloadDinoz() {
	await loadDinoz();
}

watch([userId, dinozId], loadDinoz, { immediate: true });
</script>

<style scoped lang="scss">
.admin-dinoz-page {
	display: flex;
	flex-direction: column;
	gap: 16px;
}
.red {
	color: red;
}
</style>
