/**
 * Motion Twin DSKBlock prerequisites, sourced from xml/fr/dungeons.xml.
 *
 * Original Dungeon.hx encodes DSKBlock(List<Int>) from <scenario block="...">;
 * View.hx uses the server-provided _sicons to make DIBlock impassable.
 * The historic server-side controller is not archived. Recompute an equivalent
 * server-authoritative view from completed MT scenario flags; never accept an
 * unlocked list or scenario index from the client.
 *
 * Copyright Motion Twin, CC BY-NC-SA 4.0 — integration by Remastered.
 */
import type { MtDungeonScenarioDefinition } from './dungeon.definition.js';
import { getMtFlagIndex } from './dungeon.scene.js';
import type { DungeonIcon, DungeonStructure } from './dungeon.types.js';

export interface MtDungeonBlockRule {
	/** Scenario index of the impassable tile. */
	readonly scenarioIndex: number;
	/** Completed original scenario flags required to clear the tile. */
	readonly requiredFlags: readonly number[];
}

export class MtDungeonBlockError extends Error {
	constructor(public readonly code: 'invalid-original-block' | 'missing-original-scenario') {
		super(`Original MT block rule: ${code}`);
		this.name = 'MtDungeonBlockError';
	}
}

/**
 * Resolve all prerequisites to actual IScenario coordinates from the decoded
 * original map, not to array offsets, fake flags or arbitrary player input.
 * Reject missing and duplicate map occurrences rather than opening a shortcut.
 */
export function compileMtDungeonBlockRules(
	map: DungeonStructure,
	scenarios: readonly MtDungeonScenarioDefinition[]
): readonly MtDungeonBlockRule[] {
	const positions = new Map<number, number[]>();
	for (const [l, level] of map.levels.entries()) {
		for (const room of level.rooms) {
			const item = room.item;
			if (item?.kind !== 'IScenario') continue;
			if (!scenarios[item.value] || scenarios[item.value]!.index !== item.value)
				throw new MtDungeonBlockError('missing-original-scenario');
			const flags = positions.get(item.value) ?? [];
			flags.push(getMtFlagIndex(map, l, item.x, item.y));
			positions.set(item.value, flags);
		}
	}
	const rules: MtDungeonBlockRule[] = [];
	for (const scenario of scenarios) {
		if (scenario.kind.type !== 'block') continue;
		const self = positions.get(scenario.index);
		if (!self || self.length !== 1) throw new MtDungeonBlockError('missing-original-scenario');
		const references = scenario.kind.scenarioIndexes;
		if (!references.length || new Set(references).size !== references.length || references.includes(scenario.index))
			throw new MtDungeonBlockError('invalid-original-block');
		const requiredFlags: number[] = [];
		for (const index of references) {
			if (!Number.isSafeInteger(index) || index < 0 || !scenarios[index] || scenarios[index]!.kind.type === 'block')
				throw new MtDungeonBlockError('invalid-original-block');
			const found = positions.get(index);
			if (!found || found.length !== 1) throw new MtDungeonBlockError('missing-original-scenario');
			requiredFlags.push(found[0]!);
		}
		rules.push({ scenarioIndex: scenario.index, requiredFlags });
	}
	return rules;
}

/** Completion requires ALL prerequisites, as indicated by MT's block list. */
export function isMtDungeonBlockUnlocked(
	rules: readonly MtDungeonBlockRule[] | undefined,
	scenarioIndex: number,
	flags: readonly number[]
): boolean {
	const rule = rules?.find(r => r.scenarioIndex === scenarioIndex);
	if (!rule || rule.requiredFlags.length === 0) return false;
	const visited = new Set(flags);
	return rule.requiredFlags.every(flag => visited.has(flag));
}

/**
 * View.hx makes DIBlock tiles impassable. Only change a verified DIBlock to
 * DINothing after the server has confirmed all prerequisite scenario flags.
 * Does not mutate the cached archive definition or expose any secret rewards.
 */
export function effectiveMtDungeonScenarioIcons(
	icons: readonly DungeonIcon[] | undefined,
	rules: readonly MtDungeonBlockRule[] | undefined,
	flags: readonly number[]
): readonly DungeonIcon[] | undefined {
	if (!icons) return undefined;
	return icons.map((icon, index): DungeonIcon =>
		icon.kind === 'DIBlock' && isMtDungeonBlockUnlocked(rules, index, flags) ? { kind: 'DINothing' } : icon
	);
}

/** Public-safe representation for the authenticated owner of the run. */
export function mtDungeonBlockStates(
	rules: readonly MtDungeonBlockRule[] | undefined,
	flags: readonly number[]
): { scenarioIndex: number; unlocked: boolean }[] {
	return (rules ?? []).map(rule => ({
		scenarioIndex: rule.scenarioIndex,
		unlocked: isMtDungeonBlockUnlocked(rules, rule.scenarioIndex, flags)
	}));
}
