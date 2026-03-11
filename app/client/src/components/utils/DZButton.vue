<template>
	<component
		:is="tag"
		class="button"
		:class="{
			'button--disabled': disabled,
			[`button--${size}`]: true,
			back,
			off
		}"
		:href="href"
		:to="to"
		:type="tag === 'button' ? type : undefined"
		:disabled="tag === 'button' ? disabled : undefined"
		@click="onClick"
	>
		<img v-if="back && size === 'normal'" :src="getImgURL('button', 'button-back-arrow')" alt="button-back" />

		<span class="content">
			<slot />
		</span>
	</component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type ButtonSize = 'normal' | 'small' | 'big';

const props = withDefaults(
	defineProps<{
		disabled?: boolean;
		size?: ButtonSize;
		back?: boolean;
		off?: boolean;

		href?: string;
		to?: string;

		type?: 'button' | 'submit';
	}>(),
	{
		disabled: false,
		size: 'normal',
		back: false,
		off: false,
		type: 'button'
	}
);

const emit = defineEmits<{
	click: [MouseEvent];
}>();

const tag = computed(() => {
	if (props.to) return 'RouterLink';
	if (props.href) return 'a';
	return 'button';
});

function onClick(e: MouseEvent) {
	if (props.disabled) {
		e.preventDefault();
		return;
	}

	emit('click', e);
}
</script>
