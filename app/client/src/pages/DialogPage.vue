<template>
	<TitleHeader :title="pageTitle" :header="headerTitle" :subHeader="npcName" />
	<div class="wrapper">
		<div class="box">
			<p class="name">{{ npcName }} :</p>
			<div class="content">
				<span v-if="dialogState" class="dialog" v-html="renderDialogText(dialogState.text)" />
				<div class="portrait">
					<AnimatedNPC v-if="swfName" :NPC="swfName" :flashvars="npcFlashvars" />
					<DZButton :disabled="loading" @click="stop">
						{{ $t('npc.leave') }}
					</DZButton>
				</div>
			</div>
		</div>
		<div class="footer"></div>
		<ul v-if="loaded && dialogState && dialogState.links.length > 0" id="answer">
			<li v-for="choice in dialogState.links" :key="choice.id">
				<a v-html="renderDialogText(choice.text)" @click.prevent="chooseStep(choice.id, choice.confirm)" />
			</li>
		</ul>
		<p v-if="error" class="error">{{ error }}</p>
		<p v-if="dialogState?.actions.url" class="extra-action">
			<a :href="dialogState.actions.url" target="_blank" rel="noopener">
				{{ $t('npc.openLink') }}
			</a>
		</p>
	</div>
</template>

<script setup lang="ts">
import type { DialogPhaseResponse } from '@dinorpg/core/models/dialogs/dialogResponse.js';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AnimatedNPC from '../components/common/AnimatedNPC.vue';
import DZButton from '../components/utils/DZButton.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { DialogService } from '../services/dialog.service.js';
import { FightService } from '../services';
import { sessionStore } from '../store/sessionStore';

const route = useRoute();
const router = useRouter();

const dialogState = ref<DialogPhaseResponse | null>(null);
const loaded = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const dinozId = computed(() => Number(route.params.id));
const dialogId = computed(() => String(route.params.dialogId));

const swfName = computed(() => dialogState.value?.pnj.gfx ?? null);
const npcFlashvars = computed(() => {
	if (!dialogState.value) return '';

	return new URLSearchParams({
		frame: dialogState.value.pnj.frame ?? 'speak',
		background: dialogState.value.pnj.background ?? '1'
	}).toString();
});

const pageTitle = computed(() => `PNJ - ${npcName.value}`);
const headerTitle = computed(() => 'PNJ :');

const { t, te } = useI18n();

function translateText(key: string | undefined): string {
	const value = key ?? '';
	return te(value) ? t(value) : value;
}

function renderDialogText(text: string | undefined): string {
	return translateText(text).replace(/\n/g, '<br>');
}

const npcName = computed(() => translateText(dialogState.value?.name ?? ''));

const sStore = sessionStore();

async function handlePhaseActions(phase: DialogPhaseResponse) {
	if (phase.actions.startFight) {
		const fight = await FightService.processDialogFight(dinozId.value, phase.dialogId, phase.phaseId);

		sStore.setFightResult(fight);

		await router.push({
			name: 'FightPage',
			params: { dinozId: String(dinozId.value) }
		});

		return;
	}

	if (phase.actions.popup) {
		// plus tard
	}
}

const resumePhaseId = computed(() => (typeof route.query.phaseId === 'string' ? route.query.phaseId : undefined));

async function loadDialog() {
	if (!Number.isFinite(dinozId.value) || dinozId.value <= 0 || !dialogId.value) {
		error.value = 'Dialogue invalide';
		return;
	}

	loading.value = true;
	error.value = null;
	loaded.value = false;

	try {
		if (resumePhaseId.value) {
			dialogState.value = await DialogService.resumeDialog(dinozId.value, dialogId.value, resumePhaseId.value);
		} else {
			dialogState.value = await DialogService.startDialog(dinozId.value, dialogId.value);
		}

		loaded.value = true;

		if (dialogState.value) {
			await handlePhaseActions(dialogState.value);
		}
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de charger le dialogue';
	} finally {
		loading.value = false;
	}
}

async function chooseStep(linkId: string, confirmChoice: boolean) {
	if (!dialogState.value) return;

	if (confirmChoice && !window.confirm('Confirmer cette action ?')) {
		return;
	}

	loading.value = true;
	error.value = null;

	try {
		dialogState.value = await DialogService.selectDialogLink(
			dinozId.value,
			dialogState.value.dialogId,
			linkId,
			dialogState.value.phaseId
		);

		if (dialogState.value) {
			await handlePhaseActions(dialogState.value);
		}
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de continuer le dialogue';
	} finally {
		loading.value = false;
	}
}

async function stop() {
	await router.push({
		name: 'DinozPage',
		params: { id: String(dinozId.value) }
	});
}

onMounted(loadDialog);

watch(
	() => [route.params.id, route.params.dialogId],
	() => {
		loadDialog();
	}
);
</script>

<style lang="scss" scoped>
.wrapper {
	width: 95%;
	align-self: center;
}

.box {
	cursor: pointer;
	background:
		url('../assets/background/dialog_top_left.webp'), url('../assets/background/dialog_top_right.webp'),
		url('../assets/background/dialog_top_center.webp'), url('../assets/background/dialog_footer_left.webp'),
		url('../assets/background/dialog_footer_right.webp'), url('../assets/background/dialog_footer_center.webp'),
		url('../assets/background/dialog_center_left.webp'), url('../assets/background/dialog_center_right.webp'),
		url('../assets/background/dialog_center_center.webp');
	background-position-x: left, right, center, left, right, center, left, right, center;
	background-position-y: top, top, top, bottom, bottom, bottom, 40px, 40px, 40px;
	background-repeat: no-repeat, no-repeat, repeat-x, no-repeat, no-repeat, repeat-x, repeat-y, repeat-y, repeat;

	padding-right: 5px;
	padding-left: 5px;

	.name {
		margin-left: 15px;
		padding-top: 15px;
		font-variant: small-caps;
		font-weight: bold;
		font-size: 10pt;
		color: #693118;
	}

	.content {
		min-height: 148px;
		padding: 1px;
		background-repeat: no-repeat;
		background-position: bottom left;
		overflow: hidden;
		display: flex;
		justify-content: space-between;
		gap: 15px;

		.portrait {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 5px;
			width: fit-content;
		}

		.dialog {
			width: fit-content;
			float: left;
			position: relative;
			margin-bottom: 10px;
			margin-left: 10px;
			color: #fff3b3;
			font-size: 10pt;
			font-style: italic;
			overflow: hidden;
		}
	}
}

#answer {
	list-style: none;
	padding-top: 5px;
	padding-bottom: 5px;
	background-color: #9a4029;
	border: 1px solid white;
	outline: 1px solid black;

	li a {
		display: block;
		padding-left: 20px;
		color: #fdd58a;
		font-family: Verdana, sans-serif;
		text-decoration: none;
		font-size: 10pt;
		line-height: 12pt;
		background-image: url('../assets/button/dot.webp');
		background-position: 13px 8px;
		background-repeat: no-repeat;
		border-radius: 0;
		cursor: pointer;
		font-variant: small-caps;

		&:first-letter {
			font-size: 115%;
		}

		&:hover {
			color: #9a4029;
			background-color: #fdd58a;
		}
	}
}

.error {
	margin-top: 10px;
	color: #a40000;
}

.extra-action {
	margin-top: 10px;
}
</style>
