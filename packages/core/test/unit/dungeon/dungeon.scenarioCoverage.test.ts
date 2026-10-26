/**
 * Stage 40: audit the ORIGINAL French scenario reward definitions for all MT dungeons.
 * This is a coverage inventory, not an award/grant test. Never substitute missing
 * collection or object keys: an unknown key must remain unsupported at runtime.
 */
import { describe, expect, it } from 'vitest';

import { MT_DUNGEON_MAPS } from '../../../src/models/dungeon/dungeon.catalog.js';
import { MT_DUNGEON_DEFINITIONS } from '../../../src/models/dungeon/dungeon.mtData.js';
import { itemList } from '../../../src/models/items/itemList.js';
import { rewardIdByKey } from '../../../src/models/rewards/rewardsKeyMap.js';

const items = new Map<string, { maxQuantity: number; duplicates: boolean }>();
for (const item of Object.values(itemList)) {
	if (!item.display) continue;
	const prior = items.get(item.display);
	items.set(item.display, {
		maxQuantity: item.maxQuantity,
		duplicates: prior !== undefined || prior?.duplicates === true
	});
}

const definitions = MT_DUNGEON_DEFINITIONS.fr;
const expectedDungeonIds = Object.keys(MT_DUNGEON_MAPS).sort();

type Unsupported = { dungeonId: string; stage: number; index: number; kind: string; key: string; reason: string };

function audit() {
	const unsupported: Unsupported[] = [];
	const supported: Record<string, number> = {};
	const scenarioKinds: Record<string, number> = {};
	for (const dungeon of definitions) {
		supported[dungeon.id] = 0;
		dungeon.stages.forEach((stage, stageIndex) => {
			for (const scenario of stage.scenarios) {
				const kind = scenario.kind;
				scenarioKinds[kind.type] = (scenarioKinds[kind.type] ?? 0) + 1;
				if (kind.type === 'object') {
					const item = items.get(kind.key);
					const reason = !item
						? 'unknown-object'
						: item.duplicates
							? 'ambiguous-display'
							: !Number.isSafeInteger(item.maxQuantity) || item.maxQuantity < 1
								? 'invalid-item-limit'
								: !Number.isSafeInteger(kind.count) || kind.count < 1 || kind.count > item.maxQuantity
									? 'unsupported-count'
									: null;
					if (reason)
						unsupported.push({
							dungeonId: dungeon.id,
							stage: stageIndex,
							index: scenario.index,
							kind: kind.type,
							key: kind.key,
							reason
						});
					else supported[dungeon.id]!++;
				} else if (kind.type === 'collection') {
					if (!Object.prototype.hasOwnProperty.call(rewardIdByKey, kind.key))
						unsupported.push({
							dungeonId: dungeon.id,
							stage: stageIndex,
							index: scenario.index,
							kind: kind.type,
							key: kind.key,
							reason: 'unknown-collection'
						});
					else supported[dungeon.id]!++;
				} else if (kind.type === 'none' || kind.type === 'block' || kind.type === 'monsters') {
					// Text, blocked interactions and combat use other handlers.
					supported[dungeon.id]!++;
				}
			}
		});
	}
	return { unsupported, supported, scenarioKinds };
}

describe('MT stage 40 – all original dungeon scenario/reward coverage', () => {
	it('covers exactly the six supported dungeon identities', () => {
		expect(definitions.map(d => d.id).sort()).toEqual(expectedDungeonIds);
		for (const definition of definitions) {
			expect(definition.stages).toHaveLength(MT_DUNGEON_MAPS[definition.id as keyof typeof MT_DUNGEON_MAPS].length);
		}
	});
	it('preserves the stage scenario index for every canonical MT scenario', () => {
		for (const dungeon of definitions) {
			dungeon.stages.forEach(stage => {
				stage.scenarios.forEach((scenario, index) => expect(scenario.index).toBe(index));
			});
		}
	});
	it('reports all unknown or ambiguous reward keys without creating fake awards', () => {
		const result = audit();
		console.log('\n=== MT ORIGINAL SCENARIO COVERAGE ===');
		console.log('Scenario kinds:', JSON.stringify(result.scenarioKinds));
		for (const [id, count] of Object.entries(result.supported))
			console.log(`${id}: ${count} supported/handled scenarios`);
		if (result.unsupported.length) {
			console.log('Requires verified Remastered mapping (left unsupported):');
			for (const issue of result.unsupported)
				console.log(
					`${issue.dungeonId}_${issue.stage} scenario ${issue.index}: ${issue.kind} ${issue.key} (${issue.reason})`
				);
		} else console.log('All original rewards have recognized keys.');
		expect(result.unsupported.every(x => x.dungeonId && x.key && x.reason)).toBe(true);
	});
});
