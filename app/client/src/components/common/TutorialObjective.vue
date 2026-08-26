<template>
	<section v-if="tutorialStore.isVisible && objective" class="tutorial-objective">
		<img :src="getImgURL('background', 'tuto_bg_header')" class="tutorial-objective__header" alt="" />
		<div class="tutorial-objective__body">
			<div class="tutorial-objective__content">
				<div class="tutorial-objective__infos">
					<div class="tutorial-objective__title">
						{{
							t('tutorial.objective', {
								title: t(`tutorial.objectives.${objective.id}.title`)
							})
						}}
					</div>
					<div class="tutorial-objective__text" v-html="t(`tutorial.objectives.${objective.id}.begin`)" />
				</div>
				<div class="tutorial-objective__swf">
					<AnimatedNPC NPC="michel" />
				</div>
			</div>
		</div>
		<img :src="getImgURL('background', 'tuto_bg_footer')" class="tutorial-objective__footer" alt="" />
		<button type="button" class="tutorial-objective__close" :title="t('tutorial.close')" @click="tutorialStore.hide()">
			<img :src="getImgURL('icons', 'small_delete')" alt="" />
		</button>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTutorialStore } from '../../store/tutorialStore';
import AnimatedNPC from './AnimatedNPC.vue';

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
	width: 100%;
	margin-top: 10px;
	margin-bottom: 12px;
	box-sizing: border-box;
	color: #fff4c4;
}

/*
 * Header et footer :
 * l'image détermine naturellement sa hauteur.
 */
.tutorial-objective__header,
.tutorial-objective__footer {
	display: block;
	width: 100%;
	height: auto;
	user-select: none;
	pointer-events: none;
}

/*
 * Partie centrale répétable.
 */
.tutorial-objective__body {
	width: 100%;
	background-image: url('../../assets/background/tuto_bg_pix.webp');
	background-repeat: repeat-y;
	background-position: top center;
	background-size: 100% auto;
}

.tutorial-objective__content {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 6px 14px 8px;
}

.tutorial-objective__infos {
	flex: 1;
	min-width: 0;
}

.tutorial-objective__title {
	margin-bottom: 6px;
	font-weight: 700;
	text-transform: uppercase;
	color: #ffe26d;
	background: #441c0e;
	box-sizing: border-box;
}

.tutorial-objective__text {
	font-size: 14px;
	font-style: italic;
	line-height: 1.35;
}

/*
 * Bouton fermeture
 */
.tutorial-objective__close {
	position: absolute;
	top: -19.5px;
	right: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 25px;
	height: 25px;
	padding: 0;
	border: 0;
	cursor: pointer;
	background: url('../../assets/background/tuto_closeBg.webp') no-repeat center;
}
.tutorial-objective__close img {
	width: 12px;
	height: 12px;
}
</style>
