<template>
	<section v-if="tutorialStore.isVisible && objective" class="tutorial-objective">
		<div class="tutorial-objective__content">
			<div class="tutorial-objective__title">
				{{
					t('tutorial.objective', {
						title: t(`tutorial.objectives.${objective.id}.title`)
					})
				}}
			</div>
			<div class="tutorial-objective__text" v-html="t(`tutorial.objectives.${objective.id}.begin`)" />
		</div>
		<button type="button" class="tutorial-objective__close" :title="t('tutorial.close')" @click="tutorialStore.hide()">
			×
		</button>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import { useTutorialStore } from '../../store/tutorialStore';

const { t } = useI18n();

const tutorialStore = useTutorialStore();

const objective = computed(() => tutorialStore.currentObjective);

onMounted(() => {
	void tutorialStore.load();
});
</script>

<style scoped>
.tutorial-objective {
	position: relative;
	display: flex;
	width: 100%;
	box-sizing: border-box;
	margin-bottom: 12px;
	border: 2px solid #9b4b16;
	background: #a94324;
	color: #fff4c4;
}
.tutorial-objective__content {
	flex: 1;
	padding: 10px 14px;
}
.tutorial-objective__title {
	margin-bottom: 6px;
	font-weight: 700;
	text-transform: uppercase;
	color: #ffe26d;
}
.tutorial-objective__text {
	font-size: 14px;
	font-style: italic;
	line-height: 1.35;
}
.tutorial-objective__close {
	position: absolute;
	top: -23px;
	right: 0;
	width: 23px;
	height: 23px;
	border: 1px solid #9b4b16;
	background: #d65c18;
	color: #fff;
	cursor: pointer;
}
</style>
