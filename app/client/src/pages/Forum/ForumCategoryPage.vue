<template>
	<div class="forum-page">
		<div class="forum-frame">
			<header class="forum-banner">
				<RouterLink
					class="forum-home-link"
					:to="{
						name: 'ForumHome'
					}"
				>
					Accueil des forums
				</RouterLink>

				<h1>
					{{ categoryTitle }}
				</h1>
			</header>

			<div class="forum-toolbar">
				<button v-if="user.isLogged" class="forum-action" type="button" @click="showComposer = !showComposer">
					{{ showComposer ? 'Annuler' : 'Écrire un message' }}
				</button>

				<span class="forum-spacer"></span>

				<span>
					{{ result?.total ?? 0 }}
					sujet(s)
				</span>
			</div>

			<form v-if="showComposer" class="forum-composer" @submit.prevent="createTopic">
				<label>
					Sujet

					<input v-model="title" maxlength="120" required />
				</label>

				<label>
					Message

					<textarea v-model="content" maxlength="10000" required></textarea>
				</label>

				<button class="forum-action" type="submit" :disabled="submitting || title.trim().length < 3 || !content.trim()">
					Créer le sujet
				</button>
			</form>

			<p v-if="error" class="forum-error">
				{{ error }}
			</p>

			<ForumTopicTable :topics="result?.topics ?? []" />

			<ForumPagination v-if="result" :page="result.page" :page-count="result.pageCount" @change="changePage" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { isForumCategory, type ForumCategory, type ForumTopicListResponse } from '@dinorpg/core/models/forum/forum.js';

import { computed, ref, watch } from 'vue';

import { useRoute, useRouter } from 'vue-router';

import ForumPagination from '../../components/forum/ForumPagination.vue';
import ForumTopicTable from '../../components/forum/ForumTopicTable.vue';

import { userStore } from '../../store/userStore';
import { ForumService } from '../../services/forum.services.ts';

const route = useRoute();

const router = useRouter();

const user = userStore();

const result = ref<ForumTopicListResponse | null>(null);

const error = ref('');

const showComposer = ref(false);

const submitting = ref(false);

const title = ref('');

const content = ref('');

const category = computed<ForumCategory | null>(() => {
	const value = route.params.category;

	return isForumCategory(value) ? value : null;
});

const categoryTitles: Record<ForumCategory, string> = {
	QUESTIONS: 'Questions / Réponses',

	GAME: 'Discussions autour du jeu',

	CLANS: 'Clans',

	CHAOS: 'Auberge du chaos'
};

const categoryTitle = computed(() => (category.value ? categoryTitles[category.value] : 'Forum'));

function currentPage(): number {
	const value = Number(route.query.page ?? 1);

	return Number.isInteger(value) && value > 0 ? value : 1;
}

async function load(): Promise<void> {
	if (!category.value) {
		await router.replace({
			name: 'ForumHome'
		});

		return;
	}

	error.value = '';

	try {
		result.value = await ForumService.listTopics(category.value, currentPage());
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de charger le forum.';
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

async function createTopic(): Promise<void> {
	if (!category.value || submitting.value) {
		return;
	}

	submitting.value = true;

	error.value = '';

	try {
		const topic = await ForumService.createTopic(category.value, {
			title: title.value.trim(),

			content: content.value.trim()
		});

		title.value = '';
		content.value = '';

		showComposer.value = false;

		await router.push({
			name: 'ForumTopic',

			params: {
				topicId: topic.id
			}
		});
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de créer le sujet.';
	} finally {
		submitting.value = false;
	}
}

watch(
	() => [route.params.category, route.query.page],

	() => void load(),

	{
		immediate: true
	}
);
</script>

<style lang="scss">
@use '../styles/forum';
</style>
