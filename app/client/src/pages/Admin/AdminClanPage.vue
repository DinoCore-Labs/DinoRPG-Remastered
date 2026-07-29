<template>
	<div class="admin-clan-page">
		<TitleHeader v-if="clan" title="Admin" header="Clan:" :sub-header="clan.name ?? String(clan.id)" />
		<TitleHeader v-else title="Admin" header="Modération de Clan" />

		<AdminClanSearch
			:model-value="selectedClanId"
			@update:model-value="selectedClanId = $event"
			@select="handleSelectClan"
		/>

		<p v-if="loading">Chargement...</p>
		<p v-else-if="error" class="red">{{ error }}</p>

		<div v-else-if="clan" class="clan-details">
			<div class="actions-header">
				<DZButton size="small" @click="deleteClan">Supprimer le Clan</DZButton>
			</div>

			<div class="card">
				<div class="card-container">
					<h3>Informations Générales</h3>
					<div class="field-group">
						<label>Nom du Clan:</label>
						<input type="text" v-model="editName" />
						<DZButton size="small" @click="saveName">Sauvegarder Nom</DZButton>
					</div>
					<div class="field-group">
						<label>Leader Actuel:</label>
						<select v-model="editLeaderId">
							<option v-for="member in clan.members" :key="member.userId" :value="member.userId">
								{{ member.user.name }}
							</option>
						</select>
						<DZButton size="small" @click="saveLeader">Changer de Leader</DZButton>
					</div>
				</div>
			</div>

			<div class="card">
				<div class="card-container">
					<h3>Trésorerie</h3>
					<div class="field-group">
						<label>Or Total:</label>
						<input type="number" v-model="editTreasure" />
						<DZButton size="small" @click="saveTreasure">Sauvegarder Or</DZButton>
					</div>

					<h4>Ingrédients du Clan</h4>
					<ul>
						<li v-for="ing in clan.ingredients" :key="ing.ingredientId">
							Ingredient ID: {{ ing.ingredientId }} ({{ getIngredientName(ing.ingredientId) }}) - Quantité:
							{{ ing.quantity }}
						</li>
						<li v-if="clan.ingredients.length === 0">Aucun ingrédient.</li>
					</ul>

					<h4>Ajouter / Retirer un ingrédient</h4>
					<div class="field-group">
						<select v-model="selectedIngredientId">
							<option v-for="[id, fiche] in allIngredients" :key="id" :value="Number(id)">
								{{ fiche.name }} (Prix: {{ fiche.price || 0 }})
							</option>
						</select>
						<input type="number" v-model="ingredientAmount" placeholder="Quantité (+ ou -)" />
						<DZButton size="small" @click="updateIngredient">Appliquer</DZButton>
					</div>
				</div>
			</div>

			<div class="card">
				<div class="card-container">
					<h3>Membres ({{ clan.members.length }})</h3>
					<div class="table-responsive">
						<table class="members-table">
							<thead>
								<tr>
									<th>Nom</th>
									<th>ID Joueur</th>
									<th>Date d'arrivée</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="member in clan.members" :key="member.userId">
									<td>{{ member.user.name }} <span v-if="member.userId === clan.leaderId">(Leader)</span></td>
									<td>{{ member.userId }}</td>
									<td>{{ new Date(member.dateJoin).toLocaleDateString() }}</td>
									<td>
										<DZButton size="small" @click="kickMember(member.userId)">Expulser</DZButton>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import AdminClanSearch from '../../components/admin/clan/AdminClanSearch.vue';
import DZButton from '../../components/utils/DZButton.vue';
import { AdminClanService, type AdminClan } from '../../services/adminClan.service';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';

const route = useRoute();
const router = useRouter();

const instance = getCurrentInstance();

const selectedClanId = ref('');
const clan = ref<AdminClan | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const editName = ref('');
const editLeaderId = ref('');
const editTreasure = ref(0);

const allIngredients = Object.entries(ingredientList);
const selectedIngredientId = ref<number | ''>('');
const ingredientAmount = ref<number | ''>('');

async function handleSelectClan(clanId: string) {
	selectedClanId.value = clanId;
	await loadClan(clanId);
}

async function loadClan(id: number | string) {
	if (!id) return;
	loading.value = true;
	error.value = null;
	try {
		const data = await AdminClanService.getClan(Number(id));
		clan.value = data;
		editName.value = data.name;
		editLeaderId.value = data.leaderId;
		editTreasure.value = data.treasureValue;
		// Update URL safely
		router.replace({ query: { clanId: id } });
	} catch (e: any) {
		error.value = e.response?.data?.message || e.message;
		clan.value = null;
	} finally {
		loading.value = false;
	}
}

async function saveName() {
	if (!clan.value) return;
	try {
		await AdminClanService.updateName(clan.value.id, editName.value);
		await loadClan(clan.value.id);
		instance?.proxy?.$toast?.success('Nom sauvegardé');
	} catch (e: any) {
		instance?.proxy?.$toast?.error(e.response?.data?.message || 'Erreur');
	}
}

async function saveLeader() {
	if (!clan.value) return;
	try {
		await AdminClanService.updateLeader(clan.value.id, editLeaderId.value);
		await loadClan(clan.value.id);
		instance?.proxy?.$toast?.success('Leader changé avec succès');
	} catch (e: any) {
		instance?.proxy?.$toast?.error(e.response?.data?.message || 'Erreur');
	}
}

async function saveTreasure() {
	if (!clan.value) return;
	try {
		await AdminClanService.updateTreasure(clan.value.id, editTreasure.value);
		await loadClan(clan.value.id);
		instance?.proxy?.$toast?.success('Trésor mis à jour');
	} catch (e: any) {
		instance?.proxy?.$toast?.error(e.response?.data?.message || 'Erreur');
	}
}

async function updateIngredient() {
	if (!clan.value || selectedIngredientId.value === '' || ingredientAmount.value === '' || ingredientAmount.value === 0)
		return;
	try {
		await AdminClanService.updateIngredient(
			clan.value.id,
			Number(selectedIngredientId.value),
			Number(ingredientAmount.value)
		);
		await loadClan(clan.value.id);
		ingredientAmount.value = '';
		instance?.proxy?.$toast?.success('Ingrédients mis à jour');
	} catch (e: any) {
		instance?.proxy?.$toast?.error(e.response?.data?.message || 'Erreur');
	}
}

async function kickMember(userId: string) {
	if (!clan.value) return;
	const confirmed = await instance?.proxy?.$confirm({
		header: 'Confirmation',
		message: "Voulez-vous vraiment expulser ce membre ? S'il s'agit du dernier membre, le clan sera supprimé."
	});
	if (!confirmed) return;
	try {
		const res = await AdminClanService.kickMember(clan.value.id, userId);
		if (res.deleted) {
			instance?.proxy?.$toast?.info('Le clan a été supprimé car il était vide.');
			clan.value = null;
		} else {
			await loadClan(clan.value.id);
		}
	} catch (e: any) {
		instance?.proxy?.$toast?.error(e.response?.data?.message || 'Erreur');
	}
}

async function deleteClan() {
	if (!clan.value) return;
	const confirmed = await instance?.proxy?.$confirm({
		header: 'ATTENTION !',
		message: 'Voulez-vous VRAIMENT supprimer ce clan ? Cette action est irréversible.'
	});
	if (!confirmed) return;
	try {
		await AdminClanService.deleteClan(clan.value.id);
		instance?.proxy?.$toast?.success('Clan supprimé.');
		clan.value = null;
	} catch (e: any) {
		instance?.proxy?.$toast?.error(e.response?.data?.message || 'Erreur');
	}
}

function getIngredientName(id: number) {
	// @ts-ignore
	const fiche = ingredientList[id];
	return fiche ? fiche.name : 'Inconnu';
}

onMounted(() => {
	const clanId = route.query.clanId;
	if (clanId) {
		selectedClanId.value = String(clanId);
		loadClan(selectedClanId.value);
	}
});
</script>

<style scoped lang="scss">
.admin-clan-page {
	display: flex;
	flex-direction: column;
	gap: 15px;
}
.red {
	color: red;
}

.clan-details {
	display: flex;
	flex-direction: column;
	gap: 15px;
}
.actions-header {
	display: flex;
	justify-content: flex-end;
}
.card {
	width: 100%;
	box-sizing: border-box;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	padding: 5px;
	&-container {
		border: 2px solid #bc683c;
		padding: 20px;
		box-sizing: border-box;
		overflow-x: auto;
	}

	h3 {
		margin-top: 0;
		border-bottom: 1px solid #c9b49b;
		padding-bottom: 5px;
	}
	h4 {
		margin-top: 15px;
		margin-bottom: 5px;
	}
}
.field-group {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 10px;
	align-items: center;

	label {
		font-weight: bold;
		min-width: 120px;
	}
	input,
	select {
		padding: 5px;
		border: 1px solid #ccc;
	}
}
.small-info {
	font-size: 0.85em;
	color: #666;
	font-style: italic;
	margin-top: 0;
}
.table-responsive {
	overflow-x: auto;
	width: 100%;
	box-sizing: border-box;
}
.members-table {
	width: 100%;
	box-sizing: border-box;
	border-collapse: collapse;
	min-width: 400px;

	th,
	td {
		padding: 8px;
		border-bottom: 1px solid #ddd;
		text-align: left;
	}
	th {
		background: #eee;
	}
}
.btn-danger {
	background-color: #dc2626 !important;
}
</style>
