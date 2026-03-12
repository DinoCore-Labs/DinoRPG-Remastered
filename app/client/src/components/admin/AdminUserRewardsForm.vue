<template>
	<div class="card">
		<div class="card-container">
			<h3>Rewards</h3>
			<ul class="reward-list">
				<li v-for="reward in user.rewards" :key="reward.rewardId" class="reward-row">
					<div class="reward-info">
						<strong>{{ rewardName(reward.rewardId) }}</strong>
						<span>ID: {{ reward.rewardId }}</span>
					</div>
				</li>
			</ul>
			<form class="reward-form" @submit.prevent="submit">
				<div class="field">
					<label for="rewardSelect">Reward</label>
					<DZSelect id="rewardSelect" v-model="form.rewardId" :options="rewardOptions" />
				</div>
				<div class="field">
					<label>Opération</label>
					<div class="radio-group">
						<DZRadio id="rewardAdd" name="rewardOperation" v-model="form.operation" value="add" label="Ajouter" />
						<DZRadio id="rewardRemove" name="rewardOperation" v-model="form.operation" value="remove" label="Retirer" />
					</div>
				</div>
				<DZButton type="submit" :disabled="submitting">
					{{ submitting ? 'Enregistrement...' : 'Modifier' }}
				</DZButton>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import { AdminUserService } from '../../services/adminUsers.service';

import DZSelect from '../utils/DZSelect.vue';
import type { SelectOption } from '../utils/DZSelect.vue';
import DZRadio from '../utils/DZRadio.vue';
import DZButton from '../utils/DZButton.vue';

// À adapter selon où se trouve ta liste réelle
import { rewardList } from '@dinorpg/core/models/rewards/rewardList.js';

const props = defineProps<{
	user: AdminUserDetails;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const submitting = ref(false);

const form = reactive({
	rewardId: 0,
	operation: 'add' as 'add' | 'remove'
});

const rewardOptions = computed<SelectOption<number>[]>(() =>
	Object.entries(rewardList).map(([id, name]) => ({
		value: Number(id),
		label: String(name)
	}))
);

function rewardName(rewardId: number): string {
	return rewardList.imgName[rewardId] ?? `reward_${rewardId}`;
}

async function submit() {
	submitting.value = true;

	try {
		await AdminUserService.updateUserRewards(props.user.id, {
			rewardId: form.rewardId,
			operation: form.operation
		});

		emit('updated');
	} finally {
		submitting.value = false;
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
.reward-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin: 0 0 16px;
	padding: 0;
	list-style: none;
}
.reward-row {
	padding: 6px 8px;
	border: 1px solid #bc683c;
	background: #f3ca92;
}
.reward-info {
	display: flex;
	flex-direction: column;
	color: #710;
	span {
		font-size: 8pt;
		opacity: 0.8;
	}
}
.reward-form {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.radio-group {
	display: flex;
	align-items: center;
	gap: 12px;
}
</style>
