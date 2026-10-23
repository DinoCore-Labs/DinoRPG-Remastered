/**
 * Remastered shared MT dungeon gold reserve — a documented GAME POLICY, NOT a
 * recovered Motion Twin server formula. The archive provides dungeon.gold
 * and 8-bit IGold.v (a map weight), but not the server-side payout algorithm.
 *
 * Award = ceil(remainingGold * rawMapValue / 1000). Thus an equally weighted
 * pile pays less as other players withdraw from the common finite reserve.
 * No automatic replenishment is performed. A 0-value pile or empty reserve
 * awards 0 but still consumes the individual one-time pile flag.
 */
export const MT_DUNGEON_GOLD_WEIGHT_DIVISOR = 1000;

export function mtDungeonGoldAward(rawMapValue: number, remainingGold: number, initialGold: number): number {
	if (!Number.isSafeInteger(rawMapValue) || rawMapValue < 0 || rawMapValue > 255)
		throw new RangeError('Invalid MT IGold 8-bit value');
	if (
		!Number.isSafeInteger(initialGold) ||
		initialGold < 0 ||
		initialGold > 2147483647 ||
		!Number.isSafeInteger(remainingGold) ||
		remainingGold < 0 ||
		remainingGold > initialGold
	)
		throw new RangeError('Invalid remaining or initial dungeon gold');
	if (rawMapValue === 0 || remainingGold === 0) return 0;
	return Math.min(remainingGold, Math.ceil((remainingGold * rawMapValue) / MT_DUNGEON_GOLD_WEIGHT_DIVISOR));
}
