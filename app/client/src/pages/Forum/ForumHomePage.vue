<template>
	<div class="forum-page forum-home-page">
		<div class="forum-frame forum-home-frame">
			<div class="forum-home-ornament" aria-hidden="true"></div>
			<div class="forum-menu">
				<RouterLink
					v-for="entry in categories"
					:key="entry.category"
					class="forum-menu-entry"
					:to="{
						name: 'ForumCategory',
						params: {
							category: entry.category
						}
					}"
				>
					<span class="forum-menu-icon">
						<img :src="getImgURL('act', entry.icon)" alt="" />
					</span>
					<span class="forum-menu-content">
						<strong>{{ entry.title }}</strong>
						<em>{{ entry.description }}</em>
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
						<strong>Mes favoris</strong>
						<em>La liste de vos sujets de discussion préférés.</em>
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
import type { ForumCategory } from '@dinorpg/core/models/forum/forum.js';

import { userStore } from '../../store/userStore';
import { getImgURL } from '../../utils/getImgURL';

const user = userStore();

const categories: Array<{
	category: ForumCategory;
	icon: string;
	title: string;
	description: string;
}> = [
	{
		category: 'QUESTIONS',
		icon: 'act_help',
		title: 'Questions / Réponses',
		description: 'Trouvez ici toutes les réponses à vos questions !'
	},
	{
		category: 'GAME',
		icon: 'act_explore',
		title: 'Discussions autour du jeu',
		description: 'Discutez du monde de DinoRPG : dinoz, lieux, missions, etc...'
	},
	{
		category: 'CLANS',
		icon: 'act_castle',
		title: 'Clans',
		description: 'Discutez entre Clans, ou venez recruter ici vos futurs membres !'
	},
	{
		category: 'CHAOS',
		icon: 'act_talk',
		title: 'Auberge du Chaos',
		description: 'Les discussions sans rapport avec DinoRPG sont à écrire ici.'
	}
];
</script>

<style lang="scss">
@use '../../style/forum';
</style>
