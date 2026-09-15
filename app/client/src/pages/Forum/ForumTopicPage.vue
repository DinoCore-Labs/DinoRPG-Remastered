<template>
	<div class="forum-page">
		<div class="forum-frame">
			<template v-if="result">
				<header class="forum-banner">
					<DZButton back :to="`/forum/${result.topic.category}`">Liste des sujets</DZButton>
					<h1>{{ categoryTitle }}</h1>
				</header>
				<div class="forum-toolbar">
					<DZButton to="/forum">Accueil</DZButton>
					<DZButton v-if="user.isLogged" @click="toggleFavorite">
						{{ result.topic.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
					</DZButton>
					<span class="forum-spacer"></span>
					<template v-if="user.isModerator">
						<DZButton @click="togglePinned">
							{{ result.topic.isPinned ? 'Retirer le Post-It' : 'Mettre en Post-It' }}
						</DZButton>
						<DZButton v-if="!result.topic.isClosed || result.topic.messageCount < maxMessages" @click="toggleClosed">
							{{ result.topic.isClosed ? 'Rouvrir' : 'Fermer' }}
						</DZButton>
					</template>
				</div>
				<ForumPagination :page="result.page" :page-count="result.pageCount" @change="changePage" />
				<h2 class="forum-topic-title">
					<img
						v-if="result.topic.isClosed"
						class="forum-topic-title-lock"
						:src="getImgURL('icons', 'small_lock')"
						alt="Sujet fermé"
					/>
					{{ result.topic.title }}
				</h2>
				<section class="forum-posts">
					<article v-for="message in result.messages" :key="message.id" class="forum-post">
						<aside class="forum-post-author">
							<img v-if="message.avatarUrl" class="forum-avatar" :src="message.avatarUrl" alt="" />
							<div v-else class="forum-avatar forum-avatar-placeholder">
								{{ initial(message.authorName) }}
							</div>
							<div class="forum-post-author__info">
								<RouterLink v-if="message.authorId" :to="`/user/${message.authorId}`">
									<strong>{{ message.authorName }}</strong>
								</RouterLink>
								<strong v-else>
									{{ message.authorName }}
								</strong>
								<time :datetime="message.createdAt">
									{{ formatDate(message.createdAt) }}
								</time>
							</div>
						</aside>
						<div class="forum-post-content" v-html="richFormatText(message.content)"></div>
					</article>
				</section>
				<ForumPagination :page="result.page" :page-count="result.pageCount" @change="changePage" />
				<p v-if="result.topic.isClosed" class="forum-notice">
					Sujet fermé
					<span v-if="result.topic.messageCount >= maxMessages"> automatiquement après {{ maxMessages }} messages </span
					>.
				</p>
				<div v-else-if="user.isLogged" class="forum-composer">
					<div class="forum-composer-label">
						<span>Répondre</span>
						<RichTextEditor
							ref="replyEditorRef"
							v-model="content"
							:submit-on-enter="false"
							:show-dialog-buttons="false"
							:clear-on-confirm="false"
							:max-length="10000"
							@send="reply"
						/>
					</div>
					<div class="forum-composer-actions">
						<DZButton :disabled="submitting" @click="submitReply">Répondre</DZButton>
					</div>
				</div>
				<p v-else class="forum-notice">Connectez-vous pour répondre à ce sujet.</p>
			</template>
			<p v-if="error" class="forum-error">
				{{ error }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	FORUM_MAX_MESSAGES,
	FORUM_MESSAGES_PER_PAGE,
	type ForumCategory,
	type ForumTopicViewResponse
} from '@dinorpg/core/models/forum/forum.js';

import { computed, ref, useTemplateRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ForumPagination from '../../components/forum/ForumPagination.vue';
import RichTextEditor from '../../components/richTextEditor/RichTextEditor.vue';
import DZButton from '../../components/utils/DZButton.vue';
import { ForumService } from '../../services/index.ts';
import { userStore } from '../../store/userStore';
import { getImgURL } from '../../utils/getImgURL';
import { richFormatText } from '../../utils/richFormatText';

const route = useRoute();
const router = useRouter();

const user = userStore();

const result = ref<ForumTopicViewResponse | null>(null);

const error = ref('');
const content = ref('');
const submitting = ref(false);

const replyEditorRef = useTemplateRef<InstanceType<typeof RichTextEditor>>('replyEditorRef');

const maxMessages = FORUM_MAX_MESSAGES;

const categoryTitles: Record<ForumCategory, string> = {
	QUESTIONS: 'Questions / Réponses',
	GAME: 'Discussions autour du jeu',
	CLANS: 'Clans',
	CHAOS: 'Auberge du chaos'
};

const categoryTitle = computed(() => (result.value ? categoryTitles[result.value.topic.category] : 'Forum'));

function topicId(): number {
	return Number(route.params.topicId);
}

function currentPage(): number {
	const value = Number(route.query.page ?? 1);
	return Number.isInteger(value) && value > 0 ? value : 1;
}

async function load(): Promise<void> {
	const id = topicId();
	if (!Number.isInteger(id) || id <= 0) {
		await router.replace({
			name: 'ForumHome'
		});
		return;
	}
	error.value = '';
	try {
		result.value = await ForumService.getTopic(id, currentPage());
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de charger ce sujet.';
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

function submitReply(): void {
	error.value = '';
	replyEditorRef.value?.confirm();
}

async function reply(message: string): Promise<void> {
	const trimmedMessage = message.trim();
	if (!trimmedMessage || submitting.value) {
		if (!trimmedMessage) {
			error.value = 'Le message ne peut pas être vide.';
		}
		return;
	}
	submitting.value = true;
	error.value = '';
	try {
		const created = await ForumService.createMessage(topicId(), {
			content: trimmedMessage
		});
		content.value = '';
		const lastPage = Math.max(1, Math.ceil(created.topic.messageCount / FORUM_MESSAGES_PER_PAGE));
		if (currentPage() === lastPage) {
			await load();
		} else {
			await router.push({
				query: {
					...route.query,
					page: String(lastPage)
				}
			});
		}
	} catch (err) {
		content.value = message;
		error.value = err instanceof Error ? err.message : 'Impossible de répondre.';
		await load();
	} finally {
		submitting.value = false;
	}
}

async function toggleFavorite(): Promise<void> {
	if (!result.value) {
		return;
	}
	const toggled = await ForumService.toggleFavorite(topicId());
	result.value.topic.isFavorite = toggled.favorite;
}

async function togglePinned(): Promise<void> {
	if (!result.value) {
		return;
	}
	await ForumService.setPinned(topicId(), !result.value.topic.isPinned);
	result.value.topic.isPinned = !result.value.topic.isPinned;
}

async function toggleClosed(): Promise<void> {
	if (!result.value) {
		return;
	}
	await ForumService.setClosed(topicId(), !result.value.topic.isClosed);
	result.value.topic.isClosed = !result.value.topic.isClosed;
}

function initial(name: string): string {
	return name.trim().slice(0, 1).toUpperCase() || '?';
}

function formatDate(value: string): string {
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(value));
}

watch(
	() => [route.params.topicId, route.query.page],
	() => void load(),
	{
		immediate: true
	}
);
</script>

<style lang="scss">
@use '../../style/forum';
</style>
