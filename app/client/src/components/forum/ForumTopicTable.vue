<template>
	<div class="forum-table-wrap">
		<table class="forum-topic-table">
			<thead>
				<tr>
					<th>Sujet</th>
					<th>Auteur</th>
					<th>Réponses</th>
				</tr>
			</thead>
			<tbody>
				<template v-for="(topic, index) in topics" :key="topic.id">
					<tr v-if="needsSection(topic, index)" class="forum-section-row">
						<td colspan="3">
							{{ sectionLabel(topic) }}
						</td>
					</tr>
					<tr class="forum-topic-row">
						<td>
							<span v-if="topic.isPinned" class="forum-pin" title="Post-It"> ◆ </span>
							<span v-if="topic.isClosed" class="forum-lock" title="Sujet fermé" aria-label="Sujet fermé"> 🔒 </span>
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
						<td>
							{{ topic.authorName }}
						</td>
						<td>
							{{ topic.replyCount }}
						</td>
					</tr>
				</template>
				<tr v-if="topics.length === 0" class="forum-empty-row">
					<td colspan="3">Aucun sujet pour le moment.</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
import type { ForumTopicSummary } from '@dinorpg/core/models/forum/forum.js';

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

	/*
	 * Les Post-It restent tous dans
	 * une section unique.
	 */
	if (topic.isPinned) {
		return false;
	}

	return dateKey(topic.lastActivityAt) !== dateKey(previous.lastActivityAt);
}

function sectionLabel(topic: ForumTopicSummary): string {
	if (topic.isPinned) {
		return 'POST-IT';
	}

	return new Intl.DateTimeFormat('fr-FR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(new Date(topic.lastActivityAt));
}
</script>
