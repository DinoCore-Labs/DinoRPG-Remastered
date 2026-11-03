import { MT_DUNGEON_DEFINITIONS } from '@dinorpg/core/models/dungeon/dungeon.mtData.js';

/**
 * The original MT `msg_icon` timeline (notably the `misc` frame) is not
 * exported as a PNG. When it cannot be rendered, use the scenario's actual
 * original map icon rather than inventing a sprite or silently omitting it.
 *
 * This is a visual fallback, NOT a claim that `item_scroll.png` equals the
 * original Flash `msg_icon` / `misc` frame.
 */
const BUNDLED_ICONS = new Set(['chest', 'scroll', 'skel', 'gold', 'key']);

export function mtDungeonScenarioMessageIcon(
	mapId: string,
	scenarioIndex: number | null | undefined,
	messageIcon: string | null | undefined
): string | null {
	if (messageIcon && BUNDLED_ICONS.has(messageIcon)) return messageIcon;
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(mapId);
	if (!match || !Number.isSafeInteger(scenarioIndex) || scenarioIndex! < 0) return null;
	const dungeon = MT_DUNGEON_DEFINITIONS.fr.find(def => def.id === match[1]);
	const icon = dungeon?.stages[Number(match[2])]?.scenarios[scenarioIndex!]?.icon;
	return icon && BUNDLED_ICONS.has(icon) ? icon : null;
}
