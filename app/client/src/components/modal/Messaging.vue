<template>
	<dialog ref="messageRef">
		<div class="modal">
			<div
				class="menu"
				:class="{
					leftShow: !threadSelected,
					leftHide: threadSelected
				}"
			>
				<div class="actions">
					<div class="title">
						<img :src="getImgURL('icons', 'small_browse_next')" />
						<p>{{ $t('modal.messagerie.actions') }}</p>
					</div>
					<div class="buttons">
						<div @click="create()" class="clickable">
							<img :src="getImgURL('icons', 'edit')" />
							<span>{{ $t('modal.messagerie.create') }}</span>
						</div>
						<div @click="toggleSearch()" class="clickable">
							<img :src="getImgURL('icons', 'search')" />
							<span>{{ $t('modal.messagerie.research') }}</span>
						</div>
					</div>
				</div>
				<div class="search">
					<div v-if="isSearchVisible">
						<div class="searchInput">
							<label for="conv_list_filter">
								<img :src="getImgURL('icons', 'search')" class="size-10" />
							</label>
							<input v-model="searchQuery" id="conv_list_filter" :placeholder="$t('modal.messagerie.search')" />
						</div>
					</div>
				</div>
				<div class="threads">
					<div class="title">
						<img :src="getImgURL('icons', 'thread')" />
						<span>{{ $t('modal.messagerie.conversations') }}</span>
					</div>
					<div
						v-for="thread in filteredThreads"
						:key="thread.id"
						class="thread"
						@click="selectThread(thread.id)"
						:class="{
							selected: thread.id === selectedThreadId
						}"
					>
						<p class="name">
							<img
								v-if="notifiedThreads.includes(thread.id) || thread.hasUnread"
								:src="getImgURL('icons', 'small_notif')"
							/>
							{{ thread.title }}
						</p>
						<div>
							<span>
								<b class="creator">{{ thread.createdBy?.name ?? $t('modal.messagerie.system') }}</b
								>, {{ thread.participants.length }} {{ $t('modal.messagerie.participants') }},
							</span>
							<span class="date">{{ formatDate(thread.updatedAt) }}</span>
						</div>
					</div>
				</div>
			</div>
			<div
				class="conversations"
				:class="{
					rightHide: !threadSelected,
					rightShow: threadSelected
				}"
			>
				<DZButton class="mobile" back @click="unselect()">Retour</DZButton>
				<DZDisclaimer help v-if="!threadSelected" content="modal.messagerie.disclaimer" />
				<div class="creationMode" v-if="creationMode">
					<div class="title">
						<p>{{ $t('modal.messagerie.newMsg') }}</p>
					</div>
					<div class="messageTitle">
						<label for="title">{{ $t('modal.messagerie.newMsgTitle') }}</label>
						<input type="text" id="title" v-model="newThread.title" :placeholder="$t('modal.messagerie.title')" />
					</div>
					<div
						class="search"
						v-if="!newThread.participants || (newThread.participants && newThread.participants.length < 9)"
					>
						<label for="user">{{ $t('modal.messagerie.newMsgParticipants') }}</label>
						<DZSearch
							background
							entityType="user"
							place-holder="modal.messagerie.addParticipants"
							@entity="participantThread"
						/>
					</div>
					<p v-else>{{ $t('toast.maxParticipantInThread') }}</p>
					<div class="participants">
						<template v-for="participant in newThread.participants" :key="participant.id">
							<DZUser :user="participant" />
						</template>
					</div>
					<div class="message">
						<label for="message">{{ $t('modal.messagerie.newMsgMessage') }}</label>
						<textarea id="message" v-model="newThread.message" :placeholder="$t('modal.messagerie.message')" />
					</div>
					<div class="send">
						<DZButton @click="sendMessage" :disabled="isSending">
							{{ $t('modal.messagerie.newMsgSend') }}
						</DZButton>
					</div>
				</div>
				<template v-if="!creationMode && selectedThreadId && threadSelected">
					<Thread :thread-id="selectedThreadId" />
				</template>
			</div>
		</div>

		<div class="close" @click="close()">X</div>
	</dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZDisclaimer from '../utils/DZDisclaimer.vue';
import DZUser from '../utils/DZUser.vue';
import DZButton from '../utils/DZButton.vue';
import DZSearch from '../utils/DZSearch.vue';
import Thread from '../messaging/Thread.vue';
import type { NewThread, ThreadsBasic } from '@dinorpg/core/models/messaging/threadBasic.js';
import { userStore } from '../../store/userStore';
import { MessagerieService } from '../../services/messaging.service';
import { errorHandler } from '../../utils/errorHandler';
import { formatDateTime } from '../../utils/formatDate';
import eventBus from '../../events';

export default defineComponent({
	name: 'Messagerie',
	components: { DZDisclaimer, DZUser, DZButton, Thread, DZSearch },
	data() {
		return {
			messageRef: null as HTMLDialogElement | null,
			threads: [] as ThreadsBasic[],
			creationMode: false,
			newThread: {} as NewThread,
			threadSelected: false,
			selectedThreadId: null as string | null,
			isSearchVisible: false,
			searchQuery: '',
			notifiedThreads: [] as string[],
			isSending: false,
			uStore: userStore()
		};
	},
	computed: {
		filteredThreads(): ThreadsBasic[] {
			if (!this.searchQuery) {
				return this.threads;
			}
			return this.threads.filter(thread => thread.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
		}
	},
	methods: {
		async open() {
			if (!this.uStore.canUseMessaging) {
				this.$toast.error(this.$t('messagerie.locked'));
				return;
			}
			try {
				this.threads = await MessagerieService.getThreads();
				if (this.messageRef && !this.messageRef.open) {
					this.messageRef.showModal();
				}
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		create() {
			this.creationMode = true;
			this.threadSelected = true;
			this.selectedThreadId = null;
			this.newThread = {
				title: '',
				message: '',
				participants: []
			};
		},
		unselect() {
			this.threadSelected = false;
			this.creationMode = false;
			this.selectedThreadId = null;
			this.newThread = {} as NewThread;
		},
		participantThread(p: { id: string; name: string }) {
			const participant = {
				id: p.id,
				name: p.name
			};
			if (!this.newThread.participants) {
				this.newThread.participants = [participant];
				return;
			}
			if (
				!this.newThread.participants.some(existing => existing.id === participant.id) &&
				this.newThread.participants.length < 9
			) {
				this.newThread.participants.push(participant);
			}
		},
		close() {
			if (this.messageRef?.open) {
				this.messageRef.close();
			}
			this.creationMode = false;
			this.threadSelected = false;
			this.selectedThreadId = null;
			this.isSearchVisible = false;
			this.newThread = {} as NewThread;
		},
		async selectThread(id: string) {
			this.creationMode = false;
			this.threadSelected = true;
			this.selectedThreadId = id;
			this.notifiedThreads = this.notifiedThreads.filter(threadId => threadId !== id);
		},
		formatDate(dateString: string) {
			return formatDateTime(dateString);
		},
		async sendMessage() {
			if (!this.newThread.message?.trim()) return;
			try {
				this.isSending = true;
				const participants = this.newThread.participants?.map(participant => participant.id);
				const newThread = await MessagerieService.createThread(
					participants,
					this.newThread.title,
					this.newThread.message
				);
				this.threads = [newThread, ...this.threads.filter(thread => thread.id !== newThread.id)];
				this.creationMode = false;
				this.selectedThreadId = newThread.id;
				this.threadSelected = true;
				this.newThread = {} as NewThread;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.isSending = false;
			}
		},
		toggleSearch() {
			this.isSearchVisible = !this.isSearchVisible;
		}
	},
	mounted() {
		this.messageRef = this.$refs.messageRef as HTMLDialogElement;
		//this.notifiedThreads = this.pStore.getNotifications.map(notification => notification.message);
		eventBus.on('message', async () => {
			await this.open();
		});
		eventBus.on('messageToPlayer', async (player: { name: string; id: string }) => {
			await this.open();
			if (!this.uStore.canUseMessaging) {
				return;
			}
			this.creationMode = true;
			this.threadSelected = true;
			this.newThread = {
				title: '',
				message: '',
				participants: [player]
			};
		});
	}
	/*watch: {
		'pStore.getNotifications': function () {
			this.notifiedThreads = this.pStore.getNotifications.map(notification => notification.message);
		}
	}*/
});
</script>

<style scoped lang="scss">
dialog {
	background-color: #fff0c5;
	border: 3px solid #cb7c49;
	color: #ffee92;
	max-height: 100%;
	max-width: 90%;
	min-width: 200px;
	outline: 2px solid #000;
	overflow: visible;
	padding: 0;
	width: auto;
	position: fixed;
	top: 2vh;
	bottom: 2vh;
	&::backdrop {
		background: linear-gradient(0deg, rgba(107, 32, 17, 0.2), rgba(107, 32, 17, 0.4) 70%, rgba(0, 0, 0, 0.7));
	}
}
.mobile {
	display: none;
}
.modal {
	display: flex;
	flex-direction: row;
	height: 93vh;
	.menu {
		display: flex;
		flex-direction: column;
		width: 30%;
		padding: 5px;
		gap: 15px;
		.actions {
			background-color: rgb(203 124 73);
			border-color: rgb(112 67 40);
			font-style: italic;
			border-style: solid;
			border-width: 2px;
			padding: 5px;
			.title {
				display: flex;
				background-color: rgb(174 97 57);
				align-items: center;
				gap: 0.75rem;
				padding: 4px;
			}
			.buttons {
				display: flex;
				flex-wrap: nowrap;
				padding: 4px;
				.clickable {
					display: flex;
					box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 3px;
					width: 50%;
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
		}
		.search {
			.searchInput {
				display: flex;
				align-items: center;
				gap: 6px;
				padding: 4px;
				input {
					width: 100%;
					border: none;
					background-color: #b05733;
					color: #ffee92;
					padding: 6px;
					outline: 1px solid transparent;
					&:focus {
						outline-color: #efdba8;
					}
				}
			}
		}
		.threads {
			display: flex;
			flex-direction: column;
			background-color: #cb7c49;
			border-color: #704328;
			border-style: solid;
			border-width: 2px;
			padding-bottom: 4px;
			overflow-y: auto;
			.title {
				display: flex;
				background-color: rgb(174 97 57);
				align-items: center;
				gap: 0.75rem;
				padding: 4px;
			}
			.thread {
				display: flex;
				padding-top: 8px;
				flex-direction: column;
				gap: 3px;
				cursor: pointer;
				transition:
					background-color 0.5s ease,
					box-shadow 0.5s ease;
				&:hover {
					background-color: hsla(0, 0%, 100%, 0.2);
					box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
				}
				&::after {
					content: ' ';
					border: 1px solid #b37c4a;
				}
				.name {
					padding-left: 3px;
					color: white;
					font-size: 17.6px;
					font-weight: 700;
					font-variant: all-petite-caps;
					overflow: hidden;
					white-space: nowrap;
					max-width: calc(100% - 50px);
					img {
						width: 16px;
						height: 16px;
					}
				}
				span {
					padding-left: 3px;
					font-size: 11px;
				}
				.creator {
					color: white;
					margin-right: -3px;
				}
				.date {
					opacity: 0.6;
				}
			}
			.selected {
				background-color: #e6b479;
				.creator,
				span,
				.name {
					color: #7e4d2a;
				}
			}
		}
	}
	.conversations {
		width: 70%;
		padding: 5px;
		scrollbar-width: thin;
		scrollbar-color: rgb(112, 67, 40) rgb(203, 124, 73);
		display: flex;
		flex-direction: column;
		gap: 15px;
		.creationMode {
			display: flex;
			flex-direction: column;
			gap: 15px;
			background-color: #cb7c49;
			padding: 4px;
			.title {
				display: flex;
				background-color: rgb(174 97 57);
				align-items: center;
				gap: 0.75rem;
				padding: 4px;
				box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
			}
			.messageTitle {
				display: flex;
				label {
					width: 25%;
				}
				input {
					background-color: #b05733;
					outline: 1px solid transparent;
					color: #ffee92;
					font-weight: 400;
					font-size: 16px;
					outline-offset: 2px;
					width: auto;
					border: none;
					padding-left: 4px;
					&:focus {
						transition: outline-color 0.5s;
						outline-color: #efdba8;
					}
				}
			}
			.search {
				display: flex;
				label {
					width: 25%;
				}
			}
			.participants {
				display: flex;
				justify-content: center;
				width: 100%;
				gap: 3px;
				flex-wrap: wrap;
			}
			.message {
				display: flex;
				flex-direction: column;
				gap: 10px;
				label {
					width: 25%;
				}
				textarea {
					background-color: #b05733;
					outline: 1px solid transparent;
					color: #ffee92;
					font-weight: 400;
					font-size: 16px;
					outline-offset: 2px;
					width: 100%;
					min-height: 140px;
					border: none;
					padding-left: 4px;
					&:focus {
						transition: outline-color 0.5s;
						outline-color: #efdba8;
					}
				}
			}
			.send {
				display: flex;
				justify-content: end;
			}
		}
	}
}
.close {
	top: 0;
	right: 0;
	position: absolute;
	color: rgb(185 28 28);
	background-color: rgb(254 215 170);
	border-color: rgb(239 68 68);
	border-width: 2px;
	border-style: solid;
	cursor: pointer;
	padding: 0.25rem 0.75rem;
	font-weight: 800;
	&:hover {
		filter: brightness(120%);
	}
}
@media (max-width: 539px) {
	.mobile {
		display: inherit;
		width: 80%;
		align-self: center;
	}
	label {
		width: 40%;
	}
	.modal {
		.conversations {
			.creationMode {
				.messageTitle label,
				.search label {
					width: 40%;
				}
			}
		}
		.leftShow {
			width: 100%;
			transition: transform 0.3s ease-out;
			transform: translateX(0%);
		}
		.leftHide {
			transform: translateX(-100%);
			width: 0;
			opacity: 0;
			padding: 0;
		}
		.rightShow {
			width: 100%;
			display: flex;
			transition: transform 0.3s ease-out;
			transform: translateX(0%);
		}
		.rightHide {
			transform: translateX(100%);
			opacity: 0;
			width: 0%;
			padding: 0;
		}
	}
}
</style>
