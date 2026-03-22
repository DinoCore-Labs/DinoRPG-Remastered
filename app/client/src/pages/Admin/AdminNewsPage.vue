<template>
	<TitleHeader :title="$t('pageTitle.admin')" header="News" />

	<div class="card">
		<div class="card-header">
			<h3>News</h3>
			<RouterLink to="/admin/news/create">
				<DZButton type="button">Créer une news</DZButton>
			</RouterLink>
		</div>

		<p v-if="loading">Chargement...</p>
		<p v-else-if="error" class="red">{{ error }}</p>

		<ul v-else-if="newsList.length" class="news-list">
			<li v-for="news in newsList" :key="news.id">
				<div class="news-main">
					<strong>#{{ news.id }}</strong>
					<span>{{ getMainTitle(news) }}</span>
					<span>({{ news.type }})</span>
					<span>{{ news.isPublished ? 'Publiée' : 'Brouillon' }}</span>
				</div>

				<RouterLink :to="`/admin/news/${news.id}`">
					<DZButton type="button">Éditer</DZButton>
				</RouterLink>
				<DZButton type="button" @click="handleDelete(news.id)">Supprimer</DZButton>
			</li>
		</ul>

		<p v-else>Aucune news.</p>
	</div>
</template>

<script lang="ts">
import type { AdminNewsListItem } from '@dinorpg/core/models/news/news.js';
import { defineComponent } from 'vue';

import DZButton from '../../components/utils/DZButton.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { AdminNewsService } from '../../services/adminNews.service';
import { errorHandler } from '../../utils/errorHandler';

export default defineComponent({
	name: 'AdminNewsPage',
	components: {
		TitleHeader,
		DZButton
	},
	data() {
		return {
			loading: false,
			error: '',
			newsList: [] as AdminNewsListItem[]
		};
	},
	methods: {
		getMainTitle(news: AdminNewsListItem): string {
			return news.translations.find(t => t.lang === 'FR')?.title ?? news.translations[0]?.title ?? 'Sans titre';
		},
		async loadNews() {
			try {
				this.loading = true;
				this.error = '';
				this.newsList = await AdminNewsService.getAdminNewsList();
			} catch (err) {
				this.error = 'Impossible de charger les news.';
				errorHandler.handle(err, this.$toast);
			} finally {
				this.loading = false;
			}
		},
		async handleDelete(id: number) {
			const confirmed = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (!confirmed) return;
			try {
				await AdminNewsService.deleteNews(id);
				this.$toast.open({
					message: this.$t('adminPage.news.deleteSuccess') as string,
					type: 'success'
				});
				await this.loadNews();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		}
	},
	async mounted() {
		await this.loadNews();
	}
});
</script>
