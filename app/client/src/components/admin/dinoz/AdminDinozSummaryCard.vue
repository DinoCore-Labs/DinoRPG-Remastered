<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<div class="summary">
					<div class="summary-dino">
						<DinozMini :display="dinoz.display" :width="80" :height="80" />
					</div>
					<div class="summary-info">
						<h3>
							<strong>{{ dinoz.name }}</strong> (#{{ dinoz.id }})
						</h3>
					</div>
				</div>
				<div class="summary-info">
					<p><strong>Utilisateur :</strong> {{ dinoz.userName ?? dinoz.userId }}</p>
					<p><strong>Niveau :</strong> {{ dinoz.level }}</p>
					<p><strong>PV :</strong> {{ dinoz.life }} / {{ dinoz.maxLife }}</p>
					<p><strong>Race :</strong> {{ dinoz.raceId }}</p>
					<p><strong>Place :</strong> {{ dinoz.placeId }}</p>
					<p><strong>État :</strong> {{ dinoz.state ?? 'Aucun' }}</p>
					<p><strong>Leader :</strong> {{ dinoz.leaderId ?? 'Aucun' }}</p>
					<p><strong>Fight :</strong> {{ dinoz.fight ? 'Oui' : 'Non' }}</p>
					<p><strong>Gather :</strong> {{ dinoz.gather ? 'Oui' : 'Non' }}</p>
					<p><strong>Créé le : </strong>{{ dinoz.createdDate }}</p>
					<p><strong>Mis à jour le :</strong> {{ dinoz.updatedDate }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';

import DinozMini from '../../dinoz/DinozMini.vue';

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
.summary {
	display: flex;
	align-items: center;
}
.summary-dino {
	display: flex;
	align-items: center;
	justify-content: center;
}
p {
	& strong {
		color: #8e3e26;
	}
}
</style>
