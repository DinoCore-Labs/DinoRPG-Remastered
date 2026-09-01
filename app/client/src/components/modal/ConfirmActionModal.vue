<template>
	<div class="modal-background">
		<div class="password-modal">
			<h3>{{ title }}</h3>
			<p class="description">{{ description }}</p>

			<div class="field">
				<label for="passwordInput">{{ labelText }}</label>
				<DZInput
					id="passwordInput"
					v-model="form.password"
					type="password"
					:placeholder="$t('modal.confirmAction.passwordPlaceholder')"
					autocomplete="off"
				/>
			</div>

			<p v-if="localError" class="password-error">{{ localError }}</p>
			<p v-else-if="error" class="password-error">{{ error }}</p>

			<div class="buttonLand">
				<DZButton class="bSmall no-first-letter" @click="submit">
					{{ loading ? $t('common.loading') : $t('modal.confirmAction.confirm') }}
				</DZButton>
				<DZButton class="bSmall no-first-letter" back @click="$emit('close')">{{ $t('button.cancel') }}</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import DZInput from '../utils/DZInput.vue';
import DZButton from '../utils/DZButton.vue';

const { t } = useI18n();

const props = withDefaults(
	defineProps<{
		title: string;
		description: string;
		label?: string;
		loading?: boolean;
		error?: string | null;
		actionType?: 'reset' | 'delete';
	}>(),
	{
		label: '',
		loading: false,
		error: null,
		actionType: 'delete'
	}
);

const labelText = computed(() => props.label || t('modal.confirmAction.label'));

const emit = defineEmits<{
	close: [];
	submit: [
		payload: {
			password: string;
		}
	];
}>();

const localError = ref<string | null>(null);

const form = reactive({
	password: ''
});

function submit() {
	localError.value = null;

	if (!form.password) {
		localError.value = t('modal.confirmAction.passwordRequired');
		return;
	}

	emit('submit', { password: form.password });
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
	:deep(input) {
		border: none;
		background-color: #ae6139;
		color: #ffee92;
		padding: 6px;
	}
	:deep(input:focus) {
		background-color: #9a4029;
		outline: none;
	}
}
.description {
	margin-bottom: 20px;
	font-size: 14px;
	color: #7b3f22;
}
.password-error {
	color: #8f1d12;
	font-weight: bold;
}
.buttonLand {
	display: flex;
	justify-content: space-around;
	margin-top: 15px;
}
.no-first-letter {
	&::first-letter {
		color: inherit !important;
	}
	:deep(span::first-letter) {
		color: inherit !important;
	}
}
</style>
