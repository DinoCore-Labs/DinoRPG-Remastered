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
					<div class="forum-toolbar__group">
						<DZButton class="bSmall" to="/forum">
							{{ $t('forum.actions.home') }}
						</DZButton>
						<DZButton v-if="user.isLogged" @click="toggleFavorite">
							{{ result.topic.isFavorite ? $t('forum.actions.removeFavorite') : $t('forum.actions.addFavorite') }}
						</DZButton>
						<DZButton v-if="user.isLogged" @click="toggleSubscription">
							<img class="forum-toolbar-action-icon" :src="getImgURL('icons', 'small_notif')" alt="" />
							{{ result.isSubscribed ? $t('forum.actions.unfollow') : $t('forum.actions.follow') }}
						</DZButton>
					</div>
					<div v-if="user.isModerator" class="forum-toolbar__group forum-toolbar__group--moderation">
						<DZButton @click="togglePinned">
							{{ result.topic.isPinned ? $t('forum.actions.unpin') : $t('forum.actions.pin') }}
						</DZButton>
						<DZButton
							class="bSmall"
							v-if="!result.topic.isClosed || result.topic.messageCount < maxMessages"
							@click="toggleClosed"
						>
							{{ result.topic.isClosed ? $t('forum.actions.reopen') : $t('forum.actions.close') }}
						</DZButton>
						<DZButton class="forum-toolbar__history bSmall" @click="toggleModerationHistory">
							{{ $t('forum.moderation.historyShort') }}
						</DZButton>
					</div>
				</div>
				<section v-if="user.isModerator && moderationHistoryVisible" class="forum-moderation-history">
					<h3>
						{{ $t('forum.moderation.history') }}
					</h3>
					<p v-if="moderationHistoryLoading">
						{{ $t('forum.moderation.loading') }}
					</p>
					<p v-else-if="moderationHistory.length === 0">
						{{ $t('forum.moderation.empty') }}
					</p>
					<div v-for="action in moderationHistory" :key="action.id" class="forum-moderation-history__entry">
						<strong>
							{{ action.actorName }}
						</strong>
						<span>
							{{ $t(`forum.moderation.actions.${action.action}`) }}
						</span>
						<span v-if="action.messageId"> #{{ action.messageId }} </span>
						<time :datetime="action.createdAt">
							{{ formatDate(action.createdAt) }}
						</time>
						<p v-if="action.reason">
							{{ action.reason }}
						</p>
					</div>
				</section>
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
					<article
						v-for="message in result.messages"
						:id="`forum-message-${message.id}`"
						:key="message.id"
						class="forum-post"
					>
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
								v-if="
									editingMessageId !== message.id &&
									(canQuoteMessage(message) ||
										canReportMessage(message) ||
										canEditMessage(message) ||
										canDeleteMessage(message) ||
										canModerateMessage(message))
								"
								class="forum-post-actions"
							>
								<DZButton
									v-if="canQuoteMessage(message)"
									class="forum-post-action-button bSmall"
									:title="$t('forum.actions.quote')"
									:aria-label="$t('forum.actions.quote')"
									@click="quoteMessage(message)"
								>
									<img class="forum-post-action-img" :src="getImgURL('icons', 'thread')" alt="" />
								</DZButton>
								<DZButton
									v-if="canEditMessage(message)"
									class="forum-post-action-button bSmall"
									:title="$t('forum.actions.edit')"
									:aria-label="$t('forum.actions.edit')"
									@click="startEdit(message)"
								>
									<img class="forum-post-action-img" :src="getImgURL('icons', 'small_edit')" alt="" />
								</DZButton>
								<DZButton
									v-if="canDeleteMessage(message)"
									class="forum-post-action-button bSmall"
									:disabled="deletingMessageId !== null"
									:title="$t('forum.actions.delete')"
									:aria-label="$t('forum.actions.delete')"
									@click="deleteMessage(message)"
								>
									<img class="forum-post-action-img" :src="getImgURL('icons', 'small_delete')" alt="" />
								</DZButton>
								<DZButton
									v-if="canReportMessage(message)"
									size="small"
									class="forum-post-action-button"
									:title="$t('forum.actions.report')"
									:aria-label="$t('forum.actions.report')"
									@click="startReport(message)"
								>
									{{ $t('forum.actions.report') }}
								</DZButton>
								<DZButton
									v-if="canModerateMessage(message)"
									class="forum-post-action-button bSmall"
									:title="$t('forum.moderation.delete')"
									:aria-label="$t('forum.moderation.delete')"
									@click="startModerationDelete(message)"
								>
									<img class="forum-post-action-img" :src="getImgURL('icons', 'small_delete')" alt="" />
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
							<div v-else-if="message.isDeleted" class="forum-post-deleted">
								<p class="forum-post-deleted__notice">
									{{
										message.deletionKind === 'MODERATION' ? $t('forum.deleted.moderation') : $t('forum.deleted.author')
									}}
								</p>
								<template v-if="user.isModerator && message.content">
									<div class="forum-post-deleted__original" v-html="richFormatText(message.content)"></div>
									<p v-if="message.deletionReason" class="forum-post-deleted__reason">
										<strong>
											{{ $t('forum.moderation.reason') }}
										</strong>
										{{ message.deletionReason }}
									</p>
									<DZButton v-if="message.deletionKind === 'MODERATION'" size="small" @click="restoreMessage(message)">
										{{ $t('forum.moderation.restore') }}
									</DZButton>
								</template>
							</div>
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
				<div v-else-if="user.isLogged" ref="replyComposerRef" class="forum-composer">
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
	<ForumModerationDeleteModal
		v-if="moderatingMessage"
		:author-name="moderatingMessage.authorName"
		:loading="moderationDeleting"
		@close="moderatingMessage = null"
		@confirm="confirmModerationDelete"
	/>
	<ReportModal
		v-if="reportingMessage"
		:show="true"
		:reported-forum-message-id="reportingMessage.id"
		:reported-forum-author-name="reportingMessage.authorName"
		@close="closeReport"
	/>
</template>

<script setup lang="ts">
import {
	FORUM_MAX_MESSAGES,
	FORUM_MESSAGES_PER_PAGE,
	type ForumMessageView,
	type ForumModerationActionView,
	type ForumTopicViewResponse
} from '@dinorpg/core/models/forum/forum.js';

import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import ForumPagination from '../../components/forum/ForumPagination.vue';
import RichTextEditor from '../../components/richTextEditor/RichTextEditor.vue';
import DZButton from '../../components/utils/DZButton.vue';
import ReportModal from '../../components/modal/ReportModal.vue';
import ForumModerationDeleteModal from '../../components/forum/ForumModerationDeleteModal.vue';
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
const replyComposerRef = useTemplateRef<HTMLElement>('replyComposerRef');

const reportingMessage = ref<ForumMessageView | null>(null);

const moderatingMessage = ref<ForumMessageView | null>(null);

const moderationDeleting = ref(false);

const moderationHistory = ref<ForumModerationActionView[]>([]);

const moderationHistoryVisible = ref(false);

const moderationHistoryLoading = ref(false);

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

function canQuoteMessage(message: ForumMessageView): boolean {
	return !message.isDeleted && user.isLogged && result.value !== null && !result.value.topic.isClosed;
}

function canEditMessage(message: ForumMessageView): boolean {
	return !message.isDeleted && user.id !== null && message.authorId === user.id;
}

function canDeleteMessage(message: ForumMessageView): boolean {
	return !message.isDeleted && user.id !== null && message.authorId === user.id;
}

function canModerateMessage(message: ForumMessageView): boolean {
	return !message.isDeleted && user.isModerator && user.id !== null && message.authorId !== user.id;
}

function startModerationDelete(message: ForumMessageView): void {
	if (!canModerateMessage(message)) {
		return;
	}
	moderatingMessage.value = message;
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

async function confirmModerationDelete(reason: string): Promise<void> {
	if (!moderatingMessage.value || moderationDeleting.value) {
		return;
	}
	moderationDeleting.value = true;
	error.value = '';
	try {
		await ForumService.setMessageModeration(topicId(), moderatingMessage.value.id, {
			isDeleted: true,
			reason
		});
		moderatingMessage.value = null;
		await load();
		if (moderationHistoryVisible.value) {
			const response = await ForumService.getModerationHistory(topicId());
			moderationHistory.value = response.actions;
		}
	} catch {
		error.value = t('forum.errors.moderateMessage');
	} finally {
		moderationDeleting.value = false;
	}
}

async function restoreMessage(message: ForumMessageView): Promise<void> {
	if (!user.isModerator || message.deletionKind !== 'MODERATION') {
		return;
	}
	error.value = '';
	try {
		await ForumService.setMessageModeration(topicId(), message.id, {
			isDeleted: false
		});
		await load();
		/*
		 * Si l'historique est actuellement affiché,
		 * on le recharge pour faire apparaître
		 * immédiatement MESSAGE_RESTORE.
		 */
		if (moderationHistoryVisible.value) {
			const response = await ForumService.getModerationHistory(topicId());
			moderationHistory.value = response.actions;
		}
	} catch {
		error.value = t('forum.errors.restoreMessage');
	}
}

async function deleteMessage(message: ForumMessageView): Promise<void> {
	if (!canDeleteMessage(message) || !result.value || deletingMessageId.value !== null) {
		return;
	}
	const confirmed = window.confirm(t('forum.confirm.deleteMessage'));
	if (!confirmed) {
		return;
	}
	if (editingMessageId.value === message.id) {
		cancelEdit();
	}
	deletingMessageId.value = message.id;
	error.value = '';
	try {
		await ForumService.deleteMessage(topicId(), message.id);
		/*
		 * Le message n'a pas été physiquement supprimé.
		 *
		 * On recharge simplement la page :
		 *
		 * message normal
		 *       ↓
		 * [message supprimé par son auteur]
		 *
		 * La page et le nombre de messages
		 * restent identiques.
		 */
		await load();
	} catch {
		error.value = t('forum.errors.deleteMessage');
	} finally {
		deletingMessageId.value = null;
	}
}

function quoteMessage(message: ForumMessageView): void {
	if (!canQuoteMessage(message)) {
		return;
	}
	const quotedContent = message.content
		.split(/\r?\n/)
		.map(line => `> ${line}`)
		.join('\n');
	const quote = [`> ${message.authorName} · #${message.id}`, quotedContent].join('\n');
	const currentContent = content.value.trimEnd();
	content.value = currentContent ? `${currentContent}\n\n${quote}\n\n` : `${quote}\n\n`;
	requestAnimationFrame(() => {
		replyComposerRef.value?.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	});
}

async function toggleSubscription(): Promise<void> {
	if (!result.value) {
		return;
	}
	error.value = '';
	try {
		const toggled = await ForumService.toggleSubscription(topicId());
		result.value.isSubscribed = toggled.subscribed;
	} catch {
		error.value = t('forum.errors.subscription');
	}
}

async function toggleModerationHistory(): Promise<void> {
	moderationHistoryVisible.value = !moderationHistoryVisible.value;
	if (!moderationHistoryVisible.value) {
		return;
	}
	moderationHistoryLoading.value = true;
	try {
		const response = await ForumService.getModerationHistory(topicId());
		moderationHistory.value = response.actions;
	} finally {
		moderationHistoryLoading.value = false;
	}
}

function canReportMessage(message: ForumMessageView): boolean {
	return !message.isDeleted && user.id !== null && message.authorId !== null && message.authorId !== user.id;
}

function startReport(message: ForumMessageView): void {
	if (!canReportMessage(message)) {
		return;
	}
	reportingMessage.value = message;
}

function closeReport(): void {
	reportingMessage.value = null;
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
		const loaded = await ForumService.getTopic(id, currentPage());
		result.value = loaded;
		/*
		 * Une page chargée est considérée comme lue
		 * jusqu'à son dernier message.
		 */
		if (user.isLogged && loaded.messages.length > 0) {
			const lastMessage = loaded.messages[loaded.messages.length - 1];
			try {
				await ForumService.markTopicRead(id, lastMessage.id);
				/*
				 * Si c'est la dernière page, le topic
				 * vient forcément d'être entièrement lu.
				 */
				if (loaded.page === loaded.pageCount) {
					loaded.topic.hasUnreadMessages = false;
				}
			} catch {
				/*
				 * Le suivi lu/non-lu ne doit jamais
				 * empêcher l'affichage du topic.
				 */
			}
		}
		await nextTick();
		scrollToMessageHash();
	} catch (err) {
		error.value = t('forum.errors.loadTopic');
	}
}

function scrollToMessageHash(): void {
	const match = /^#forum-message-(\d+)$/.exec(route.hash);
	if (!match) {
		return;
	}
	const element = document.getElementById(`forum-message-${match[1]}`);
	element?.scrollIntoView({
		behavior: 'smooth',
		block: 'center'
	});
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
	() => [route.params.topicId, route.query.page, route.hash],
	() => void load(),
	{
		immediate: true
	}
);
</script>

<style lang="scss">
@use '../../style/forum';
</style>
