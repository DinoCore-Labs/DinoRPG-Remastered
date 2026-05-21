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
		<section class="charts">
			<h3>Graphique des logs</h3>
			<form class="chartFilters" @submit.prevent="loadChart">
				<label>
					Log
					<DZSelect id="admin-log-chart-type" v-model="chartLogType" :options="chartTypeOptions" />
				</label>
				<label>
					Affichage
					<DZSelect id="admin-log-chart-display" v-model="chartDisplayType" :options="chartDisplayOptions" />
				</label>
				<label>
					Du
					<DZInput v-model="chartFromFilter" type="date" />
				</label>
				<label>
					Au
					<DZInput v-model="chartToFilter" type="date" />
				</label>
				<DZButton type="submit" size="small" :disabled="chartLoading">
					{{ chartLoading ? 'Chargement…' : 'Afficher' }}
				</DZButton>
			</form>
			<p v-if="chartError" class="error">{{ chartError }}</p>
			<p v-else-if="chartLoading">Chargement du graphique...</p>
			<AdminLogsChart v-else :title="chartTitle" :labels="chartLabels" :values="chartValues" :type="chartDisplayType" />
			<p class="chartMode">
				Affichage :
				<strong>{{ chartGranularity === 'hourly' ? 'par heure' : 'par jour' }}</strong>
			</p>
		</section>
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
import AdminLogsChart from '../../components/admin/AdminLogsChart.vue';
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

// Chart state
type ChartRow = {
	label: string;
	total: number;
};

const chartRows = ref<ChartRow[]>([]);
const chartLoading = ref(false);
const chartError = ref('');

const chartLogType = ref<GameLogType>('GoldWon');
const chartDisplayType = ref<'bar' | 'line'>('bar');

const chartFromFilter = ref(getDateInputValue(addDays(new Date(), -7)));
const chartToFilter = ref(getDateInputValue(new Date()));

const chartGranularity = computed<'hourly' | 'daily'>(() => {
	return chartFromFilter.value === chartToFilter.value ? 'hourly' : 'daily';
});

const chartTitle = computed(() => {
	return `${chartLogType.value} - ${chartGranularity.value === 'hourly' ? 'par heure' : 'par jour'}`;
});

const chartLabels = computed(() => chartRows.value.map(row => row.label));
const chartValues = computed(() => chartRows.value.map(row => row.total));

const chartTypeOptions: SelectOption<GameLogType>[] = [
	{ value: 'GoldWon', label: 'Or gagné' },
	{ value: 'GoldLost', label: 'Or perdu' },
	{ value: 'XPEarned', label: 'XP gagnée' },
	{ value: 'HPLost', label: 'PV perdus' },
	{ value: 'FightWon', label: 'Combats gagnés' },
	{ value: 'FightLost', label: 'Combats perdus' },
	{ value: 'MissionFinished', label: 'Missions terminées' },
	{ value: 'MissionCanceled', label: 'Missions annulées' },
	{ value: 'ItemFound', label: 'Objets trouvés' }
];

const chartDisplayOptions: SelectOption<'bar' | 'line'>[] = [
	{ value: 'bar', label: 'Barres' },
	{ value: 'line', label: 'Courbe' }
];

async function loadChart() {
	chartLoading.value = true;
	chartError.value = '';
	try {
		if (!chartFromFilter.value || !chartToFilter.value) {
			chartRows.value = [];
			return;
		}
		if (chartFromFilter.value > chartToFilter.value) {
			chartError.value = 'La date de début ne peut pas être après la date de fin.';
			chartRows.value = [];
			return;
		}
		if (chartGranularity.value === 'hourly') {
			const rows = await AdminGameLogsService.hourly({
				type: chartLogType.value,
				date: chartFromFilter.value
			});
			chartRows.value = rows.map(row => ({
				label: `${String(row.hour).padStart(2, '0')}h`,
				total: row.total
			}));
			return;
		}
		const rows = await AdminGameLogsService.daily({
			type: chartLogType.value,
			from: chartFromFilter.value,
			to: chartToFilter.value
		});
		chartRows.value = rows.map(row => ({
			label: formatChartDay(row.day),
			total: row.total
		}));
	} catch (err) {
		chartError.value = err instanceof Error ? err.message : String(err);
		chartRows.value = [];
	} finally {
		chartLoading.value = false;
	}
}

function formatChartDay(value: string) {
	const date = new Date(`${value}T00:00:00`);
	return Number.isNaN(date.getTime())
		? value
		: date.toLocaleDateString('fr-FR', {
				day: '2-digit',
				month: '2-digit'
			});
}

function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

function getDateInputValue(date: Date) {
	return date.toISOString().slice(0, 10);
}

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
		await loadChart();
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
	void loadChart();
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
.charts {
	margin: 12px 0;
	padding: 10px;
	border: 1px solid #d39a65;
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.25);
}
.chartFilters {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 10px;
	align-items: end;
	margin-bottom: 12px;
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 9pt;
		font-weight: bold;
		color: #710;
	}
}
</style>
