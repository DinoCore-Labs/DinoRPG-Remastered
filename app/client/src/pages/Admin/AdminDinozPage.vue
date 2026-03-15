<template>
	<div class="admin-dinoz-page">
		<TitleHeader :title="$t('pageTitle.adminDinoz')" />
		<p v-if="loading">Chargement...</p>
		<p v-else-if="error" class="red">{{ error }}</p>
		<template v-else-if="dinoz">
			<AdminDinozSummaryCard :dinoz="dinoz" />
			<AdminDinozProfileForm :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozStatsForm :dinoz="dinoz" @updated="reloadDinoz" />
			<AdminDinozStateForm :dinoz="dinoz" @updated="reloadDinoz" />
			<!--<AdminDinozRelationsForm :dinoz="dinoz" @updated="reloadDinoz" />-->
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';

import TitleHeader from '../../components/utils/TitleHeader.vue';
import { AdminDinozService } from '../../services/adminDinoz.service';
import AdminDinozSummaryCard from '../../components/admin/dinoz/AdminDinozSummaryCard.vue';
import AdminDinozProfileForm from '../../components/admin/dinoz/AdminDinozProfileForm.vue';
import AdminDinozStatsForm from '../../components/admin/dinoz/AdminDinozStatsForm.vue';
import AdminDinozStateForm from '../../components/admin/dinoz/AdminDinozStateForm.vue';
//import AdminDinozRelationsForm from '../../components/admin/dinoz/AdminDinozRelationsForm.vue';

const route = useRoute();

const loading = ref(false);
const error = ref('');
const dinoz = ref<AdminDinozDetails | null>(null);

const playerId = computed(() => {
	return typeof route.query.playerId === 'string' ? route.query.playerId : undefined;
});

const dinozId = computed(() => {
	if (typeof route.query.dinozId !== 'string') return undefined;

	const parsed = Number(route.query.dinozId);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
});

async function loadDinoz() {
	if (!playerId.value || !dinozId.value) {
		error.value = 'Paramètres playerId ou dinozId invalides.';
		dinoz.value = null;
		return;
	}

	loading.value = true;
	error.value = '';

	try {
		dinoz.value = await AdminDinozService.getAdminDinoz(playerId.value, dinozId.value);
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de charger le Dinoz.';
		dinoz.value = null;
	} finally {
		loading.value = false;
	}
}

async function reloadDinoz() {
	await loadDinoz();
}

watch(
	[playerId, dinozId],
	async () => {
		await loadDinoz();
	},
	{ immediate: true }
);

onMounted(async () => {
	await loadDinoz();
});
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
