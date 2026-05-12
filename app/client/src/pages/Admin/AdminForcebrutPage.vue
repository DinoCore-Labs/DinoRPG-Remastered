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
						<label for="raceId">Race</label>
						<select id="raceId" v-model.number="form.raceId" class="admin-select">
							<option v-for="race in raceOptions" :key="race.id" :value="race.id">
								{{ race.label }}
							</option>
						</select>
					</div>
					<div class="field field--wide">
						<label for="display">Display complet</label>
						<DZInput
							id="display"
							v-model="form.display"
							type="text"
							maxlength="16"
							placeholder="Ex: XX00000000000000"
						/>
						<div class="display-editor">
							<div class="display-preview" v-if="form.display.length === 16">
								<DinozAnimation :display="form.display" :key="form.display" :life="1" />
							</div>
							<div class="display-tools">
								<p class="display-help">
									Modifie chaque caractère du display pour retrouver exactement le Dinoz original.
								</p>
								<div class="display-chars">
									<div v-for="(_, index) in displayChars" :key="index" class="display-char">
										<span class="display-char-index">{{ index + 1 }}</span>
										<button type="button" class="display-char-button" @click="moveDisplayChar(index, 1)">+</button>
										<input
											:value="displayChars[index]"
											maxlength="1"
											class="display-char-input"
											@input="updateDisplayChar(index, ($event.target as HTMLInputElement).value)"
										/>
										<button type="button" class="display-char-button" @click="moveDisplayChar(index, -1)">-</button>
									</div>
								</div>
								<div class="display-actions">
									<DZButton type="button" @click="syncDisplayCharsFromDisplay"> Lire le display </DZButton>
									<DZButton type="button" @click="randomizeFullDisplay"> Random complet </DZButton>
									<DZButton type="button" @click="clearDisplay"> Reset </DZButton>
								</div>
							</div>
						</div>
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
						<label for="skillSearch">Compétences</label>
						<DZInput id="skillSearch" v-model="skillSearch" type="text" placeholder="Rechercher une compétence..." />
						<div class="skill-results">
							<button
								v-for="skill in availableSkillOptions"
								:key="skill.id"
								type="button"
								class="skill-result"
								@click="addSkill(skill.id)"
							>
								+ {{ skill.label }}
							</button>
							<p v-if="availableSkillOptions.length === 0" class="field-help">Aucune compétence trouvée.</p>
						</div>
						<div v-if="form.skillIds.length > 0" class="selected-list">
							<button
								v-for="skillId in form.skillIds"
								:key="skillId"
								type="button"
								class="selected-pill"
								@click="removeSkill(skillId)"
							>
								{{ getSkillLabel(skillId) }}
								<span>×</span>
							</button>
						</div>
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
import { computed, onMounted, reactive, ref, watch } from 'vue';

import DZButton from '../../components/utils/DZButton.vue';
import DZCheckbox from '../../components/utils/DZCheckbox.vue';
import DZInput from '../../components/utils/DZInput.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { AdminForcebrutService } from '../../services/adminForcebrut.service';
import DinozAnimation from '../../components/dinoz/DinozAnimation.vue';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { raceList } from '../../constants/race';

const skillSearch = ref('');

type RaceOption = {
	id: number;
	label: string;
};

type SkillOption = {
	id: number;
	label: string;
};

function formatLabel(value: string): string {
	return value
		.replaceAll('_', ' ')
		.replaceAll('.', ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, char => char.toUpperCase());
}

const raceOptions = computed<RaceOption[]>(() => {
	return Object.entries(raceList)
		.map(([raceId, raceName]) => ({
			id: Number(raceId),
			label: `${formatLabel(raceName)} (#${raceId})`
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
});

const skillOptions = computed<SkillOption[]>(() => {
	return Object.values(skillList as Record<string, { id?: number; skillId?: number; name?: string; nameKey?: string }>)
		.map(skill => {
			const id = skill.id ?? skill.skillId;
			const rawName = skill.name ?? skill.nameKey ?? `skill.${id}`;
			return id
				? {
						id,
						label: `${formatLabel(rawName)} (#${id})`
					}
				: null;
		})
		.filter((skill): skill is SkillOption => skill !== null)
		.sort((a, b) => a.label.localeCompare(b.label));
});

const filteredSkillOptions = computed<SkillOption[]>(() => {
	const search = skillSearch.value.trim().toLowerCase();
	if (!search) {
		return skillOptions.value;
	}
	return skillOptions.value.filter(skill => skill.label.toLowerCase().includes(search));
});

const availableSkillOptions = computed<SkillOption[]>(() => {
	return filteredSkillOptions.value.filter(skill => !form.skillIds.includes(skill.id));
});

function addSkill(skillId: number) {
	if (form.skillIds.includes(skillId)) {
		return;
	}
	form.skillIds = [...form.skillIds, skillId];
}

function removeSkill(skillId: number) {
	form.skillIds = form.skillIds.filter(id => id !== skillId);
}

function getSkillLabel(skillId: number): string {
	return skillOptions.value.find(skill => skill.id === skillId)?.label ?? `Compétence #${skillId}`;
}

const DISPLAY_LENGTH = 16;
const DISPLAY_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

const displayChars = ref<string[]>(Array.from({ length: DISPLAY_LENGTH }, () => '0'));

function normalizeDisplay(value: string): string {
	return value.trim().slice(0, DISPLAY_LENGTH).padEnd(DISPLAY_LENGTH, '0');
}

function syncDisplayCharsFromDisplay() {
	displayChars.value = normalizeDisplay(form.display).split('');
}

function syncDisplayFromChars() {
	form.display = displayChars.value
		.map(char => {
			const cleanChar = String(char ?? '').slice(0, 1);
			return cleanChar || '0';
		})
		.join('')
		.slice(0, DISPLAY_LENGTH);
}

function updateDisplayChar(index: number, value: string) {
	displayChars.value[index] = String(value ?? '').slice(0, 1) || '0';
	syncDisplayFromChars();
}

function moveDisplayChar(index: number, direction: -1 | 1) {
	const currentChar = displayChars.value[index] || '0';
	const currentIndex = DISPLAY_ALPHABET.indexOf(currentChar);
	const safeIndex = currentIndex === -1 ? 0 : currentIndex;

	const nextIndex = (safeIndex + direction + DISPLAY_ALPHABET.length) % DISPLAY_ALPHABET.length;

	displayChars.value[index] = DISPLAY_ALPHABET[nextIndex];
	syncDisplayFromChars();
}

function randomizeFullDisplay() {
	displayChars.value = Array.from({ length: DISPLAY_LENGTH }, () => {
		const index = Math.floor(Math.random() * DISPLAY_ALPHABET.length);
		return DISPLAY_ALPHABET[index];
	});

	syncDisplayFromChars();
}

function clearDisplay() {
	displayChars.value = Array.from({ length: DISPLAY_LENGTH }, () => '0');
	syncDisplayFromChars();
}

const opponents = ref<AdminForcebrutOpponent[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const editingOpponent = ref<AdminForcebrutOpponent | null>(null);

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
	nbrUpFire: 0,
	nbrUpWood: 0,
	nbrUpWater: 0,
	nbrUpLightning: 0,
	nbrUpAir: 0,
	skillIds: [],
	enabled: true
});

function buildPayload(): AdminForcebrutOpponentPayload {
	return {
		...form,
		skillIds: form.skillIds.map(Number).filter(skillId => Number.isInteger(skillId) && skillId > 0)
	};
}

function resetForm() {
	editingOpponent.value = null;

	form.step = 1;
	form.name = '';
	form.raceId = 1;
	form.display = '';
	displayChars.value = Array.from({ length: DISPLAY_LENGTH }, () => '0');
	form.level = 1;
	form.life = 100;
	form.maxLife = 100;
	form.nbrUpFire = 0;
	form.nbrUpWood = 0;
	form.nbrUpWater = 0;
	form.nbrUpLightning = 0;
	form.nbrUpAir = 0;
	form.skillIds = [];
	form.enabled = true;
}

function editOpponent(opponent: AdminForcebrutOpponent) {
	editingOpponent.value = opponent;

	form.step = opponent.step;
	form.name = opponent.name;
	form.raceId = opponent.raceId;
	form.display = opponent.display;
	syncDisplayCharsFromDisplay();
	form.level = opponent.level;
	form.life = opponent.life;
	form.maxLife = opponent.maxLife;
	form.nbrUpFire = opponent.nbrUpFire;
	form.nbrUpWood = opponent.nbrUpWood;
	form.nbrUpWater = opponent.nbrUpWater;
	form.nbrUpLightning = opponent.nbrUpLightning;
	form.nbrUpAir = opponent.nbrUpAir;
	form.skillIds = [...opponent.skillIds];
	form.enabled = opponent.enabled;
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

watch(
	() => form.display,
	value => {
		if (value !== displayChars.value.join('')) {
			syncDisplayCharsFromDisplay();
		}
	}
);
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
	flex-direction: column;
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
.display-editor {
	display: grid;
	grid-template-columns: 180px 1fr;
	gap: 16px;
	margin-top: 10px;
	padding: 12px;
	background-color: #fce3bc;
	border: 1px solid #bc683c;
	border-radius: 8px;
}
.display-preview {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 150px;
	background-color: #ecbd84;
	border: 1px solid #bc683c;
	border-radius: 8px;
	overflow: hidden;
}
.display-tools {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.display-help {
	margin: 0;
	color: #8e3e26;
	font-weight: bold;
}
.display-chars {
	display: grid;
	grid-template-columns: repeat(8, minmax(0, 1fr));
	gap: 8px;
}
.display-char {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}
.display-char-index {
	font-size: 11px;
	font-weight: bold;
	color: #8e3e26;
}
.display-char-input {
	width: 32px;
	height: 28px;
	text-align: center;
	border: 1px solid #bc683c;
	background-color: #fff5dd;
	color: #53260e;
	font-weight: bold;
}
.display-char-button {
	width: 32px;
	height: 24px;
	border: 1px solid #bc683c;
	background-color: #bc683c;
	color: #fce3bc;
	font-weight: bold;
	cursor: pointer;
	&:hover {
		background-color: #8e3e26;
	}
}
.display-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
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
	.display-editor {
		grid-template-columns: 1fr;
	}
	.display-chars {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
</style>
