import { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import { LifeEffect } from '@dinorpg/core/models/fight/transpiler.js';

import type { DetailedFight } from './generateFight.js';

/** MT sources: src/fight/Scenario.hx (kabuki phase 19), xml/fr/scenarios.xml. */
export const IGOR_KABUKI_TEXT = {
	fight: "A l'attaque mes Dinoz adorés !",
	leave: "Après vous avoir écrasé, Igor s'éloigne accompagné de ses fidèles Dinoz, en direction de l'Ile du Totem..."
} as const;
const COMPANION_NAMES = ['Barbara', 'Choupette', 'Poupoule'] as const;

/**
 * The dialogue defines all four opponents, but the MT animation brings in the
 * three companions AFTER Igor's introduction. Take the already initialized
 * fighters out of the active roster without changing their original statistics.
 */
export function reserveIgorKabukiCompanions(fight: DetailedFight): DetailedFighter[] {
	const igor = fight.fighters.find(f => !f.attacker && f.name === 'igor');
	if (!igor) throw new Error('MT Igor encounter needs Igor as the main defender');
	const waiting: DetailedFighter[] = [];
	for (const name of COMPANION_NAMES) {
		const indexes = fight.fighters
			.map((fighter, index) => (!fighter.attacker && fighter.name === name ? index : -1))
			.filter(index => index >= 0);
		if (indexes.length !== 1) throw new Error(`MT Igor companion ${name}: expected exactly one fighter`);
		const [removed] = fight.fighters.splice(indexes[0], 1);
		waiting.push(removed);
	}
	return waiting;
}

/**
 * Called immediately after the engine's native startFight hook. Reinforcements
 * are introduced with the standard arrive animation and retain original stats.
 */
export function releaseIgorKabukiCompanions(
	fight: DetailedFight,
	waiting: DetailedFighter[],
	registerStat: (fight: DetailedFight, fighter: DetailedFighter, stat: 'startingHp', amount: number) => void
): void {
	if (waiting.length !== 3 || waiting.map(f => f.name).join('|') !== COMPANION_NAMES.join('|')) {
		throw new Error('MT Igor encounter requires exactly Barbara, Choupette, and Poupoule');
	}
	const igor = fight.fighters.find(f => !f.attacker && f.name === 'igor');
	if (!igor) throw new Error('Igor disappeared before reinforcement entry');
	fight.steps.push({ action: 'fightText', text: { type: 'talk', text: IGOR_KABUKI_TEXT.fight, speakerFid: igor.id } });
	for (const fighter of waiting) {
		fight.steps.push({ action: 'fightText', text: { type: 'talk', text: `${fighter.name} !`, speakerFid: igor.id } });
		fight.fighters.push(fighter);
		registerStat(fight, fighter, 'startingHp', fighter.startingHp);
		fight.steps.push({ action: 'arrive', fid: fighter.id });
	}
}

/**
 * MT phase 19 ends with m.res.won = true even when the player was wiped out.
 * Dead player Dinoz are healed to exactly 1 HP BEFORE FighterResultFiche and
 * the database reward are computed; the player may continue the scenario.
 */
export function finishIgorKabukiCoralFight(fight: DetailedFight): number {
	fight.steps.push({ action: 'fightText', text: { type: 'message', text: IGOR_KABUKI_TEXT.leave } });
	let revived = 0;
	for (const fighter of fight.fighters) {
		if (!fighter.attacker || fighter.type !== FighterType.DINOZ || fighter.hp > 0) continue;
		const missing = 1 - fighter.hp;
		fighter.hp = 1;
		fight.steps.push({
			action: 'heal',
			fighter: { id: fighter.id, name: fighter.name, type: fighter.type, attacker: true },
			hp: missing,
			fx: LifeEffect.Heal
		});
		revived++;
	}
	fight.outcome = FightOutcome.AttackerWin;
	return revived;
}
