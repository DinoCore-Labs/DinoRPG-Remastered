<template>
	<div class="new-message-container" v-if="hasAccess">
		<template v-if="!showEditor">
			<div class="button-land">
				<DZButton class="button" @click="showEditor = !showEditor">{{ t('clan.discussion.action.create') }}</DZButton>
			</div>
		</template>

		<template v-if="showEditor">
			<div>
				<RichTextEditor ref="editorRef" v-model="newMessage" />
			</div>
			<div class="button-land">
				<DZButton class="button" @click="submitMessage()">{{ t('clan.discussion.action.send') }}</DZButton>
			</div>
		</template>
	</div>

	<div class="page-content" v-if="hasAccess">
		<div class="discussion" v-if="messages">
			<ClanMessageItem
				v-for="msg in messages"
				:key="msg.id"
				:author="msg.author ?? { id: '', name: 'Deleted' }"
				:isLeader="isLeader(msg)"
				:contentHtml="richFormatText(msg.content)"
				:date="msg.date"
				:isSelf="isSelf(msg)"
				:canDelete="canDeleteMessage(msg)"
				@delete="deleteMessage(msg)"
			/>
		</div>

		<div class="switch-page-container" v-if="maxPage > 1">
			<div class="arrow-button">
				<img src="/src/assets/icons/left.webp" alt="left" @click="changePage(-1)" v-if="page > 1" />
			</div>

			<p>{{ t('clan.discussion.pagination.page') }} {{ page }} / {{ maxPage }}</p>

			<div class="arrow-button">
				<img
					src="/src/assets/icons/right.webp"
					alt="right"
					@click="changePage(1)"
					v-if="messages.length >= 20 && page < maxPage"
				/>
			</div>
		</div>
		<div class="page-selector" v-if="maxPage > 1">
			<p>{{ t('clan.discussion.pagination.go_to') }}</p>
			<DZInput type="number" v-model="pageSelector" />
			<DZButton @click="goToSelectedPage()">Go !</DZButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import type { ClanMessage } from '@dinorpg/core/models/clan/clanMessage.js';
import { ClanService } from '../../services/clan.service.ts';
import { userStore } from '../../store/userStore';
import { errorHandler } from '../../utils/errorHandler';
import RichTextEditor from '../richTextEditor/RichTextEditor.vue';
import type { ToastPluginApi } from 'vue-toast-notification';
import type { ClanLite } from '@dinorpg/core/models/clan/clan.js';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';

import ClanMessageItem from './ClanMessageItem.vue';
import DZInput from '../utils/DZInput.vue';
import DZButton from '../utils/DZButton.vue';
import { richFormatText } from '../../utils/richFormatText';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const instance = getCurrentInstance();

const store = userStore();

const hasAccess = ref<boolean>(false);
const clanLeaderId = ref<string | null>(null);
const messages = ref<ClanMessage[]>([]);
const page = ref<number>(1);
const maxPage = ref<number>(1);
const pageSelector = ref<number>(1);
const newMessage = ref<string>('');
const showEditor = ref<boolean>(false);
const editorRef = useTemplateRef<InstanceType<typeof RichTextEditor>>('editorRef');
const hasDeleteRight = ref<boolean>(false);

function isLeader(msg: ClanMessage): boolean {
	return msg.author?.id === clanLeaderId.value;
}

function isSelf(msg: ClanMessage): boolean {
	return msg.author?.id === store.id;
}

function canDeleteMessage(msg: ClanMessage): boolean {
	return msg.author?.id === store.id || hasDeleteRight.value;
}

async function submitMessage(): Promise<void> {
	editorRef.value?.confirm();
	await createNewMessage();
}

async function createNewMessage(): Promise<void> {
	if (!hasAccess.value || !newMessage.value.trim()) return;
	try {
		await ClanService.createClanMessage(Number(route.params.id), newMessage.value);
		newMessage.value = '';
		showEditor.value = false;
		page.value = 1;
		await getClanMessages();
	} catch (err) {
		console.error(err);
		errorHandler.handle(err as Error, instance?.proxy?.$toast ?? ({} as ToastPluginApi));
	}
}

async function deleteMessage(msg: ClanMessage): Promise<void> {
	if (!canDeleteMessage(msg)) return;
	const res = await instance?.proxy?.$confirm({
		message: t('popup.confirm'),
		header: t('popup.attention'),
		acceptLabel: t('popup.accept'),
		rejectLabel: t('popup.reject')
	});
	if (!res) return;
	try {
		await ClanService.deleteClanMessage(Number(route.params.id), msg.id);
		await getClanMessages();
	} catch (err) {
		console.error(err);
		errorHandler.handle(err as Error, instance?.proxy?.$toast ?? ({} as ToastPluginApi));
	}
}

async function getClanMessages(): Promise<void> {
	const clanId = Number(route.params.id);
	messages.value = await ClanService.getClanMessages(clanId, page.value);
	const messagesCount = await ClanService.getClanMessagesCount(clanId);
	maxPage.value = Math.max(1, Math.floor((messagesCount.count + 19) / 20));
}

async function changePage(n: number) {
	page.value += n;
	await getClanMessages();
}

async function goToSelectedPage() {
	if (pageSelector.value <= maxPage.value && pageSelector.value > 0) {
		page.value = pageSelector.value;
		await getClanMessages();
	}
}

onMounted(async () => {
	hasAccess.value = store.clanId === Number(route.params.id);
	if (!hasAccess.value) {
		router.push({ name: 'Clan', params: { id: route.params.id } });
		return;
	}

	try {
		const clanId = Number(route.params.id);
		const clan: ClanLite = await ClanService.getClan(clanId);
		clanLeaderId.value = clan.leader.id ?? null;
		hasDeleteRight.value = await ClanService.getPlayerHasRight(clanId, ClanMemberRight.DISCUSSION_DELETE_MESSAGE);
		await getClanMessages();
	} catch (err) {
		console.error(err);
		errorHandler.handle(err as Error, instance?.proxy?.$toast ?? ({} as ToastPluginApi));
	}
});
</script>

<style lang="scss" scoped>
.new-message-container {
	padding: 10px 0;
	display: flex;
	gap: 16px;
	margin: 0 16px;
	flex-direction: column;
	.button-land {
		display: flex;
		justify-content: flex-end;
	}
}
.discussion {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-bottom: 16px;
	padding-left: 16px;
	padding-right: 16px;
}
.switch-page-container {
	display: flex;
	padding: 8px 16px;
	justify-content: center;
	align-items: center;
	gap: 16px;
	.arrow-button {
		width: 20px;
		height: 20px;
		img {
			width: 100%;
			height: 100%;
		}
		&:hover {
			filter: brightness(120%);
			cursor: pointer;
		}
	}
}
.page-selector {
	display: flex;
	padding: 8px 16px;
	justify-content: center;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	input {
		width: 35px;
		font-size: 12px;
	}
}
</style>
