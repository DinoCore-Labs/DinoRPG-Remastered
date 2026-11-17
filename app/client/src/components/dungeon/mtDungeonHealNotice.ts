import type { MtSceneFeature } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';

type DungeonPosition = Pick<MtDungeonSession, 'mapId' | 'position'>;
type DungeonState = Pick<MtDungeonSession, 'mapId' | 'position' | 'pending'>;

export function shouldShowMtDungeonHealNotice(
	previous: DungeonPosition,
	current: DungeonState,
	features: readonly MtSceneFeature[]
): boolean {
	if (current.pending) return false;

	const hasMoved =
		previous.mapId !== current.mapId ||
		previous.position.x !== current.position.x ||
		previous.position.y !== current.position.y ||
		previous.position.l !== current.position.l;

	if (!hasMoved) return false;

	return features.some(
		feature =>
			feature.kind === 'heal' &&
			!feature.consumed &&
			feature.x === current.position.x &&
			feature.y === current.position.y
	);
}
