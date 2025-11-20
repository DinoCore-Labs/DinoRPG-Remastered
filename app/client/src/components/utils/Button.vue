<template>
	<a :href="props.disabled ? undefined : props.href" class="button" :class="{ 'button--disabled': props.disabled }">
		<slot />
	</a>
</template>

<script setup lang="ts">
interface Props {
	href: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false
});
</script>
