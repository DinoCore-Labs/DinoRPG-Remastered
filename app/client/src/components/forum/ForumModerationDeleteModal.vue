<template>
	<div class="forum-moderation-modal" @click.self="$emit('close')">
		<div class="forum-moderation-modal__box">
			<h3>
				{{ $t('forum.moderation.deleteTitle') }}
			</h3>
			<p>
				{{
					$t('forum.moderation.deleteDescription', {
						name: authorName
					})
				}}
			</p>
			<textarea v-model="reason" maxlength="500" :placeholder="$t('forum.moderation.reasonPlaceholder')"></textarea>
			<div class="forum-moderation-modal__actions">
				<DZButton size="small" @click="$emit('close')">
					{{ $t('forum.actions.cancel') }}
				</DZButton>
				<DZButton size="small" :disabled="!reason.trim() || loading" @click="$emit('confirm', reason.trim())">
					{{ $t('forum.moderation.delete') }}
				</DZButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import DZButton from '../utils/DZButton.vue';

defineProps<{
	authorName: string;
	loading: boolean;
}>();

defineEmits<{
	close: [];
	confirm: [reason: string];
}>();

const reason = ref('');
</script>
