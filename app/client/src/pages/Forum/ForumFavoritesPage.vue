<template>
	<div class="forum-page">
		<div class="forum-frame">
			<ForumHeader title="Mes favoris" back-to="/forum" back-label="Accueil des forums" />
			<p v-if="error" class="forum-error">
				{{ error }}
			</p>
			<ForumTopicTable :topics="result?.topics ?? []" />
			<ForumPagination v-if="result" :page="result.page" :page-count="result.pageCount" @change="changePage" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ForumTopicListResponse } from '@dinorpg/core/models/forum/forum.js';

import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ForumHeader from '../../components/forum/ForumHeader.vue';
import ForumPagination from '../../components/forum/ForumPagination.vue';
import ForumTopicTable from '../../components/forum/ForumTopicTable.vue';
import { ForumService } from '../../services/index.ts';

const route = useRoute();
const router = useRouter();

const result = ref<ForumTopicListResponse | null>(null);
const error = ref('');

function currentPage(): number {
	const value = Number(route.query.page ?? 1);

	return Number.isInteger(value) && value > 0 ? value : 1;
}

async function load(): Promise<void> {
	error.value = '';

	try {
		result.value = await ForumService.listFavorites(currentPage());
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de charger vos favoris.';
	}
}

async function changePage(page: number): Promise<void> {
	await router.push({
		query: {
			...route.query,
			page: String(page)
		}
	});
}

watch(
	() => route.query.page,
	() => void load(),
	{
		immediate: true
	}
);
</script>

<style lang="scss">
@use '../../style/forum';
</style>
