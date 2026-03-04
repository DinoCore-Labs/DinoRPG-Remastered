<template>
	<TitleHeader :title="`${$t('pageTitle.news')}`" :header="$t('newsPage.title')"></TitleHeader>
	<!--<div :class="news.hide ? 'bloc hide' : 'bloc'" v-for="news in batch" :key="news.id" @click="news.hide = !news.hide">
		<div class="news">
			<div class="newsTitle">
				<div class="newsImg">
					<img :src="getImgURL('news', news.type)" :alt="news.title" />
				</div>
				<div class="newsContent">
					<h1 v-if="news.title">{{ news.title }}</h1>
					<h1 v-else>{{ $t('news.noTranslation') }}</h1>
					<span>{{ '' + formatCreatedDate(news.createdDate) }}</span>
				</div>
			</div>
			<div class="newsLike" @click.stop="toggleLike(news)">
				<div class="newsCounter">
					<img :src="getImgURL('icons', news.likedByMe ? 'miniIcon_on' : 'miniIcon_off')" alt="icon" />
					<span class="newsCounter">{{ news.likes }}</span>
				</div>
			</div>
		</div>
		<img :src="`${API_BASE}/news/${news.id}/illustration`" :alt="news.title" onerror="this.style.display='none'" />
		<div class="markdown" v-if="news.text">
			<Markdown :source="news.text" />
		</div>
		<div class="missingText" v-else>
			{{ $t('news.noTranslation') }}
		</div>
		<Poll v-if="news.poll" :poll="news.poll" :totalVote="news.totalVote" @voted="getFirstNews()" />
		<div class="newsFooter">
			<a class="counter" @click.stop="toggleLike(news)">
				<img :src="getImgURL('icons', news.likedByMe ? 'miniIcon_on' : 'miniIcon_off')" alt="icon" />
				<span class="newsCounter">{{ news.likes }}</span>
			</a>
		</div>
	</div>
	<a v-if="batch.length % 10 === 0" class="overload" @click="overload(page + 1)"> {{ $t('news.overload') }}</a>
  -->
	<Roadmap />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//import { NewsService } from '../../services/index.js';
//import { localStore } from '../../store/index.js';
//import { API_BASE, errorHandler } from '../../utils/index.js';
//import { NewsGetResponse } from '@drpg/core/returnTypes/News';
import Roadmap from '../components/common/Roadmap.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
//import Markdown from 'vue3-markdown-it';
//import Poll from './Poll.vue';

export default defineComponent({
	name: 'NewsPage',
	components: {
		//Poll,
		Roadmap,
		TitleHeader
		//Markdown
	},
	data() {
		return {
			//localStore: localStore(),
			//batch: [] as NewsGetResponse[],
			//page: 1,
			//API_BASE
		};
	},
	computed: {
		/*language() {
			return this.localStore.getLanguage;
		}*/
	},
	methods: {
		/*async overload(page: number) {
			try {
				const newLoad = await NewsService.getNewsFromPage(page);
				this.batch.push(...newLoad);
				this.page++;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return Promise.reject(err);
			}
		},
		async getFirstNews() {
			try {
				this.batch = await NewsService.getNewsFromPage(this.page);
				if (this.batch.length !== 0) {
					this.batch[0].hide = false;
				}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return Promise.reject(err);
			}
		},
		formatCreatedDate(stringDate: string): string {
			const date = new Date(stringDate);
			const options = { year: 'numeric', month: 'long', day: 'numeric' } as const;
			return date.toLocaleDateString(this.localStore.getLanguage, options);
		},
		async toggleLike(news: NewsGetResponse) {
			try {
				const result = await NewsService.toggleLike(news.id);
				news.likes = result.likes;
				// Updates whether the user has liked or not
				news.likedByMe = result.likedByMe;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		}*/
	}
	/*async mounted() {
		await this.getFirstNews();
	},*/
	/*watch: {
		language() {
			this.page = 1;
			this.getFirstNews();
		}
	}*/
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
	background-image: url('../../assets/background/bloc_news.webp');
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
	// To have untranslate news look like the markdown
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
		// Effet de brillance subtile
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
			transition: left 0.5s ease;
		}
		&:hover::before {
			left: 100%;
		}
	}
	.markdown {
		color: #f4e4bc;
		line-height: 1.6;
		// Stylisation des conteneurs div
		:deep(div) {
			background: linear-gradient(145deg, #8b4513, #a0522d);
			border-radius: 12px;
			padding: 20px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
			border: 2px solid rgba(255, 215, 0, 0.3);
			backdrop-filter: blur(10px);
			position: relative;
			overflow: hidden;
			// Effet de brillance subtile
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: -100%;
				width: 100%;
				height: 100%;
				background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
				transition: left 0.5s ease;
			}
			&:hover::before {
				left: 100%;
			}
		}
		// Stylisation des titres
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
			position: relative;
			z-index: 1;
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
		// Stylisation des paragraphes
		:deep(p) {
			margin: 15px 0;
			color: #f4e4bc;
			position: relative;
			z-index: 1;
			text-align: justify;
			font-size: 1.2rem;
			font-weight: 500;
		}
		// Stylisation des liens
		:deep(a) {
			color: #ffd700;
			text-decoration: none;
			padding: 2px 4px;
			border-radius: 4px;
			transition: all 0.3s ease;
			position: relative;
			z-index: 1;
			&:hover {
				background: rgba(255, 215, 0, 0.2);
				box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
				transform: translateY(-1px);
			}
			&:active {
				transform: translateY(0);
			}
		}
		// Stylisation des listes
		:deep(ul),
		:deep(ol) {
			margin: 15px 0;
			padding-left: 0;
			position: relative;
			z-index: 1;
		}
		:deep(li) {
			margin: 8px 0;
			padding: 12px 20px;
			background: rgba(0, 0, 0, 0.2);
			border-radius: 8px;
			border-left: 4px solid #ffd700;
			transition: all 0.3s ease;
			list-style: none;
			position: relative;
			font-size: 1.2rem;
			&:hover {
				background: rgba(255, 215, 0, 0.1);
				transform: translateX(5px);
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
			}
		}
		// Numérotation personnalisée pour les listes ordonnées
		:deep(ol) {
			counter-reset: custom-counter;
			:deep(li) {
				counter-increment: custom-counter;
				padding-left: 50px;
				&::before {
					content: counter(custom-counter);
					position: absolute;
					left: 15px;
					top: 50%;
					transform: translateY(-50%);
					background: #ffd700;
					color: #8b4513;
					width: 25px;
					height: 25px;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: bold;
					font-size: 0.9rem;
				}
			}
		}
		// Puces personnalisées pour les listes non ordonnées
		:deep(ul li) {
			padding-left: 50px;
			&::before {
				content: '◆';
				color: #ffd700;
				position: absolute;
				left: 15px;
				top: 50%;
				transform: translateY(-50%);
				font-size: 1.2rem;
			}
		}
		// Stylisation des boutons
		:deep(button) {
			background: linear-gradient(135deg, #ffd700, #ffa500);
			color: #8b4513;
			border: none;
			border-radius: 8px;
			padding: 12px 24px;
			font-weight: bold;
			font-size: 1rem;
			cursor: pointer;
			transition: all 0.3s ease;
			box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
			margin: 10px 5px;
			position: relative;
			z-index: 1;
			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
			}
			&:active {
				transform: translateY(0);
			}
			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
				transform: none;
				&:hover {
					transform: none;
				}
			}
		}
		// Stylisation des formulaires
		:deep(form) {
			background: rgba(0, 0, 0, 0.2);
			border-radius: 10px;
			padding: 20px;
			margin: 20px 0;
			border: 1px solid rgba(255, 215, 0, 0.2);
		}
		:deep(input),
		:deep(textarea),
		:deep(select) {
			width: 100%;
			padding: 12px 15px;
			margin: 8px 0 16px 0;
			border: 2px solid rgba(255, 215, 0, 0.3);
			border-radius: 8px;
			background: rgba(255, 255, 255, 0.1);
			color: #f4e4bc;
			font-size: 1rem;
			transition: all 0.3s ease;
			&:focus {
				outline: none;
				border-color: #ffd700;
				box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
				background: rgba(255, 255, 255, 0.15);
			}
			&::placeholder {
				color: rgba(244, 228, 188, 0.6);
			}
		}
		// Stylisation des images
		:deep(img) {
			max-width: 100%;
			height: auto;
			border-radius: 10px;
			box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
			transition: all 0.3s ease;
			margin: 15px 0;
			position: relative;
			z-index: 1;
			&:hover {
				transform: scale(1.02);
				box-shadow: 0 12px 35px rgba(255, 215, 0, 0.2);
			}
		}
		// Stylisation des tableaux
		table {
			width: 100%;
			border-collapse: collapse;
			margin: 20px 0;
			background: rgba(0, 0, 0, 0.2);
			border-radius: 10px;
			overflow: hidden;
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		}
		th,
		td {
			padding: 12px 15px;
			text-align: left;
			border-bottom: 1px solid rgba(255, 215, 0, 0.2);
		}
		th {
			background: rgba(255, 215, 0, 0.2);
			color: #ffd700;
			font-weight: bold;
		}
		tr {
			&:hover {
				background: rgba(255, 215, 0, 0.1);
			}
		}
		// Stylisation des citations
		blockquote {
			margin: 20px 0;
			padding: 20px;
			border-left: 4px solid #ffd700;
			background: rgba(0, 0, 0, 0.3);
			border-radius: 8px;
			font-style: italic;
			position: relative;
			z-index: 1;
			&::before {
				content: '"';
				font-size: 3rem;
				color: #ffd700;
				position: absolute;
				top: 10px;
				left: 15px;
				opacity: 0.3;
			}
		}
		// Stylisation du code
		code {
			background: rgba(0, 0, 0, 0.4);
			padding: 2px 6px;
			border-radius: 4px;
			font-family: 'Courier New', monospace;
			color: #ffd700;
			border: 1px solid rgba(255, 215, 0, 0.3);
		}
		pre {
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
		// Stylisation des éléments de séparation
		hr {
			border: none;
			height: 2px;
			background: linear-gradient(to right, transparent, #ffd700, transparent);
			margin: 30px 0;
		}
		// Stylisation des éléments strong et em
		strong {
			color: #ffd700;
			font-weight: bold;
		}
		em {
			color: #ffa500;
			font-style: italic;
		}
		// Stylisation des éléments de définition
		dl {
			margin: 15px 0;
		}
		dt {
			color: #ffd700;
			font-weight: bold;
			margin-top: 15px;
		}
		dd {
			margin: 5px 0 0 20px;
			padding: 8px 15px;
			background: rgba(0, 0, 0, 0.2);
			border-radius: 6px;
			border-left: 3px solid #ffd700;
		}
		// Stylisation des éléments mark
		mark {
			background: rgba(255, 215, 0, 0.3);
			color: #ffd700;
			padding: 2px 4px;
			border-radius: 3px;
		}
		// Stylisation des éléments kbd
		kbd {
			background: rgba(0, 0, 0, 0.6);
			color: #ffd700;
			padding: 3px 6px;
			border-radius: 4px;
			border: 1px solid rgba(255, 215, 0, 0.5);
			font-family: 'Courier New', monospace;
			font-size: 0.9em;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		}
		// Responsive pour les éléments dans markdown
		@media (max-width: 768px) {
			div {
				margin: 10px 0;
				padding: 15px;
			}

			h1 {
				font-size: 1.6rem;
			}

			h2 {
				font-size: 1.4rem;
			}

			h3 {
				font-size: 1.2rem;
			}

			button {
				width: 100%;
				margin: 5px 0;
			}

			table {
				font-size: 0.9rem;
			}

			th,
			td {
				padding: 8px 10px;
			}
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
				& img {
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
				& h1 {
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
				& span {
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
				& img {
					height: 16px;
					width: 20px;
					object-fit: cover;
				}
				& span {
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
			padding: 0px;
			font-size: 11pt;
			font-weight: bold;
			img {
				max-width: 100%;
				display: block;
				margin-left: auto;
				margin-right: auto;
				margin-bottom: 20px;
			}
			p {
				color: white;
				background: transparent;
			}
		}
	}
}
</style>
