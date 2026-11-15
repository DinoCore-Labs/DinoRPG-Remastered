<template>
	<div class="admin-tournament">
		<TitleHeader title="Admin" header="Tournoi Interdojo" sub-header="Gestion manuelle du Tournoi Interdojo" />

		<section class="card">
			<div class="card-container">
				<h3>Lancer un nouveau tournoi</h3>
				<p class="hint">
					Indiquez la date du tournoi : à cette date, une news sera publiée avec les règles. Les qualifications
					débuteront dans la nuit du dimanche au lundi qui suit et dureront 2 semaines semaines.
				</p>

				<div class="form-grid">
					<div class="field">
						<label for="tourney-start">Date d'annonce (publication des règles)</label>
						<DZInput id="tourney-start" v-model="createForm.startDate" type="datetime-local" />
						<span class="sub-hint">Si vide ou passée, la news et le tournoi démarrent immédiatement.</span>
					</div>

					<div class="field">
						<label for="tourney-teamsize">Taille d'équipe</label>
						<DZSelect
							id="tourney-teamsize"
							v-model="createForm.teamSize"
							:options="teamSizeOptions"
							placeholder="Aléatoire (2 à 6)"
						/>
					</div>

					<div class="field">
						<label for="tourney-level">Niveau max</label>
						<DZInput id="tourney-level" v-model="createForm.levelLimit" type="number" placeholder="50" />
					</div>

					<div class="field">
						<label for="tourney-poison">Poison</label>
						<DZSelect
							id="tourney-poison"
							v-model="createForm.poison"
							:options="booleanOptions"
							placeholder="Aléatoire"
						/>
					</div>

					<div class="field">
						<label for="tourney-items">Objets</label>
						<DZSelect
							id="tourney-items"
							v-model="createForm.itemsAllowed"
							:options="booleanOptions"
							placeholder="Aléatoire"
						/>
					</div>
				</div>

				<div class="actions">
					<DZButton :disabled="creating" @click="createTournament">
						{{ creating ? 'Lancement...' : 'Créer et programmer le tournoi' }}
					</DZButton>
				</div>
			</div>
		</section>

		<section class="card">
			<div class="card-container">
				<h3>Cycle de vie & Prochaine étape</h3>

				<div class="actions">
					<DZButton :disabled="nextStepRunning || !overview" @click="runNextStep">
						{{ nextStepRunning ? 'Exécution...' : `Executer l'étape suivante` }}
					</DZButton>
				</div>

				<div v-if="message" :class="['feedback', messageType]">
					{{ message }}
				</div>
			</div>
		</section>

		<!-- État du tournoi en cours -->
		<section class="card">
			<div class="card-container">
				<h3>Tournoi en cours</h3>

				<p v-if="loading">Chargement...</p>

				<p v-else-if="!overview?.current" class="no-tournament">Aucun tournoi actif en ce moment.</p>

				<div v-else class="tournament-info">
					<div class="info-grid">
						<div class="info-item">
							<span class="label">ID</span>
							<span class="value mono">{{ overview.current.id }}</span>
						</div>
						<div class="info-item">
							<span class="label">Phase</span>
							<span :class="['value', 'phase', `phase-${overview.current.phase.toLowerCase()}`]">
								{{ overview.current.phase }}
							</span>
						</div>
						<div class="info-item">
							<span class="label">Round</span>
							<span class="value">{{ overview.current.round }}</span>
						</div>
						<div class="info-item">
							<span class="label">Format</span>
							<span class="value">{{ overview.current.formatName }}</span>
						</div>
						<div class="info-item">
							<span class="label">Taille équipe</span>
							<span class="value">{{ overview.current.teamSize }} Dinoz</span>
						</div>
						<div class="info-item">
							<span class="label">Niveau limite</span>
							<span class="value">{{ overview.current.levelLimit }}</span>
						</div>
						<div class="info-item">
							<span class="label">Poison</span>
							<span class="value">{{ overview.current.poison ? '✅ Activé' : '❌ Désactivé' }}</span>
						</div>
						<div class="info-item">
							<span class="label">Objets autorisés</span>
							<span class="value">{{ overview.current.itemsAllowed ? '✅ Activés' : '❌ Désactivés' }}</span>
						</div>
					</div>

					<div class="schedule">
						<h4>Planning officiel</h4>
						<div class="schedule-grid">
							<div class="schedule-item">
								<span class="label">Qualifications début (dimanche/lundi minuit)</span>
								<span class="value mono">{{ formatDate(overview.current.schedule.qualificationStart) }}</span>
							</div>
							<div class="schedule-item">
								<span class="label">Qualifications fin (durée 2 semaines)</span>
								<span class="value mono">{{ formatDate(overview.current.schedule.qualificationEnd) }}</span>
							</div>
							<div class="schedule-item">
								<span class="label">Poules début (Round 0)</span>
								<span class="value mono">{{ formatDate(overview.current.schedule.poolsStart) }}</span>
							</div>
							<div class="schedule-item">
								<span class="label">Finales début (1/16 de finale)</span>
								<span class="value mono">{{ formatDate(overview.current.schedule.finalsStart) }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="card">
			<div class="card-container">
				<h3>Étapes du tournoi & Jobs automatiques</h3>

				<DZTable>
					<tr>
						<th>Clé du job</th>
						<th>Description</th>
						<th>Exécution automatique</th>
						<th>Statut</th>
						<th>Action manuelle</th>
					</tr>
					<tr v-for="step in TOURNAMENT_STEPS" :key="step.key">
						<td class="mono">{{ step.key }}</td>
						<td>{{ step.label }}</td>
						<td class="mono">
							{{ getJobNextRun(step.key) }}
						</td>
						<td>
							<span :class="['job-status', isJobEnabled(step.key) ? 'status-active' : 'status-disabled']">
								{{ isJobEnabled(step.key) ? 'Actif' : 'Désactivé' }}
							</span>
						</td>
						<td>
							<DZButton small :disabled="runningKey === step.key" @click="runStep(step.key)">
								{{ runningKey === step.key ? 'Exécution...' : 'Lancer' }}
							</DZButton>
						</td>
					</tr>
				</DZTable>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import type { AdminTournamentOverview } from '@dinorpg/core/models/admin/adminTournament.js';

import { onMounted, reactive, ref } from 'vue';

import DZButton from '../../components/utils/DZButton.vue';
import DZInput from '../../components/utils/DZInput.vue';
import DZSelect from '../../components/utils/DZSelect.vue';
import DZTable from '../../components/utils/DZTable.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';

import { AdminTournamentService } from '../../services/adminTournament.service';

const TOURNAMENT_STEPS = [
	{ key: 'tournament-init', label: 'Annonce & création du tournoi (publication des règles)' },
	{
		key: 'tournament-pools-start',
		label: 'Fermer les qualifications (2 semaines), assigner les poules et jouer Round 0'
	},
	{ key: 'tournament-pools-round-1', label: 'Poules — Round 1 (M3 et M4)' },
	{ key: 'tournament-pools-round-2', label: 'Poules — Round 2 (M5 décisif) + générer l’arbre final' },
	{ key: 'tournament-finals-r0', label: 'Finales — 1/16 de finale (32 → 16)' },
	{ key: 'tournament-finals-r1', label: 'Finales — 1/8 de finale (16 → 8)' },
	{ key: 'tournament-finals-r2', label: 'Finales — Quarts de finale (8 → 4)' },
	{ key: 'tournament-finals-r3', label: 'Finales — Demi-finales (4 → 2)' },
	{ key: 'tournament-finals-r4', label: 'Finales — Grande Finale (2 → 1) + récompenses' }
] as const;

const teamSizeOptions = [
	{ value: '', label: 'Aléatoire (2 à 6)' },
	{ value: '2', label: '2 Dinoz' },
	{ value: '3', label: '3 Dinoz' },
	{ value: '4', label: '4 Dinoz' },
	{ value: '5', label: '5 Dinoz' },
	{ value: '6', label: '6 Dinoz' }
];

const booleanOptions = [
	{ value: '', label: 'Aléatoire' },
	{ value: 'true', label: 'Oui' },
	{ value: 'false', label: 'Non' }
];

const createForm = reactive({
	startDate: '',
	teamSize: '',
	levelLimit: '50',
	poison: '',
	itemsAllowed: ''
});

const overview = ref<AdminTournamentOverview | null>(null);
const loading = ref(false);
const creating = ref(false);
const nextStepRunning = ref(false);
const runningKey = ref('');
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

function showSuccess(value: string) {
	message.value = value;
	messageType.value = 'success';
}

function showError(error: unknown) {
	message.value = error instanceof Error ? error.message : String(error);
	messageType.value = 'error';
}

async function load() {
	loading.value = true;
	message.value = '';
	try {
		overview.value = await AdminTournamentService.getOverview();
	} catch (error) {
		showError(error);
	} finally {
		loading.value = false;
	}
}

function getJobNextRun(key: string): string {
	const job = overview.value?.jobs?.find(j => j.key === key);
	if (!job || !job.nextRunAt) return '—';
	return formatDate(job.nextRunAt);
}

function isJobEnabled(key: string): boolean {
	const job = overview.value?.jobs?.find(j => j.key === key);
	return job?.enabled ?? false;
}

async function createTournament() {
	creating.value = true;
	message.value = '';
	try {
		const payload: {
			startDate?: string;
			teamSize?: number;
			levelLimit?: number;
			poison?: boolean;
			itemsAllowed?: boolean;
		} = {};

		if (createForm.startDate) {
			const d = new Date(createForm.startDate);
			if (!Number.isNaN(d.getTime())) {
				payload.startDate = d.toISOString();
			}
		}
		if (createForm.teamSize) {
			payload.teamSize = parseInt(createForm.teamSize, 10);
		}
		if (createForm.levelLimit) {
			payload.levelLimit = parseInt(createForm.levelLimit, 10);
		}
		if (createForm.poison !== '') {
			payload.poison = createForm.poison === 'true';
		}
		if (createForm.itemsAllowed !== '') {
			payload.itemsAllowed = createForm.itemsAllowed === 'true';
		}

		const result = await AdminTournamentService.create(payload);
		showSuccess(result.message);
		await load();
	} catch (error) {
		showError(error);
	} finally {
		creating.value = false;
	}
}

async function runNextStep() {
	if (!overview.value) return;
	nextStepRunning.value = true;
	message.value = '';
	try {
		const result = await AdminTournamentService.runNextStep();
		showSuccess(result.message);
		await load();
	} catch (error) {
		showError(error);
	} finally {
		nextStepRunning.value = false;
	}
}

async function runStep(key: string) {
	if (!confirm(`Lancer immédiatement l'étape "${key}" ?`)) return;
	runningKey.value = key;
	message.value = '';
	try {
		const result = await AdminTournamentService.runStepByKey(key);
		showSuccess(result.message);
		await load();
	} catch (error) {
		showError(error);
	} finally {
		runningKey.value = '';
	}
}

function formatDate(value: string): string {
	return new Date(value).toLocaleString();
}

onMounted(load);
</script>

<style scoped lang="scss">
.admin-tournament {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.card {
	width: 100%;
	background-color: #ecbd84;
	padding: 5px;

	&-container {
		border: 2px solid #bc683c;
		padding: 20px;
	}
}

h3 {
	margin-top: 0;
	color: #8e3e26;
}

h4 {
	color: #8e3e26;
	margin-top: 16px;
	margin-bottom: 8px;
}

.hint {
	color: #5c3010;
	font-size: 0.9em;
	margin-bottom: 12px;
	line-height: 1.4;
}

.sub-hint {
	font-size: 0.75em;
	color: #7b401d;
	font-style: italic;
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 12px;
	margin-bottom: 12px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 5px;

	label {
		color: #8e3e26;
		font-weight: bold;
		font-size: 0.9em;
	}
}

.actions {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 8px;
}

.feedback {
	margin-top: 12px;
	padding: 10px;
	border: 1px solid #bc683c;

	&.success {
		color: #206020;
		background: #e8ffe8;
	}

	&.error {
		color: #8b2020;
		background: #ffe8e8;
	}
}

.no-tournament {
	color: #5c3010;
	font-style: italic;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 10px;
	margin-bottom: 16px;
}

.schedule-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 10px;
}

.info-item,
.schedule-item {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.label {
	font-size: 0.8em;
	color: #8e3e26;
	font-weight: bold;
	text-transform: uppercase;
}

.value {
	font-size: 0.95em;
}

.mono {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
	font-size: 0.85em;
}

.phase {
	font-weight: bold;
}

.phase-qualification {
	color: #765c00;
}

.phase-pools {
	color: #167016;
}

.phase-finals {
	color: #8e3e26;
}

.job-status {
	font-weight: bold;
	font-size: 0.85em;
	padding: 2px 6px;
	border-radius: 3px;

	&.status-active {
		color: #105e10;
		background-color: #c7f2c7;
	}

	&.status-disabled {
		color: #666666;
		background-color: #e0e0e0;
	}
}

table {
	font-size: 9pt;
}

@media (max-width: 900px) {
	.form-grid {
		grid-template-columns: 1fr;
	}

	.info-grid {
		grid-template-columns: repeat(2, 1fr);
	}

	.schedule-grid {
		grid-template-columns: 1fr;
	}
}
</style>
