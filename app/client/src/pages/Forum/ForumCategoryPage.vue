<template>
	<div class="forum-page">
		<div class="forum-frame">
			<ForumHeader :category="category" :title="categoryTitle" back-to="/forum" :back-label="$t('forum.backHome')" />
			<div class="forum-toolbar">
				<DZButton v-if="user.isLogged" @click="toggleComposer">
					{{ showComposer ? $t('forum.actions.cancel') : $t('forum.actions.writeMessage') }}
				</DZButton>
				<span class="forum-spacer"></span>
				<span class="forum-toolbar-count">
					{{ $t('forum.topicCount', { count: result?.total ?? 0 }) }}
				</span>
			</div>
			<div v-if="showComposer" class="forum-composer">
				<label class="forum-composer-label">
					<span>{{ $t('forum.composer.subject') }}</span>
					<input v-model="title" maxlength="120" required />
				</label>
				<div class="forum-composer-label">
					<span>{{ $t('forum.composer.message') }}</span>
					<RichTextEditor
						ref="editorRef"
						v-model="content"
						:submit-on-enter="false"
						:show-dialog-buttons="false"
						:clear-on-confirm="false"
						:max-length="10000"
						@send="createTopic"
					/>
				</div>
				<div class="forum-composer-actions">
					<DZButton @click="cancelComposer">
						{{ $t('forum.actions.cancel') }}
					</DZButton>
					<DZButton :disabled="submitting || title.trim().length < 3" @click="submitTopic">
						{{ $t('forum.actions.createTopic') }}
					</DZButton>
				</div>
			</div>
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

import { computed, ref, useTemplateRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import ForumPagination from '../../components/forum/ForumPagination.vue';
import ForumTopicTable from '../../components/forum/ForumTopicTable.vue';
import ForumHeader from '../../components/forum/ForumHeader.vue';
import RichTextEditor from '../../components/richTextEditor/RichTextEditor.vue';
import DZButton from '../../components/utils/DZButton.vue';
import { ForumService } from '../../services/forum.services.ts';
import { userStore } from '../../store/userStore';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const user = userStore();

const result = ref<ForumTopicListResponse | null>(null);

const error = ref('');
const showComposer = ref(false);
const submitting = ref(false);

const title = ref('');
const content = ref('');

const editorRef = useTemplateRef<InstanceType<typeof RichTextEditor>>('editorRef');

const category = computed<ForumCategory | null>(() => {
	const value = route.params.category;
	return isForumCategory(value) ? value : null;
});

const categoryTitle = computed(() => {
	if (!category.value) {
		return t('forum.title');
	}
	return t(`forum.categories.${category.value}.title`);
});

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
		error.value = t('forum.errors.loadForum');
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

function toggleComposer(): void {
	if (showComposer.value) {
		cancelComposer();
		return;
	}
	error.value = '';
	showComposer.value = true;
}

function cancelComposer(): void {
	editorRef.value?.cancel();
	title.value = '';
	content.value = '';
	showComposer.value = false;
	error.value = '';
}

function submitTopic(): void {
	if (title.value.trim().length < 3) {
		error.value = t('forum.errors.titleMin');
		return;
	}
	error.value = '';
	editorRef.value?.confirm();
}

async function createTopic(message: string): Promise<void> {
	if (!category.value || submitting.value) {
		return;
	}
	const trimmedMessage = message.trim();
	if (!trimmedMessage) {
		error.value = t('forum.errors.messageEmpty');
		return;
	}
	submitting.value = true;
	error.value = '';
	try {
		const topic = await ForumService.createTopic(category.value, {
			title: title.value.trim(),
			content: trimmedMessage
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
		error.value = t('forum.errors.createTopic');
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
@use '../../style/forum';
</style>
