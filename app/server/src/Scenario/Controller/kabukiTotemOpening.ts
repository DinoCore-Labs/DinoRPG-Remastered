import type { FighterRecap, FightProcessResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';

import type { DetailedFight } from '../../utils/fight/generateFight.js';

/**
 * MT src/fight/Scenario.hx, P.itotem at kabuki:20.
 * All fighters already belong to the simulated fight. This function inserts
 * the original ordered narrative/arrival steps BEFORE its first combat turn;
 * it does not change stats, damage, targeting, rewards, or battle outcome.
 *
 * True on-start dynamic spawning remains a separate engine enhancement.
 */
export function buildKabukiTotemOpening(
	fighters: readonly Pick<FighterRecap, 'id' | 'name' | 'attacker'>[]
): FightStep[] {
	const pick = (name: string, attacker: boolean): Pick<FighterRecap, 'id' | 'name' | 'attacker'> => {
		const matches = fighters.filter(f => f.name === name && f.attacker === attacker);
		if (matches.length !== 1) {
			throw new Error(
				`Kabuki Totem opening expected one fighter ${name} (${attacker ? 'ally' : 'enemy'}), found ${matches.length}`
			);
		}
		return matches[0]!;
	};
	const igor = pick('igor', false);
	const barbara = pick('Barbara', false);
	const choupette = pick('Choupette', false);
	const poupoule = pick('Poupoule', false);
	const yakuzi = pick('yakuzi', true);
	const ninjutsu = pick('Ninjutsu', true);
	const kage = pick('Kage', true);
	const talk = (speakerFid: number, text: string): FightStep => ({
		action: 'fightText',
		text: { type: 'talk', speakerFid, text }
	});
	const arrive = (fid: number): FightStep => ({ action: 'arrive', fid });
	return [
		talk(igor.id, 'scenarios.kabuki.texts.igorFinalTalk'),
		talk(igor.id, 'Barbara !'),
		arrive(barbara.id),
		talk(igor.id, 'Choupette !'),
		arrive(choupette.id),
		talk(igor.id, 'Poupoule !'),
		arrive(poupoule.id),
		talk(igor.id, 'scenarios.kabuki.texts.igorFinalAttack'),
		arrive(yakuzi.id),
		talk(yakuzi.id, 'scenarios.kabuki.texts.yakuziFinalWait'),
		arrive(ninjutsu.id),
		arrive(kage.id),
		talk(yakuzi.id, 'scenarios.kabuki.texts.yakuziFinalHelp')
	];
}

/** Insert just after prepare: renderer sees the roster before arrive events. */
export function applyKabukiTotemOpening(fight: Pick<FightProcessResult, 'fighters' | 'steps'>): void {
	const prepare = fight.steps.findIndex(step => step.action === 'prepare');
	if (prepare === -1) throw new Error('Kabuki Totem opening requires a prepare step');
	const steps = buildKabukiTotemOpening(fight.fighters);
	fight.steps.splice(prepare + 1, 0, ...steps);
}

/**
 * Called between prepareFight and startFight, matching MT Scenario.hx onStartFight.
 * Reserve fighters have already been initialized/prepared by the engine, but are
 * NOT in the visual initial roster and cannot take turns before their arrival.
 * They enter the simulation in the original scripted order; startFight processes
 * everyone after their arrival (passives and beginning-of-combat abilities).
 */
export function stageKabukiTotemOpening(fight: Pick<DetailedFight, 'fighters' | 'steps'>): void {
	const introductions = buildKabukiTotemOpening(fight.fighters);
	const entrants = introductions
		.filter((step): step is Extract<FightStep, { action: 'arrive' }> => step.action === 'arrive')
		.map(step => step.fid);
	const uniqueIds = new Set(entrants);
	if (uniqueIds.size !== entrants.length) throw new Error('Duplicate Kabuki Totem reinforcement ID');

	const initial = fight.fighters;
	const reserve = new Map(
		entrants.map(id => {
			const fighter = initial.find(candidate => candidate.id === id);
			if (!fighter) throw new Error(`Missing Kabuki Totem reinforcement ${id}`);
			return [id, fighter] as const;
		})
	);

	const prepare = fight.steps.find(step => step.action === 'prepare');
	if (!prepare || prepare.action !== 'prepare') {
		throw new Error('Kabuki Totem dynamic opening requires a prepare step');
	}
	// Keep the player's Dinoz and Igor in the initial roster. Late reinforcements
	// enter exclusively through their own arrive event, avoiding duplicate sprites.
	const initialMonsterList = prepare.monsterList.filter(entry => !uniqueIds.has(entry.fid));
	const initialDinozList = prepare.dinozList.filter(entry => !uniqueIds.has(entry.fid));

	// Validation complete: apply the staged entrance atomically to in-memory state.
	prepare.monsterList = initialMonsterList;
	prepare.dinozList = initialDinozList;
	// Preserve the original array: generateFight serializes from config.fighters.
	// Later summoned fighters must be visible in the final recap as well.
	initial.splice(0, initial.length, ...initial.filter(fighter => !uniqueIds.has(fighter.id)));
	for (const step of introductions) {
		if (step.action === 'arrive') {
			const actor = reserve.get(step.fid);
			if (!actor) throw new Error(`Missing staged reinforcement ${step.fid}`);
			fight.fighters.push(actor);
		}
		fight.steps.push(step);
	}
}
