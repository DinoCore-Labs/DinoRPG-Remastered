<template>
	<div class="modal-background">
		<div class="password-modal">
			<h3>{{ $t('modal.password.title') }}</h3>
			<div v-if="withOldPassword" class="field">
				<label for="oldPassword">{{ $t('modal.password.old') }}</label>
				<DZInput id="oldPassword" v-model="form.oldPassword" type="password" autocomplete="current-password" />
			</div>
			<div class="field">
				<label for="newPassword">{{ $t('modal.password.new') }}</label>
				<DZInput id="newPassword" v-model="form.newPassword" type="password" autocomplete="new-password" />
			</div>
			<div class="field">
				<label for="confirmPassword">{{ $t('modal.password.confirm') }}</label>
				<DZInput id="confirmPassword" v-model="form.confirmPassword" type="password" autocomplete="new-password" />
			</div>
			<p v-if="localError" class="password-error">{{ localError }}</p>
			<p v-else-if="error" class="password-error">{{ error }}</p>
			<div class="buttonLand">
				<DZButton class="bSmall" @click="submit">
					{{ loading ? $t('modal.modif') : $t('modal.valid') }}
				</DZButton>
				<DZButton class="bSmall" back @click="$emit('close')">{{ $t('modal.close') }}</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DZInput from '../utils/DZInput.vue';
import DZButton from '../utils/DZButton.vue';

const { t } = useI18n();

const props = withDefaults(
	defineProps<{
		loading?: boolean;
		error?: string | null;
		withOldPassword?: boolean;
	}>(),
	{
		loading: false,
		error: null,
		withOldPassword: true
	}
);

const emit = defineEmits<{
	close: [];
	submit: [
		payload: {
			oldPassword?: string;
			newPassword: string;
			confirmPassword: string;
		}
	];
}>();

const localError = ref<string | null>(null);

const form = reactive({
	oldPassword: '',
	newPassword: '',
	confirmPassword: ''
});

function submit() {
	localError.value = null;
	if (props.withOldPassword && !form.oldPassword) {
		localError.value = t('password.errors.oldPasswordRequired');
		return;
	}
	if (!form.newPassword || !form.confirmPassword) {
		localError.value = t('password.errors.fieldsRequired');
		return;
	}
	if (form.newPassword !== form.confirmPassword) {
		localError.value = t('password.errors.passwordMismatch');
		return;
	}
	emit('submit', {
		oldPassword: props.withOldPassword ? form.oldPassword : undefined,
		newPassword: form.newPassword,
		confirmPassword: form.confirmPassword
	});
}
</script>

<style scoped lang="scss">
@use 'sass:color';
.modal-background {
	position: absolute;
	background: color.adjust(#09092d, $alpha: -0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}
.password-modal {
	width: min(420px, calc(100% - 32px));
	background-color: #ecbd84;
	border: 2px solid #bc683c;
	padding: 20px;
	color: #7b3f22;
	h3 {
		margin-top: 0;
		color: #9a4029;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 12px;
	}
	input {
		border: none;
		background-color: #ae6139;
		color: #ffee92;
		padding: 6px;
	}
	input:focus {
		background-color: #9a4029;
		outline: none;
	}
}
.password-error {
	color: #8f1d12;
	font-weight: bold;
}
</style>
