<template>
	<nav v-if="pageCount > 1" class="forum-pagination" aria-label="Pagination du forum">
		<button type="button" :disabled="page <= 1" aria-label="Première page" @click="$emit('change', 1)">«</button>
		<button type="button" :disabled="page <= 1" aria-label="Page précédente" @click="$emit('change', page - 1)">
			‹
		</button>
		<span> Page {{ page }} / {{ pageCount }} </span>

		<button type="button" :disabled="page >= pageCount" aria-label="Page suivante" @click="$emit('change', page + 1)">
			›
		</button>

		<button type="button" :disabled="page >= pageCount" aria-label="Dernière page" @click="$emit('change', pageCount)">
			»
		</button>
	</nav>
</template>

<script setup lang="ts">
defineProps<{
	page: number;
	pageCount: number;
}>();

defineEmits<{
	change: [page: number];
}>();
</script>
