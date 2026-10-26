/**
 * Visual-only adapters between historical View.hx overlay *timeline labels*
 * and the PNG families recovered from its graphics export.
 *
 * MT's view uses skin.over = [symbol, symbol] and a 1.15 neighbourhood mask.
 * The complete Flash timeline-to-PNG correspondence is NOT preserved in the
 * named PNG archive. These mappings are COLOR/TEXTURE hypotheses, not an
 * assertion of byte-for-byte original rendering. The opt-in sprite-plan switch
 * is deliberately required by the caller.
 *
 * Grounded texture choices for Cavernes Magnetiques:
 *   dirt       -> stone  (brown rock / dirt)
 *   ruinPurple -> broken (dark purple/slate cracked masonry)
 *   square     -> slab   (purple square stonework)
 * The original placement, ordering, thresholds and mask computation are
 * already performed by dungeon.scene.ts and are not changed here.
 */
export const MT_DUNGEON_OVERLAY_FAMILIES = Object.freeze({
	dirt: 'stone',
	ruinPurple: 'broken',
	square: 'slab',
	grass: 'grass',
	creep: 'creep',
	// These remain explicitly approximate until the Flash overground
	// symbol frames can be compared with the full SWF timeline.
	ruin: 'broken',
	grassDark: 'grass',
	grassLabo: 'grass'
} as const);

export type MtDungeonOverlaySymbol = keyof typeof MT_DUNGEON_OVERLAY_FAMILIES;

export function resolveMtDungeonOverlayArt(
	symbol: string,
	mask: number
): {
	file: string;
	family: string;
	verifiedOriginalMapping: false;
} | null {
	if (!Number.isInteger(mask) || mask < 1 || mask > 15) return null;
	if (!Object.prototype.hasOwnProperty.call(MT_DUNGEON_OVERLAY_FAMILIES, symbol)) return null;
	const family = MT_DUNGEON_OVERLAY_FAMILIES[symbol as MtDungeonOverlaySymbol];
	return {
		file: `overground_${family}_${String(mask).padStart(2, '0')}.png`,
		family,
		verifiedOriginalMapping: false
	};
}
