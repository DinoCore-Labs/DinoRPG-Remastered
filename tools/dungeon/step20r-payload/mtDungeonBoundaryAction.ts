/** Boundary command following the original four Magnetic Caverns stages.
 * The server remains the sole authority for world exits and stage transitions.
 */
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';

export type MtDungeonBoundaryAction = 'forward' | 'backward' | 'surface-exit' | null;

export function mtDungeonBoundaryAction(run: Pick<MtDungeonSession, 'mapId' | 'pending'>): MtDungeonBoundaryAction {
	const match = /^stepp_([0-3])$/.exec(run.mapId);
	if (!match) return null;
	const stage = Number(match[1]);
	switch (run.pending?.kind) {
		case 'boundary-start':
			return stage === 0 ? 'surface-exit' : 'backward';
		case 'boundary-exit':
			return stage === 3 ? 'surface-exit' : 'forward';
		default:
			return null;
	}
}
