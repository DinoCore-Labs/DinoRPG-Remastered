<template>
	<div id="threadPannel">
		<div class="title">
			<img :src="getImgURL('icons', 'small_browse_next')" />
			<p>{{ $t('modal.messagerie.conversation') }}</p>
		</div>
		<div class="buttons">
			<div class="clickable" @click="refresh()">
				<img :src="getImgURL('icons', 'refresh')" />
				<p>{{ $t('modal.messagerie.actualizeThread') }}</p>
			</div>
			<div @click="answerMsg()" class="clickable">
				<img :src="getImgURL('icons', 'edit')" />
				<p>{{ $t('modal.messagerie.responseConv') }}</p>
			</div>
			<div class="clickable" @click="showParticipants = !showParticipants">
				<img :src="getImgURL('icons', 'player')" />
				<p>{{ $t('modal.messagerie.participantsConv') }}</p>
			</div>
		</div>
		<div id="participants" v-if="showParticipants && myThread">
			<DZUser v-for="participant in myThread.participants" :user="participant.player" :key="participant.id" />
		</div>
	</div>
	<div v-if="answerMode" class="answer">
		<RichTextEditor v-model="answer" @send="sendMessageFromEditor" />
	</div>
	<div v-if="myThread && myThread.pinnedMessage">
		<Message :message="myThread.pinnedMessage" />
	</div>
	<div id="conversation" ref="conversationRef" v-if="myThread" @scroll="onScroll">
		<Message v-for="message in myThread.messages" :key="message.id" :message="message" />
	</div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import DZUser from '../utils/DZUser.vue';
import DZButton from '../utils/DZButton.vue';
import Message from './Message.vue';
import RichTextEditor from '../richTextEditor/RichTextEditor.vue';
import { localStore } from '../../store/localStore';
import type { FullThread } from '@dinorpg/core/models/messaging/threadBasic.js';
import { MessagerieService } from '../../services/messaging.service';
import { errorHandler } from '../../utils/errorHandler';

export default defineComponent({
	name: 'Thread',
	props: {
		threadId: { type: String, required: true }
	},
	components: { DZUser, Message, DZButton, RichTextEditor },
	data() {
		return {
			answerMode: false,
			localStore: localStore(),
			answer: '',
			myThread: undefined as FullThread | undefined,
			currentThreadPage: 1,
			showParticipants: false,
			isLoadingOlder: false,
			hasMoreMessages: true,
			isSending: false
		};
	},
	methods: {
		answerMsg() {
			this.answerMode = true;
		},
		async scrollToBottom() {
			await nextTick();
			const conversationRef = this.$refs.conversationRef as HTMLDivElement | undefined;
			if (conversationRef) {
				conversationRef.scrollTop = conversationRef.scrollHeight;
			}
		},
		async refresh() {
			try {
				this.currentThreadPage = 1;
				this.hasMoreMessages = true;
				this.myThread = await MessagerieService.getThread(this.threadId);
				this.$emit('thread-read');
				await this.scrollToBottom();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async sendMessageFromEditor(content: string) {
			await this.sendMessage(content);
		},
		async sendMessage(content?: string) {
			const messageToSend = (content ?? this.answer).trim();
			if (!messageToSend || !this.myThread) return;
			try {
				this.isSending = true;
				this.myThread = await MessagerieService.answerThread(this.myThread.id, messageToSend);
				this.answer = '';
				this.answerMode = false;
				this.currentThreadPage = 1;
				this.hasMoreMessages = true;
				await this.scrollToBottom();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.isSending = false;
			}
		},
		async onScroll(event: Event) {
			const target = event.target as HTMLDivElement;
			if (!this.myThread || this.isLoadingOlder || !this.hasMoreMessages) {
				return;
			}
			if (target.scrollTop > 20) {
				return;
			}
			try {
				this.isLoadingOlder = true;
				const previousHeight = target.scrollHeight;
				const nextPage = this.currentThreadPage + 1;
				const olderMessages = await MessagerieService.loadMessages(this.myThread.id, nextPage);
				if (olderMessages.messages.length === 0) {
					this.hasMoreMessages = false;
					return;
				}
				this.currentThreadPage = nextPage;
				this.hasMoreMessages = olderMessages.hasMore;
				this.myThread.messages = [...olderMessages.messages, ...this.myThread.messages];
				await nextTick();
				const newHeight = target.scrollHeight;
				target.scrollTop = newHeight - previousHeight;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.isLoadingOlder = false;
			}
		}
	},
	emits: ['thread-read'],
	watch: {
		async threadId() {
			this.currentThreadPage = 1;
			this.hasMoreMessages = true;
			this.myThread = undefined;
			try {
				this.myThread = await MessagerieService.getThread(this.threadId);
				this.$emit('thread-read');
				await this.scrollToBottom();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {
		try {
			this.myThread = await MessagerieService.getThread(this.threadId);
			this.$emit('thread-read');
			await this.scrollToBottom();
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style scoped lang="scss">
#threadPannel {
	display: flex;
	flex-direction: column;
	background-color: rgb(203 124 73);
	border-color: rgb(112 67 40);
	font-style: italic;
	border-style: solid;
	border-width: 2px;
	.title {
		display: flex;
		background-color: rgb(174 97 57);
		align-items: center;
		gap: 0.75rem;
		padding: 4px;
		max-width: calc(100% - 8px);
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		padding: 4px;
		gap: 5px;
		.clickable {
			display: flex;
			box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 3px;
			text-align: center;
			gap: 0.5rem;
			align-items: center;
			cursor: pointer;
			padding: 6px;
			&:hover {
				background-color: rgb(174 97 57);
			}
		}
	}
	#participants {
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
	}
}
.answer {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	background-color: #cb7c49;
	border-color: #704328;
	border-style: solid;
	border-width: 2px;
}
#conversation {
	display: flex;
	flex-direction: column;
	gap: 5px;
	overflow-y: auto;
	min-height: 0;
}
</style>
