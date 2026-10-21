/**
 * Remastered IGold provisional economy policy.
 * Source: MT DungeonCodec.hx uses an unsigned 8-bit room-item value;
 * gen/Gameplay.hx computes IGold.v from room distance and visited rooms.
 * The ORIGINAL server-side conversion from that value to wallet gold is not archived.
 * We use one wallet gold unit per raw map unit ONLY as an explicit provisional policy.
 * Do not present this as recovered Motion Twin server behavior.
 */
export function mtDungeonGoldAward(rawMapValue: number): number {
	if (!Number.isSafeInteger(rawMapValue) || rawMapValue < 0 || rawMapValue > 255)
		throw new RangeError('Invalid MT IGold 8-bit value');
	return rawMapValue;
}
