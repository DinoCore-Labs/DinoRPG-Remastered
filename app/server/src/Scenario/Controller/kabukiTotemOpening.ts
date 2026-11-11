import type { FighterRecap, FightProcessResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';

/**
 * MT src/fight/Scenario.hx, P.itotem at kabuki:20.
 * All fighters already belong to the simulated fight. This function inserts
 * the original ordered narrative/arrival steps BEFORE its first combat turn;
 * it does not change stats, damage, targeting, rewards, or battle outcome.
 *
 * True on-start dynamic spawning remains a separate engine enhancement.
 */
export function buildKabukiTotemOpening(fighters: readonly FighterRecap[]): FightStep[] {
	const pick = (name: string, attacker: boolean): FighterRecap => {
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
