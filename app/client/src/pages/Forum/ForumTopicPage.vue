<template>
	<div class="forum-page">
		<div class="forum-frame">
			<template v-if="result">
				<header class="forum-banner">
					<DZButton back :to="`/forum/${result.topic.category}`">
						{{ $t('forum.backTopics') }}
					</DZButton>
					<h1>{{ categoryTitle }}</h1>
				</header>
				<div class="forum-toolbar">
					<DZButton to="/forum">
						{{ $t('forum.actions.home') }}
					</DZButton>
					<DZButton v-if="user.isLogged" @click="toggleFavorite">
						{{ result.topic.isFavorite ? $t('forum.actions.removeFavorite') : $t('forum.actions.addFavorite') }}
					</DZButton>
					<span class="forum-spacer"></span>
					<template v-if="user.isModerator">
						<DZButton @click="togglePinned">
							{{ result.topic.isPinned ? $t('forum.actions.unpin') : $t('forum.actions.pin') }}
						</DZButton>
						<DZButton v-if="!result.topic.isClosed || result.topic.messageCount < maxMessages" @click="toggleClosed">
							{{ result.topic.isClosed ? $t('forum.actions.reopen') : $t('forum.actions.close') }}
						</DZButton>
					</template>
				</div>
				<ForumPagination :page="result.page" :page-count="result.pageCount" @change="changePage" />
				<h2 class="forum-topic-title">
					<img
						v-if="result.topic.isClosed"
						class="forum-topic-title-lock"
						:src="getImgURL('icons', 'small_lock')"
						:alt="$t('forum.table.closed')"
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
								<div class="forum-post-author__name">
									<RouterLink v-if="message.authorId" :to="`/user/${message.authorId}`">
										<strong>{{ message.authorName }}</strong>
									</RouterLink>
									<strong v-else>
										{{ message.authorName }}
									</strong>
									<img
										v-if="message.authorRole === 'MODERATOR'"
										class="forum-staff-badge forum-staff-badge--moderator"
										:src="getImgURL('icons', 'small_mode')"
										:title="$t('forum.roles.moderator')"
										:aria-label="$t('forum.roles.moderator')"
									/>
									<img
										v-else-if="message.authorRole === 'ADMIN' || message.authorRole === 'SUPER_ADMIN'"
										class="forum-staff-badge forum-staff-badge--admin"
										:src="getImgURL('icons', 'crown', true)"
										:alt="$t('forum.roles.admin')"
										:title="$t('forum.roles.admin')"
									/>
								</div>
								<time :datetime="message.createdAt">
									{{ formatDate(message.createdAt) }}
								</time>
							</div>
						</aside>
						<div class="forum-post-content">
							<div
								v-if="editingMessageId !== message.id && (canEditMessage(message) || canDeleteMessage(message))"
								class="forum-post-actions"
							>
								<DZButton
									v-if="canEditMessage(message)"
									class="forum-post-action-button"
									size="small"
									:title="$t('forum.actions.edit')"
									:aria-label="$t('forum.actions.edit')"
									@click="startEdit(message)"
								>
									<img :src="getImgURL('icons', 'small_edit')" alt="" />
								</DZButton>
								<DZButton
									v-if="canDeleteMessage(message)"
									class="forum-post-action-button"
									size="small"
									:disabled="deletingMessageId !== null"
									:title="$t('forum.actions.delete')"
									:aria-label="$t('forum.actions.delete')"
									@click="deleteMessage(message)"
								>
									<img :src="getImgURL('icons', 'small_delete')" alt="" />
								</DZButton>
							</div>
							<template v-if="editingMessageId === message.id">
								<div class="forum-post-editor">
									<RichTextEditor
										:ref="setEditEditorRef"
										v-model="editingContent"
										:submit-on-enter="false"
										:show-dialog-buttons="false"
										:clear-on-confirm="false"
										:max-length="10000"
										@send="saveEdit(message.id, $event)"
									/>
									<div class="forum-post-edit-actions">
										<DZButton size="small" :disabled="savingEdit" @click="cancelEdit">
											{{ $t('forum.actions.cancel') }}
										</DZButton>
										<DZButton size="small" :disabled="savingEdit" @click="submitEdit">
											{{ $t('forum.actions.save') }}
										</DZButton>
									</div>
								</div>
							</template>

							<div v-else class="forum-post-message" v-html="richFormatText(message.content)"></div>
						</div>
					</article>
				</section>
				<ForumPagination :page="result.page" :page-count="result.pageCount" @change="changePage" />
				<p v-if="result.topic.isClosed" class="forum-notice">
					{{
						result.topic.messageCount >= maxMessages
							? $t('forum.closed.automatic', { count: maxMessages })
							: $t('forum.closed.manual')
					}}
				</p>
				<div v-else-if="user.isLogged" class="forum-composer">
					<div class="forum-composer-label">
						<span>{{ $t('forum.actions.reply') }}</span>
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
						<DZButton :disabled="submitting" @click="submitReply">
							{{ $t('forum.actions.reply') }}
						</DZButton>
					</div>
				</div>
				<p v-else class="forum-notice">
					{{ $t('forum.loginToReply') }}
				</p>
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
	type ForumMessageView,
	type ForumTopicViewResponse
} from '@dinorpg/core/models/forum/forum.js';

import { computed, ref, useTemplateRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import ForumPagination from '../../components/forum/ForumPagination.vue';
import RichTextEditor from '../../components/richTextEditor/RichTextEditor.vue';
import DZButton from '../../components/utils/DZButton.vue';
import { ForumService } from '../../services/index.ts';
import { userStore } from '../../store/userStore';
import { getImgURL } from '../../utils/getImgURL';
import { richFormatText } from '../../utils/richFormatText';

const route = useRoute();
const router = useRouter();

const { t, locale } = useI18n();

const user = userStore();

const result = ref<ForumTopicViewResponse | null>(null);

const error = ref('');
const content = ref('');
const submitting = ref(false);

const editingMessageId = ref<number | null>(null);
const editingContent = ref('');
const savingEdit = ref(false);

const deletingMessageId = ref<number | null>(null);

const editEditorRef = ref<InstanceType<typeof RichTextEditor> | null>(null);

const replyEditorRef = useTemplateRef<InstanceType<typeof RichTextEditor>>('replyEditorRef');

const maxMessages = FORUM_MAX_MESSAGES;

const categoryTitle = computed(() => {
	if (!result.value) {
		return t('forum.title');
	}
	return t(`forum.categories.${result.value.topic.category}.title`);
});

function topicId(): number {
	return Number(route.params.topicId);
}

function currentPage(): number {
	const value = Number(route.query.page ?? 1);
	return Number.isInteger(value) && value > 0 ? value : 1;
}

function setEditEditorRef(instance: unknown): void {
	editEditorRef.value = instance as InstanceType<typeof RichTextEditor> | null;
}

function canEditMessage(message: ForumMessageView): boolean {
	return user.id !== null && message.authorId === user.id;
}

function canDeleteMessage(message: ForumMessageView): boolean {
	if (user.id === null) {
		return false;
	}
	return message.authorId === user.id || user.isModerator;
}

function startEdit(message: ForumMessageView): void {
	if (!canEditMessage(message) || savingEdit.value) {
		return;
	}
	if (editingMessageId.value !== null) {
		cancelEdit();
	}
	error.value = '';
	editingMessageId.value = message.id;
	editingContent.value = message.content;
}

function cancelEdit(): void {
	editEditorRef.value?.cancel();
	editingMessageId.value = null;
	editingContent.value = '';
	editEditorRef.value = null;
}

function submitEdit(): void {
	error.value = '';
	editEditorRef.value?.confirm();
}

async function saveEdit(messageId: number, message: string): Promise<void> {
	const trimmedMessage = message.trim();
	if (!trimmedMessage) {
		error.value = t('forum.errors.messageEmpty');
		return;
	}
	if (savingEdit.value) {
		return;
	}
	savingEdit.value = true;
	error.value = '';
	try {
		const updatedMessage = await ForumService.updateMessage(topicId(), messageId, {
			content: trimmedMessage
		});
		if (result.value) {
			const index = result.value.messages.findIndex(currentMessage => currentMessage.id === messageId);
			if (index !== -1) {
				result.value.messages[index] = updatedMessage;
			}
		}
		editingMessageId.value = null;
		editingContent.value = '';
		editEditorRef.value = null;
	} catch {
		editingContent.value = message;
		error.value = t('forum.errors.editMessage');
	} finally {
		savingEdit.value = false;
	}
}

async function deleteMessage(message: ForumMessageView): Promise<void> {
	if (!canDeleteMessage(message) || !result.value || deletingMessageId.value !== null) {
		return;
	}
	const isLastMessage = result.value.topic.messageCount === 1;
	const confirmed = window.confirm(
		t(isLastMessage ? 'forum.confirm.deleteLastMessage' : 'forum.confirm.deleteMessage')
	);
	if (!confirmed) {
		return;
	}
	if (editingMessageId.value === message.id) {
		cancelEdit();
	}
	deletingMessageId.value = message.id;
	error.value = '';
	const category = result.value.topic.category;
	try {
		const deleted = await ForumService.deleteMessage(topicId(), message.id);
		/*
		 * Dernier message supprimé :
		 * le backend a également supprimé le sujet.
		 */
		if (deleted.topicDeleted) {
			await router.push({
				name: 'ForumCategory',
				params: {
					category
				}
			});
			return;
		}
		/*
		 * Exemple :
		 *
		 * page 3 contient uniquement le message #51.
		 * On le supprime → il ne reste plus que 2 pages.
		 *
		 * On revient alors automatiquement à la page 2.
		 */
		if (currentPage() > deleted.pageCount) {
			await router.push({
				query: {
					...route.query,
					page: String(deleted.pageCount)
				}
			});
			return;
		}
		await load();
	} catch {
		error.value = t('forum.errors.deleteMessage');
	} finally {
		deletingMessageId.value = null;
	}
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
		error.value = t('forum.errors.loadTopic');
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
			error.value = t('forum.errors.messageEmpty');
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
		error.value = t('forum.errors.reply');
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
	return new Intl.DateTimeFormat(String(locale.value).toLowerCase(), {
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
