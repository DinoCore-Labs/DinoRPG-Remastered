/**
 * Remastered healing area: manual item healing is permitted only while a party
 * stands on a discovered, still-active IHeal cell. The cell is consumed on
 * the first *committed departure*, not on arrival and not when using an item.
 * MT's original client does not persist a one-use IHeal flag; this is the
 * explicit Remastered gameplay policy for persistent dungeon exploration.
 */
import { getMtFlagIndex } from './dungeon.scene.js';
import type { DungeonPoint, DungeonStructure } from './dungeon.types.js';

export function isActiveMtHealZone(
	map: DungeonStructure,
	position: DungeonPoint,
	flags: readonly number[] | ReadonlySet<number>
): boolean {
	const floor = map.levels[position.l];
	if (!floor || position.x < 0 || position.y < 0 || position.x >= map.width || position.y >= map.height) return false;
	const flag = getMtFlagIndex(map, position.l, position.x, position.y);
	if (flags instanceof Set ? flags.has(flag) : Array.from(flags).includes(flag)) return false;
	return floor.rooms.some(
		room => room.item?.kind === 'IHeal' && room.item.x === position.x && room.item.y === position.y
	);
}

/** Never consumes for an invalid/blocked command or a pending unsuccessful fight. */
export function consumeMtHealOnDeparture(
	map: DungeonStructure,
	from: DungeonPoint,
	to: DungeonPoint,
	flags: readonly number[]
): number[] {
	if (from.x === to.x && from.y === to.y && from.l === to.l) return [...flags];
	if (!isActiveMtHealZone(map, from, flags)) return [...flags];
	return [...new Set([...flags, getMtFlagIndex(map, from.l, from.x, from.y)])].sort((a, b) => a - b);
}
