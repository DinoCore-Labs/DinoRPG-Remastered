<template>
	<div class="container">
		<div class="sender">
			<DZUser :user="message.sender" />
			<div class="date">{{ formatDate(message.createdAt) }}</div>
		</div>

		<div class="message msg-content" v-html="message.content" />
	</div>
</template>

<script lang="ts">
import type { ThreadMessage } from '@dinorpg/core/models/messaging/threadBasic.js';
import type { PropType } from 'vue';

import { defineComponent } from 'vue';
import DZUser from '../utils/DZUser.vue';
import { formatDateTime } from '../../utils/formatDate';

export default defineComponent({
	name: 'Message',
	components: { DZUser },
	props: {
		message: {
			type: Object as PropType<ThreadMessage>,
			required: true
		}
	},
	methods: {
		formatDate(dateString: string) {
			return formatDateTime(dateString);
		}
	}
});
</script>

<style scoped lang="scss">
.container {
	display: flex;
	flex-direction: column;
	background-color: rgb(203 124 73);
	border-color: rgb(112 67 40);
	border-style: solid;
	border-width: 2px;
	.sender {
		display: flex;
		background-color: rgb(174 97 57);
		align-items: center;
		gap: 0.75rem;
		padding: 4px;
		justify-content: space-between;
		.date {
			font-size: 1rem;
			line-height: 1.75rem;
		}
	}
	.message {
		padding: 5px;
		font-feature-settings: normal;
		font-size: 16px;
		font-variation-settings: normal;
		word-break: break-word;
	}
}
</style>
