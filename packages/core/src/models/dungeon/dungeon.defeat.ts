/**
 * Checks an authoritative, current MT dungeon team snapshot.
 * A Dinoz with zero or negative HP is knocked out, never resurrected here.
 */
export function isMtDungeonPartyWiped(
	members: readonly { id: number; leaderId: number | null; life: number }[],
	leaderDinozId: number
): boolean {
	return (
		members.length > 0 &&
		members.some(member => member.id === leaderDinozId && member.leaderId === null) &&
		members.every(member => member.id === leaderDinozId || member.leaderId === leaderDinozId) &&
		members.every(member => member.life <= 0)
	);
}
