<script setup lang="ts">
import { computed } from 'vue';

import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { SkillTreeType } from '@dinorpg/core/models/enums/SkillTreeType.js';

import TitleHeader from '../components/utils/TitleHeader.vue';
import SkillTree from '../components/dinoz/SkillTree.vue';
import { userStore } from '../store/userStore';

const uStore = userStore();

const elements = [ElementType.FIRE, ElementType.WOOD, ElementType.WATER, ElementType.LIGHTNING, ElementType.AIR];

const hasDiscoveredSkills = computed(() => uStore.discoveredSkills.length > 0);
</script>

<template>
	<main class="skill-trees-page">
		<TitleHeader>
			{{ $t('skillTrees.title') }}
		</TitleHeader>
		<p class="intro">
			{{ $t('skillTrees.description') }}
		</p>
		<p v-if="!hasDiscoveredSkills" class="empty">
			{{ $t('skillTrees.empty') }}
		</p>
		<section class="trees">
			<SkillTree v-for="element in elements" :key="element" :type="element" :tree-type="SkillTreeType.VANILLA" />
		</section>
	</main>
</template>

<style scoped lang="scss">
.skill-trees-page {
	display: grid;
	gap: 12px;
}

.intro,
.empty {
	margin: 0 8px;
	text-align: center;
	font-size: 9pt;
}

.empty {
	font-weight: bold;
	color: #793f1f;
}

.trees {
	display: grid;
	gap: 8px;
}
</style>
