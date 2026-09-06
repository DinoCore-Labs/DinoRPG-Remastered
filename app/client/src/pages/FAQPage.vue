<!--
  This file contains code derived from or adapted from:
  Eternaltwin DinoRPG
  Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/pages/FAQPage.vue
  Copyright in the original contributions remains with the respective
  authors and contributors.
  Modified by DinoRPG Remastered contributors on 2026-09-06.
  See NOTICE.md and the Git history for provenance and modification details.
  SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<TitleHeader :title="`${$t('pageTitle.faq')}`" :header="$t('topBar.userMenu.faq')" />
	<DZDisclaimer help round content="faq.intro" />
	<div class="search">
		<form @submit.prevent>
			<table>
				<tbody>
					<tr>
						<td>
							<DZInput v-model="searchQuery" name="search" />
						</td>
						<td>
							<DZButton type="submit">
								{{ $t('button.search') }}
							</DZButton>
						</td>
					</tr>
				</tbody>
			</table>
		</form>
	</div>
	<div class="faq">
		<h3 class="titleSection">
			{{ $t('faq.qa') }}
		</h3>
		<dl class="results">
			<template v-for="pair in filteredPairs" :key="pair.id">
				<dt @click="toggleCollapsed(pair.id)">
					<span>
						<img :src="getImgURL('icons', 'small_follow')" />
					</span>
					<p>{{ pair.question }}</p>
				</dt>
				<dd v-show="!isCollapsed(pair.id)">
					<MarkdownRenderer :source="pair.answer" game-icons />
				</dd>
			</template>
		</dl>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import MarkdownRenderer from '../components/common/MarkdownRenderer.vue';
import DZButton from '../components/utils/DZButton.vue';
import DZDisclaimer from '../components/utils/DZDisclaimer.vue';
import DZInput from '../components/utils/DZInput.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { getImgURL } from '../utils/getImgURL';
import { parseFaqMarkdown } from '../utils/parseFaqMarkdown';

const { locale } = useI18n();

const faqSources = import.meta.glob<string>('../content/faq/*.md', {
	query: '?raw',
	import: 'default'
});

const markdownSource = ref('');
const searchQuery = ref('');
const openedPairs = ref<Set<number>>(new Set());

const faqPairs = computed(() => parseFaqMarkdown(markdownSource.value));

const normalizeText = (value: string): string => {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
};

const filteredPairs = computed(() => {
	const search = normalizeText(searchQuery.value.trim());
	if (!search) {
		return faqPairs.value;
	}
	return faqPairs.value.filter(pair => {
		return normalizeText(pair.question).includes(search) || normalizeText(pair.answer).includes(search);
	});
});

const loadFaq = async (language: string): Promise<void> => {
	const languagePath = `../content/faq/${language.toUpperCase()}.md`;
	const fallbackPath = '../content/faq/FR.md';
	const loader = faqSources[languagePath] ?? faqSources[fallbackPath];
	if (!loader) {
		console.error(`[FAQ] Markdown file not found for language "${language}"`);
		markdownSource.value = '';
		return;
	}
	markdownSource.value = await loader();
	openedPairs.value = new Set();
};

const toggleCollapsed = (id: number): void => {
	const opened = new Set(openedPairs.value);
	if (opened.has(id)) {
		opened.delete(id);
	} else {
		opened.add(id);
	}
	openedPairs.value = opened;
};

const isCollapsed = (id: number): boolean => {
	return !openedPairs.value.has(id);
};
watch(
	locale,
	language => {
		void loadFaq(String(language));
	},
	{
		immediate: true
	}
);
</script>

<style lang="scss" scoped>
.search {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 10px;
}
.faq {
	margin-top: 20px;
	.titleSection {
		background-color: #bc683c;
		color: #fff1ad;
		margin-bottom: 10px;
		padding-left: 10px;
	}
	.results {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 10px;
		dt {
			color: #8e3e26;
			cursor: pointer;
			display: flex;
			align-items: center;
			font-variant: small-caps;
			font-weight: bold;
			gap: 6px;
			margin-top: 10px;
			padding-left: 20px;
			p {
				margin: 0;
			}
			&:hover {
				background-color: #8e3e26;
				color: #fff1ad;
			}
		}
		dd {
			background-color: #f3ca92;
			border: 1px solid #fcf9d1;
			display: block;
			margin-inline-start: 40px;
			outline: 2px solid #f8d39c;
			padding: 5px;
			max-width: calc(100% - 52px);
			:deep(.markdown-body) {
				p:first-child {
					margin-top: 0;
				}
				p:last-child {
					margin-bottom: 0;
				}
				ul,
				ol {
					padding-left: 25px;
				}
				img {
					vertical-align: middle;
				}
				strong,
				em {
					color: rgb(142, 62, 38);
				}
			}
		}
	}
}
</style>
