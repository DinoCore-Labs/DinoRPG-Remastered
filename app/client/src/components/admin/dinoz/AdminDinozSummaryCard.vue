<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>{{ dinoz.name }} (#{{ dinoz.id }})</h3>
				<p>Utilisateur : {{ dinoz.userName ?? dinoz.userId }}</p>
				<p>Niveau : {{ dinoz.level }}</p>
				<p>PV : {{ dinoz.life }} / {{ dinoz.maxLife }}</p>
				<p>Race : {{ dinoz.raceId }}</p>
				<p>Place : {{ dinoz.placeId }}</p>
				<p>État : {{ dinoz.state ?? 'Aucun' }}</p>
				<p>Créé le : {{ dinoz.createdDate }}</p>
				<p>Mis à jour le : {{ dinoz.updatedDate }}</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';

defineProps<{
	dinoz: AdminDinozDetails;
}>();
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
</style>
