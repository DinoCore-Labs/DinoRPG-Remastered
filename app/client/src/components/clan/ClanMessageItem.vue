<template>
	<div class="message-item">
		<div class="message-header">
			<div class="author-info">
				<img v-if="author.avatarUrl" :src="author.avatarUrl" alt="avatar" class="avatar" />

				<DZUser :user="{ id: author.id, name: author.name }" :leader="isLeader" :me="isSelf" />
			</div>

			<div class="message-actions">
				<span class="date">{{ dateToString(date) }}</span>
				<img
					v-if="canDelete"
					:src="getImgURL('icons', 'small_delete')"
					alt="delete"
					class="delete-btn"
					@click="$emit('delete')"
					v-tippy="{
						content: formatContent($t('clan.discussion.delete')),
						theme: 'small'
					}"
				/>
			</div>
		</div>

		<div class="message-body" v-html="contentHtml"></div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import DZUser from '../utils/DZUser.vue';
import type { ClanMessageAuthor } from '@dinorpg/core/models/clan/clanMessage.js';

export default defineComponent({
	name: 'ClanMessageItem',
	components: { DZUser },
	emits: ['delete'],
	props: {
		author: {
			type: Object as PropType<ClanMessageAuthor>,
			required: true
		},
		isLeader: {
			type: Boolean,
			default: false
		},
		isSelf: {
			type: Boolean,
			default: false
		},
		contentHtml: {
			type: String,
			required: true
		},
		date: {
			type: [Date, String],
			required: true
		},
		canDelete: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		dateToString(date: Date | string): string {
			return new Date(date).toLocaleString('fr-FR', { timeZone: 'GMT' });
		}
	}
});
</script>

<style lang="scss" scoped>
.message-item {
	position: relative;
	background: #f6d19a;
	color: #1b140c;
	border: 1px solid #d7c3a0;
	border-radius: 9px 9px 2px 2px;
	display: grid;
	margin-bottom: 20px;
	.message-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 64px;
		background: #b15f25;
		background: linear-gradient(270deg, #b15f25 0%, #9f5621 40%, #96501f 80%);
		background: -webkit-linear-gradient(270deg, #b15f25 0%, #9f5621 40%, #96501f 80%);
		background: -moz-linear-gradient(270deg, #b15f25 0%, #9f5621 40%, #96501f 80%);
		border-radius: 8px;
		padding-left: 8px;
		padding-right: 8px;
		-webkit-box-shadow: 1px 5px 3px -4px #171717;
		box-shadow: 1px 5px 3px -4px #171717;
		.author-info {
			display: flex;
			align-items: center;
			gap: 6px;
			flex-wrap: wrap;
			.avatar {
				width: 56px;
				height: 56px;
				border-radius: 4px;
				object-fit: cover;
				border: 1px solid #bc683c;
			}
			.top-item {
				font-size: 11px;
				color: #7a4a20;
				background-color: #f5c98a;
				padding: 1px 6px;
				border-radius: 10px;
			}
		}
		.message-actions {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-shrink: 0;
			.date {
				background-color: #bc683c;
				padding: 2px 8px;
				border-radius: 16px;
				color: #fff8ed;
				font-size: 11px;
				white-space: nowrap;
			}
			.delete-btn {
				width: 16px;
				height: 16px;
				cursor: pointer;
				opacity: 0.75;
				transition: opacity 0.15s;
				&:hover {
					opacity: 1;
					filter: brightness(1.3);
				}
			}
		}
	}
	.message-body {
		-webkit-box-shadow: 1px 5px 3px -4px #949494;
		box-shadow: 1px 5px 3px -4px #949494;
		padding: 14px 8px 8px 8px;
		color: #33464c;
		a {
			color: #0645ad;
			text-decoration: underline;
		}
		:deep(ul),
		:deep(ol) {
			padding-left: 1.5em;
			margin: 0.5em 0;
			list-style: revert;
		}
		:deep(li) {
			display: list-item;
		}
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
