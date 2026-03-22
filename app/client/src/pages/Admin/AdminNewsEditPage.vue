<template>
	<TitleHeader :title="$t('pageTitle.admin')" :header="isEdit ? 'Modifier une news' : 'Créer une news'" />

	<p v-if="loading">Chargement...</p>
	<p v-else-if="error" class="red">{{ error }}</p>

	<AdminNewsForm
		v-else
		:model-value="form"
		:loading="saving"
		:has-current-image="hasCurrentImage"
		:is-edit="isEdit"
		@update:model-value="form = $event"
		@submit="handleSubmit"
	/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { DetailedNews } from '@dinorpg/core/models/news/news.js';
import { Language } from '@dinorpg/core/models/config/language.js';
import { NewsType } from '@dinorpg/core/models/news/news.js';
import type { AdminNewsPayload } from '@dinorpg/core/models/admin/adminNewsPayload.js';

import TitleHeader from '../../components/utils/TitleHeader.vue';
import AdminNewsForm from '../../components/admin/news/AdminNewsForm.vue';
import { AdminNewsService } from '../../services/adminNews.service';
import { errorHandler } from '../../utils/errorHandler';

function createDefaultForm() {
	return {
		slug: '',
		type: NewsType.UPDATE,
		isPublished: false,
		publishedAt: '',
		removeImage: false,
		translations: [
			{ lang: Language.FR, title: '', excerpt: '', content: '' },
			{ lang: Language.EN, title: '', excerpt: '', content: '' },
			{ lang: Language.ES, title: '', excerpt: '', content: '' },
			{ lang: Language.DE, title: '', excerpt: '', content: '' }
		],
		pollEnabled: false,
		poll: {
			isActive: true,
			endAt: '',
			options: [
				{
					sortOrder: 0,
					translations: [
						{ lang: Language.FR, label: '' },
						{ lang: Language.EN, label: '' },
						{ lang: Language.ES, label: '' },
						{ lang: Language.DE, label: '' }
					]
				},
				{
					sortOrder: 1,
					translations: [
						{ lang: Language.FR, label: '' },
						{ lang: Language.EN, label: '' },
						{ lang: Language.ES, label: '' },
						{ lang: Language.DE, label: '' }
					]
				}
			]
		}
	};
}

export default defineComponent({
	name: 'AdminNewsEditPage',
	components: {
		TitleHeader,
		AdminNewsForm
	},
	data() {
		return {
			loading: false,
			saving: false,
			error: '',
			form: createDefaultForm(),
			imageFile: null as File | null,
			hasCurrentImage: false
		};
	},
	computed: {
		newsId(): number | null {
			const value = Number(this.$route.params.id);
			return Number.isFinite(value) ? value : null;
		},
		isEdit(): boolean {
			return this.newsId !== null;
		}
	},
	methods: {
		mapNewsToForm(news: DetailedNews) {
			const form = createDefaultForm();

			form.slug = news.slug;
			form.type = news.type;
			form.isPublished = news.isPublished;
			form.publishedAt = news.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 16) : '';

			for (const translation of news.translations) {
				const current = form.translations.find(t => t.lang === translation.lang);
				if (!current) continue;

				current.title = translation.title;
				current.excerpt = translation.excerpt ?? '';
				current.content = translation.content;
			}

			if (news.poll) {
				form.pollEnabled = true;
				form.poll.isActive = news.poll.isActive;
				form.poll.endAt = new Date(news.poll.endAt).toISOString().slice(0, 16);
				form.poll.options = news.poll.options.map(option => ({
					sortOrder: option.sortOrder,
					translations: option.translations.map(translation => ({
						lang: translation.lang,
						label: translation.label
					}))
				}));
			}

			return form;
		},

		buildPayload(): AdminNewsPayload {
			return {
				slug: this.form.slug,
				type: this.form.type,
				isPublished: this.form.isPublished,
				publishedAt: this.form.publishedAt ? new Date(this.form.publishedAt) : null,
				removeImage: this.form.removeImage,
				translations: this.form.translations.map(translation => ({
					lang: translation.lang,
					title: translation.title,
					excerpt: translation.excerpt || null,
					content: translation.content
				})),
				poll: this.form.pollEnabled
					? {
							isActive: this.form.poll.isActive,
							endAt: new Date(this.form.poll.endAt),
							options: this.form.poll.options.map((option, index) => ({
								sortOrder: index,
								translations: option.translations.map(translation => ({
									lang: translation.lang,
									label: translation.label
								}))
							}))
						}
					: undefined
			};
		},

		async loadNews() {
			if (!this.isEdit || !this.newsId) return;

			try {
				this.loading = true;
				this.error = '';

				const news = await AdminNewsService.getAdminNewsDetails(this.newsId);
				this.form = this.mapNewsToForm(news);
				this.hasCurrentImage = !!news.image?.data;
			} catch (err) {
				this.error = 'Impossible de charger la news.';
				errorHandler.handle(err, this.$toast);
			} finally {
				this.loading = false;
			}
		},

		async handleSubmit(imageFile: File | null) {
			try {
				this.saving = true;
				const payload = this.buildPayload();

				if (this.isEdit && this.newsId) {
					if (imageFile) {
						await AdminNewsService.updateAdminNewsWithImage(this.newsId, payload, imageFile);
					} else {
						await AdminNewsService.updateAdminNews(this.newsId, payload);
					}
				} else {
					if (imageFile) {
						await AdminNewsService.createAdminNewsWithImage(payload, imageFile);
					} else {
						await AdminNewsService.createAdminNews(payload);
					}
				}

				this.$router.push('/admin/news');
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			} finally {
				this.saving = false;
			}
		}
	},
	async mounted() {
		await this.loadNews();
	}
});
</script>
