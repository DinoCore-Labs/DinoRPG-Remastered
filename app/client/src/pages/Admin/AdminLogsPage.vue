<template>
	<div class="adminLogs">
		<TitleHeader title="Admin" header="Logs :" sub-header="Audit & événements" />
		<form class="filters" @submit.prevent="loadLogs(0)">
			<label>
				Type
				<DZSelect id="admin-log-type" v-model="typeFilter" :options="typeOptions" />
			</label>
			<label>
				Retention
				<DZSelect id="admin-log-retention" v-model="retentionFilter" :options="retentionOptions" />
			</label>
			<label>
				User ID
				<DZInput v-model="userIdFilter" type="text" placeholder="UUID joueur" />
			</label>
			<label>
				Dinoz ID
				<DZInput v-model="dinozIdFilter" type="number" min="1" placeholder="ID Dinoz" />
			</label>
			<label>
				Actor ID
				<DZInput v-model="actorUserIdFilter" type="text" placeholder="UUID admin" />
			</label>
			<label>
				Depuis
				<DZInput v-model="fromFilter" type="datetime-local" />
			</label>
			<label>
				Jusqu'à
				<DZInput v-model="toFilter" type="datetime-local" />
			</label>
			<div class="actions">
				<DZButton type="submit" class="bSmall" :disabled="loading">
					{{ loading ? 'Loading…' : 'Rechercher' }}
				</DZButton>
				<DZButton type="button" class="bSmall" :disabled="loading" @click="resetFilters"> Reset </DZButton>
			</div>
		</form>
		<div v-if="error" class="error">{{ error }}</div>
		<p class="summary">{{ total }} log(s) trouvé(s)</p>
		<DZTable>
			<tr>
				<th>Date</th>
				<th>Type</th>
				<th>Admin</th>
				<th>Joueur</th>
				<th>Dinoz</th>
				<th>Values</th>
				<th>Metadata</th>
			</tr>
			<tr v-if="loading">
				<td colspan="7">Chargement...</td>
			</tr>
			<tr v-else-if="logs.length === 0">
				<td colspan="7">Aucun log trouvé.</td>
			</tr>
			<tr v-for="log in logs" v-else :key="log.id">
				<td class="mono">{{ formatDate(log.createdAt) }}</td>
				<td>
					<strong>{{ log.type }}</strong>
					<br />
					<small class="mono">{{ log.retention }}</small>
				</td>
				<td>
					<span v-if="log.actorUserId">
						{{ log.actorNameSnapshot ?? log.actorUserId }}
					</span>
					<span v-else>—</span>
				</td>
				<td>
					<span v-if="log.userId">
						{{ log.userNameSnapshot ?? log.userId }}
					</span>
					<span v-else>—</span>
				</td>
				<td>
					<span v-if="log.dinozId">
						#{{ log.dinozId }}
						<span v-if="log.dinozNameSnapshot">- {{ log.dinozNameSnapshot }}</span>
					</span>
					<span v-else>—</span>
				</td>
				<td class="values">
					{{ log.values.length ? log.values.join(', ') : '—' }}
				</td>
				<td class="metadata">
					<details v-if="log.metadata">
						<summary>Voir</summary>
						<pre>{{ formatMetadata(log.metadata) }}</pre>
					</details>
					<span v-else>—</span>
				</td>
			</tr>
		</DZTable>
		<div class="pagination">
			<DZButton class="bSmall" :disabled="loading || page === 0" @click="loadLogs(page - 1)"> Précédent </DZButton>
			<span>Page {{ page + 1 }}</span>
			<DZButton class="bSmall" :disabled="loading || !hasNextPage" @click="loadLogs(page + 1)"> Suivant </DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { AdminGameLog, GameLogRetention, GameLogType } from '@dinorpg/core/models/admin/adminGameLog.js';
import { gameLogTypes } from '@dinorpg/core/models/admin/adminGameLog.js';
import type { SelectOption } from '../../components/utils/DZSelect.vue';
import { computed, onMounted, ref } from 'vue';

import DZButton from '../../components/utils/DZButton.vue';
import DZInput from '../../components/utils/DZInput.vue';
import DZSelect from '../../components/utils/DZSelect.vue';
import DZTable from '../../components/utils/DZTable.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { AdminGameLogsService } from '../../services/adminGamelog.service';

const PAGE_SIZE = 50;

const logs = ref<AdminGameLog[]>([]);
const total = ref(0);
const page = ref(0);
const loading = ref(false);
const error = ref('');

const typeFilter = ref<GameLogType | ''>('');
const retentionFilter = ref<GameLogRetention | ''>('AUDIT');
const userIdFilter = ref('');
const dinozIdFilter = ref<string | number>('');
const actorUserIdFilter = ref('');
const fromFilter = ref('');
const toFilter = ref('');

const typeOptions: SelectOption<GameLogType | ''>[] = [
	{ value: '', label: 'Tous' },
	...gameLogTypes.map(type => ({
		value: type,
		label: type
	}))
];

const retentionOptions: SelectOption<GameLogRetention | ''>[] = [
	{ value: '', label: 'Toutes' },
	{ value: 'AUDIT', label: 'AUDIT' },
	{ value: 'TEMPORARY', label: 'TEMPORARY' }
];

const hasNextPage = computed(() => (page.value + 1) * PAGE_SIZE < total.value);

function toIsoDateTime(value: string): string | undefined {
	if (!value) return undefined;

	return new Date(value).toISOString();
}

function buildQuery() {
	const dinozId = Number(dinozIdFilter.value);

	return {
		...(typeFilter.value ? { type: typeFilter.value } : {}),
		...(retentionFilter.value ? { retention: retentionFilter.value } : {}),
		...(userIdFilter.value ? { userId: userIdFilter.value } : {}),
		...(Number.isInteger(dinozId) && dinozId > 0 ? { dinozId } : {}),
		...(actorUserIdFilter.value ? { actorUserId: actorUserIdFilter.value } : {}),
		...(fromFilter.value ? { from: toIsoDateTime(fromFilter.value) } : {}),
		...(toFilter.value ? { to: toIsoDateTime(toFilter.value) } : {}),
		take: PAGE_SIZE,
		skip: page.value * PAGE_SIZE
	};
}

async function loadLogs(nextPage = page.value) {
	page.value = nextPage;
	loading.value = true;
	error.value = '';

	try {
		const result = await AdminGameLogsService.list(buildQuery());
		logs.value = result.logs;
		total.value = result.total;
	} catch (err) {
		error.value = err instanceof Error ? err.message : String(err);
	} finally {
		loading.value = false;
	}
}

function resetFilters() {
	typeFilter.value = '';
	retentionFilter.value = 'AUDIT';
	userIdFilter.value = '';
	dinozIdFilter.value = '';
	actorUserIdFilter.value = '';
	fromFilter.value = '';
	toFilter.value = '';
	void loadLogs(0);
}

function formatDate(value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR');
}

function formatMetadata(value: unknown) {
	return JSON.stringify(value, null, 2);
}

onMounted(() => {
	void loadLogs(0);
});
</script>

<style scoped lang="scss">
.adminLogs {
	display: flex;
	flex-direction: column;
	padding: 12px;
}
.filters {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	gap: 10px;
	align-items: end;
	margin: 10px 0;
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 9pt;
		font-weight: bold;
		color: #710;
	}
}
.actions,
.pagination {
	display: flex;
	gap: 10px;
	align-items: center;
}
.summary {
	margin: 8px 0;
	font-weight: bold;
	color: #710;
}
.error {
	margin: 10px 0;
	padding: 10px;
	border: 1px solid rgba(255, 0, 0, 0.35);
	background: rgba(255, 0, 0, 0.12);
	border-radius: 10px;
}
.mono {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
.values {
	max-width: 240px;
	word-break: break-word;
}
.metadata {
	max-width: 360px;
	pre {
		max-height: 220px;
		overflow: auto;
		white-space: pre-wrap;
		font-size: 8pt;
	}
}
.pagination {
	margin-top: 12px;
	justify-content: center;
}
</style>
