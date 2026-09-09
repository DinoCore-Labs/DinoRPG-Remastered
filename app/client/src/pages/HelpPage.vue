<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/pages/HelpPage.vue

  Copyright in the original contributions remains with the respective
  authors and contributors.

  Modified by DinoRPG Remastered contributors from 2026-01-25 through 2026-09-08.
  See NOTICE.md and the Git history for provenance and modification details.

  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<TitleHeader :title="t('pageTitle.guide')" :header="t('guide.title')" :sub-header="selectedItem?.name ?? ''" />
	<div class="intro">
		<div class="menu">
			<ul class="list">
				<li
					v-for="(item, index) in items"
					:key="item.slug"
					:class="{ selected: selectedItemIndex === index }"
					@click="selectedItemIndex = index"
				>
					<img :src="getImgURL(item.icon.path, item.icon.name)" alt="" />
					{{ item.name }}
				</li>
			</ul>
		</div>
		<div class="image">
			<img :src="getImgURL('design', 'rocky_01')" alt="" />
		</div>
	</div>
	<div class="showContent">
		<div v-if="selectedItem" class="content">
			<div class="titleContent">
				<h3>{{ selectedItem.name }}</h3>
			</div>
			<MarkdownRenderer class="guideMarkdown" :source="selectedMarkdown" game-icons />
			<button v-if="selectedItemIndex > 0" class="next" @click="showPrevItem">
				<img :src="getImgURL('icons', 'small_page_up')" alt="" />
				{{ prevItemName }}
			</button>
			<button v-if="selectedItemIndex < items.length - 1" class="next" @click="showNextItem">
				<img :src="getImgURL('icons', 'small_page_down')" alt="" />
				{{ nextItemName }}
			</button>
			<button class="next" @click="goToNews">
				<img :src="getImgURL('icons', 'small_delete')" alt="" />
				{{ t('guide.stop') }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import MarkdownRenderer from '../components/common/MarkdownRenderer.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { getImgURL } from '../utils/getImgURL';

type GuideIcon = {
	path: string;
	name: string;
};

type GuideDefinition = {
	slug: string;
	icon: GuideIcon;
};

type GuideItem = GuideDefinition & {
	name: string;
	source: string;
};

const SUPPORTED_LANGUAGES = ['FR', 'EN', 'ES', 'DE'] as const;

const GUIDE_DEFINITIONS: GuideDefinition[] = [
	{
		slug: 'intro',
		icon: { path: 'icons', name: 'small_home' }
	},
	{
		slug: 'adopt',
		icon: { path: 'icons', name: 'small_member' }
	},
	{
		slug: 'name',
		icon: { path: 'icons', name: 'small_question' }
	},
	{
		slug: 'card',
		icon: { path: 'status', name: 'fx_ccard' }
	},
	{
		slug: 'move',
		icon: { path: 'icons', name: 'small_follow' }
	},
	{
		slug: 'fight',
		icon: { path: 'icons', name: 'small_fire' }
	},
	{
		slug: 'heal',
		icon: { path: 'icons', name: 'small_use' }
	},
	{
		slug: 'death',
		icon: { path: 'icons', name: 'small_delete' }
	},
	{
		slug: 'exp',
		icon: { path: 'icons', name: 'small_xp' }
	},
	{
		slug: 'missions',
		icon: { path: 'icons', name: 'small_gold' }
	},
	{
		slug: 'status',
		icon: { path: 'icons', name: 'small_edit' }
	},
	{
		slug: 'equipment',
		icon: { path: 'status', name: 'fx_bckpck' }
	},
	{
		slug: 'epic',
		icon: { path: 'icons', name: 'small_mode' }
	},
	{
		slug: 'group',
		icon: { path: 'icons', name: 'small_leader' }
	},
	{
		slug: 'ingredient',
		icon: { path: 'status', name: 'fx_pelle' }
	},
	{
		slug: 'clans',
		icon: { path: 'icons', name: 'small_leader' }
	},
	{
		slug: 'dojo',
		icon: { path: 'icons', name: 'small_dojo' }
	},
	{
		slug: 'gdc',
		icon: { path: 'icons', name: 'small_attack' }
	},
	{
		slug: 'cdc',
		icon: { path: 'icons', name: 'small_attack' }
	},
	{
		slug: 'question',
		icon: { path: 'icons', name: 'small_mail' }
	},
	{
		slug: 'support',
		icon: { path: 'icons', name: 'small_browse_next' }
	},
	{
		slug: 'security',
		icon: { path: 'icons', name: 'small_lock' }
	}
];

const guideSources = import.meta.glob<string>('../content/guide/*.md', {
	query: '?raw',
	import: 'default'
});

const { locale, t } = useI18n();
const router = useRouter();

const items = ref<GuideItem[]>([]);
const selectedItemIndex = ref(0);

let loadSequence = 0;

const normalizeLanguage = (language: string): (typeof SUPPORTED_LANGUAGES)[number] => {
	const normalized = language.toUpperCase().split(/[-_]/)[0];
	return SUPPORTED_LANGUAGES.includes(normalized as (typeof SUPPORTED_LANGUAGES)[number])
		? (normalized as (typeof SUPPORTED_LANGUAGES)[number])
		: 'FR';
};

const parseGuideSource = (source: string, filename: string): Pick<GuideItem, 'name' | 'source'> => {
	const titleMatch = source.match(/^#\s+(.+?)(?:\r?\n|$)/);
	if (!titleMatch) {
		throw new Error(`[Guide] Missing H1 title in ${filename}`);
	}
	return {
		name: titleMatch[1].trim(),
		source: source.slice(titleMatch[0].length).trim()
	};
};

const loadGuide = async (languageValue: string): Promise<void> => {
	const language = normalizeLanguage(languageValue);
	const currentLoad = ++loadSequence;
	try {
		const loadedItems = await Promise.all(
			GUIDE_DEFINITIONS.map(async definition => {
				const filename = `${definition.slug}${language}.md`;
				const requestedPath = `../content/guide/${filename}`;
				const fallbackFilename = `${definition.slug}FR.md`;
				const fallbackPath = `../content/guide/${fallbackFilename}`;
				const loader = guideSources[requestedPath] ?? guideSources[fallbackPath];
				if (!loader) {
					throw new Error(`[Guide] Markdown file not found: ${filename}`);
				}
				const source = await loader();
				const parsed = parseGuideSource(source, filename);
				return {
					...definition,
					...parsed
				};
			})
		);
		if (currentLoad === loadSequence) {
			items.value = loadedItems;
		}
	} catch (error) {
		if (currentLoad === loadSequence) {
			items.value = [];
		}
		console.error(error);
	}
};

const resolveAssetUrls = (source: string): string => {
	return source.replace(/\(asset:\/\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\)/g, (match, path: string, name: string) => {
		const url = getImgURL(path, name);
		return url ? `(${url})` : match;
	});
};

const selectedItem = computed(() => items.value[selectedItemIndex.value] ?? null);

const selectedMarkdown = computed(() => resolveAssetUrls(selectedItem.value?.source ?? ''));

const prevItemName = computed(() => items.value[selectedItemIndex.value - 1]?.name ?? '');

const nextItemName = computed(() => items.value[selectedItemIndex.value + 1]?.name ?? '');

const showPrevItem = (): void => {
	if (selectedItemIndex.value > 0) {
		selectedItemIndex.value -= 1;
	}
};

const showNextItem = (): void => {
	if (selectedItemIndex.value < items.value.length - 1) {
		selectedItemIndex.value += 1;
	}
};

const goToNews = () => {
	void router.push({ name: 'NewsPage' });
};

watch(
	locale,
	language => {
		void loadGuide(String(language));
	},
	{
		immediate: true
	}
);
</script>

<style lang="scss" scoped>
.intro {
	display: flex;
	margin-left: 10px;
	max-width: 95%;
	align-self: baseline;
	.menu {
		background-color: #e09b6244;
		border-radius: 5px;
		width: 220px;
		.list {
			color: rgb(142, 62, 38);
			cursor: pointer;
			font-variant: small-caps;
			font-weight: bold;
			list-style: none;
			margin-top: 6px;
			margin-left: -25px;
			& li:hover,
			& li.selected {
				color: #fce3bc;
				background-color: rgb(142, 62, 38);
			}
		}
	}
	.image {
		margin-top: auto;
		& img {
			max-width: 95%;
			height: auto;
		}
	}
}
.showContent {
	max-width: 95%;
	align-self: center;
	.content {
		margin-top: 10px;
		.titleContent {
			height: fit-content;
			background-image: url('../assets/design/title/title_h1.webp');
			background-position: left bottom;
			background-repeat: no-repeat;
			padding-bottom: 22px;
			h3 {
				margin-left: 5px;
				color: #71b703;
				font-variant: small-caps;
			}
		}
		.guideMarkdown {
			margin-top: 15px;
			:deep(.markdown-body) {
				strong,
				em {
					color: rgb(142, 62, 38);
				}
				h2 {
					background-image: url('../assets/design/title/title_h2.webp');
					background-position: left bottom;
					background-repeat: no-repeat;
					color: #fff1ad;
					padding-left: 5px;
				}
				p {
					margin: 0 0 10px;
				}
				ul {
					list-style: none;
					margin: 12px 0;
					padding-left: 10px;
					li {
						margin-top: 10px;
						img {
							margin-right: 8px;
							vertical-align: middle;
						}
					}
				}
				> p > img {
					display: block;
					height: auto;
					margin: 10px 0;
					max-width: 100%;
				}
			}
		}
		.next {
			background-image: url('../assets/button/button.webp');
			border: none;
			color: #fff1ad;
			font-variant: small-caps;
			font-weight: bold;
			text-align: center;
			height: 28px;
			width: 145px !important;
			background-repeat: no-repeat;
			font-size: 7pt;
			margin-left: 10px;
			margin-right: 10px;
			margin-top: 20px;
			cursor: pointer;
			&:hover {
				color: white;
				background-image: url('../assets/button/button_hover.webp');
			}
		}
	}
}
</style>
