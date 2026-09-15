<template>
	<nav v-if="pageCount > 1" class="forum-pagination" :aria-label="$t('forum.pagination.ariaLabel')">
		<DZButton size="small" :disabled="page <= 1" @click="emit('change', 1)">«</DZButton>
		<DZButton size="small" :disabled="page <= 1" @click="emit('change', page - 1)">‹</DZButton>
		<span class="forum-pagination__label">
			{{ $t('forum.pagination.page', { page, pageCount }) }}
		</span>
		<DZButton size="small" :disabled="page >= pageCount" @click="emit('change', page + 1)">›</DZButton>
		<DZButton size="small" :disabled="page >= pageCount" @click="emit('change', pageCount)">»</DZButton>
	</nav>
</template>

<script setup lang="ts">
import DZButton from '../utils/DZButton.vue';

defineProps<{
	page: number;
	pageCount: number;
}>();

const emit = defineEmits<{
	change: [page: number];
}>();
</script>
