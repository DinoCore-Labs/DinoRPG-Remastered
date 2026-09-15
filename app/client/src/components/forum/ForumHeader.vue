<template>
	<header
		class="forum-category-header"
		:class="{
			'forum-category-header--image': bannerUrl,
			'forum-category-header--plain': !bannerUrl
		}"
		:style="bannerStyle"
	>
		<div class="forum-category-header__back">
			<DZButton back :to="backTo">
				{{ resolvedBackLabel }}
			</DZButton>
		</div>
		<h1 :class="{ 'forum-visually-hidden': bannerUrl }">
			{{ title }}
		</h1>
	</header>
</template>

<script setup lang="ts">
import type { ForumCategory } from '@dinorpg/core/models/forum/forum.js';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { getImgURL } from '../../utils/getImgURL';
import DZButton from '../utils/DZButton.vue';

const { t } = useI18n();

const props = withDefaults(
	defineProps<{
		category?: ForumCategory | null;
		title: string;
		backTo: string;
		backLabel?: string;
	}>(),
	{
		category: null
	}
);

const resolvedBackLabel = computed(() => props.backLabel ?? t('forum.backHome'));

const bannerNames: Partial<Record<ForumCategory, string>> = {
	GAME: 'forum_banner_talk',
	CLANS: 'forum_banner_clans',
	CHAOS: 'forum_banner_chaos'
};

const bannerUrl = computed(() => {
	if (!props.category) {
		return '';
	}
	const bannerName = bannerNames[props.category];
	return bannerName ? getImgURL('design/forum', bannerName) : '';
});

const bannerStyle = computed(() => {
	if (!bannerUrl.value) {
		return undefined;
	}
	return {
		backgroundImage: `url("${bannerUrl.value}")`
	};
});
</script>
