<!--
  STEP_20X_MT_MSGBOX
  Frame images are the eight original msgbox_*.png slices already shipped in
  app/client/public/dungeon/mt/. Keep their native 77x41 and 23x41 dimensions.
  No beige panel, background dimmer or fake parchment icon.
-->
<template>
	<div class="mt-msgbox-overlay" :class="`mt-msgbox-overlay--${placement}`" @click.self="dismissOutside">
		<section
			class="mt-msgbox"
			:class="`mt-msgbox--${variant}`"
			role="dialog"
			:aria-modal="variant === 'dialog' ? 'true' : 'false'"
			:aria-label="title || text"
		>
			<img class="mt-msgbox__tab" :src="'/dungeon/mt/item_scroll.png'" aria-hidden="true" />
			<span
				v-for="piece in pieces"
				:key="piece"
				class="mt-msgbox__piece"
				:class="`mt-msgbox__${piece}`"
				aria-hidden="true"
			/>
			<div class="mt-msgbox__content">
				<!-- The Flash-like notice is itself the confirmation control; no visible web button. -->
				<button
					v-if="variant === 'notice'"
					type="button"
					class="mt-msgbox__notice-button"
					:disabled="busy"
					:aria-label="confirmLabel"
					@click="emit('confirm')"
				>
					<span class="mt-msgbox__text">{{ text }}</span>
				</button>
				<template v-else>
					<h3 v-if="title" class="mt-msgbox__title">{{ title }}</h3>
					<p class="mt-msgbox__text">{{ text }}</p>
					<div class="mt-msgbox__actions">
						<button type="button" :disabled="busy" @click="emit('confirm')">{{ confirmLabel }}</button>
						<button v-if="cancelLabel" type="button" :disabled="busy" @click="emit('close')">
							{{ cancelLabel }}
						</button>
					</div>
				</template>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		title?: string;
		text: string;
		confirmLabel: string;
		cancelLabel?: string;
		busy?: boolean;
		variant?: 'notice' | 'dialog';
		placement?: 'screen' | 'viewport';
	}>(),
	{ variant: 'dialog', placement: 'screen', busy: false }
);
const emit = defineEmits<{ confirm: []; close: [] }>();
const pieces = ['topleft', 'top', 'topright', 'left', 'right', 'bottomleft', 'bottom', 'bottomright'] as const;

function dismissOutside(): void {
	// Narrative rewards must never be settled by a click outside the window.
	// Only an explicit cancelable dialog may be dismissed this way.
	if (props.variant === 'dialog' && props.cancelLabel && !props.busy) emit('close');
}
</script>

<style scoped>
.mt-msgbox-overlay {
	inset: 0;
	z-index: 2500;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	box-sizing: border-box;
	/* The MT fog/vignette provides the backdrop; no modern dark modal layer. */
	background: transparent;
}
.mt-msgbox-overlay--screen {
	position: fixed;
}
.mt-msgbox-overlay--viewport {
	position: absolute;
	z-index: 50;
}
.mt-msgbox {
	--mt-corner-x: 77px;
	--mt-corner-y: 41px;
	position: relative;
	box-sizing: border-box;
	width: min(100%, 340px);
	max-height: min(80vh, 330px);
	min-width: 0;
	padding: 16px 18px;
	color: #fff3e8;
	background: #471c12;
	font-family: Arial, Helvetica, sans-serif;
	text-align: center;
	filter: drop-shadow(1px 3px 3px rgb(0 0 0 / 55%));
}
.mt-msgbox--notice {
	width: min(100%, 286px);
	min-height: 73px;
	padding: 13px 20px;
}
.mt-msgbox__piece {
	position: absolute;
	z-index: 0;
	pointer-events: none;
	background-repeat: no-repeat;
	background-size: 100% 100%;
}
.mt-msgbox__topleft,
.mt-msgbox__topright,
.mt-msgbox__bottomleft,
.mt-msgbox__bottomright {
	width: var(--mt-corner-x);
	height: var(--mt-corner-y);
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
	left: var(--mt-corner-x);
	right: var(--mt-corner-x);
	height: var(--mt-corner-y);
	background-repeat: repeat-x;
	background-size: 23px 41px;
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
	top: var(--mt-corner-y);
	bottom: var(--mt-corner-y);
	width: var(--mt-corner-x);
	background-repeat: repeat-y;
	background-size: 77px 41px;
}
.mt-msgbox__left {
	left: 0;
	background-image: url('/dungeon/mt/msgbox_left.png');
}
.mt-msgbox__right {
	right: 0;
	background-image: url('/dungeon/mt/msgbox_right.png');
}
/* A small raised tab, as seen on the 2000s Flash dungeon message frame. */
.mt-msgbox__tab {
	position: absolute;
	z-index: 2501;
	top: -17px;
	left: 50%;
	width: 40px;
	height: auto;
	transform: translateX(-50%);
}
.mt-msgbox__content {
	position: relative;
	z-index: 2;
	max-height: calc(min(80vh, 330px) - 28px);
}
.mt-msgbox__text {
	margin: 0;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	font-size: 13px;
	font-weight: 600;
	line-height: 1.35;
	text-shadow: 0 1px 1px #190b08;
}
.mt-msgbox__notice-button {
	display: block;
	width: 100%;
	min-height: 47px;
	margin: 0;
	padding: 0;
	border: 0;
	color: inherit;
	background: transparent;
	font: inherit;
	text-align: center;
	cursor: pointer;
}
.mt-msgbox__notice-button:focus-visible,
.mt-msgbox__actions button:focus-visible {
	outline: 2px solid #ffe2a0;
	outline-offset: 2px;
}
.mt-msgbox__notice-button:disabled {
	cursor: progress;
}
.mt-msgbox__title {
	margin: 0 0 7px;
	color: #ffe3a6;
	font-size: 14px;
	font-weight: 700;
	line-height: 1.2;
	text-shadow: 0 1px #261108;
}
.mt-msgbox__actions {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 7px;
	margin-top: 12px;
}
.mt-msgbox__actions button {
	padding: 5px 10px;
	border: 1px solid #cf7929;
	border-radius: 2px;
	background: #762912;
	color: #fff1db;
	font-size: 12px;
	font-weight: 700;
	cursor: pointer;
	box-shadow: inset 1px 1px #a64e1f;
}
.mt-msgbox__actions button:hover:not(:disabled) {
	background: #9f3b18;
}
.mt-msgbox__actions button:disabled {
	cursor: progress;
	opacity: 0.6;
}
/* A canvas displayed at 800px scales the original 360px Flash stage up.
   Scale viewport-contained popups with it; do not leave a 286px dialog on an 800px canvas. */
.mt-msgbox-overlay--viewport .mt-msgbox {
	width: min(90cqw, 96%);
	max-height: min(78cqw, 80vh);
}
.mt-msgbox-overlay--viewport .mt-msgbox__text {
	font-size: clamp(13px, 3.35cqw, 29px);
}
.mt-msgbox-overlay--viewport .mt-msgbox__title {
	font-size: clamp(14px, 3.5cqw, 29px);
}
.mt-msgbox-overlay--viewport .mt-msgbox__actions button {
	font-size: clamp(12px, 2.8cqw, 21px);
}
@media (max-width: 370px) {
	.mt-msgbox-overlay {
		padding: 6px;
	}
	.mt-msgbox--dialog {
		padding: 14px;
	}
}
</style>
