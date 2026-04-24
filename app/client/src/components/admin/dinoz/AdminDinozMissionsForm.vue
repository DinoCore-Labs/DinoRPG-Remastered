<template>
	<div class="card">
		<div class="card-container">
			<h2>Missions</h2>

			<div class="section">
				<h3>Mission en cours</h3>

				<p v-if="!dinoz.currentMission" class="muted">Aucune mission active pour ce Dinoz.</p>

				<form v-else class="form" @submit.prevent="saveCurrentMission">
					<div class="infos">
						<p>
							<strong>{{ dinoz.currentMission.nameKey ?? dinoz.currentMission.missionKey }}</strong>
						</p>
						<p>Clé : {{ dinoz.currentMission.missionKey }}</p>
						<p>Groupe : {{ dinoz.currentMission.group ?? '—' }}</p>
						<p>Étape courante : {{ dinoz.currentMission.currentGoal?.type ?? '—' }}</p>
						<p>Nombre d’étapes : {{ dinoz.currentMission.goalCount ?? '—' }}</p>
					</div>

					<label class="field">
						<span>Progression</span>
						<input v-model.number="form.progression" min="0" type="number" />
					</label>

					<label class="field">
						<span>Tracking</span>
						<input v-model.number="form.tracking" min="0" type="number" />
					</label>

					<label class="checkbox">
						<input v-model="form.isCompleted" type="checkbox" />
						<span>Mission terminée</span>
					</label>

					<label class="field">
						<span>State (JSON)</span>
						<textarea v-model="form.stateJson" rows="8" />
					</label>

					<p v-if="error" class="error">{{ error }}</p>

					<DZButton :disabled="saving" type="submit">
						{{ saving ? 'Sauvegarde...' : 'Sauvegarder la mission' }}
					</DZButton>
				</form>
			</div>

			<div class="section">
				<h3>Missions enregistrées</h3>

				<p v-if="dinoz.missions.length === 0" class="muted">Aucune mission enregistrée.</p>

				<div v-for="mission in dinoz.missions" :key="mission.id" class="mission-row">
					<div class="mission-content">
						<p class="mission-title">
							<strong>{{ mission.nameKey ?? mission.missionKey }}</strong>
						</p>
						<p>Clé : {{ mission.missionKey }}</p>
						<p>Statut : {{ mission.isCompleted ? 'Terminée' : mission.isCurrent ? 'En cours' : 'Stockée' }}</p>
						<p>Progression : {{ mission.progression }}</p>
						<p>Tracking : {{ mission.tracking }}</p>
					</div>

					<div class="mission-actions">
						<DZButton
							v-if="mission.isCompleted"
							:disabled="replayingMissionKey === mission.missionKey"
							@click="makeReplayable(mission.missionKey)"
						>
							{{ replayingMissionKey === mission.missionKey ? '...' : 'Rendre rejouable' }}
						</DZButton>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

import type { AdminDinozDetails, AdminDinozMissionEntry } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { UpdateAdminDinozMissionPayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import DZButton from '../../utils/DZButton.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const saving = ref(false);
const replayingMissionKey = ref<string | null>(null);
const error = ref('');

const form = reactive({
	progression: 0,
	tracking: 0,
	isCompleted: false,
	stateJson: ''
});

function stringifyState(state: AdminDinozMissionEntry['state']) {
	return state == null ? '' : JSON.stringify(state, null, 2);
}

function syncFromMission(mission: AdminDinozMissionEntry | null) {
	form.progression = mission?.progression ?? 0;
	form.tracking = mission?.tracking ?? 0;
	form.isCompleted = mission?.isCompleted ?? false;
	form.stateJson = stringifyState(mission?.state ?? null);
	error.value = '';
}

watch(() => props.dinoz.currentMission, syncFromMission, { immediate: true });

function buildPayload(): UpdateAdminDinozMissionPayload {
	let parsedState: UpdateAdminDinozMissionPayload['state'] = null;

	if (form.stateJson.trim() !== '') {
		parsedState = JSON.parse(form.stateJson);
	}

	return {
		progression: Number(form.progression),
		tracking: Number(form.tracking),
		isCompleted: form.isCompleted,
		state: parsedState
	};
}

async function saveCurrentMission() {
	if (!props.dinoz.currentMission) return;

	saving.value = true;
	error.value = '';

	try {
		await AdminDinozService.updateDinozMission(
			props.userId,
			props.dinoz.id,
			props.dinoz.currentMission.missionKey,
			buildPayload()
		);

		emit('updated');
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de sauvegarder la mission.';
	} finally {
		saving.value = false;
	}
}

async function makeReplayable(missionKey: string) {
	replayingMissionKey.value = missionKey;
	error.value = '';

	try {
		await AdminDinozService.makeDinozMissionReplayable(props.userId, props.dinoz.id, missionKey);
		emit('updated');
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de rendre la mission rejouable.';
	} finally {
		replayingMissionKey.value = null;
	}
}
</script>

<style scoped lang="scss">
.card {
	margin-top: 1rem;
	background: #fff;
	border: 1px solid #d7d7d7;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.card-container {
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.section {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem;
	border: 1px solid #ececec;
	border-radius: 10px;
	background: #fafafa;
}

.form {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.field input,
.field textarea {
	width: 100%;
	padding: 0.65rem 0.75rem;
	border: 1px solid #cfcfcf;
	border-radius: 8px;
	font: inherit;
}

.checkbox {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.mission-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	padding: 0.85rem 1rem;
	border: 1px solid #ececec;
	border-radius: 10px;
	background: white;
}

.mission-content {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.mission-title {
	margin: 0;
}

.mission-actions {
	display: flex;
	align-items: center;
}

.muted {
	color: #777;
}

.error {
	color: #c62828;
	font-weight: 600;
}
</style>
