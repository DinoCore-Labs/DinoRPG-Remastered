<template>
	<TitleHeader :title="$t('pageTitle.forum')" :header="$t('forum.title')" />
	<div class="forum-page forum-home-page">
		<div class="forum-frame forum-home-frame">
			<form class="forum-home-search" @submit.prevent="submitSearch">
				<img class="forum-search-icon" :src="getImgURL('icons', 'search')" alt="" />
				<label class="forum-visually-hidden" for="forum-home-search">
					{{ $t('forum.search.label') }}
				</label>
				<DZInput
					id="forum-home-search"
					v-model="search"
					class="forum-search-input"
					type="text"
					:maxlength="FORUM_SEARCH_MAX_LENGTH"
				/>
				<DZButton type="submit" size="small" :disabled="search.trim().length < FORUM_SEARCH_MIN_LENGTH">
					{{ $t('forum.search.button') }}
				</DZButton>
			</form>
			<div class="forum-menu">
				<RouterLink
					v-for="entry in categories"
					:key="entry.category"
					class="forum-menu-entry"
					:to="
						entry.category === 'QUESTIONS'
							? { name: 'FAQPage' }
							: {
									name: 'ForumCategory',
									params: {
										category: entry.category
									}
								}
					"
				>
					<span class="forum-menu-icon">
						<img :src="getImgURL('act', entry.icon)" alt="" />
					</span>
					<span class="forum-menu-content">
						<strong>{{ $t(entry.titleKey) }}</strong>
						<em>{{ $t(entry.descriptionKey) }}</em>
					</span>
				</RouterLink>
				<RouterLink
					v-if="user.isLogged"
					class="forum-menu-entry"
					:to="{
						name: 'ForumFavorites'
					}"
				>
					<span class="forum-menu-icon">
						<img :src="getImgURL('act', 'act_fav')" alt="" />
					</span>
					<span class="forum-menu-content">
						<strong>{{ $t('forum.favorites.title') }}</strong>
						<em>{{ $t('forum.favorites.description') }}</em>
					</span>
				</RouterLink>
			</div>
			<div class="forum-goupis" aria-hidden="true">
				<img class="forum-goupi forum-goupi--one" :src="getImgURL('design/forum', 'goupi_01')" alt="" />
				<img class="forum-goupi forum-goupi--two" :src="getImgURL('design/forum', 'goupi_02')" alt="" />
				<img class="forum-goupi forum-goupi--three" :src="getImgURL('design/forum', 'goupi_03')" alt="" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	FORUM_SEARCH_MAX_LENGTH,
	FORUM_SEARCH_MIN_LENGTH,
	type ForumCategory
} from '@dinorpg/core/models/forum/forum.js';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import DZButton from '../../components/utils/DZButton.vue';
import DZInput from '../../components/utils/DZInput.vue';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { userStore } from '../../store/userStore';
import { getImgURL } from '../../utils/getImgURL';

const router = useRouter();

const user = userStore();

const search = ref('');

async function submitSearch(): Promise<void> {
	const query = search.value.trim();
	if (query.length < FORUM_SEARCH_MIN_LENGTH) {
		return;
	}
	await router.push({
		name: 'ForumSearch',
		query: {
			q: query,
			page: '1'
		}
	});
}

const categories: Array<{
	category: ForumCategory;
	icon: string;
	titleKey: string;
	descriptionKey: string;
}> = [
	{
		category: 'QUESTIONS',
		icon: 'act_help',
		titleKey: 'forum.categories.QUESTIONS.title',
		descriptionKey: 'forum.categories.QUESTIONS.description'
	},
	{
		category: 'GAME',
		icon: 'act_explore',
		titleKey: 'forum.categories.GAME.title',
		descriptionKey: 'forum.categories.GAME.description'
	},
	{
		category: 'CLANS',
		icon: 'act_castle',
		titleKey: 'forum.categories.CLANS.title',
		descriptionKey: 'forum.categories.CLANS.description'
	},
	{
		category: 'CHAOS',
		icon: 'act_talk',
		titleKey: 'forum.categories.CHAOS.title',
		descriptionKey: 'forum.categories.CHAOS.description'
	}
];
</script>

<style lang="scss">
@use '../../style/forum';
</style>
