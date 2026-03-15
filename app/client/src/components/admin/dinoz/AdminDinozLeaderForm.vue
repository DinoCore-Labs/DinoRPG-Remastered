<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Leader</h3>
				<div class="field">
					<label for="leaderSelect">Leader :</label>
					<DZSelect id="leaderSelect" v-model="selectedLeaderId" :options="leaderOptions" />
				</div>
				<DZButton type="button" @click="submit">Sauvegarder</DZButton>
			</div>
			<div class="card-container followers">
				<h4>Followers</h4>
				<div v-if="dinoz.followers.length > 0" class="followers-list">
					<div v-for="follower in dinoz.followers" :key="follower.id" class="follower">
						<span>{{ follower.name }} (#{{ follower.id }}) - niv. {{ follower.level }}</span>
					</div>
				</div>
				<p v-else>Aucun follower</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';

import DZButton from '../../utils/DZButton.vue';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';
import { AdminDinozService } from '../../../services/adminDinoz.service';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const NO_LEADER = 0;

const selectedLeaderId = ref<number>(NO_LEADER);

const leaderOptions = computed<SelectOption<number>[]>(() => [
	{ value: NO_LEADER, label: 'Aucun leader' },
	...props.dinoz.leaderOptions.map(option => ({
		value: option.id,
		label: `${option.name} (#${option.id}) - niv. ${option.level}`
	}))
]);

watch(
	() => props.dinoz.leaderId,
	value => {
		selectedLeaderId.value = value ?? NO_LEADER;
	},
	{ immediate: true }
);

async function submit() {
	await AdminDinozService.updateDinozLeader(props.userId, props.dinoz.id, {
		leaderId: selectedLeaderId.value === NO_LEADER ? null : selectedLeaderId.value
	});

	emit('updated');
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
.field {
	display: flex;
	gap: 5px;
}
.followers {
	margin-top: 5px;
}
label {
	color: #8e3e26;
}
</style>
