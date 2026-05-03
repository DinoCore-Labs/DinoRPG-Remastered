import { RuntimeDialog, RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';

export function resolveDialogReturnPhase(phaseId: string, won: boolean): string | undefined {
	if (!won) return undefined;
	switch (phaseId) {
		case 'water_fight':
			return 'water_win';

		case 'fire_fight':
			return 'fire_win';

		case 'attack':
			return 'attack_win';

		case 'show':
			return 'show_win';

		case 'fight':
			return 'fight_win';

		default:
			return undefined;
	}
}

export function getDialogFightSpecialStatusKey(phase: RuntimeDialogPhase): string | undefined {
	const statusSpecial = phase.special.find(special => special.type === 'status');
	return statusSpecial?.type === 'status' ? statusSpecial.status : undefined;
}

export function getDialogReturnStatusKeys(phase?: RuntimeDialogPhase): string[] {
	return phase?.effects.flatMap(effect => (effect.type === 'effect' ? [effect.effect] : [])) ?? [];
}

export function getDialogFightLockStatusKey(
	fightPhase: RuntimeDialogPhase,
	returnPhase?: RuntimeDialogPhase
): string | undefined {
	return getDialogFightSpecialStatusKey(fightPhase) ?? getDialogReturnStatusKeys(returnPhase)[0];
}

export function findDialogFightPhaseByReturnPhase(
	dialog: RuntimeDialog,
	returnPhaseId: string
): RuntimeDialogPhase | undefined {
	return Object.values(dialog.phases).find(phase => {
		const isFightPhase = phase.special.some(special => special.type === 'startFight');

		return isFightPhase && resolveDialogReturnPhase(phase.id, true) === returnPhaseId;
	});
}
