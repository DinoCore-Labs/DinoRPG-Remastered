<template>
	<TitleHeader :title="$t('common.legalNotices')" :header="$t('common.legalNotices')" />
	<div class="intro">
		<div v-if="sections.length" class="menu">
			<ul class="list">
				<li
					v-for="(section, index) in sections"
					:key="section.id"
					:class="{ selected: selectedSectionIndex === index }"
					@click="showContent(section, index)"
				>
					{{ section.title }}
				</li>
			</ul>
		</div>
		<div class="image">
			<img :src="getImgURL('design', 'rocky_01')" alt="" />
		</div>
	</div>
	<div class="showContent">
		<div class="content">
			<div class="legalMetadata">
				<span>
					{{ $t('common.lastUpdated', { date: formattedUpdatedAt }) }}
				</span>
			</div>
			<section
				v-for="section in sections"
				:id="`legal-notices-section-${section.id}`"
				:key="section.id"
				class="sectionContent"
			>
				<h3 class="titleSection">
					{{ section.title }}
				</h3>
				<MarkdownRenderer class="legalMarkdown" :source="section.content" />
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import MarkdownRenderer from '../components/common/MarkdownRenderer.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { parseLegalNoticesMarkdown, type LegalNoticesSection } from '../utils/parseLegalNoticesMarkdown';
import { getImgURL } from '../utils/getImgURL';

const LEGAL_NOTICES_UPDATED_AT = '2026-07-05';

const { locale } = useI18n();

const legalNoticesSources = import.meta.glob<string>('../content/legal-notices/*.md', {
	query: '?raw',
	import: 'default'
});

const markdownSource = ref('');
const selectedSectionIndex = ref(0);

const sections = computed(() => parseLegalNoticesMarkdown(markdownSource.value));

const formattedUpdatedAt = computed(() => {
	return new Intl.DateTimeFormat(String(locale.value), {
		dateStyle: 'long',
		timeZone: 'UTC'
	}).format(new Date(`${LEGAL_NOTICES_UPDATED_AT}T12:00:00.000Z`));
});

const loadLegalNotices = async (language: string): Promise<void> => {
	const languagePath = `../content/legal-notices/${language.toUpperCase()}.md`;
	const fallbackPath = '../content/legal-notices/FR.md';
	const loader = legalNoticesSources[languagePath] ?? legalNoticesSources[fallbackPath];

	if (!loader) {
		console.error(`[Legal notices] Markdown file not found for language "${language}"`);
		markdownSource.value = '';
		return;
	}

	markdownSource.value = await loader();
	selectedSectionIndex.value = 0;
};

const showContent = (section: LegalNoticesSection, index: number): void => {
	selectedSectionIndex.value = index;
	void nextTick(() => {
		document.getElementById(`legal-notices-section-${section.id}`)?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	});
};

watch(
	locale,
	language => {
		void loadLegalNotices(String(language));
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
			li {
				display: flex;
				align-items: center;
				gap: 5px;
				padding: 1px 3px;
			}
			li:hover,
			li.selected {
				color: #fce3bc;
				background-color: rgb(142, 62, 38);
			}
		}
	}
	.image {
		margin-top: auto;
		img {
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
		.legalMetadata {
			display: flex;
			flex-direction: column;
			gap: 3px;
			margin: 10px 5px 20px;
		}
		.sectionContent {
			margin-top: 15px;
			scroll-margin-top: 15px;
			.titleSection {
				background-image: url('../assets/design/title/title_h2.webp');
				background-position: left bottom;
				background-repeat: no-repeat;
				color: #fff1ad;
				padding-left: 5px;
			}
		}
		.legalMarkdown {
			:deep(p) {
				line-height: 1.45;
			}
			:deep(ul) {
				padding-left: 30px;
			}
			:deep(li) {
				margin: 8px 0;
				line-height: 1.4;
			}
			:deep(strong) {
				color: rgb(142, 62, 38);
			}
			:deep(a) {
				color: rgb(142, 62, 38);
				font-weight: bold;
				text-decoration: underline;
				text-underline-offset: 2px;

				&:hover {
					color: #71b703;
				}
			}
		}
	}
}

@media only screen and (max-width: 600px) {
	.intro {
		flex-direction: column;
		margin-left: 0;
		align-self: center;
		width: 95%;
		.menu {
			width: 100%;
		}
		.image {
			display: none;
		}
	}
	.showContent {
		width: 95%;
	}
}
</style>
