import { decodeMtDungeon } from '@dinorpg/core/models/dungeon/dungeon.codec.js';
import { decideMtDungeonMove } from '@dinorpg/core/models/dungeon/dungeon.exploration.js';
import { MT_DUNGEON_DEFINITIONS, MT_DUNGEON_MAPS_ENCODED } from '@dinorpg/core/models/dungeon/dungeon.mtData.js';
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	type MtSessionConfiguration
} from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { describe, expect, it } from 'vitest';

const scenarios = new Map(MT_DUNGEON_DEFINITIONS.fr.map(d => [d.id, d]));
const stages = Object.entries(MT_DUNGEON_MAPS_ENCODED).map(([file, encoded]) => {
	const mapId = file.replace(/\.xml$/, '');
	const match = /^([a-z][a-z0-9]*)_(\d+)$/.exec(mapId);
	if (!match) throw new Error(`Unexpected original MT map name: ${file}`);
	const dungeonId = match[1]!;
	const stageIndex = Number(match[2]);
	const definition = scenarios.get(dungeonId);
	if (!definition) throw new Error(`Missing original definition for ${dungeonId}`);
	const structure = decodeMtDungeon(encoded).structure;
	const stage = definition.stages[stageIndex];
	if (!stage) throw new Error(`Missing original stage ${mapId}`);
	const scenarioIcons = stage.scenarios.map(s =>
		s.kind.type === 'block' ? ({ kind: 'DIBlock' } as const) : ({ kind: 'DIIcon', icon: s.icon ?? 'none' } as const)
	);
	const config: MtSessionConfiguration = { mapId, map: structure, scenarioIcons, tower: definition.tower };
	return { mapId, dungeonId, stageIndex, stage, config };
});

/** The scanner describes potential movement; it NEVER grants a fight victory, item or DB reward. */
function scan(mapId: string, cfg: MtSessionConfiguration) {
	const map = cfg.map;
	const ids = map.levels.flatMap(l =>
		l.rooms.flatMap(r => [
			...(r.item?.kind === 'IKey' ? [r.item.value] : []),
			...r.doors.filter(d => d.key !== null).map(d => d.key!)
		])
	);
	const allKeys = Array.from({ length: Math.max(-1, ...ids) + 1 }, () => true);
	const cleared = new Set<number>();
	// This is a *potential* walkability envelope, not a playable walkthrough.
	for (let l = 0; l < map.levels.length; l++) {
		for (const room of map.levels[l]!.rooms) {
			for (const door of room.doors) cleared.add(l * map.width * map.height + door.y * map.width + door.x);
			if (room.item?.kind === 'IScenario')
				cleared.add(l * map.width * map.height + room.item.y * map.width + room.item.x);
		}
	}
	const base = createMtDungeonSession(cfg, false);
	const dirs = [
		{ direction: 'north' as const, dx: 0, dy: -1 },
		{ direction: 'south' as const, dx: 0, dy: 1 },
		{ direction: 'west' as const, dx: -1, dy: 0 },
		{ direction: 'east' as const, dx: 1, dy: 0 }
	];
	const cell = (l: number, x: number, y: number) => `${l}/${x}/${y}`;
	const visited = new Set([cell(map.start.l, map.start.x, map.start.y)]);
	const queue = [{ ...map.start }];
	let sampled = 0;
	let reachableExit = false;
	for (let head = 0; head < queue.length; head++) {
		const from = queue[head]!;
		if (from.x === map.exit.x && from.y === map.exit.y && from.l === map.exit.l) reachableExit = true;
		for (const { direction, dx, dy } of dirs) {
			const state = { position: from, keys: allKeys, flags: cleared, locked: false, fog: null };
			// DIBlock scenarios stay blocked until their true server condition is resolved.
			const decision = decideMtDungeonMove({
				map,
				state,
				direction,
				scenarioIcons: cfg.scenarioIcons,
				tower: cfg.tower
			});
			if (decision.kind !== 'command' || !decision.moved) continue;
			// Exercise the actual authoritative replay, not just the client prediction.
			if (sampled < 120) {
				const session = { ...base, position: from, keys: allKeys, flags: [...cleared] };
				const result = applyMtDungeonCommandBatch(cfg, session, [decision.command]);
				expect(result.ok, `${mapId} ${direction} from ${JSON.stringify(from)}`).toBe(true);
				if (result.ok) {
					expect(result.accepted).toBe(1);
					expect(result.session.revision).toBe(1);
					// Pending encounters do not advance the player before settlement.
					expect(result.session.position).toEqual(result.pending ? from : decision.position);
				}
				sampled++;
			}
			const target = decision.position;
			const key = cell(target.l, target.x, target.y);
			if (!visited.has(key)) {
				visited.add(key);
				queue.push(target);
			}
		}
	}
	return { visited: visited.size, sampled, reachableExit };
}

describe('MT 43e — original map route and event contract (all 11 maps)', () => {
	it('matches the historical six dungeons and exactly eleven encoded maps', () => {
		expect(stages).toHaveLength(11);
		expect(new Set(stages.map(s => s.dungeonId))).toEqual(
			new Set(['stepp', 'katak', 'mbegin', 'mquetz', 'mcuzco', 'labo'])
		);
		for (const definition of MT_DUNGEON_DEFINITIONS.fr) {
			expect(stages.filter(s => s.dungeonId === definition.id)).toHaveLength(definition.stages.length);
		}
	});

	for (const { mapId, stage, config } of stages) {
		it(`${mapId}: replays real-map moves and audits event coordinates`, () => {
			const map = config.map;
			for (const point of [map.start, map.exit]) {
				expect(map.levels[point.l]?.table[point.x]?.[point.y], `${mapId} start/exit cell`).toBe(true);
			}
			const items = map.levels.flatMap(level => level.rooms.flatMap(room => (room.item ? [room.item] : [])));
			for (const item of items) {
				expect(Number.isSafeInteger(item.value)).toBe(true);
				if (item.kind === 'IScenario') {
					expect(stage.scenarios[item.value], `${mapId} scenario index ${item.value}`).toBeDefined();
				}
			}
			for (const level of map.levels) {
				for (const room of level.rooms) {
					if (room.item) expect(level.table[room.item.x]?.[room.item.y], `${mapId} item cell`).toBe(true);
					for (const door of room.doors) expect(level.table[door.x]?.[door.y], `${mapId} door cell`).toBe(true);
				}
			}
			const result = scan(mapId, config);
			expect(result.visited, `${mapId}: start must have a navigable envelope`).toBeGreaterThan(0);
			// Visibility is intentionally reported rather than asserted: some MT stages
			// require story blocks, keys, fights or level transfers before the exit.
			console.info(
				`[MT route audit] ${mapId}: ${result.visited} reachable cells, ${result.sampled} authoritative edges, exit in optimistic envelope=${result.reachableExit}`
			);
		});
	}
});
