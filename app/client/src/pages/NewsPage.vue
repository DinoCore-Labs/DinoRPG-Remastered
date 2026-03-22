<template>
	<TitleHeader :title="`${$t('pageTitle.news')}`" :header="$t('newsPage.title')"></TitleHeader>
	<div v-for="news in batch" :key="news.id" :class="news.hide ? 'bloc hide' : 'bloc'" @click="toggleCollapse(news)">
		<div class="news">
			<div class="newsTitle">
				<div class="newsImg">
					<img :src="getImgURL('news', news.type)" :alt="news.title || 'news'" />
				</div>
				<div class="newsContent">
					<h1 v-if="news.title">{{ news.title }}</h1>
					<h1 v-else>{{ $t('news.noTranslation') }}</h1>
					<span>{{ formatCreatedDate(news.publishedAt ?? news.createdAt) }}</span>
				</div>
			</div>
			<div class="newsLike" :class="{ disabled: !isAuthenticated }" @click.stop="handleLike(news)">
				<div class="newsCounter">
					<img :src="getImgURL('icons', news.likedByMe ? 'miniIcon_on' : 'miniIcon_off')" alt="icon" />
					<span class="newsCounter">{{ news.likes }}</span>
				</div>
			</div>
		</div>
		<img v-if="news.imageUrl" :src="news.imageUrl" :alt="news.title || 'news'" @error="hideBrokenImage" />
		<div class="markdown" v-if="news.content">
			<MarkdownRenderer :source="news.content" />
		</div>
		<div class="missingText" v-else>
			{{ $t('news.noTranslation') }}
		</div>
		<Poll v-if="news.poll" :poll="news.poll" @voted="refreshCurrentPage" />
		<div class="newsFooter">
			<a class="counter" :class="{ disabled: !isAuthenticated }" @click.stop="handleLike(news)">
				<img :src="getImgURL('icons', news.likedByMe ? 'miniIcon_on' : 'miniIcon_off')" alt="icon" />
				<span class="newsCounter">{{ news.likes }}</span>
			</a>
		</div>
	</div>
	<a v-if="canLoadMore" class="overload" @click="overload(page + 1)">
		{{ $t('news.overload') }}
	</a>
	<Roadmap />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PublicNewsListItem } from '@dinorpg/core/models/news/news.js';
import type { NewsPageItem } from '@dinorpg/core/models/news/news.js';

import Poll from '../components/common/Poll.vue';
import MarkdownRenderer from '../components/common/MarkdownRenderer.vue';
import Roadmap from '../components/common/Roadmap.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { localStore } from '../store/localStore';
import { userStore } from '../store/userStore';
import { NewsService } from '../services/news.service';
import { errorHandler } from '../utils/errorHandler';
import { getImgURL } from '../utils/getImgURL';

export default defineComponent({
	name: 'NewsPage',
	components: {
		Poll,
		Roadmap,
		TitleHeader,
		MarkdownRenderer
	},
	data() {
		return {
			userStore: userStore(),
			localStore: localStore(),
			batch: [] as NewsPageItem[],
			page: 1,
			loading: false
		};
	},
	computed: {
		isAuthenticated(): boolean {
			return !!this.userStore.isLogged;
		},
		canLoadMore(): boolean {
			return this.batch.length > 0 && this.batch.length % 10 === 0;
		}
	},
	methods: {
		getImgURL,
		mapNewsBatch(newsList: PublicNewsListItem[]): NewsPageItem[] {
			return newsList.map((news, index) => ({
				...news,
				hide: index !== 0
			}));
		},
		toggleCollapse(news: NewsPageItem) {
			news.hide = !news.hide;
		},
		hideBrokenImage(event: Event) {
			const target = event.target as HTMLImageElement;
			target.style.display = 'none';
		},
		formatCreatedDate(dateValue: string | Date): string {
			const date = new Date(dateValue);
			const options = { year: 'numeric', month: 'long', day: 'numeric' } as const;
			return date.toLocaleDateString(this.localStore.getLanguage || undefined, options);
		},
		async getFirstNews() {
			try {
				this.loading = true;
				const newsList = await NewsService.getNewsPage(1);
				this.batch = this.mapNewsBatch(newsList);
				this.page = 1;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return Promise.reject(err);
			} finally {
				this.loading = false;
			}
		},
		async overload(page: number) {
			try {
				this.loading = true;
				const newLoad = await NewsService.getNewsPage(page);
				this.batch.push(
					...newLoad.map(news => ({
						...news,
						hide: true
					}))
				);
				this.page = page;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return Promise.reject(err);
			} finally {
				this.loading = false;
			}
		},
		async refreshCurrentPage() {
			try {
				const refreshed = await NewsService.getNewsPage(this.page);
				this.batch = refreshed.map((news, index) => {
					const previous = this.batch[index];
					return {
						...news,
						hide: previous ? previous.hide : index !== 0
					};
				});
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return Promise.reject(err);
			}
		},
		handleLike(news: NewsPageItem) {
			if (!this.isAuthenticated) {
				this.$toast.open({
					message: this.$t('toast.loginToLike'),
					type: 'info'
				});
				return;
			}
			this.toggleLike(news);
		},
		async toggleLike(news: NewsPageItem) {
			if (!this.isAuthenticated) return;
			try {
				const result = await NewsService.toggleLike(news.id);
				news.likes = result.likes;
				news.likedByMe = result.likedByMe;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		}
	},
	async mounted() {
		await this.getFirstNews();
	}
});
</script>

<style lang="scss" scoped>
.hide {
	max-height: 50px !important;
	overflow: hidden;
	p {
		display: none;
	}
}
.overload {
	display: block;
	text-align: center;
	margin: 10px;
	padding: 2px;
	cursor: pointer;
}
.bloc {
	background-image: url('../assets/background/bloc_news.webp');
	width: 90%;
	align-self: center;
	max-width: 496px;
	background-repeat: repeat-y;
	cursor: pointer;
	margin-bottom: 10px;
	border: 1px solid #ffee92;
	outline: 1px solid #92471f;
	transition: max-height 0.9s ease-out;
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	.newsLike.disabled,
	.counter.disabled {
		cursor: default;
		opacity: 0.85;
	}
	.missingText {
		color: #f4e4bc;
		line-height: 1.6;
		background: linear-gradient(145deg, #8b4513, #a0522d);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		border: 2px solid rgba(255, 215, 0, 0.3);
		backdrop-filter: blur(10px);
		position: relative;
		overflow: hidden;
	}
	.markdown {
		color: #f4e4bc;
		line-height: 1.6;
		:deep(.markdown-body) {
			background: linear-gradient(145deg, #8b4513, #a0522d);
			border-radius: 12px;
			padding: 20px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
			border: 2px solid rgba(255, 215, 0, 0.3);
			backdrop-filter: blur(10px);
			position: relative;
			overflow: hidden;
		}
		:deep(h1),
		:deep(h2),
		:deep(h3),
		:deep(h4),
		:deep(h5),
		:deep(h6) {
			color: #ffd700;
			margin: 0 0 15px 0;
			font-weight: bold;
			text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
		}

		:deep(h1) {
			font-size: 2rem;
			margin-bottom: 20px;
			border-bottom: 2px solid rgba(255, 215, 0, 0.3);
			padding-bottom: 10px;
		}

		:deep(h2) {
			font-size: 1.6rem;
			margin-top: 25px;
		}

		:deep(h3) {
			font-size: 1.4rem;
			margin-top: 20px;
		}

		:deep(h4) {
			font-size: 1.2rem;
			margin-top: 15px;
		}

		:deep(h5) {
			font-size: 1.1rem;
			margin-top: 15px;
		}

		:deep(h6) {
			font-size: 1rem;
			margin-top: 10px;
		}

		:deep(p) {
			margin: 15px 0;
			color: #f4e4bc;
			text-align: justify;
			font-size: 1.2rem;
			font-weight: 500;
		}

		:deep(a) {
			color: #ffd700;
			text-decoration: none;
			padding: 2px 4px;
			border-radius: 4px;
			transition: all 0.3s ease;

			&:hover {
				background: rgba(255, 215, 0, 0.2);
				box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
			}
		}

		:deep(ul),
		:deep(ol) {
			margin: 15px 0;
			padding-left: 20px;
		}

		:deep(li) {
			margin: 8px 0;
			font-size: 1.1rem;
		}

		:deep(img) {
			max-width: 100%;
			height: auto;
			border-radius: 10px;
			margin: 15px 0;
		}

		:deep(code) {
			background: rgba(0, 0, 0, 0.4);
			padding: 2px 6px;
			border-radius: 4px;
			font-family: 'Courier New', monospace;
			color: #ffd700;
		}

		:deep(pre) {
			background: rgba(0, 0, 0, 0.4);
			padding: 15px;
			border-radius: 8px;
			overflow-x: auto;
			border: 1px solid rgba(255, 215, 0, 0.3);
			margin: 15px 0;

			code {
				background: none;
				border: none;
				padding: 0;
			}
		}

		:deep(blockquote) {
			margin: 20px 0;
			padding: 20px;
			border-left: 4px solid #ffd700;
			background: rgba(0, 0, 0, 0.3);
			border-radius: 8px;
			font-style: italic;
		}

		:deep(hr) {
			border: none;
			height: 2px;
			background: linear-gradient(to right, transparent, #ffd700, transparent);
			margin: 30px 0;
		}

		:deep(strong) {
			color: #ffd700;
			font-weight: bold;
		}

		:deep(em) {
			color: #ffa500;
			font-style: italic;
		}
	}

	.news {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.newsTitle {
			display: flex;
			gap: 10px;
			max-width: 80%;

			.newsImg {
				border: 1px solid #ffee92;
				min-width: 80px;
				height: 80px;
				overflow: hidden;

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}

			.newsContent {
				color: #ffee92;
				display: flex;
				flex-direction: column;
				max-width: 280px;
				min-width: 0;

				h1 {
					height: auto;
					max-height: none;
					text-align: left;
					margin-bottom: 5px;
					font-size: 20pt;
					font-weight: bold;
					line-height: 1em;
					opacity: 0.8;
					background: transparent;
					text-overflow: ellipsis;
					overflow: hidden;
				}

				span {
					font-size: 7.5pt;
					margin-bottom: 6px;
					opacity: 0.7;
				}
			}
		}

		.newsLike {
			background-image: url('../../assets/design/marker.webp');
			background-repeat: no-repeat;
			display: flex;
			align-items: center;
			margin-top: -22px;
			margin-right: -12px;
			margin-left: -25px;
			min-width: 130px;
			height: 70px;

			.newsCounter {
				display: flex;
				color: #ffee92;
				cursor: pointer;
				font-weight: bold;
				margin-top: -15px;
				margin-left: 25px;

				img {
					height: 16px;
					width: 20px;
					object-fit: cover;
				}

				span {
					margin-top: -1px;
					margin-left: 6px;
				}
			}
		}
	}

	.newsFooter {
		display: flex;

		.counter {
			color: #ffee92;
			cursor: pointer;
			display: flex;
			gap: 5px;
			padding: 0;
			font-size: 11pt;
			font-weight: bold;

			img {
				max-width: 100%;
				display: block;
				margin-left: auto;
				margin-right: auto;
				margin-bottom: 20px;
			}
		}
	}
}
</style>
