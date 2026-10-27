/** Resolve MT stair transitions across ALL original dungeon definitions. */
import { MT_DUNGEON_MAPS } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';

export type MtDungeonBoundaryAction = 'forward' | 'backward' | 'surface-exit' | null;

export function mtDungeonBoundaryAction(run: Pick<MtDungeonSession, 'mapId' | 'pending'>): MtDungeonBoundaryAction {
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(run.mapId);
	if (!match) return null;
	const id = match[1]!;
	if (!Object.prototype.hasOwnProperty.call(MT_DUNGEON_MAPS, id)) return null;
	const maps = MT_DUNGEON_MAPS[id as keyof typeof MT_DUNGEON_MAPS];
	const stage = Number(match[2]);
	if (stage >= maps.length || maps[stage] !== run.mapId + '.xml') return null;
	switch (run.pending?.kind) {
		case 'boundary-start':
			return stage === 0 ? 'surface-exit' : 'backward';
		case 'boundary-exit':
			return stage === maps.length - 1 ? 'surface-exit' : 'forward';
		default:
			return null;
	}
}
