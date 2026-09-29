<template>
	<div v-if="display" class="modal-background">
		<div class="modal-box">
			<div class="piglou-content">
				<button class="modal-close" @click="display = false">
					<img :src="getImgURL('icons', 'small_delete')" alt="X" />
				</button>
				<div class="snow-flakes"></div>
				<div class="snow-flakes layer-2"></div>

				<div class="story-text">
					<div class="story-placeholder">
						<span>{{ fullText }}</span>
					</div>
					<div class="story-animated">
						<span>{{ typedText1 }}{{ typedText2 }}{{ typedText3 }}{{ typedText4 }}</span>
					</div>
				</div>

				<div class="title-container">
					<div class="title-placeholder">{{ $t('events.announcePopup.title') }}</div>
					<transition name="bounce">
						<div v-show="step >= 5" class="big-title-animated">{{ $t('events.announcePopup.title') }}</div>
					</transition>
				</div>

				<div class="button-wrapper">
					<div class="button-placeholder">
						<DZButton class="no-first-letter">{{ $t('events.announcePopup.viewEvent') }}</DZButton>
					</div>
					<transition name="fade">
						<div v-show="step >= 6" class="button-animated">
							<DZButton class="no-first-letter" @click="goToEvent">{{ $t('events.announcePopup.viewEvent') }}</DZButton>
						</div>
					</transition>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { GameEvent } from '@dinorpg/core/models/game/gameEvents.js';
import { gameConfigStore } from '../../store/gameConfigStore.js';
import DZButton from '../utils/DZButton.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'EventAnnouncePopup',
	components: { DZButton },
	setup() {
		const display = ref(false);
		const step = ref(0);
		const router = useRouter();

		const typedText1 = ref('');
		const typedText2 = ref('');
		const typedText3 = ref('');
		const typedText4 = ref('');

		const { t } = useI18n();

		const textsToType = [
			t('events.announcePopup.text1'),
			t('events.announcePopup.text2'),
			t('events.announcePopup.text3'),
			t('events.announcePopup.text4')
		];

		const fullText = textsToType.join('');

		const typeText = async (text: string, targetRef: Ref<string>, speed: number) => {
			for (let i = 0; i < text.length; i++) {
				targetRef.value += text.charAt(i);
				await new Promise(r => setTimeout(r, speed));
			}
		};

		const runAnimation = async () => {
			step.value = 0;
			typedText1.value = '';
			typedText2.value = '';
			typedText3.value = '';
			typedText4.value = '';

			await new Promise(r => setTimeout(r, 600));

			step.value = 1;
			await typeText(textsToType[0], typedText1, 80);
			await new Promise(r => setTimeout(r, 600));

			step.value = 2;
			await typeText(textsToType[1], typedText2, 60);
			await new Promise(r => setTimeout(r, 600));

			step.value = 3;
			await typeText(textsToType[2], typedText3, 35);
			await new Promise(r => setTimeout(r, 1000));

			step.value = 4;
			await typeText(textsToType[3], typedText4, 70);
			await new Promise(r => setTimeout(r, 800));

			step.value = 5; // TITRE (BAM !)
			await new Promise(r => setTimeout(r, 800));

			step.value = 6; // Bouton
		};

		onMounted(() => {
			const events = gameConfigStore().activeEvents;
			const isChristmas = events.some(e => e.event === GameEvent.CHRISTMAS);

			if (isChristmas) {
				const currentYear = new Date().getFullYear();
				const hasSeenPopup = localStorage.getItem(`seen_christmas_event_${currentYear}`);
				if (!hasSeenPopup) {
					display.value = true;
					runAnimation();
				}
			}
		});

		const goToEvent = () => {
			const currentYear = new Date().getFullYear();
			localStorage.setItem(`seen_christmas_event_${currentYear}`, 'true');

			display.value = false;
			router.push('/news');
		};

		return { display, step, typedText1, typedText2, typedText3, typedText4, fullText, goToEvent };
	}
});
</script>

<style lang="scss" scoped>
@use 'sass:color';

.modal-background {
	position: fixed;
	background: color.adjust(#09092d65, $alpha: 0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;

	.modal-box {
		box-sizing: border-box;
		max-width: 500px;
		width: 95%; /* Responsive width */
		height: auto; /* Height dictated by content */
		position: relative;
		animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;

		/* Remove overflow: hidden here so the button can hang outside */
	}
}

.modal-close {
	position: absolute;
	top: 10px;
	right: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	border: 0;
	padding: 5px;
	cursor: pointer;
	z-index: 10;
	transition: transform 0.1s;

	&:hover {
		transform: scale(1.2);
	}

	img {
		width: 18px;
		height: 18px;
	}
}

.piglou-content {
	box-sizing: border-box;
	text-align: center;
	color: #006064;

	/* Styles visuels déplacés depuis modal-box */
	width: 100%;
	height: auto;
	position: relative;
	padding: 20px 20px 25px 20px; /* Responsive padding */
	font-size: 1.1em;
	background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
	border-radius: 8px;
	border: 2px solid #4dd0e1;
	box-shadow: 0 0 10px 2px rgba(77, 208, 225, 0.5);
	overflow: hidden; /* Cache les flocons de neige qui dépassent */

	display: flex;
	flex-direction: column;
	justify-content: flex-start;

	.story-text {
		position: relative;
		z-index: 2;
		text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
		line-height: 1.5;
		font-size: 1.1em;
		margin-top: 20px; /* Marge en haut pour aérer */
		display: block;

		.story-placeholder {
			visibility: hidden;
		}

		.story-animated {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
		}
	}

	.title-container {
		position: relative;
		z-index: 2;
		font-size: 1.6em;
		font-weight: bold;
		color: #00838f;
		text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9);
		margin: 25px 0 15px 0; /* Plus d'espace en haut avant le titre */
		display: flex;
		align-items: center;
		justify-content: center;

		.title-placeholder {
			visibility: hidden;
		}

		.big-title-animated {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.button-wrapper {
		margin-top: 10px;
		position: relative;
		z-index: 3;
		display: flex;
		justify-content: center;

		.button-placeholder {
			visibility: hidden;
		}

		.button-animated {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			display: flex;
			justify-content: center;
		}
	}
}

// Simple CSS Snow Animation
.snow-flakes {
	position: absolute;
	top: -100px;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
	background-image:
		radial-gradient(4px 4px at 20px 30px, #ffffff 50%, transparent),
		radial-gradient(5px 5px at 80px 70px, #ffffff 50%, transparent),
		radial-gradient(3px 3px at 150px 20px, #ffffff 50%, transparent),
		radial-gradient(6px 6px at 250px 90px, #ffffff 50%, transparent),
		radial-gradient(4px 4px at 320px 40px, #ffffff 50%, transparent),
		radial-gradient(3px 3px at 400px 80px, #ffffff 50%, transparent);
	background-size: 450px 150px;
	animation: snow 4s linear infinite;
	opacity: 0.9;
}

.snow-flakes.layer-2 {
	background-image:
		radial-gradient(3px 3px at 40px 90px, #ffffff 50%, transparent),
		radial-gradient(4px 4px at 120px 40px, #ffffff 50%, transparent),
		radial-gradient(5px 5px at 200px 110px, #ffffff 50%, transparent),
		radial-gradient(3px 3px at 280px 20px, #ffffff 50%, transparent),
		radial-gradient(6px 6px at 360px 100px, #ffffff 50%, transparent);
	background-size: 450px 200px;
	animation: snow 6s linear infinite;
	opacity: 0.6;
}

@keyframes blowUpModal {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}

@keyframes snow {
	0% {
		transform: translateY(0);
	}
	100% {
		transform: translateY(200px);
	}
}

/* Animations de transition Vue */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.bounce-enter-active {
	animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes bounce-in {
	0% {
		transform: scale(0.5);
		opacity: 0;
	}
	60% {
		transform: scale(1.1);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}
</style>
