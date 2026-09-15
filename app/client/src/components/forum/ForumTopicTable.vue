<template>
	<div class="forum-table-wrap">
		<DZTable class="forum-topic-table">
			<tr class="forum-topic-table__header">
				<th>Sujet</th>
				<th>Auteur</th>
				<th>Réponses</th>
			</tr>
			<template v-for="(topic, index) in topics" :key="topic.id">
				<tr v-if="needsSection(topic, index)" class="forum-section-row">
					<td colspan="3" class="subtitle">
						{{ sectionLabel(topic) }}
					</td>
				</tr>
				<tr class="forum-topic-row">
					<td class="forum-topic-subject">
						<img
							v-if="topic.isPinned"
							class="forum-topic-state-icon forum-topic-state-icon--pin"
							:src="getImgURL('icons', 'pin')"
							alt=""
							title="Post-It"
						/>
						<img
							v-if="topic.isClosed"
							class="forum-topic-state-icon"
							:src="getImgURL('icons', 'small_lock')"
							alt="Sujet fermé"
							title="Sujet fermé"
						/>
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
						{{ topic.authorName }}
					</td>
					<td class="forum-topic-replies">
						{{ topic.replyCount }}
					</td>
				</tr>
			</template>
			<tr v-if="topics.length === 0" class="forum-empty-row">
				<td colspan="3">Aucun sujet pour le moment.</td>
			</tr>
		</DZTable>
	</div>
</template>

<script setup lang="ts">
import type { ForumTopicSummary } from '@dinorpg/core/models/forum/forum.js';

import { getImgURL } from '../../utils/getImgURL';
import DZTable from '../utils/DZTable.vue';

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
		return 'POST-IT';
	}
	const date = new Date(topic.lastActivityAt);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
</script>
