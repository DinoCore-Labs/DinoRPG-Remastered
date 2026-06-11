<template>
	<div class="page">
		<h3>{{ editMode ? $t('clan.clanPages.creation.edit') : $t('clan.clanPages.creation.new') }}</h3>
		<div class="box">
			<div class="middle-content">
				<div class="grid">
					<p>{{ $t('clan.clanPages.creation.title') }}</p>
					<DZInput v-model="page.name" />

					<p>{{ $t('clan.clanPages.creation.content') }}</p>
					<textarea class="dz-golden-box no-shadow" type="text" v-model="page.content"></textarea>

					<p>{{ $t('clan.clanPages.creation.public') }}</p>
					<input class="public" type="checkbox" v-model="page.public" :disabled="page.home" />
				</div>
			</div>
		</div>
		<div class="df">
			<a class="button" @click="createClanPage()" v-if="!editMode">{{ $t('clan.clanPages.creation.action.create') }}</a>
			<a class="button" @click="updateClanPage()" v-if="editMode">{{ $t('clan.clanPages.creation.action.edit') }}</a>
			<a class="button" @click="cancel()">{{ $t('clan.clanPages.creation.action.cancel') }}</a>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanService } from '../../services/clan.service.js';
import { errorHandler } from '../../utils/errorHandler.js';
import type { ClanPage } from '@dinorpg/core/models/clan/clanPage.js';
import DZInput from '../utils/DZInput.vue';

export default defineComponent({
	name: 'ClanCreatePage',
	components: {
		DZInput
	},
	data() {
		return {
			page: {
				name: '',
				content: '',
				public: false
			} as ClanPage,
			editMode: false as boolean
		};
	},
	methods: {
		async createClanPage() {
			try {
				const page = await ClanService.createClanPage(
					this.page.name,
					this.page.content,
					this.page.public,
					Number(this.$route.params.id)
				);

				this.$router.push({ name: 'ClanPage', params: { pageId: page.id } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async updateClanPage() {
			try {
				await ClanService.updateClanPage(
					Number(this.$route.params.pageId),
					this.page.name,
					this.page.content,
					this.page.public,
					Number(this.$route.params.id)
				);

				this.$router.push({ name: 'ClanPage', params: { pageId: Number(this.$route.params.pageId) } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		cancel() {
			if (this.editMode) {
				this.$router.push({ name: 'ClanPage', params: { pageId: Number(this.$route.params.pageId) } });
			} else {
				this.$router.push({ name: 'Clan', params: { id: Number(this.$route.params.id) } });
			}
		}
	},
	async mounted() {
		this.editMode = this.$route.name == 'ClanEditPage';
		if (this.editMode) {
			try {
				this.page = await ClanService.getClanPage(Number(this.$route.params.pageId));
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.page {
	padding: 10px;

	h3 {
		font-variant-caps: small-caps;
		font-weight: 400;
		color: #e4aa69;
		margin-bottom: 8px;
	}

	.grid {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 8px;
		align-items: stretch;

		p {
			font-variant: normal;
			font-weight: bold;
			font-size: 8pt;
			color: #ffee92;
			text-align: center;
			background-color: #e4aa69;
			border-radius: 10px;
			-webkit-border-radius: 10px;
		}

		textarea {
			padding: 4px 8px;
			color: #ffee92;
			font-size: 9pt;
			font-weight: bold;
			height: 100px;
			resize: vertical;
		}
	}

	.df {
		margin-top: 8px;
		gap: 4px;
	}
}
</style>
