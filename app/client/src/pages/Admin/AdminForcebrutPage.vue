<template>
	<div class="admin-forcebrut-page">
		<TitleHeader title="Admin" header="Tournoi de Forcebrut" />

		<section class="card">
			<div class="card-container">
				<h3>{{ editingOpponent ? 'Modifier un adversaire' : 'Créer un adversaire' }}</h3>

				<div class="grid">
					<div class="field">
						<label for="step">Palier</label>
						<DZInput id="step" v-model.number="form.step" type="number" min="1" />
					</div>

					<div class="field">
						<label for="name">Nom</label>
						<DZInput id="name" v-model="form.name" type="text" />
					</div>

					<div class="field">
						<label for="raceId">Race ID</label>
						<DZInput id="raceId" v-model.number="form.raceId" type="number" min="1" />
					</div>

					<div class="field">
						<label for="display">Display</label>
						<DZInput id="display" v-model="form.display" type="text" />
					</div>

					<div class="field">
						<label for="level">Niveau</label>
						<DZInput id="level" v-model.number="form.level" type="number" min="1" />
					</div>

					<div class="field">
						<label for="life">Vie actuelle</label>
						<DZInput id="life" v-model.number="form.life" type="number" min="0" />
					</div>

					<div class="field">
						<label for="maxLife">Vie max</label>
						<DZInput id="maxLife" v-model.number="form.maxLife" type="number" min="1" />
					</div>

					<div class="field">
						<label for="experience">Expérience</label>
						<DZInput id="experience" v-model.number="form.experience" type="number" min="0" />
					</div>

					<div class="field">
						<label for="nbrUpFire">Feu</label>
						<DZInput id="nbrUpFire" v-model.number="form.nbrUpFire" type="number" min="0" />
					</div>

					<div class="field">
						<label for="nbrUpWood">Bois</label>
						<DZInput id="nbrUpWood" v-model.number="form.nbrUpWood" type="number" min="0" />
					</div>

					<div class="field">
						<label for="nbrUpWater">Eau</label>
						<DZInput id="nbrUpWater" v-model.number="form.nbrUpWater" type="number" min="0" />
					</div>

					<div class="field">
						<label for="nbrUpLightning">Foudre</label>
						<DZInput id="nbrUpLightning" v-model.number="form.nbrUpLightning" type="number" min="0" />
					</div>

					<div class="field">
						<label for="nbrUpAir">Air</label>
						<DZInput id="nbrUpAir" v-model.number="form.nbrUpAir" type="number" min="0" />
					</div>

					<div class="field field--wide">
						<label for="skillIds">Compétences</label>
						<DZInput id="skillIds" v-model="skillIdsInput" type="text" placeholder="Ex: 1, 2, 3" />
					</div>

					<div class="field field--wide">
						<label for="itemIds">Objets équipés</label>
						<DZInput id="itemIds" v-model="itemIdsInput" type="text" placeholder="Ex: 12, 25" />
					</div>

					<div class="field field--wide">
						<label for="statusIds">Statuts</label>
						<DZInput id="statusIds" v-model="statusIdsInput" type="text" placeholder="Ex: 4, 8" />
					</div>

					<div class="field field--wide">
						<DZCheckbox id="enabled" v-model="form.enabled">Adversaire activé</DZCheckbox>
					</div>
				</div>

				<div class="actions">
					<DZButton type="button" @click="submit">
						{{ editingOpponent ? 'Sauvegarder' : 'Créer' }}
					</DZButton>

					<DZButton v-if="editingOpponent" type="button" @click="resetForm"> Annuler </DZButton>
				</div>

				<p v-if="error" class="error">{{ error }}</p>
			</div>
		</section>

		<section class="card">
			<div class="card-container">
				<div class="table-header">
					<h3>Adversaires configurés</h3>
					<DZButton type="button" @click="loadOpponents">Recharger</DZButton>
				</div>

				<p v-if="loading">Chargement...</p>

				<table v-else>
					<thead>
						<tr>
							<th>Palier</th>
							<th>Nom</th>
							<th>Race</th>
							<th>Niv.</th>
							<th>PV</th>
							<th>Display</th>
							<th>Actif</th>
							<th>Skills</th>
							<th>Items</th>
							<th>Statuts</th>
							<th></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="opponent in opponents" :key="opponent.id">
							<td>{{ opponent.step }}</td>
							<td>{{ opponent.name }}</td>
							<td>{{ opponent.raceId }}</td>
							<td>{{ opponent.level }}</td>
							<td>{{ opponent.life }} / {{ opponent.maxLife }}</td>
							<td class="display">{{ opponent.display }}</td>
							<td>{{ opponent.enabled ? 'Oui' : 'Non' }}</td>
							<td>{{ opponent.skillIds.join(', ') || '-' }}</td>
							<td>{{ opponent.itemIds.join(', ') || '-' }}</td>
							<td>{{ opponent.statusIds.join(', ') || '-' }}</td>
							<td class="row-actions">
								<DZButton type="button" @click="editOpponent(opponent)">Modifier</DZButton>
								<DZButton type="button" @click="deleteOpponent(opponent)">Supprimer</DZButton>
							</td>
						</tr>

						<tr v-if="opponents.length === 0">
							<td colspan="11">Aucun adversaire configuré.</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import type {
	AdminForcebrutOpponent,
	AdminForcebrutOpponentPayload
} from '@dinorpg/core/models/admin/adminForcebrut.js';
import { onMounted, reactive, ref } from 'vue';

import DZButton from '../../components/utils/DZButton.vue';
import DZCheckbox from '../../components/utils/DZCheckbox.vue';
import DZInput from '../../components/utils/DZInput.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { AdminForcebrutService } from '../../services/adminForcebrut.service';

const opponents = ref<AdminForcebrutOpponent[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const editingOpponent = ref<AdminForcebrutOpponent | null>(null);

const skillIdsInput = ref('');
const itemIdsInput = ref('');
const statusIdsInput = ref('');

const form = reactive<AdminForcebrutOpponentPayload>({
	step: 1,
	name: '',
	raceId: 1,
	display: '',
	level: 1,
	life: 100,
	maxLife: 100,
	experience: 0,
	nbrUpFire: 0,
	nbrUpWood: 0,
	nbrUpWater: 0,
	nbrUpLightning: 0,
	nbrUpAir: 0,
	skillIds: [],
	itemIds: [],
	statusIds: [],
	enabled: true
});

function parseNumberList(value: string): number[] {
	return value
		.split(',')
		.map(entry => Number(entry.trim()))
		.filter(entry => Number.isInteger(entry) && entry > 0);
}

function fillNumberInputs() {
	skillIdsInput.value = form.skillIds.join(', ');
	itemIdsInput.value = form.itemIds.join(', ');
	statusIdsInput.value = form.statusIds.join(', ');
}

function buildPayload(): AdminForcebrutOpponentPayload {
	return {
		...form,
		skillIds: parseNumberList(skillIdsInput.value),
		itemIds: parseNumberList(itemIdsInput.value),
		statusIds: parseNumberList(statusIdsInput.value)
	};
}

function resetForm() {
	editingOpponent.value = null;

	form.step = 1;
	form.name = '';
	form.raceId = 1;
	form.display = '';
	form.level = 1;
	form.life = 100;
	form.maxLife = 100;
	form.experience = 0;
	form.nbrUpFire = 0;
	form.nbrUpWood = 0;
	form.nbrUpWater = 0;
	form.nbrUpLightning = 0;
	form.nbrUpAir = 0;
	form.skillIds = [];
	form.itemIds = [];
	form.statusIds = [];
	form.enabled = true;

	fillNumberInputs();
}

function editOpponent(opponent: AdminForcebrutOpponent) {
	editingOpponent.value = opponent;

	form.step = opponent.step;
	form.name = opponent.name;
	form.raceId = opponent.raceId;
	form.display = opponent.display;
	form.level = opponent.level;
	form.life = opponent.life;
	form.maxLife = opponent.maxLife;
	form.experience = opponent.experience;
	form.nbrUpFire = opponent.nbrUpFire;
	form.nbrUpWood = opponent.nbrUpWood;
	form.nbrUpWater = opponent.nbrUpWater;
	form.nbrUpLightning = opponent.nbrUpLightning;
	form.nbrUpAir = opponent.nbrUpAir;
	form.skillIds = [...opponent.skillIds];
	form.itemIds = [...opponent.itemIds];
	form.statusIds = [...opponent.statusIds];
	form.enabled = opponent.enabled;

	fillNumberInputs();
}

async function loadOpponents() {
	loading.value = true;
	error.value = null;

	try {
		opponents.value = await AdminForcebrutService.getOpponents();
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Erreur inconnue';
	} finally {
		loading.value = false;
	}
}

async function submit() {
	error.value = null;

	try {
		const payload = buildPayload();

		if (editingOpponent.value) {
			await AdminForcebrutService.updateOpponent(editingOpponent.value.id, payload);
		} else {
			await AdminForcebrutService.createOpponent(payload);
		}

		resetForm();
		await loadOpponents();
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Erreur inconnue';
	}
}

async function deleteOpponent(opponent: AdminForcebrutOpponent) {
	const confirmed = window.confirm(`Supprimer l'adversaire du palier ${opponent.step} : ${opponent.name} ?`);

	if (!confirmed) {
		return;
	}

	error.value = null;

	try {
		await AdminForcebrutService.deleteOpponent(opponent.id);

		if (editingOpponent.value?.id === opponent.id) {
			resetForm();
		}

		await loadOpponents();
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Erreur inconnue';
	}
}

onMounted(loadOpponents);
</script>

<style scoped lang="scss">
.admin-forcebrut-page {
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

.grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 4px;

	&--wide {
		grid-column: 1 / -1;
	}
}

label {
	color: #8e3e26;
	font-weight: bold;
}

.actions,
.row-actions,
.table-header {
	display: flex;
	gap: 10px;
	align-items: center;
}

.actions {
	margin-top: 16px;
}

.table-header {
	justify-content: space-between;
	margin-bottom: 12px;
}

table {
	width: 100%;
	border-collapse: collapse;
	background-color: #fce3bc;
}

th,
td {
	border: 1px solid #bc683c;
	padding: 6px;
	text-align: left;
	vertical-align: top;
}

th {
	color: #8e3e26;
	background-color: #ecbd84;
}

.display {
	max-width: 180px;
	word-break: break-all;
}

.error {
	color: #b00020;
	font-weight: bold;
}

@media (max-width: 900px) {
	.grid {
		grid-template-columns: 1fr;
	}

	.table-header,
	.row-actions {
		align-items: stretch;
		flex-direction: column;
	}

	table {
		font-size: 12px;
	}
}
</style>
