<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/common/DZRadio.vue

  Copyright in the original contributions remains with the respective
  authors and contributors.

  Modified by DinoRPG Remastered contributors from 2026-02-09 through 2026-03-13.
  See NOTICE.md and the Git history for provenance and modification details.

  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="dz-radio" :class="{ disabled }">
		<input
			:type="'radio'"
			:id="id"
			:name="id"
			:disabled="disabled"
			:value="valueString"
			:checked="isChecked"
			@change="onChange"
		/>
		<span class="icon" :class="{ checked: isChecked }" @click="onIconClick" />
		<label class="text" :for="id">
			<slot>{{ label }}</slot>
		</label>
	</div>
</template>

<script setup lang="ts" generic="T extends string | number | boolean">
import { computed } from 'vue';

const props = defineProps<{
	modelValue?: T;
	value: T;
	label?: string;
	disabled?: boolean;
	id: string;
	name?: string;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: T];
	change: [value: T];
}>();

const isChecked = computed(() => props.modelValue === props.value);
const valueString = computed(() => String(props.value));

const selectValue = () => {
	if (props.disabled) return;
	emit('update:modelValue', props.value);
	emit('change', props.value);
};

const onChange = () => {
	// Native radio fires change only when it becomes checked
	selectValue();
};

const onIconClick = (e: MouseEvent) => {
	// Delegate to input for consistency
	e.preventDefault();
	if (!isChecked.value) selectValue();
};
</script>

<style scoped lang="scss">
.dz-radio {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	user-select: none;
	font-size: 9pt;
	font-weight: bold;
	color: #ffee92;
	input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}
	.icon {
		width: 9px;
		height: 9px;
		background: url('../../assets/button/radio.webp') center / contain no-repeat;
	}
	.icon.checked {
		background: url('../../assets/button/radio-selected.webp') center / contain no-repeat;
	}
	.text {
		cursor: pointer;
		line-height: 9px;
	}
	&:hover .icon {
		filter: brightness(1.1);
	}
	&.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	&.disabled .icon,
	&.disabled .text {
		filter: grayscale(0.5) brightness(0.8);
		cursor: not-allowed;
	}
}
</style>
