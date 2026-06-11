<template>
	<div v-if="hasAccess" class="wrapper">
		<div class="history-container" v-for="evt in history" :key="evt.id">
			<div class="history-header">
				<img :src="getImgURL('icons', 'small_edit')" alt="Fil de discussion" />
				<DZUser
					v-if="evt.authorId && evt.author.name"
					:user="{ id: evt.authorId, name: evt.author.name }"
					:leader="!!evt.author.leaderOf?.id"
				/>
				<div v-else class="author">{{ evt.author.name }}</div>
				<div class="date">{{ DateToString(evt.date) }}</div>
			</div>

			<div class="message">
				<p>{{ GetHistoryMessageFromType(evt.type, { msg: evt.authorMessage }) }}</p>
			</div>
		</div>
		<div class="switch-page-container">
			<div class="arrow-button">
				<img :src="getImgURL('icons', 'left')" alt="left" @click="changePage(-1)" v-if="page > 1" />
			</div>

			<p>{{ $t('clan.history.page') }} {{ page }} / {{ maxPage }}</p>

			<div class="arrow-button">
				<img :src="getImgURL('icons', 'right')" alt="right" @click="changePage(1)" v-if="history.length >= 20" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { ClanHistory } from '@dinorpg/core/models/clan/clanHistory.js';
import { ClanHistoryType } from '@dinorpg/core/models/enums/ClanHistoryType.js';
import { userStore } from '../../store/userStore.js';
import { ClanService } from '../../services/clan.service.js';
import { errorHandler } from '../../utils/errorHandler.js';
import DZUser from '../utils/DZUser.vue';

export default defineComponent({
	name: 'ClanHistory',
	computed: {
		ClanHistoryType() {
			return ClanHistoryType;
		}
	},
	components: { DZUser },
	data() {
		return {
			userStore: userStore(),
			hasAccess: false as boolean,
			history: {} as ClanHistory[],
			page: 1 as number,
			maxPage: 1 as number
		};
	},
	methods: {
		DateToString(date: Date): string {
			return new Date(date).toLocaleString('fr-FR', { timeZone: 'GMT' });
		},
		GetHistoryMessageFromType(type: ClanHistoryType, variables?: Record<string, any>) {
			if (variables) {
				return this.$t('clan.history.type.' + type, variables);
			}

			return this.$t('clan.history.type.' + type);
		},
		async getClanHistory(): Promise<void> {
			try {
				const { history, count } = await ClanService.getClanHistory(Number(this.$route.params.id), this.page);
				this.history = history;
				this.maxPage = Math.floor((count + 19) / 20);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async changePage(n: number) {
			this.page += n;
			await this.getClanHistory();
		}
	},
	mounted(): void {
		this.hasAccess = this.userStore.clanId == Number(this.$route.params.id);
		if (!this.hasAccess) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
	},
	async created() {
		await this.getClanHistory();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 15px;
	padding: 8px 0;
	.history-container {
		background-color: #fbd7a2;
		border-radius: 5px;
		padding: 5px;
		width: 100%;
		.history-header {
			display: flex;
			gap: 4px;
			align-items: center;
			.date {
				background-color: #bc683c;
				padding: 2px 8px;
				border-radius: 16px;
				color: #fff8ed;
				font-size: 12px;
			}
			.author {
				font-weight: bold;
				padding: 0 4px;
				&:hover {
					cursor: pointer;
					color: white;
				}
			}
		}
		.message {
			font-size: 14px;
			color: #bc683c;
		}
	}
}

.switch-page-container {
	width: 100%;
	display: flex;
	padding: 8px 16px;
	justify-content: center;
	align-items: center;
	gap: 16px;

	.arrow-button {
		width: 20px;
		height: 20px;

		&:hover {
			filter: brightness(120%);
			cursor: pointer;
		}
	}
}
</style>
