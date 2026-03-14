<template>
	<div class="admin-secrets-page">
		<TitleHeader title="Admin" header="Secrets :" />
		<div class="card">
			<h3>Secrets</h3>
			<div v-if="loading" class="state">Chargement...</div>
			<div v-else-if="secrets.length === 0" class="state">Aucun secret trouvé.</div>
			<div v-else class="secrets-list">
				<div v-for="secret in secrets" :key="secret.key" class="secret-row">
					<div class="secret-meta">
						<label :for="`secret-${secret.key}`" class="secret-key">
							{{ secret.key }}
						</label>
					</div>
					<div class="secret-actions">
						<DZInput
							:id="`secret-${secret.key}`"
							v-model="editedSecrets[secret.key]"
							type="text"
							class="secret-input"
						/>
						<DZButton type="button" :disabled="savingKeys[secret.key]" @click="saveSecret(secret.key)">
							{{ savingKeys[secret.key] ? 'Sauvegarde...' : 'Sauvegarder' }}
						</DZButton>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';

import TitleHeader from '../../components/utils/TitleHeader.vue';
import DZButton from '../../components/utils/DZButton.vue';
import DZInput from '../../components/utils/DZInput.vue';
import { AdminSecretService } from '../../services/adminSecrets.service';
import type { AdminSecret } from '@dinorpg/core/models/admin/adminSecrets.js';
import { errorHandler } from '../../utils/errorHandler';
import type { ToastPluginApi } from 'vue-toast-notification';

const instance = getCurrentInstance();
const toast = instance?.appContext.config.globalProperties.$toast as ToastPluginApi;

const secrets = ref<AdminSecret[]>([]);
const loading = ref(true);

const editedSecrets = reactive<Record<string, string>>({});
const savingKeys = reactive<Record<string, boolean>>({});

async function fetchSecrets() {
	try {
		loading.value = true;
		const data = await AdminSecretService.getSecrets();
		secrets.value = data;
		for (const secret of data) {
			editedSecrets[secret.key] = secret.value;
		}
	} catch (error) {
		console.error(error);
		errorHandler.handle(error, toast);
	} finally {
		loading.value = false;
	}
}

async function saveSecret(key: string) {
	try {
		savingKeys[key] = true;
		const updatedSecret = await AdminSecretService.updateSecret(key, editedSecrets[key]);
		const index = secrets.value.findIndex(secret => secret.key === key);
		if (index !== -1) {
			secrets.value[index] = updatedSecret;
			editedSecrets[key] = updatedSecret.value;
		}
		toast.success(`Le secret "${key}" a bien été mis à jour.`);
	} catch (error) {
		console.error(error);
		errorHandler.handle(error, toast);
	} finally {
		savingKeys[key] = false;
	}
}

onMounted(fetchSecrets);
</script>

<style scoped lang="scss">
.admin-secrets-page {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.card {
	padding: 16px;
}
.state {
	padding: 8px 0;
}
.secrets-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.secret-row {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 12px;
	border: 1px solid #d9c6a5;
	border-radius: 6px;
	background: rgba(255, 248, 232, 0.7);
}
.secret-key {
	font-weight: bold;
	word-break: break-word;
}
.secret-actions {
	display: flex;
	gap: 8px;
	align-items: center;
}
.secret-input {
	flex: 1;
	min-width: 0;
}
</style>
