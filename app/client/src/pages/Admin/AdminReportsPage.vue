<template>
	<div class="admin-reports-page">
		<TitleHeader title="Admin" header="Signalements" />

		<p v-if="loading">Chargement...</p>
		<p v-else-if="error" class="red">{{ error }}</p>
		<div v-else class="reports-list">
			<div v-if="reports.length === 0">Aucun signalement.</div>

			<div class="report-card" v-for="report in reports" :key="report.id">
				<div class="header">
					<span><strong>ID:</strong> {{ report.id }}</span>
					<span :class="['status', report.status.toLowerCase()]">{{ report.status }}</span>
					<span><strong>Date:</strong> {{ new Date(report.createdAt).toLocaleString() }}</span>
				</div>
				<div class="details">
					<p>
						<strong>Par:</strong>
						<router-link :to="{ path: '/admin/user', query: { userId: report.reporterId } }">{{
							report.reporter.name
						}}</router-link>
					</p>

					<p v-if="report.reportedUserId">
						<strong>Joueur signalé:</strong>
						<router-link :to="{ path: '/admin/user', query: { userId: report.reportedUserId } }">{{
							report.reportedUser?.name
						}}</router-link>
					</p>
					<p v-if="report.reportedDinozId">
						<strong>Dinoz signalé:</strong> {{ report.reportedDinoz?.name }} (ID: {{ report.reportedDinozId }})
					</p>
					<p v-if="report.reportedClanId">
						<strong>Clan signalé:</strong> {{ report.reportedClan?.name }} (ID: {{ report.reportedClanId }})
					</p>

					<p><strong>Raison:</strong> {{ report.reason }}</p>
					<p v-if="report.comment"><strong>Commentaire:</strong> {{ report.comment }}</p>

					<div
						v-if="report.reportedUserId"
						class="sanction-controls"
						style="margin-top: 10px; display: flex; gap: 15px"
					>
						<div>
							<label>Bannissement:</label>
							<select v-model="reportSanctions[report.id].ban">
								<option value="none">Aucun</option>
								<option value="7d">7 jours</option>
								<option value="1m">1 mois</option>
								<option value="6m">6 mois</option>
								<option value="def">Définitif</option>
							</select>
						</div>
						<div>
							<label>Mute:</label>
							<select v-model="reportSanctions[report.id].mute">
								<option value="none">Aucun</option>
								<option value="7d">7 jours</option>
								<option value="1m">1 mois</option>
								<option value="6m">6 mois</option>
								<option value="def">Définitif</option>
							</select>
						</div>
					</div>
				</div>
				<div class="actions">
					<template v-if="report.reportedUserId">
						<DZButton size="small" v-if="report.status !== 'RESOLVED'" @click="applySanction(report.id)"
							>Appliquer & Résoudre</DZButton
						>
						<DZButton size="small" v-if="report.status === 'RESOLVED'" @click="applySanction(report.id)"
							>Modifier Sanction</DZButton
						>
					</template>
					<template v-else>
						<DZButton size="small" v-if="report.status !== 'RESOLVED'" @click="updateStatus(report.id, 'RESOLVED')"
							>Marquer Résolu</DZButton
						>

						<DZButton
							size="small"
							v-if="report.reportedClanId"
							:to="`${routePrefix}/clan?clanId=${report.reportedClanId}`"
							>Edit Clan</DZButton
						>

						<DZButton
							size="small"
							v-if="report.reportedDinozId"
							:to="`${routePrefix}/dinoz?playerId=${report.reportedUserId || report.reportedDinoz?.userId}&dinozId=${report.reportedDinozId}`"
							>Edit Dinoz</DZButton
						>

						<DZButton
							size="small"
							v-if="!report.reportedDinozId && !report.reportedClanId && report.reportedUserId"
							:to="`${routePrefix}/user?userId=${report.reportedUserId}`"
							>Edit Player</DZButton
						>
					</template>

					<DZButton size="small" v-if="report.status !== 'REJECTED'" @click="updateStatus(report.id, 'REJECTED')"
						>Rejeter</DZButton
					>
					<DZButton size="small" v-if="report.status !== 'PENDING'" @click="updateStatus(report.id, 'PENDING')"
						>Remettre En attente</DZButton
					>
				</div>
			</div>

			<div class="pagination" v-if="totalPages > 1">
				<DZButton size="small" :disabled="currentPage === 1" @click="prevPage()">Précédent</DZButton>
				<span>Page {{ currentPage }} sur {{ totalPages }}</span>
				<DZButton size="small" :disabled="currentPage === totalPages" @click="nextPage()">Suivant</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import DZButton from '../../components/utils/DZButton.vue';
import { AdminReportService, type AdminReport } from '../../services/adminReports.service';

const route = useRoute();
const routePrefix = computed(() => (route.path.startsWith('/moderation') ? '/moderation' : '/admin'));

const reports = ref<AdminReport[]>([]);
const reportSanctions = ref<Record<number, { ban: string; mute: string }>>({});
const loading = ref(false);
const error = ref<string | null>(null);

const currentPage = ref(1);
const totalPages = ref(1);

async function loadReports() {
	loading.value = true;
	try {
		const response = await AdminReportService.getReports(currentPage.value);
		reports.value = response.reports;
		totalPages.value = Math.ceil(response.total / 10) || 1;

		reports.value.forEach(r => {
			if (!reportSanctions.value[r.id]) {
				reportSanctions.value[r.id] = { ban: 'none', mute: 'none' };
			}
		});
	} catch (e) {
		error.value = e instanceof Error ? e.message : 'Erreur inconnue';
	} finally {
		loading.value = false;
	}
}

function prevPage() {
	if (currentPage.value > 1) {
		currentPage.value--;
		loadReports();
	}
}

function nextPage() {
	if (currentPage.value < totalPages.value) {
		currentPage.value++;
		loadReports();
	}
}

async function updateStatus(id: number, status: 'PENDING' | 'RESOLVED' | 'REJECTED') {
	try {
		await AdminReportService.updateReportStatus(id, { status });
		await loadReports();
	} catch (e) {
		console.error(e);
	}
}

async function applySanction(id: number) {
	try {
		const sanction = reportSanctions.value[id];
		await AdminReportService.updateReportStatus(id, {
			status: 'RESOLVED',
			banDuration: sanction.ban,
			muteDuration: sanction.mute
		});
		await loadReports();
	} catch (e) {
		console.error(e);
	}
}

onMounted(() => {
	loadReports();
});
</script>

<style scoped lang="scss">
.admin-reports-page {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.red {
	color: red;
}
.reports-list {
	display: flex;
	flex-direction: column;
	gap: 15px;
}
.report-card {
	background: #fdf5e6;
	border: 1px solid #c9b49b;
	padding: 10px;
	border-radius: 4px;

	.header {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #c9b49b;
		padding-bottom: 5px;
		margin-bottom: 5px;
		font-size: 0.9em;

		.status {
			font-weight: bold;
			&.pending {
				color: orange;
			}
			&.resolved {
				color: green;
			}
			&.rejected {
				color: red;
			}
		}
	}
	.details {
		margin-bottom: 10px;
		p {
			margin: 2px 0;
		}
	}
	.actions {
		display: flex;
		gap: 10px;
	}
}

.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 20px;
	margin-top: 15px;
	padding: 10px;
	background-color: #fdf5e6;
	border: 1px dashed #d69e68;
	border-radius: 4px;
	color: #79432b;
	font-weight: bold;
	span {
		font-size: 14px;
	}
	button {
		background-color: #bc683c;
		color: #f1e8e6;
		border: 1px solid #79432b;
		padding: 5px 15px;
		border-radius: 4px;
		cursor: pointer;
		&:hover:not(:disabled) {
			background-color: #ff9200;
		}
		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
}
</style>
