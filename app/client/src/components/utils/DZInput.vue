<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/common/DZInput.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2026-01-20 through 2026-06-13.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<input :type="type" :value="modelValue ?? value" @input="onInput" v-bind="$attrs" />
</template>

<script setup lang="ts">
defineOptions({
	inheritAttrs: false
});

const props = defineProps<{
	type?: string;
	modelValue?: string | number | null;
	value?: string | number | null;
	placeholder?: string;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: string | number | null];
	input: [value: string | number | null];
	change: [value: string | number | null];
}>();

const getValue = (input: HTMLInputElement): string | number => {
	// For number inputs, use valueAsNumber if valid
	if (props.type === 'number') {
		const numVal = input.valueAsNumber;
		return !isNaN(numVal) ? numVal : input.value;
	}
	return input.value;
};

const onInput = (e: Event) => {
	const val = getValue(e.target as HTMLInputElement);
	emit('update:modelValue', val);
	emit('input', val);
};
</script>

<style lang="scss" scoped>
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
		url('../../assets/design/input/form_field_right.webp') right top / auto 100% no-repeat,
		url('../../assets/design/input/form_field_left.webp') left top / auto 100% no-repeat,
		url('../../assets/design/input/form_field_middle.webp') left top / auto 100% repeat-x;
	background-color: transparent;
	&:focus {
		outline: none;
		background:
			url('../../assets/design/input/form_field_right_hover.webp') right top / auto 100% no-repeat,
			url('../../assets/design/input/form_field_left_hover.webp') left top / auto 100% no-repeat,
			url('../../assets/design/input/form_field_middle_hover.webp') left top / auto 100% repeat-x;
	}
	&::placeholder {
		color: #ffee92;
		opacity: 0.7;
	}
}
</style>
