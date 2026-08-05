<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/components/message/Message.vue
  
  Copyright in the original contributions remains with the respective
  authors and contributors.
  
  Modified by DinoRPG Remastered contributors from 2026-04-17 through 2026-04-17.
  See NOTICE.md and the Git history for provenance and modification details.
  
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="container">
		<div class="sender">
			<DZUser :user="message.sender" />
			<div class="date">{{ formatDate(message.createdAt) }}</div>
		</div>

		<div class="message msg-content" v-html="formatMessage(message.content)" />
	</div>
</template>

<script lang="ts">
import type { ThreadMessage } from '@dinorpg/core/models/messaging/threadBasic.js';
import type { PropType } from 'vue';

import { defineComponent } from 'vue';
import DZUser from '../utils/DZUser.vue';
import { formatDateTime } from '../../utils/formatDate';
import { richFormatText } from '../../utils/richFormatText';

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
		formatMessage(value: string): string {
			return richFormatText(value.toString());
		},
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
		:deep(.spoiler) {
			background-color: #444;
			color: transparent;
			border-radius: 4px;
			transition:
				color 0.2s ease,
				background-color 0.2s ease;
			cursor: pointer;
		}
		:deep(.spoiler:hover),
		:deep(.spoiler:active) {
			color: inherit;
			background-color: rgba(0, 0, 0, 0.1);
		}
		:deep(code) {
			background-color: rgba(0, 0, 0, 0.1);
			color: #222;
			font-family: 'Cascadia Code', monospace;
			font-size: 1.2rem;
			padding: 2px 4px;
			border-radius: 4px;
		}
		:deep(pre) {
			background-color: #1e1e1e;
			color: #f8f8f2;
			padding: 8px;
			border-radius: 6px;
			overflow-x: auto;
			font-family: monospace;
		}
		:deep(pre code) {
			background: none;
			color: inherit;
			padding: 0;
		}
	}
}
</style>
