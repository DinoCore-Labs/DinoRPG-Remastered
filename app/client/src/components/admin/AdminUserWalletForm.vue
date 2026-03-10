<template>
	<div class="card">
		<h3>Wallets</h3>

		<ul class="wallet-list">
			<li v-for="wallet in user.wallets" :key="wallet.type">
				<strong>{{ wallet.type }}</strong> : {{ wallet.amount }}
			</li>
		</ul>

		<form @submit.prevent="submit">
			<div class="field">
				<label for="walletType">Type</label>
				<input id="walletType" v-model="form.type" type="text" />
			</div>

			<div class="field">
				<label for="walletAmount">Montant</label>
				<input id="walletAmount" v-model.number="form.amount" type="number" min="1" />
			</div>

			<div class="field">
				<label>Opération</label>
				<select v-model="form.operation">
					<option value="add">Ajouter</option>
					<option value="remove">Retirer</option>
				</select>
			</div>

			<button type="submit" :disabled="submitting">
				{{ submitting ? 'Enregistrement...' : 'Modifier le wallet' }}
			</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
// import { AdminService } from '@/services';

const props = defineProps<{
	user: AdminUserDetails;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const submitting = ref(false);

const form = reactive({
	type: 'GOLD',
	amount: 1,
	operation: 'add' as 'add' | 'remove'
});

async function submit() {
	submitting.value = true;

	try {
		// await AdminService.updateUserWallet(props.player.id, {
		// 	type: form.type,
		// 	amount: form.amount,
		// 	operation: form.operation
		// });

		emit('updated');
	} finally {
		submitting.value = false;
	}
}
</script>

<style scoped lang="scss">
.card {
	padding: 16px;
	background: #ecbd84;
	border: 1px solid #bc683c;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.wallet-list {
	margin: 0;
	padding-left: 18px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
</style>
