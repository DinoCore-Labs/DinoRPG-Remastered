<template>
	<div class="admin-monster-hunt">
		<TitleHeader title="Admin" header="Monster Hunt" sub-header="Gestion des éditions de la Chasse aux Monstres" />

		<section class="card">
			<div class="card-container">
				<h3>Planifier une édition</h3>

				<div class="form-grid">
					<div class="field">
						<label>Preset</label>

						<DZSelect
							id="monster-hunt-preset"
							v-model="form.presetKey"
							:options="presetOptions"
							placeholder="Sélectionner"
						/>
					</div>

					<div class="field">
						<label for="hunt-start"> Début </label>

						<DZInput id="hunt-start" v-model="form.startAt" type="datetime-local" />
					</div>

					<div class="field">
						<label for="hunt-end"> Fin </label>

						<DZInput id="hunt-end" v-model="form.endAt" type="datetime-local" />
					</div>
				</div>

				<div class="actions">
					<DZButton :disabled="creating" @click="createEdition">
						{{ creating ? 'Création...' : 'Créer l’édition' }}
					</DZButton>

					<DZButton :disabled="lifecycleRunning" @click="runLifecycle">
						{{ lifecycleRunning ? 'Exécution...' : 'Synchroniser le lifecycle' }}
					</DZButton>

					<DZButton :disabled="loading" @click="load"> Recharger </DZButton>
				</div>

				<div v-if="message" :class="['feedback', messageType]">
					{{ message }}
				</div>
			</div>
		</section>

		<section class="card">
			<div class="card-container">
				<h3>Éditions</h3>

				<p v-if="loading">Chargement...</p>

				<DZTable v-else>
					<tr>
						<th>Édition</th>
						<th>Statut</th>
						<th>Début</th>
						<th>Fin</th>
						<th>Joueurs</th>
						<th>Points</th>
						<th>Objets</th>
						<th>News</th>
						<th>Actions</th>
					</tr>

					<tr v-for="hunt in editions" :key="hunt.id">
						<td>
							<strong>
								{{ hunt.slug }}
							</strong>
						</td>

						<td>
							<span :class="['status', `status-${hunt.status.toLowerCase()}`]">
								{{ hunt.status }}
							</span>
						</td>

						<td>
							{{ formatDate(hunt.startAt) }}
						</td>

						<td>
							{{ formatDate(hunt.endAt) }}
						</td>

						<td>
							{{ hunt.participants }}
						</td>

						<td>
							{{ hunt.points }}
						</td>

						<td>
							{{ hunt.objects }}
						</td>

						<td>
							Début :
							{{ hunt.startNewsPublished ? '✅' : '❌' }}
							<br />

							Fin :
							{{ hunt.endNewsPublished ? '✅' : '❌' }}
						</td>

						<td>
							<div class="row-actions">
								<DZButton small @click="openRanking(hunt.id)"> Classement </DZButton>

								<DZButton
									v-if="hunt.status === MonsterHuntStatus.SCHEDULED"
									small
									:disabled="actionId === hunt.id"
									@click="startNow(hunt)"
								>
									Démarrer
								</DZButton>

								<DZButton
									v-if="hunt.status === MonsterHuntStatus.ACTIVE"
									small
									:disabled="actionId === hunt.id"
									@click="publishStartNews(hunt)"
								>
									News début
								</DZButton>

								<DZButton
									v-if="hunt.status === MonsterHuntStatus.ACTIVE"
									small
									:disabled="actionId === hunt.id"
									@click="endNow(hunt)"
								>
									Terminer
								</DZButton>

								<DZButton
									v-if="hunt.status === MonsterHuntStatus.ENDED"
									small
									:disabled="actionId === hunt.id"
									@click="distributeRewards(hunt)"
								>
									Récompenses
								</DZButton>

								<DZButton
									v-if="hunt.status === MonsterHuntStatus.REWARDED"
									small
									:disabled="actionId === hunt.id"
									@click="publishEndNews(hunt)"
								>
									News fin
								</DZButton>

								<DZButton
									v-if="hunt.status === MonsterHuntStatus.SCHEDULED || hunt.status === MonsterHuntStatus.DRAFT"
									small
									:disabled="actionId === hunt.id"
									@click="deleteEdition(hunt)"
								>
									Supprimer
								</DZButton>
							</div>
						</td>
					</tr>

					<tr v-if="editions.length === 0">
						<td colspan="9">Aucune édition.</td>
					</tr>
				</DZTable>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import type { AdminMonsterHuntEdition } from '@dinorpg/core/models/admin/adminMonsterHunt.js';

import { MonsterHuntPresetKey, MonsterHuntStatus } from '@dinorpg/core/models/monsterHunt/monsterHunt.js';

import { computed, onMounted, reactive, ref } from 'vue';

import { useRouter } from 'vue-router';

import DZButton from '../../components/utils/DZButton.vue';
import DZInput from '../../components/utils/DZInput.vue';
import DZSelect from '../../components/utils/DZSelect.vue';
import DZTable from '../../components/utils/DZTable.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';

import { AdminMonsterHuntService } from '../../services/adminMonsterHunt.service';

const router = useRouter();

const editions = ref<AdminMonsterHuntEdition[]>([]);

const presets = ref<
	Array<{
		key: MonsterHuntPresetKey;
		slug: string;
		nameKey: string;
	}>
>([]);

const loading = ref(false);
const creating = ref(false);
const lifecycleRunning = ref(false);
const actionId = ref('');

const message = ref('');
const messageType = ref<'success' | 'error'>('success');

const form = reactive({
	presetKey: MonsterHuntPresetKey.DARK_WORLD_INVASION,

	startAt: '',
	endAt: ''
});

const presetOptions = computed(() =>
	presets.value.map(preset => ({
		value: preset.key,
		label: preset.slug
	}))
);

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

	try {
		const result = await AdminMonsterHuntService.getOverview();

		presets.value = result.presets;
		editions.value = result.editions;
	} catch (error) {
		showError(error);
	} finally {
		loading.value = false;
	}
}

function toIso(value: string): string {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		throw new Error('Date invalide.');
	}

	return date.toISOString();
}

async function createEdition() {
	if (!form.startAt || !form.endAt) {
		showError(new Error('Les dates de début et de fin sont obligatoires.'));
		return;
	}

	creating.value = true;

	try {
		const result = await AdminMonsterHuntService.create({
			presetKey: form.presetKey,

			startAt: toIso(form.startAt),

			endAt: toIso(form.endAt)
		});

		showSuccess(result.message);

		form.startAt = '';
		form.endAt = '';

		await load();
	} catch (error) {
		showError(error);
	} finally {
		creating.value = false;
	}
}

async function startNow(hunt: AdminMonsterHuntEdition) {
	if (!confirm(`Démarrer "${hunt.slug}" maintenant ?`)) {
		return;
	}

	await performAction(hunt.id, () => AdminMonsterHuntService.startNow(hunt.id));
}

async function endNow(hunt: AdminMonsterHuntEdition) {
	if (!confirm(`Terminer "${hunt.slug}" maintenant ? Les récompenses finales seront distribuées par le lifecycle.`)) {
		return;
	}

	await performAction(hunt.id, () => AdminMonsterHuntService.endNow(hunt.id));
}

async function publishStartNews(hunt: AdminMonsterHuntEdition) {
	await performAction(hunt.id, () => AdminMonsterHuntService.publishStartNews(hunt.id));
}

async function publishEndNews(hunt: AdminMonsterHuntEdition) {
	await performAction(hunt.id, () => AdminMonsterHuntService.publishEndNews(hunt.id));
}

async function distributeRewards(hunt: AdminMonsterHuntEdition) {
	if (!confirm('Distribuer les récompenses finales de cette édition ?')) {
		return;
	}

	await performAction(hunt.id, () => AdminMonsterHuntService.distributeRewards(hunt.id));
}

async function deleteEdition(hunt: AdminMonsterHuntEdition) {
	if (!confirm(`Supprimer définitivement "${hunt.slug}" ?`)) {
		return;
	}

	await performAction(hunt.id, () => AdminMonsterHuntService.delete(hunt.id));
}

async function performAction(
	id: string,
	action: () => Promise<{
		message: string;
	}>
) {
	actionId.value = id;

	try {
		const result = await action();

		showSuccess(result.message);

		await load();
	} catch (error) {
		showError(error);
	} finally {
		actionId.value = '';
	}
}

async function runLifecycle() {
	lifecycleRunning.value = true;

	try {
		const result = await AdminMonsterHuntService.runLifecycle();

		showSuccess(result.message);

		await load();
	} catch (error) {
		showError(error);
	} finally {
		lifecycleRunning.value = false;
	}
}

function openRanking(huntId: string) {
	void router.push({
		name: 'RankingMonsterHunt',

		params: {
			pageLoaded: 1
		},

		query: {
			huntId
		}
	});
}

function formatDate(value: string): string {
	return new Date(value).toLocaleString();
}

onMounted(load);
</script>

<style scoped lang="scss">
.admin-monster-hunt {
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

.form-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 5px;

	label {
		color: #8e3e26;
		font-weight: bold;
	}
}

.actions {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 16px;
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

.row-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
}

.status {
	font-weight: bold;
}

.status-scheduled {
	color: #765c00;
}

.status-active {
	color: #167016;
}

.status-ended {
	color: #8e3e26;
}

.status-rewarded {
	color: #4b3f90;
}

table {
	font-size: 9pt;
}

@media (max-width: 900px) {
	.form-grid {
		grid-template-columns: 1fr;
	}
}
</style>
