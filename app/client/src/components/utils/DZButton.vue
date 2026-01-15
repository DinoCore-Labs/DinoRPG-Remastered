<template>
	<a
		class="button"
		:class="{
			'button--disabled': props.disabled,
			[`button--${props.size}`]: true,
			back: props.back,
			off: props.off
		}"
	>
		<img
			v-if="props.back && props.size === 'normal'"
			:src="getImgURL('button', 'button-back-arrow')"
			alt="button-back"
		/>
		<span class="content">
			<slot />
		</span>
	</a>
</template>

<script setup lang="ts">
type ButtonSize = 'normal' | 'small' | 'big';

const props = withDefaults(
	defineProps<{
		disabled?: boolean;
		size?: ButtonSize;
		back?: boolean;
		off?: boolean;
	}>(),
	{
		disabled: false,
		size: 'normal',
		back: false,
		off: false
	}
);
</script>
