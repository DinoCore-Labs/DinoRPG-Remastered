<template>
	<div class="forum-page">
		<div class="forum-frame">
			<header class="forum-banner">
				<h1>Forums DinoRPG</h1>
			</header>

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
						{{ entry.icon }}
					</span>

					<span>
						<strong>
							{{ entry.title }}
						</strong>

						<em>
							{{ entry.description }}
						</em>
					</span>
				</RouterLink>

				<RouterLink
					v-if="user.isLogged"
					class="forum-menu-entry"
					:to="{
						name: 'ForumFavorites'
					}"
				>
					<span class="forum-menu-icon"> ★ </span>

					<span>
						<strong> Mes favoris </strong>

						<em> La liste de vos sujets de discussion préférés. </em>
					</span>
				</RouterLink>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ForumCategory } from '@dinorpg/core/models/forum/forum.js';

import { userStore } from '../../store/userStore';

const user = userStore();

const categories: Array<{
	category: ForumCategory;
	icon: string;
	title: string;
	description: string;
}> = [
	{
		category: 'QUESTIONS',

		icon: '?',

		title: 'Questions / Réponses',

		description: 'Trouvez ici toutes les réponses à vos questions !'
	},
	{
		category: 'GAME',

		icon: '✦',

		title: 'Discussions autour du jeu',

		description: 'Discutez du monde de DinoRPG : dinoz, lieux, missions, etc.'
	},
	{
		category: 'CLANS',

		icon: '⚔',

		title: 'Clans',

		description: 'Discutez entre clans, ou venez recruter ici vos futurs membres !'
	},
	{
		category: 'CHAOS',

		icon: '☵',

		title: 'Auberge du chaos',

		description: 'Discussions sans rapport avec DinoRPG. Publicités, MSN et insultes interdites !'
	}
];
</script>

<style lang="scss">
@use '../styles/forum';
</style>
