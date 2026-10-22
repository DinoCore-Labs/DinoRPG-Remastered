/** Dungeon navigation requires an available combat action on every living party member.
 * An Irma activation restores that action using Remastered's existing economy rules.
 * This remains separate from the session's _lock (pending encounter / dungeon interaction).
 */
export interface MtDungeonActionMember {
	id: number;
	leaderId: number | null;
	life: number;
	fight: boolean;
}

export type MtDungeonActionGate = 'ready' | 'missing-party' | 'party-defeated' | 'actions-exhausted';

export function evaluateMtDungeonActionGate(
	members: readonly MtDungeonActionMember[],
	leaderDinozId: number
): MtDungeonActionGate {
	if (
		!Number.isSafeInteger(leaderDinozId) ||
		leaderDinozId <= 0 ||
		!members.some(m => m.id === leaderDinozId && m.leaderId === null)
	)
		return 'missing-party';
	if (members.every(m => m.life <= 0)) return 'party-defeated';
	if (members.some(m => m.life > 0 && m.fight !== true)) return 'actions-exhausted';
	return 'ready';
}
