import { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightStep } from '@dinorpg/core/models/fight/fightStep.js';

/**
 * Motion Twin: src/fight/Scenario.hx, scenario(kabuki,4).
 * After Yakuzi is defeated at the Forges he leaves instead of dying.
 * The rule only runs for an explicitly opted-in story encounter.
 * Neither XP nor scenario progression is awarded here: the caller
 * handles rewards and moves kabuki to 4 only after a confirmed victory.
 */
export function escapeYakuziAfterDefeat(fighters: DetailedFighter[], steps: FightStep[]): boolean {
	const yakuzi = fighters.find(f => !f.attacker && f.type === FighterType.BOSS && f.name === 'yakuzi' && !f.escaped);
	if (!yakuzi || yakuzi.hp > 0) return false;
	// Leave step, not a death step. Yakuzi survives to appear at the Gorges.
	// Retain 1 HP so the visual/combat model never treats him as dead.
	yakuzi.hp = 1;
	yakuzi.escaped = true;
	steps.push({
		action: 'leave',
		fighter: { id: yakuzi.id, name: yakuzi.name, type: yakuzi.type, attacker: yakuzi.attacker }
	});
	return true;
}
