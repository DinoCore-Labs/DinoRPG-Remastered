<template>
	<TitleHeader :title="pageTitle" header="PNJ :" :subHeader="npcName" />
	<div class="wrapper">
		<div class="box">
			<p class="name">{{ npcName }} :</p>
			<div class="content">
				<span v-if="dialogState" class="dialog" v-html="renderDialogText(dialogState.text)" />
				<div class="portrait">
					<AnimatedNPC v-if="swfName" :NPC="swfName" :flashvars="npcFlashvars" />
					<DZButton :disabled="loading" @click="stop">
						{{ leaveButtonLabel }}
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
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import AnimatedNPC from '../components/common/AnimatedNPC.vue';
import DZButton from '../components/utils/DZButton.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { DialogService } from '../services/dialog.service.js';
import { FightService } from '../services';
import { MissionService } from '../services/mission.service.js';
import { sessionStore } from '../store/sessionStore';

const route = useRoute();
const router = useRouter();
const { t, te } = useI18n();

const dialogState = ref<DialogPhaseResponse | null>(null);
const loaded = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const missionCompleted = ref(false);

const sStore = sessionStore();

const dinozId = computed(() => Number(route.params.id));
const dialogId = computed(() => String(route.params.dialogId));
const phaseId = computed(() => (typeof route.query.phaseId === 'string' ? route.query.phaseId : undefined));

const isMissionDialog = computed(() => route.query.missionAction === '1');
const isInlineMissionDialog = computed(
	() => dialogId.value === '__mission__' && typeof route.query.missionTextKey === 'string'
);

const missionTextKey = computed(() =>
	typeof route.query.missionTextKey === 'string' ? route.query.missionTextKey : ''
);

const missionNameKey = computed(() =>
	typeof route.query.missionNameKey === 'string' ? route.query.missionNameKey : ''
);

const missionGfx = computed(() =>
	typeof route.query.missionGfx === 'string' && route.query.missionGfx.length > 0 ? route.query.missionGfx : ''
);

const isTerminalPhase = computed(() => {
	const phase = dialogState.value;

	if (!phase) return false;
	if (phase.actions.startFight) return false;
	if (phase.actions.missionsGroup) return false;
	if (phase.actions.popup) return false;

	return phase.links.length === 0;
});

const leaveButtonLabel = computed(() =>
	isMissionDialog.value && isTerminalPhase.value ? t('npc.continue') : t('npc.leave')
);

const swfName = computed(() => dialogState.value?.pnj.gfx ?? null);

const npcFlashvars = computed(() => {
	const phase = dialogState.value;

	if (!phase) {
		return '';
	}

	return new URLSearchParams({
		frame: phase.pnj.frame ?? 'speak',
		background: phase.pnj.background ?? '1'
	}).toString();
});

const npcName = computed(() => translateText(dialogState.value?.name ?? ''));
const pageTitle = computed(() => (npcName.value ? `PNJ - ${npcName.value}` : 'PNJ'));

function translateText(value?: string): string {
	const text = value ?? '';
	return te(text) ? t(text).toString() : text;
}

function renderDialogText(text?: string): string {
	return translateText(text).replace(/\n/g, '<br>');
}

function buildInlineMissionDialogState(): DialogPhaseResponse {
	return {
		dialogId: '__mission__',
		phaseId: '__mission__',
		name: missionNameKey.value,
		text: missionTextKey.value,
		fast: false,
		pnj: {
			image: false,
			gfx: missionGfx.value,
			frame: 'speak',
			background: '1'
		},
		links: [],
		actions: {
			startFight: undefined,
			missionsGroup: undefined,
			popup: undefined,
			url: undefined,
			statusKey: undefined
		}
	};
}

async function navigateBackToDinoz() {
	await router.push({
		name: 'DinozPage',
		params: { id: String(dinozId.value) }
	});
}

async function completeMissionIfNeeded() {
	if (!isMissionDialog.value || !isTerminalPhase.value || missionCompleted.value) {
		return;
	}

	await MissionService.completeAction(dinozId.value);
	missionCompleted.value = true;
}

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

	if (phase.actions.missionsGroup) {
		await router.push({
			name: 'DinozMissions',
			params: {
				id: String(dinozId.value),
				group: phase.actions.missionsGroup
			}
		});

		return;
	}
}

async function loadDialog() {
	if (!Number.isFinite(dinozId.value) || dinozId.value <= 0) {
		error.value = 'Dialogue invalide';
		dialogState.value = null;
		loaded.value = false;
		return;
	}

	loading.value = true;
	error.value = null;
	loaded.value = false;
	dialogState.value = null;
	missionCompleted.value = false;

	try {
		if (isInlineMissionDialog.value) {
			dialogState.value = buildInlineMissionDialogState();
			loaded.value = true;
			return;
		}

		if (!dialogId.value) {
			throw new Error('Dialogue invalide');
		}

		dialogState.value = phaseId.value
			? await DialogService.resumeDialog(dinozId.value, dialogId.value, phaseId.value)
			: await DialogService.startDialog(dinozId.value, dialogId.value);

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
	if (!dialogState.value) {
		return;
	}

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
	loading.value = true;
	error.value = null;

	try {
		await completeMissionIfNeeded();
		await navigateBackToDinoz();
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Impossible de quitter le dialogue';
	} finally {
		loading.value = false;
	}
}

watch(
	() => [
		route.params.id,
		route.params.dialogId,
		route.query.phaseId,
		route.query.missionTextKey,
		route.query.missionNameKey,
		route.query.missionGfx
	],
	() => {
		void loadDialog();
	},
	{ immediate: true }
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
