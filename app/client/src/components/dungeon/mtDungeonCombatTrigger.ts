import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';

/** No client-computed fight outcomes; just decide which server-only action to call. */
export function mtDungeonCombatTrigger(
	pending: MtDungeonSession['pending'],
	encounter: { kind: string; status: string } | null
): 'guardian' | 'scenario' | null {
	if (pending?.kind === 'guardian') return 'guardian';
	if (pending?.kind === 'scenario' && encounter?.kind === 'scenario-combat' && encounter.status === 'ready-for-combat')
		return 'scenario';
	return null;
}
