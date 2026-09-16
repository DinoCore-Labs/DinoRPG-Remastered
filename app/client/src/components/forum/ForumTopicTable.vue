<template>
	<div class="forum-table-wrap">
		<DZTable class="forum-topic-table">
			<tr class="forum-topic-table__header">
				<th>{{ $t('forum.table.subject') }}</th>
				<th>{{ $t('forum.table.author') }}</th>
				<th>{{ $t('forum.table.replies') }}</th>
			</tr>
			<template v-for="(topic, index) in topics" :key="topic.id">
				<tr v-if="needsSection(topic, index)" class="forum-section-row">
					<td colspan="3" class="subtitle">
						{{ sectionLabel(topic) }}
					</td>
				</tr>
				<tr
					class="forum-topic-row"
					:class="{
						'forum-topic-row--unread': topic.hasUnreadMessages
					}"
				>
					<td class="forum-topic-subject">
						<img
							v-if="topic.isPinned"
							class="forum-topic-state-icon forum-topic-state-icon--pin"
							:src="getImgURL('icons', 'pin')"
							alt=""
							:title="$t('forum.table.postIt')"
						/>
						<img
							v-if="topic.isClosed"
							class="forum-topic-state-icon"
							:src="getImgURL('icons', 'small_lock')"
							:alt="$t('forum.table.closed')"
							:title="$t('forum.table.closed')"
						/>
						<button
							v-if="topic.hasUnreadMessages"
							type="button"
							class="forum-topic-unread"
							:disabled="openingUnreadTopicId === topic.id"
							:title="$t('forum.unread.firstUnread')"
							:aria-label="$t('forum.unread.firstUnread')"
							@click="goToFirstUnread(topic.id)"
						>
							<img :src="getImgURL('icons', 'small_mail')" alt="" />
						</button>
						<RouterLink
							:to="{
								name: 'ForumTopic',
								params: {
									topicId: topic.id
								}
							}"
						>
							{{ topic.title }}
						</RouterLink>
					</td>
					<td class="forum-topic-author">
						<div class="forum-topic-author__name">
							<span>{{ topic.authorName }}</span>
							<img
								v-if="topic.authorRole === 'MODERATOR'"
								class="forum-staff-badge forum-staff-badge--moderator"
								:src="getImgURL('icons', 'small_mode')"
								:title="$t('forum.roles.moderator')"
								:aria-label="$t('forum.roles.moderator')"
							/>
							<img
								v-else-if="topic.authorRole === 'ADMIN' || topic.authorRole === 'SUPER_ADMIN'"
								class="forum-staff-badge forum-staff-badge--admin"
								:src="getImgURL('icons', 'crown', true)"
								:alt="$t('forum.roles.admin')"
								:title="$t('forum.roles.admin')"
							/>
						</div>
					</td>
					<td class="forum-topic-replies">
						{{ topic.replyCount }}
					</td>
				</tr>
			</template>
			<tr v-if="topics.length === 0" class="forum-empty-row">
				<td colspan="3">
					{{ $t('forum.table.empty') }}
				</td>
			</tr>
		</DZTable>
	</div>
</template>

<script setup lang="ts">
import type { ForumTopicSummary } from '@dinorpg/core/models/forum/forum.js';

import { getImgURL } from '../../utils/getImgURL';
import DZTable from '../utils/DZTable.vue';
import { ForumService } from '../../services/index.ts';

import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const openingUnreadTopicId = ref<number | null>(null);

const { t } = useI18n();

const props = defineProps<{
	topics: ForumTopicSummary[];
}>();

function dateKey(value: string): string {
	const date = new Date(value);
	return [date.getFullYear(), date.getMonth(), date.getDate()].join('-');
}

function needsSection(topic: ForumTopicSummary, index: number): boolean {
	if (index === 0) {
		return true;
	}
	const previous = props.topics[index - 1];
	if (topic.isPinned !== previous.isPinned) {
		return true;
	}
	if (topic.isPinned) {
		return false;
	}
	return dateKey(topic.lastActivityAt) !== dateKey(previous.lastActivityAt);
}

function sectionLabel(topic: ForumTopicSummary): string {
	if (topic.isPinned) {
		return t('forum.table.postIt');
	}
	const date = new Date(topic.lastActivityAt);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

async function goToFirstUnread(topicId: number): Promise<void> {
	if (openingUnreadTopicId.value !== null) {
		return;
	}
	openingUnreadTopicId.value = topicId;
	try {
		const target = await ForumService.getFirstUnread(topicId);
		if (target.messageId === null || target.page === null) {
			await router.push({
				name: 'ForumTopic',
				params: {
					topicId
				}
			});
			return;
		}
		await router.push({
			name: 'ForumTopic',
			params: {
				topicId
			},
			query: {
				page: String(target.page)
			},
			hash: `#forum-message-${target.messageId}`
		});
	} finally {
		openingUnreadTopicId.value = null;
	}
}
</script>
