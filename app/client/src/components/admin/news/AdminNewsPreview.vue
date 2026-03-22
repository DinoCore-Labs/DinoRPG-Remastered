<template>
	<div class="admin-news-preview">
		<h3>Aperçu</h3>
		<div :class="collapsed ? 'bloc hide' : 'bloc'">
			<div class="news">
				<div class="newsTitle">
					<div class="newsImg">
						<img :src="previewImage" :alt="previewTitle || 'news'" />
					</div>
					<div class="newsContent">
						<h1 v-if="previewTitle">{{ previewTitle }}</h1>
						<h1 v-else>{{ $t('news.noTranslation') }}</h1>
					</div>
				</div>
				<div class="newsLike disabled">
					<div class="newsCounter">
						<img :src="getImgURL('icons', 'miniIcon_off')" alt="icon" />
						<span class="newsCounter">0</span>
					</div>
				</div>
			</div>
			<div class="markdown" v-if="previewContent">
				<MarkdownRenderer :source="previewContent" />
			</div>
			<div class="missingText" v-else>
				{{ $t('news.noTranslation') }}
			</div>
			<img v-if="imageUrl" :src="imageUrl" :alt="previewTitle || 'news'" />
			<div v-if="previewPoll" class="pollPreview">
				<h4>{{ $t('adminNews.previewPollTitle') }}</h4>
				<ul>
					<li v-for="option in previewPoll.options" :key="option.sortOrder">
						{{ option.label || $t('adminNews.emptyPollOption') }}
					</li>
				</ul>
			</div>
			<div class="newsFooter">
				<a class="counter disabled">
					<img :src="getImgURL('icons', 'miniIcon_off')" alt="icon" />
					<span class="newsCounter">0</span>
				</a>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Language } from '@dinorpg/core/models/config/language.js';

import MarkdownRenderer from '../../common/MarkdownRenderer.vue';
import { getImgURL } from '../../../utils/getImgURL';

type NewsTranslationInput = {
	lang: Language;
	title: string;
	excerpt?: string | null;
	content: string;
};

type PollOptionInput = {
	sortOrder?: number;
	translations: {
		lang: Language;
		label: string;
	}[];
};

type PollInput = {
	isActive?: boolean;
	endAt?: string | null;
	options: PollOptionInput[];
};

const props = defineProps<{
	type: string;
	translations: NewsTranslationInput[];
	selectedLang: Language;
	imageUrl?: string | null;
	poll?: PollInput | null;
	publishedAt?: string | Date | null;
	collapsed?: boolean;
}>();

function findTranslation<T extends { lang: Language }>(entries: T[], lang: Language) {
	return entries.find(entry => entry.lang === lang) ?? entries[0] ?? null;
}

const currentTranslation = computed(() => findTranslation(props.translations, props.selectedLang));

const previewTitle = computed(() => currentTranslation.value?.title ?? '');
const previewContent = computed(() => currentTranslation.value?.content ?? '');

const previewPoll = computed(() => {
	if (!props.poll) return null;

	return {
		...props.poll,
		options: props.poll.options.map((option, index) => {
			const translation = findTranslation(option.translations, props.selectedLang);

			return {
				sortOrder: option.sortOrder ?? index,
				label: translation?.label ?? ''
			};
		})
	};
});

const previewImage = computed(() => {
	return getImgURL('news', props.type);
});
</script>

<style scoped lang="scss">
.admin-news-preview {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.hide {
	max-height: 50px !important;
	overflow: hidden;
	p {
		display: none;
	}
}
.bloc {
	background-image: url('../../../assets/background/bloc_news.webp');
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
			padding: 13px;
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
			font-size: 1.6rem;
			margin-bottom: 10px;
			border-bottom: 2px solid rgba(255, 215, 0, 0.3);
			padding-bottom: 10px;
		}
		:deep(h2) {
			font-size: 1.2rem;
			margin-top: 25px;
		}
		:deep(h3) {
			font-size: 1rem;
			margin-top: 20px;
		}
		:deep(h4) {
			font-size: 1rem;
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
			font-size: 1rem;
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
			background-image: url('../../../assets/background/marker.webp');
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
.disabled {
	cursor: default;
	opacity: 0.85;
}

.pollPreview {
	color: #f4e4bc;
	background: rgba(0, 0, 0, 0.25);
	border: 1px solid rgba(255, 215, 0, 0.25);
	border-radius: 10px;
	padding: 12px;
	h4 {
		margin: 0 0 10px;
		color: #ffd700;
	}
	ul {
		margin: 0;
		padding-left: 20px;
	}
}
</style>
