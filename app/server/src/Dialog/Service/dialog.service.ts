import { DialogPhaseResponse, DialogResponseLink } from '@dinorpg/core/models/dialogs/dialogResponse.js';
import { RuntimeDialog, RuntimeDialogLink, RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';
import { dinozStatusIdByKey } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../../prisma/index.js';
import { advanceDinozMissionOnTalk } from '../../Mission/Controller/mission.progress.js';
import { prisma } from '../../prisma.js';
import { checkDialogCondition } from '../../utils/conditions/checkDialogCondition.js';
import { buildDialogContext, getScenarioProgress } from '../Controller/dialog.context.js';
import { applyDialogPhaseEffects } from '../Controller/dialog.effects.js';
import { getDialogById, getDialogs } from '../Controller/dialog.registry.js';
import {
	findDialogFightPhaseByReturnPhase,
	getDialogFightLockStatusKey
} from '../Controller/dialogReturnPhase.controller.js';

type DialogTransaction = Prisma.TransactionClient;

type OpenDialogParams = {
	userId: string;
	dinozId: number;
	dialogId: string;
};

type SelectDialogLinkParams = {
	userId: string;
	dinozId: number;
	dialogId: string;
	phaseId: string;
	linkId: string;
};

export type AvailableDialogSummary = {
	id: string;
	name: string;
	place: RuntimeDialog['place'];
	pnj: RuntimeDialog['pnj'];
};

type EnterDialogPhaseOptions = {
	applySpecials?: boolean;
	applyEffects?: boolean;
	advanceTalkMission?: boolean;
};

export function getDialogPhase(dialog: RuntimeDialog, phaseId: string): RuntimeDialogPhase {
	const phase = dialog.phases[phaseId];
	if (!phase) {
		throw new Error(`Unknown phase "${phaseId}" in dialog "${dialog.id}"`);
	}
	return phase;
}

function getDialogLink(dialog: RuntimeDialog, linkId: string): RuntimeDialogLink {
	const link = dialog.links[linkId];
	if (!link) {
		throw new Error(`Unknown link "${linkId}" in dialog "${dialog.id}"`);
	}
	return link;
}

function ensurePhaseContainsLink(phase: RuntimeDialogPhase, linkId: string, dialogId: string) {
	if (!phase.next.includes(linkId)) {
		throw new Error(`Link "${linkId}" is not available from phase "${phase.id}" in dialog "${dialogId}"`);
	}
}

function resolveVisibleLinks(
	dialog: RuntimeDialog,
	phase: RuntimeDialogPhase,
	context: Awaited<ReturnType<typeof buildDialogContext>>
): DialogResponseLink[] {
	const visibleLinks: DialogResponseLink[] = [];
	for (const linkId of phase.next) {
		const link = getDialogLink(dialog, linkId);
		if (link.cond && !checkDialogCondition(link.cond, context)) {
			continue;
		}
		//console.log('COND RAW', link.id, JSON.stringify(link.cond, null, 2));
		visibleLinks.push({
			id: link.id,
			text: link.text,
			confirm: link.confirm
		});
	}
	return visibleLinks;
}

export async function enterDialogPhase(
	tx: DialogTransaction,
	dialog: RuntimeDialog,
	phase: RuntimeDialogPhase,
	userId: string,
	dinozId: number,
	options: EnterDialogPhaseOptions = {}
): Promise<DialogPhaseResponse> {
	const beforeContext = await buildDialogContext(tx, {
		userId,
		dinozId,
		dialog
	});
	const phaseResult = await applyDialogPhaseEffects(tx, {
		context: beforeContext,
		dialog,
		phase,
		applySpecials: options.applySpecials,
		applyEffects: options.applyEffects
	});
	if (options.advanceTalkMission !== false) {
		await advanceDinozMissionOnTalk(tx, {
			dinozId,
			npcKey: dialog.id
		});
	}
	const afterContext = await buildDialogContext(tx, {
		userId,
		dinozId,
		dialog
	});
	const links = resolveVisibleLinks(dialog, phase, afterContext);
	return {
		dialogId: dialog.id,
		phaseId: phase.id,
		name: phase.name,
		text: phase.text,
		fast: phase.fast,
		pnj: phaseResult.pnj,
		links,
		actions: phaseResult.actions
	};
}

export async function assertDialogAvailability(
	tx: DialogTransaction,
	dialog: RuntimeDialog,
	userId: string,
	dinozId: number
) {
	const context = await buildDialogContext(tx, {
		userId,
		dinozId,
		dialog
	});
	if (dialog.cond && !checkDialogCondition(dialog.cond, context)) {
		throw new ExpectedError('dialogNotAvailable');
	}
}

function withDialogContext(
	context: Awaited<ReturnType<typeof buildDialogContext>>,
	dialog: RuntimeDialog
): Awaited<ReturnType<typeof buildDialogContext>> {
	return {
		...context,
		dialog: {
			id: dialog.id,
			place: dialog.place
		}
	};
}

export async function listAvailableDialogs(params: {
	userId: string;
	dinozId: number;
}): Promise<AvailableDialogSummary[]> {
	return prisma.$transaction(async tx => {
		const availableDialogs: AvailableDialogSummary[] = [];
		const dialogs = getDialogs();

		if (dialogs.length === 0) {
			return availableDialogs;
		}
		const baseContext = await buildDialogContext(tx, {
			userId: params.userId,
			dinozId: params.dinozId,
			dialog: {
				id: dialogs[0].id,
				place: dialogs[0].place
			}
		});
		for (const dialog of dialogs) {
			if (baseContext.dinoz.placeId !== dialog.place) {
				continue;
			}
			const context = withDialogContext(baseContext, dialog);
			if (dialog.cond && !checkDialogCondition(dialog.cond, context)) {
				continue;
			}
			availableDialogs.push({
				id: dialog.id,
				name: dialog.name,
				place: dialog.place,
				pnj: dialog.pnj
			});
		}
		return availableDialogs;
	});
}

export async function startDialog(params: OpenDialogParams): Promise<DialogPhaseResponse> {
	return prisma.$transaction(async tx => {
		const dialog = getDialogById(params.dialogId);
		await assertDialogAvailability(tx, dialog, params.userId, params.dinozId);
		const phase = getDialogPhase(dialog, dialog.first);
		return enterDialogPhase(tx, dialog, phase, params.userId, params.dinozId);
	});
}

export async function selectDialogLink(params: SelectDialogLinkParams): Promise<DialogPhaseResponse> {
	return prisma.$transaction(async tx => {
		const dialog = getDialogById(params.dialogId);
		const currentPhase = getDialogPhase(dialog, params.phaseId);
		const currentContext = await buildDialogContext(tx, {
			userId: params.userId,
			dinozId: params.dinozId,
			dialog
		});
		const postFightState = getPostFightContinuationState(dialog, currentPhase, currentContext);
		if (postFightState === false) {
			throw new ExpectedError(`Dialog fight continuation "${dialog.id}:${currentPhase.id}" has not been completed`);
		}
		/*
		 * true :
		 * on possède une preuve serveur qu'un combat précédent
		 * a été remporté et que cette phase appartient à sa
		 * continuation.
		 *
		 * Le cond global du dialogue peut avoir été invalidé
		 * volontairement par fight_win.
		 */
		if (postFightState !== true) {
			await assertDialogAvailability(tx, dialog, params.userId, params.dinozId);
		}
		const selectedLink = getDialogLink(dialog, params.linkId);
		ensurePhaseContainsLink(currentPhase, selectedLink.id, dialog.id);
		if (selectedLink.cond && !checkDialogCondition(selectedLink.cond, currentContext)) {
			throw new Error(`Link "${selectedLink.id}" is not currently available in dialog "${dialog.id}"`);
		}
		const targetPhase = getDialogPhase(dialog, selectedLink.target);
		return enterDialogPhase(tx, dialog, targetPhase, params.userId, params.dinozId);
	});
}

function isPhaseReachableFrom(dialog: RuntimeDialog, fromPhaseId: string, targetPhaseId: string): boolean {
	if (fromPhaseId === targetPhaseId) {
		return true;
	}
	const visited = new Set<string>();
	const pending: string[] = [fromPhaseId];
	while (pending.length > 0) {
		const phaseId = pending.shift();
		if (!phaseId || visited.has(phaseId)) {
			continue;
		}
		visited.add(phaseId);
		const phase = dialog.phases[phaseId];
		if (!phase) {
			continue;
		}
		for (const linkId of phase.next) {
			const link = dialog.links[linkId];
			if (!link) {
				continue;
			}
			if (link.target === targetPhaseId) {
				return true;
			}
			if (!visited.has(link.target)) {
				pending.push(link.target);
			}
		}
	}
	return false;
}

/**
 * Détermine si une phase fait partie d'une continuation
 * après un combat déjà remporté.
 *
 * Exemple :
 *
 * fight
 *   ↓
 * fight_win
 *   ↓
 * papy
 *   ↓
 * papy2
 *
 * fight_win, papy et papy2 sont tous considérés comme
 * faisant partie de la même continuation post-combat.
 */
function getPostFightContinuationState(
	dialog: RuntimeDialog,
	currentPhase: RuntimeDialogPhase,
	context: Awaited<ReturnType<typeof buildDialogContext>>
): boolean | null {
	let hasFailedCompletionProof = false;
	for (const returnPhase of Object.values(dialog.phases)) {
		/*
		 * Ce n'est une vraie phase de retour que si elle
		 * correspond à une phase contenant un combat.
		 */
		const fightPhase = findDialogFightPhaseByReturnPhase(dialog, returnPhase.id);
		if (!fightPhase) {
			continue;
		}
		/*
		 * La phase courante doit être le fight_win lui-même
		 * ou une phase accessible depuis celui-ci.
		 */
		if (!isPhaseReachableFrom(dialog, returnPhase.id, currentPhase.id)) {
			continue;
		}
		const completionState = getFightReturnCompletionState(dialog, returnPhase, context);
		if (completionState === true) {
			return true;
		}
		if (completionState === false) {
			hasFailedCompletionProof = true;
		}
	}
	/*
	 * false :
	 * la phase appartient bien à une branche post-combat,
	 * mais la victoire n'est pas prouvée.
	 * null :
	 * cette phase n'est pas une continuation post-combat
	 * vérifiable ; on utilisera le contrôle normal du dialogue.
	 */
	return hasFailedCompletionProof ? false : null;
}

function getFightReturnCompletionState(
	dialog: RuntimeDialog,
	returnPhase: RuntimeDialogPhase,
	context: Awaited<ReturnType<typeof buildDialogContext>>
): boolean | null {
	const fightPhase = findDialogFightPhaseByReturnPhase(dialog, returnPhase.id);
	if (!fightPhase) {
		return null;
	}
	let hasCompletionProof = false;
	/*
	 * Preuve historique via statut.
	 */
	const statusKey = getDialogFightLockStatusKey(fightPhase, returnPhase);
	if (statusKey) {
		hasCompletionProof = true;
		const statusId = dinozStatusIdByKey[statusKey];
		if (statusId == null) {
			return false;
		}
		if (!context.dinoz.statusIds.has(statusId)) {
			return false;
		}
	}
	/*
	 * Nouvelle preuve :
	 *
	 * une progression scénario placée dans fight_win
	 * n'est appliquée que par processDialogFight()
	 * après une victoire.
	 */
	for (const effect of returnPhase.effects) {
		if (effect.type !== 'scenario') {
			continue;
		}
		hasCompletionProof = true;
		if (getScenarioProgress(context, effect.scenario) !== effect.phase) {
			return false;
		}
	}
	return hasCompletionProof ? true : null;
}

function isDialogFightReturnPhase(phaseId: string): boolean {
	return ['fight_win', 'attack_win', 'show_win', 'water_win', 'fire_win', 'comb_win'].includes(phaseId);
}

export async function resumeDialogPhase(params: {
	userId: string;
	dinozId: number;
	dialogId: string;
	phaseId: string;
}): Promise<DialogPhaseResponse> {
	return prisma.$transaction(async tx => {
		const dialog = getDialogById(params.dialogId);
		const phase = getDialogPhase(dialog, params.phaseId);
		const context = await buildDialogContext(tx, {
			userId: params.userId,
			dinozId: params.dinozId,
			dialog
		});
		const postFightState = getPostFightContinuationState(dialog, phase, context);
		if (postFightState === false) {
			throw new ExpectedError(`Dialog fight continuation "${dialog.id}:${phase.id}" has not been completed`);
		}
		if (postFightState !== true) {
			await assertDialogAvailability(tx, dialog, params.userId, params.dinozId);
		}
		const isFightReturnPhase = isDialogFightReturnPhase(phase.id);
		/*
		 * Lors d'un resume d'une continuation post-combat,
		 * les effets ont déjà été appliqués lors de l'entrée
		 * réelle dans la phase.
		 *
		 * On ne les rejoue donc jamais.
		 */
		const isPostFightContinuation = postFightState === true;
		return enterDialogPhase(tx, dialog, phase, params.userId, params.dinozId, {
			applySpecials: !isFightReturnPhase && !isPostFightContinuation,
			applyEffects: !isFightReturnPhase && !isPostFightContinuation,
			advanceTalkMission: !isFightReturnPhase && !isPostFightContinuation
		});
	});
}
