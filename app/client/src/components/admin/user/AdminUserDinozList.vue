<template>
	<div class="card">
		<div class="card-container">
			<h3>Dinoz</h3>
			<div v-if="dinozList.length === 0">Aucun dinoz.</div>
			<div v-else class="dinoz-actions">
				<div class="field">
					<label for="dinozSelect">Sélectionner un dinoz</label>
					<DZSelect id="dinozSelect" v-model="selectedDinozId" :options="dinozOptions" />
				</div>
				<DZButton type="button" :disabled="selectedDinozId === undefined" @click="editSelectedDinoz">Éditer</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import type { AdminDinozSummary } from '@dinorpg/core/models/admin/adminUser.js';

import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';
import DZButton from '../../utils/DZButton.vue';

const props = defineProps<{
	userId: string;
	dinozList: AdminDinozSummary[];
}>();

const router = useRouter();
const selectedDinozId = ref<number | undefined>(undefined);

const dinozOptions = computed<SelectOption<number>[]>(() =>
	props.dinozList.map(dinoz => ({
		value: dinoz.id,
		label: `${dinoz.name} (#${dinoz.id}) - niv. ${dinoz.level}`
	}))
);

watch(
	() => props.dinozList,
	list => {
		selectedDinozId.value = list.length > 0 ? list[0].id : undefined;
	},
	{ immediate: true }
);

function editSelectedDinoz() {
	if (selectedDinozId.value === undefined) return;
	router.push({
		path: '/admin/dinoz',
		query: {
			playerId: props.userId,
			dinozId: String(selectedDinozId.value)
		}
	});
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
.dinoz-actions {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
</style>
