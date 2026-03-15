<template>
	<div class="card">
		<div class="card-container">
			<div class="card-container">
				<h3>État</h3>
				<div class="field">
					<label for="state">State :</label>
					<DZSelect id="state" v-model="selectedState" :options="stateOptions" />
				</div>
				<div class="field">
					<label for="stateTimer">State timer :</label>
					<input id="stateTimer" v-model="form.stateTimer" type="datetime-local" />
				</div>
				<DZButton type="button" @click="submit">Sauvegarder</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { UpdateAdminDinozStatePayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';
import { type DinozState, DINOZ_STATE } from '@dinorpg/core/models/dinoz/dinozState.js';

import { AdminDinozService } from '../../../services/adminDinoz.service';
import DZButton from '../../utils/DZButton.vue';
import DZSelect from '../../utils/DZSelect.vue';
import type { SelectOption } from '../../utils/DZSelect.vue';

const props = defineProps<{
	userId: string;
	dinoz: AdminDinozDetails;
}>();

const emit = defineEmits<{
	updated: [];
}>();

const NO_STATE = '';

const form = reactive<UpdateAdminDinozStatePayload>({
	state: null,
	stateTimer: null
});

const selectedState = ref<DinozState | ''>(NO_STATE);

const stateOptions = computed<SelectOption<DinozState | ''>[]>(() => [
	{ value: NO_STATE, label: 'Aucun' },
	...Object.values(DINOZ_STATE).map(state => ({
		value: state,
		label: state
	}))
]);

watch(
	() => props.dinoz,
	value => {
		form.state = value.state;
		form.stateTimer = value.stateTimer ? value.stateTimer.slice(0, 16) : null;
		selectedState.value = value.state ?? NO_STATE;
	},
	{ immediate: true }
);

async function submit() {
	await AdminDinozService.updateDinozState(props.userId, props.dinoz.id, {
		state: selectedState.value === NO_STATE ? null : selectedState.value,
		stateTimer: form.stateTimer ? new Date(form.stateTimer).toISOString() : null
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
label {
	color: #8e3e26;
}
input {
	box-sizing: border-box;
	min-width: 80px;
	height: 22px;
	padding: 2px 8px 0 8px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	background:
		url('../../../assets/design/input/form_field_right.webp') right top / auto 100% no-repeat,
		url('../../../assets/design/input/form_field_left.webp') left top / auto 100% no-repeat,
		url('../../../assets/design/input/form_field_middle.webp') left top / auto 100% repeat-x;
	background-color: transparent;
	&:focus {
		outline: none;
		background:
			url('../../../assets/design/input/form_field_right_hover.webp') right top / auto 100% no-repeat,
			url('../../../assets/design/input/form_field_left_hover.webp') left top / auto 100% no-repeat,
			url('../../../assets/design/input/form_field_middle_hover.webp') left top / auto 100% repeat-x;
	}
	&::placeholder {
		color: #ffee92;
		opacity: 0.7;
	}
}
</style>
