<script setup lang="ts">
defineProps<{
	name: string;
	image: string;
	type: string;
	description: string;
}>();
</script>

<template>
	<article class="game-item-card">
		<img class="game-item-card__image" :src="image" :alt="name" />

		<div>
			<h3>{{ name }}</h3>
			<p><strong>Type :</strong> {{ type }}</p>
			<p>{{ description }}</p>
		</div>
	</article>
</template>
