<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>Wallets</h3>
				<ul class="wallet-list">
					<li v-for="wallet in user.wallets" :key="wallet.type">
						<strong>{{ wallet.type }}</strong> : {{ wallet.amount }}
					</li>
				</ul>
				<form @submit.prevent="submit">
					<div class="field">
						<label for="walletType">Type</label>
						<DZSelect id="walletType" v-model="form.type" :options="walletOptions" />
					</div>
					<div class="field">
						<label for="walletAmount">Montant</label>
						<DZInput id="walletAmount" v-model.number="form.amount" type="number" min="1" />
					</div>
					<div class="field">
						<label>Opération</label>
						<div class="radio-group">
							<DZRadio
								id="walletOperationAdd"
								name="walletOperation"
								v-model="form.operation"
								value="add"
								label="Ajouter"
							/>
							<DZRadio
								id="walletOperationRemove"
								name="walletOperation"
								v-model="form.operation"
								value="remove"
								label="Retirer"
							/>
						</div>
					</div>
					<DZButton @click="submit" :disabled="submitting">
						{{ submitting ? 'Enregistrement...' : 'Modifier le wallet' }}
					</DZButton>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import { AdminUserService } from '../../../services/adminUsers.service';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';
import DZRadio from '../../utils/DZRadio.vue';
import DZButton from '../../utils/DZButton.vue';
import {
	MoneyTypes,
	type UpdateAdminUserWalletPayload,
	type MoneyType
} from '@dinorpg/core/models/admin/adminUserPayloads.js';
import DZInput from '../../utils/DZInput.vue';

const props = defineProps<{
	user: AdminUserDetails;
}>();

const emit = defineEmits<{
	(e: 'updated'): void;
}>();

const submitting = ref(false);
const walletOptions = computed<SelectOption<MoneyType>[]>(() =>
	MoneyTypes.map(role => ({
		value: role,
		label: role
	}))
);
const form = reactive<UpdateAdminUserWalletPayload>({
	type: 'GOLD',
	amount: 1,
	operation: 'add' as 'add' | 'remove'
});

async function submit() {
	submitting.value = true;

	try {
		await AdminUserService.updateUserWallet(props.user.id, {
			type: form.type,
			amount: form.amount,
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
