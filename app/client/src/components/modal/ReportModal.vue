<template>
	<div class="report-modal modal-overlay" v-if="show" @click.self="close">
		<div class="card">
			<div class="card-container">
				<div class="modal-header">
					<h3>{{ $t('reportModal.title') }}</h3>
					<button class="close-btn" @click="close">X</button>
				</div>
				<div class="modal-body">
					<p v-if="reportedUserName">
						{{ $t('reportModal.reportingUser') }}<strong>{{ reportedUserName }}</strong>
					</p>
					<p v-else-if="reportedDinozName">
						{{ $t('reportModal.reportingDinoz') }}<strong>{{ reportedDinozName }}</strong>
					</p>
					<p v-else-if="reportedClanName">
						{{ $t('reportModal.reportingClan') }}<strong>{{ reportedClanName }}</strong>
					</p>

					<div class="field">
						<label>{{ $t('reportModal.reason') }}</label>
						<div class="radio-group">
							<label v-for="reason in availableReasons" :key="reason.value" class="radio-label">
								<input type="radio" v-model="form.reason" :value="reason.value" />
								<span>{{ $t('reportModal.reasons.' + reason.key) }}</span>
							</label>
						</div>
					</div>
					<div class="field">
						<label>{{ $t('reportModal.comment') }}</label>
						<textarea v-model="form.comment" class="input-theme" rows="4"></textarea>
					</div>
				</div>
				<div class="modal-footer">
					<DZButton size="small" @click="close">{{ $t('reportModal.cancel') }}</DZButton>
					<DZButton
						size="small"
						:disabled="loading || !form.reason || (form.reason === 'Autre' && !form.comment.trim())"
						@click="submit"
						>{{ $t('reportModal.send') }}</DZButton
					>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import DZButton from '../../components/utils/DZButton.vue';
import { ReportService } from '../../services/report.service';
import { useI18n } from 'vue-i18n';
import type { ToastPluginApi } from 'vue-toast-notification';

const { t } = useI18n();
const instance = getCurrentInstance();
const toast = instance?.appContext.config.globalProperties.$toast as ToastPluginApi;

const props = defineProps<{
	show: boolean;
	reportedUserId?: string;
	reportedUserName?: string;
	reportedDinozId?: number;
	reportedDinozName?: string;
	reportedClanId?: number;
	reportedClanName?: string;
}>();

const emit = defineEmits<{
	(e: 'close'): void;
	(e: 'sent'): void;
}>();

const form = ref({
	reason: '',
	comment: ''
});
const loading = ref(false);

const availableReasons = computed(() => {
	if (props.reportedUserId) {
		return [
			{ value: 'Multicomptes', key: 'multiAccounts' },
			{ value: 'Pseudo', key: 'pseudo' },
			{ value: 'Description', key: 'description' },
			{ value: 'Avatar', key: 'avatar' },
			{ value: 'Comportement', key: 'behavior' },
			{ value: 'Autre', key: 'other' }
		];
	} else if (props.reportedDinozId) {
		return [
			{ value: 'Nom inapproprié', key: 'inappropriateName' },
			{ value: 'Autre', key: 'other' }
		];
	} else if (props.reportedClanId) {
		return [
			{ value: 'Nom de clan', key: 'clanName' },
			{ value: 'Bannière', key: 'banner' },
			{ value: 'Description / Pages', key: 'clanPages' },
			{ value: 'Comportement', key: 'behavior' },
			{ value: 'Autre', key: 'other' }
		];
	}
	return [{ value: 'Autre', key: 'other' }];
});

function close() {
	emit('close');
}

async function submit() {
	if (!form.value.reason) return;
	loading.value = true;
	try {
		await ReportService.createReport({
			reason: form.value.reason,
			comment: form.value.comment || undefined,
			reportedUserId: props.reportedUserId,
			reportedDinozId: props.reportedDinozId,
			reportedClanId: props.reportedClanId
		});
		toast.success(t('reportModal.success'));
		form.value = { reason: '', comment: '' };
		emit('sent');
		close();
	} catch (e) {
		console.error(e);
		toast.error(t('reportModal.error'));
	} finally {
		loading.value = false;
	}
}
</script>

<style scoped lang="scss">
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}
.card {
	width: 400px;
	max-width: 90%;
	background-color: #5c2b20;
	border: 1px solid #b37c4a;
	outline: 2px solid #000;
	padding: 0;
	&-container {
		border: none;
		padding: 0;
	}
}
.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.25);
	padding: 10px 15px;
	margin-bottom: 15px;
	h3 {
		margin: 0;
		color: wheat;
		font-size: 18px;
	}
	.close-btn {
		background: none;
		border: none;
		font-weight: bold;
		cursor: pointer;
		color: wheat;
		font-size: 16px;
	}
}
.modal-body {
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 0 15px;
	color: wheat;
	.field {
		display: flex;
		flex-direction: column;
		gap: 5px;
		.input-theme {
			padding: 8px;
			background-color: #9a4029;
			border: 1px solid #fbdfba;
			color: #fce3bb;
			border-radius: 4px;
			resize: none;
			box-sizing: border-box;
			width: 100%;
		}
	}
}
.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding: 15px;
}
.radio-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 5px;
}
.radio-label {
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	font-weight: bold;
	color: wheat;

	input[type='radio'] {
		accent-color: #fbdfba;
		width: 16px;
		height: 16px;
		cursor: pointer;
	}
}
</style>
