<template>
	<div class="card">
		<h3>Dinoz</h3>

		<div v-if="dinozList.length === 0">Aucun dinoz.</div>

		<ul v-else class="dinoz-list">
			<li v-for="dinoz in dinozList" :key="dinoz.id">
				<span>{{ dinoz.name }} (#{{ dinoz.id }}) - niv. {{ dinoz.level }}</span>
				<button type="button" @click="editDinoz(dinoz.id)">Éditer</button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { AdminDinozSummary } from '@dinorpg/core/models/admin/adminUser.js';

const props = defineProps<{
	userId: string;
	dinozList: AdminDinozSummary[];
}>();

const router = useRouter();

function editDinoz(dinozId: number) {
	router.push({
		path: '/admin/dinoz',
		query: {
			playerId: props.userId,
			dinozId: String(dinozId)
		}
	});
}
</script>

<style scoped lang="scss">
.card {
	padding: 16px;
	background: #ecbd84;
	border: 1px solid #bc683c;
}

.dinoz-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-left: 18px;
}
</style>
