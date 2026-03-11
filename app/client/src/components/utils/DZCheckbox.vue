<template>
	<div class="dz-checkbox" :class="{ disabled }">
		<input type="checkbox" :id="id" :name="id" :disabled="disabled" :checked="isChecked" @change="onChange" />
		<span class="icon" :class="{ checked: isChecked }" @click="onIconClick" />
		<label class="text" :for="id">
			<slot>{{ label }}</slot>
		</label>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	modelValue?: boolean | string[];
	value?: string;
	label?: string;
	disabled?: boolean;
	id: string;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: boolean | string[]];
	change: [value: boolean | string[]];
}>();

const isChecked = computed(() => {
	if (Array.isArray(props.modelValue) && props.value !== undefined) {
		return props.modelValue.includes(props.value);
	}
	return props.modelValue === true;
});

const toggle = () => {
	if (props.disabled) return;

	if (Array.isArray(props.modelValue) && props.value !== undefined) {
		const newArray = [...props.modelValue];
		const index = newArray.indexOf(props.value);

		if (index > -1) {
			newArray.splice(index, 1);
		} else {
			newArray.push(props.value);
		}

		emit('update:modelValue', newArray);
		emit('change', newArray);
	} else {
		const newValue = !isChecked.value;
		emit('update:modelValue', newValue);
		emit('change', newValue);
	}
};

const onChange = () => {
	toggle();
};

const onIconClick = (e: MouseEvent) => {
	e.preventDefault();
	toggle();
};
</script>

<style scoped lang="scss">
.dz-checkbox {
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
		width: 16px;
		height: 16px;
		background: url('../../assets/button/checkbox.webp') center / contain no-repeat;
	}
	.icon.checked {
		background: url('../../assets/button/checkbox-checked.webp') center / contain no-repeat;
	}
	.text {
		cursor: pointer;
		line-height: 16px;
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
