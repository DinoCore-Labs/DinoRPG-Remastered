<template>
	<div class="admin-maintenance">
		<TitleHeader title="Admin - Maintenance" header="Maintenance" />
		<p>
			Active ce mode pour bloquer l'accès au jeu aux joueurs. Les administrateurs pourront toujours accéder aux pages
			d'administration.
		</p>
		<label class="maintenance-toggle">
			<input v-model="enabled" type="checkbox" :disabled="loading || saving" />
			<span>Mode maintenance actif</span>
		</label>
		<DZButton type="button" :disabled="loading || saving" @click="saveMaintenance">
			{{ saving ? 'Enregistrement...' : 'Enregistrer' }}
		</DZButton>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { MaintenanceService } from '../../services/maintenance.service';
import DZButton from '../../components/utils/DZButton.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';

const enabled = ref(false);
const loading = ref(false);
const saving = ref(false);

async function loadMaintenance() {
	loading.value = true;
	try {
		const status = await MaintenanceService.getStatus();
		enabled.value = status.enabled;
	} finally {
		loading.value = false;
	}
}

async function saveMaintenance() {
	saving.value = true;
	try {
		const status = await MaintenanceService.update(enabled.value);
		enabled.value = status.enabled;
	} finally {
		saving.value = false;
	}
}

onMounted(loadMaintenance);
</script>

<style lang="scss" scoped>
.admin-maintenance {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.maintenance-toggle {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: bold;
}
</style>
