<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Missions</h3>
				<div v-if="dinoz.missions.length === 0" class="empty">Aucune mission enregistrée pour ce Dinoz.</div>
				<template v-else>
					<div class="section">
						<label class="title" for="dinozMissionSelect">Sélectionner une mission :</label>
						<DZSelect id="dinozMissionSelect" v-model="selectedMissionKey" :options="missionOptions" />
					</div>
					<div v-if="selectedMission" class="section">
						<label class="title">Détail de la mission :</label>
						<div class="details">
							<p><strong>Clé :</strong> {{ selectedMission.missionKey }}</p>
							<p><strong>Nom :</strong> {{ $t(selectedMission.nameKey ?? '—') }}</p>
							<p><strong>Groupe :</strong> {{ selectedMission.group ?? '—' }}</p>
							<p><strong>Statut :</strong> {{ missionStatusLabel(selectedMission) }}</p>
							<p><strong>Progression :</strong> {{ selectedMission.progression }}</p>
							<p><strong>Tracking :</strong> {{ selectedMission.tracking }}</p>
							<p><strong>Étape courante :</strong> {{ selectedMission.currentGoal?.type ?? '—' }}</p>
							<p><strong>Nombre d’étapes :</strong> {{ selectedMission.goalCount ?? '—' }}</p>
							<p><strong>State :</strong></p>
							<pre class="state-preview">{{ formattedSelectedState }}</pre>
						</div>
					</div>
					<div v-if="selectedMission?.isCurrent" class="section">
						<label class="title">Modifier la mission en cours :</label>
						<div class="form-grid">
							<div class="field">
								<label for="missionProgression">Progression :</label>
								<DZInput id="missionProgression" v-model="form.progression" type="number" min="0" />
							</div>
							<div class="field">
								<label for="missionTracking">Tracking :</label>
								<DZInput id="missionTracking" v-model="form.tracking" type="number" min="0" />
							</div>
						</div>
						<div class="checkbox-row">
							<DZCheckbox id="missionCompleted" v-model="form.isCompleted" label="Mission terminée" />
						</div>
						<div class="field textarea-field">
							<label for="missionState">State (JSON) :</label>
							<textarea id="missionState" v-model="form.stateJson" rows="8" />
						</div>
						<p v-if="error" class="error">{{ error }}</p>
						<DZButton type="button" @click="saveCurrentMission"> Sauvegarder </DZButton>
					</div>
					<div v-else-if="selectedMission?.isCompleted" class="section">
						<label class="title">Mission terminée :</label>
						<p>Cette mission peut être remise en état rejouable.</p>
						<p v-if="error" class="error">{{ error }}</p>
						<DZButton type="button" @click="makeReplayable"> Rendre rejouable </DZButton>
					</div>
					<div v-else-if="selectedMission" class="section">
						<label class="title">Mission non active :</label>
						<p>Cette mission est enregistrée, mais ce n’est pas la mission en cours.</p>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import type { AdminDinozDetails, AdminDinozMissionEntry } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { UpdateAdminDinozMissionPayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import { AdminDinozService } from '../../../services/adminDinoz.service';

import DZButton from '../../utils/DZButton.vue';
import DZCheckbox from '../../utils/DZCheckbox.vue';
import DZInput from '../../utils/DZInput.vue';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const selectedMissionKey = ref<string>('');
const error = ref('');

const form = reactive({
	progression: 0,
	tracking: 0,
	isCompleted: false,
	stateJson: ''
});

const missionOptions = computed<SelectOption<string>[]>(() =>
	props.dinoz.missions.map(mission => ({
		value: mission.missionKey,
		label: `${mission.missionKey} — ${missionStatusLabel(mission)}`
	}))
);

const selectedMission = computed<AdminDinozMissionEntry | null>(() => {
	return props.dinoz.missions.find(mission => mission.missionKey === selectedMissionKey.value) ?? null;
});

const formattedSelectedState = computed(() => {
	if (!selectedMission.value?.state) return 'null';
	return JSON.stringify(selectedMission.value.state, null, 2);
});

watch(
	() => props.dinoz.missions,
	missions => {
		if (missions.length === 0) {
			selectedMissionKey.value = '';
			return;
		}

		const stillExists = missions.some(mission => mission.missionKey === selectedMissionKey.value);
		if (stillExists) return;

		selectedMissionKey.value = props.dinoz.currentMission?.missionKey ?? missions[0]?.missionKey ?? '';
	},
	{ immediate: true }
);

watch(
	selectedMission,
	mission => {
		form.progression = mission?.progression ?? 0;
		form.tracking = mission?.tracking ?? 0;
		form.isCompleted = mission?.isCompleted ?? false;
		form.stateJson = mission?.state ? JSON.stringify(mission.state, null, 2) : '';
		error.value = '';
	},
	{ immediate: true }
);

function missionStatusLabel(mission: AdminDinozMissionEntry) {
	if (mission.isCurrent) return 'en cours';
	if (mission.isCompleted) return 'terminée';
	return 'stockée';
}

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
	if (!selectedMission.value?.isCurrent) return;

	error.value = '';

	try {
		await AdminDinozService.updateDinozMission(
			props.userId,
			props.dinoz.id,
			selectedMission.value.missionKey,
			buildPayload()
		);

		emit('updated');
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de sauvegarder la mission.';
	}
}

async function makeReplayable() {
	if (!selectedMission.value?.isCompleted) return;

	error.value = '';

	try {
		await AdminDinozService.makeDinozMissionReplayable(props.userId, props.dinoz.id, selectedMission.value.missionKey);

		emit('updated');
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de rendre la mission rejouable.';
	}
}
</script>

<style scoped lang="scss">
.card {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	padding: 5px;

	&-container {
		border: 2px solid #bc683c;
		padding: 20px;
	}
}

.section + .section {
	margin-top: 14px;
}

.title {
	display: block;
	margin-bottom: 6px;
	font-weight: bold;
}

.details {
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 10px;
	border: 1px solid #bc683c;
	background: rgb(255 255 255 / 12%);
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 180px));
	gap: 12px;
	margin-bottom: 10px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.checkbox-row {
	margin: 10px 0;
}

.textarea-field textarea {
	width: 100%;
	min-height: 120px;
	padding: 8px;
	resize: vertical;
	border: 1px solid #bc683c;
	background: rgb(255 255 255 / 12%);
	color: #2f1a0f;
	font-family: monospace;
	font-size: 12px;
	box-sizing: border-box;
}

.state-preview {
	margin: 0;
	padding: 10px;
	border: 1px solid #bc683c;
	background: rgb(255 255 255 / 12%);
	white-space: pre-wrap;
	word-break: break-word;
	font-size: 12px;
}

.empty {
	padding: 10px;
	border: 1px solid #bc683c;
	background: rgb(255 255 255 / 12%);
}

.error {
	margin-top: 8px;
	color: #a11;
	font-weight: bold;
}
</style>
