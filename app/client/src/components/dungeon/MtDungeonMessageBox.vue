<template>
	<div class="mt-msgbox-overlay" @click.self="$emit('close')">
		<section class="mt-msgbox" role="dialog" aria-modal="true" :aria-label="title">
			<span
				v-for="piece in pieces"
				:key="piece"
				class="mt-msgbox__piece"
				:class="`mt-msgbox__${piece}`"
				aria-hidden="true"
			/>
			<div class="mt-msgbox__content">
				<h3>{{ title }}</h3>
				<p>{{ text }}</p>
				<div class="mt-msgbox__actions">
					<button type="button" :disabled="busy" @click="$emit('confirm')">{{ confirmLabel }}</button>
					<button v-if="cancelLabel" type="button" :disabled="busy" @click="$emit('close')">{{ cancelLabel }}</button>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	title: string;
	text: string;
	confirmLabel: string;
	cancelLabel?: string;
	busy?: boolean;
}>();
defineEmits<{ confirm: []; close: [] }>();
const pieces = ['topleft', 'top', 'topright', 'left', 'right', 'bottomleft', 'bottom', 'bottomright'] as const;
</script>

<style scoped>
.mt-msgbox-overlay {
	position: fixed;
	inset: 0;
	z-index: 2500;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.2rem;
	background: rgb(18 12 8 / 65%);
}
.mt-msgbox {
	--mt-edge: 18px;
	position: relative;
	width: min(100%, 440px);
	max-height: min(80vh, 660px);
	padding: calc(var(--mt-edge) + 8px);
	color: #392718;
	background: #e9d4a5;
	filter: drop-shadow(0 8px 15px rgb(0 0 0 / 45%));
}
.mt-msgbox__piece {
	position: absolute;
	pointer-events: none;
	background-repeat: repeat;
}
.mt-msgbox__topleft,
.mt-msgbox__topright,
.mt-msgbox__bottomleft,
.mt-msgbox__bottomright {
	width: var(--mt-edge);
	height: var(--mt-edge);
	background-repeat: no-repeat;
	background-size: 100% 100%;
}
.mt-msgbox__topleft {
	top: 0;
	left: 0;
	background-image: url('/dungeon/mt/msgbox_topleft.png');
}
.mt-msgbox__topright {
	top: 0;
	right: 0;
	background-image: url('/dungeon/mt/msgbox_topright.png');
}
.mt-msgbox__bottomleft {
	bottom: 0;
	left: 0;
	background-image: url('/dungeon/mt/msgbox_bottomleft.png');
}
.mt-msgbox__bottomright {
	bottom: 0;
	right: 0;
	background-image: url('/dungeon/mt/msgbox_bottomright.png');
}
.mt-msgbox__top,
.mt-msgbox__bottom {
	height: var(--mt-edge);
	left: var(--mt-edge);
	right: var(--mt-edge);
	background-repeat: repeat-x;
}
.mt-msgbox__top {
	top: 0;
	background-image: url('/dungeon/mt/msgbox_top.png');
}
.mt-msgbox__bottom {
	bottom: 0;
	background-image: url('/dungeon/mt/msgbox_bottom.png');
}
.mt-msgbox__left,
.mt-msgbox__right {
	top: var(--mt-edge);
	bottom: var(--mt-edge);
	width: var(--mt-edge);
	background-repeat: repeat-y;
}
.mt-msgbox__left {
	left: 0;
	background-image: url('/dungeon/mt/msgbox_left.png');
}
.mt-msgbox__right {
	right: 0;
	background-image: url('/dungeon/mt/msgbox_right.png');
}
.mt-msgbox__content {
	position: relative;
	max-height: calc(80vh - 4rem);
	overflow: auto;
	text-align: center;
}
.mt-msgbox__content h3 {
	margin: 0 0 0.8rem;
	font-size: 1.12rem;
}
.mt-msgbox__content p {
	margin: 0;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	font-size: 0.95rem;
	line-height: 1.55;
}
.mt-msgbox__actions {
	margin-top: 1.2rem;
	display: flex;
	justify-content: center;
	gap: 0.5rem;
	flex-wrap: wrap;
}
.mt-msgbox__actions button {
	border: 1px solid #865735;
	border-radius: 3px;
	padding: 0.42rem 0.9rem;
	background: #bd8a56;
	color: #211408;
	cursor: pointer;
	font-weight: bold;
}
.mt-msgbox__actions button:hover:not(:disabled) {
	background: #d8a674;
}
.mt-msgbox__actions button:disabled {
	opacity: 0.6;
	cursor: progress;
}
</style>
