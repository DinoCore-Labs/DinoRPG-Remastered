<template>
	<div class="forum-page">
		<div class="forum-frame">
			<ForumHeader :title="$t('forum.search.title')" back-to="/forum" :back-label="$t('forum.backHome')" />
			<form class="forum-search-form" @submit.prevent="submitSearch">
				<img class="forum-search-icon" :src="getImgURL('icons', 'search')" alt="" />
				<label class="forum-visually-hidden" for="forum-search-input">
					{{ $t('forum.search.label') }}
				</label>
				<DZInput
					id="forum-search-input"
					v-model="search"
					class="forum-search-input"
					type="text"
					:maxlength="FORUM_SEARCH_MAX_LENGTH"
				/>
				<DZButton type="submit" :disabled="search.trim().length < FORUM_SEARCH_MIN_LENGTH">
					{{ $t('forum.search.button') }}
				</DZButton>
			</form>
			<p v-if="error" class="forum-error">
				{{ error }}
			</p>
			<template v-if="result">
				<div class="forum-toolbar">
					<strong class="forum-search-query">
						{{ $t('forum.search.results', { query: activeQuery }) }}
					</strong>
					<span class="forum-spacer"></span>
					<span class="forum-toolbar-count">
						{{ $t('forum.topicCount', { count: result.total }) }}
					</span>
				</div>
				<ForumTopicTable :topics="result.topics" />
				<ForumPagination :page="result.page" :page-count="result.pageCount" @change="changePage" />
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	FORUM_SEARCH_MAX_LENGTH,
	FORUM_SEARCH_MIN_LENGTH,
	type ForumTopicListResponse
} from '@dinorpg/core/models/forum/forum.js';

import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import ForumHeader from '../../components/forum/ForumHeader.vue';
import ForumPagination from '../../components/forum/ForumPagination.vue';
import ForumTopicTable from '../../components/forum/ForumTopicTable.vue';
import DZButton from '../../components/utils/DZButton.vue';
import DZInput from '../../components/utils/DZInput.vue';
import { ForumService } from '../../services/forum.services.ts';
import { getImgURL } from '../../utils/getImgURL';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const result = ref<ForumTopicListResponse | null>(null);

const search = ref('');
const error = ref('');

const activeQuery = computed(() => {
	const value = route.query.q;

	return typeof value === 'string' ? value.trim() : '';
});

function currentPage(): number {
	const value = Number(route.query.page ?? 1);
	return Number.isInteger(value) && value > 0 ? value : 1;
}

async function load(): Promise<void> {
	const query = activeQuery.value;
	search.value = query;
	error.value = '';
	if (query.length < FORUM_SEARCH_MIN_LENGTH) {
		result.value = null;
		return;
	}
	try {
		result.value = await ForumService.searchTopics(query, currentPage());
	} catch (err) {
		result.value = null;
		error.value = t('forum.errors.search');
	}
}

async function submitSearch(): Promise<void> {
	const query = search.value.trim();
	if (query.length < FORUM_SEARCH_MIN_LENGTH) {
		error.value = t('forum.errors.searchMin', {
			count: FORUM_SEARCH_MIN_LENGTH
		});
		return;
	}
	error.value = '';
	if (query === activeQuery.value && currentPage() === 1) {
		await load();
		return;
	}
	await router.push({
		name: 'ForumSearch',
		query: {
			q: query,
			page: '1'
		}
	});
}

async function changePage(page: number): Promise<void> {
	if (!activeQuery.value) {
		return;
	}
	await router.push({
		name: 'ForumSearch',
		query: {
			q: activeQuery.value,
			page: String(page)
		}
	});
}

watch(
	() => [route.query.q, route.query.page],
	() => void load(),
	{
		immediate: true
	}
);
</script>

<style lang="scss">
@use '../../style/forum';
</style>
