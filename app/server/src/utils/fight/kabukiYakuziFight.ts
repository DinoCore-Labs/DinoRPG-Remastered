import { DetailedFighter } from '@dinorpg/core/models/fight/detailedFighter.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { LifeEffect } from '@dinorpg/core/models/fight/transpiler.js';
import { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';

import type { DetailedFight } from './generateFight.js';
import { initializeMonster } from './getFighters.js';

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

/** Motion Twin: kabuki phase 5, Yakuzi starts with 30 HP (max HP is unchanged). */
export function setGorgesYakuziInitialLife(fighters: DetailedFighter[]): boolean {
	const yakuzi = fighters.find(f => !f.attacker && f.type === FighterType.BOSS && f.name === 'yakuzi');
	if (!yakuzi) return false;
	yakuzi.hp = 30;
	yakuzi.startingHp = 30;
	return true;
}

/**
 * MT Scenario.hx phase 5: on Yakuzi's lethal hit, summon yakkb1 and
 * withdraw Yakuzi. Triggered before checkDeaths, so no premature win.
 * A native fighter is introduced into the existing engine and appears in
 * the FightProcessResult fighter roster (the array is shared by config).
 */
export function summonKabukiAtGorges(fightData: DetailedFight): boolean {
	const yakuzi = fightData.fighters.find(
		f => !f.attacker && f.type === FighterType.BOSS && f.name === 'yakuzi' && !f.escaped
	);
	if (!yakuzi || yakuzi.hp > 0) return false;

	// MT Scenario.hx: m.text(Data.TEXT.kabuki_defend, y)
	fightData.steps.push({
		action: 'fightText',
		text: { type: 'talk', text: KABUKI_FIGHT_TEXT.kabukiDefend, speakerFid: yakuzi.id }
	});

	const count = fightData.fighters.filter(f => f.type !== FighterType.DINOZ).length;
	const renfortApplied = fightData.fighters.filter(f => f.skills.some(skill => skill.id === Skill.M_RENFORTS)).length;
	const wormCalls = fightData.fighters.filter(f => f.skills.some(skill => skill.id === Skill.M_WORM_CALL)).length;
	const kabuki = initializeMonster(
		{ existingMonsters: count, renfortApplied, wormCalls },
		null,
		1,
		monsterList[Monster.KABUKI_YAKUZI],
		fightData.place,
		false,
		fightData.rng
	);
	// Independent enemy, not Yakuzi's disposable invocation; fighting continues.
	kabuki.time = Math.max(fightData.time, yakuzi.time);
	fightData.fighters.push(kabuki);
	fightData.steps.push({ action: 'arrive', fid: kabuki.id });
	// MT heals Yakuzi to 100 HP and removes him from battle.
	yakuzi.maxHp = Math.max(yakuzi.maxHp, 100);
	yakuzi.hp = 100;
	yakuzi.escaped = true;
	fightData.steps.push({
		action: 'leave',
		fighter: {
			id: yakuzi.id,
			name: yakuzi.name,
			type: yakuzi.type,
			attacker: yakuzi.attacker
		}
	});
	return true;
}

/** Original Motion Twin text: xml/fr/scenarios.xml, <s id="kabuki">. */
export const KABUKI_FIGHT_TEXT = {
	yakuziRun: "Profitant d'un instant d'inattention, Yakuzi se relève et s'enfuit !",
	kabukiDefend: "A l'aide !!!!",
	strangeDinoz: 'Mais quel était donc cet étrange dinoz ?!?'
} as const;

/**
 * MT src/fight/Scenario.hx, kabuki phases 4 and 5.
 * Must run after the engine has determined the outcome but BEFORE fighter result
 * HP losses are calculated: otherwise resurrected Dinoz would remain dead in DB.
 * No scenario rewards/progression here: existing dialog fight_win handles those.
 */
export function completeKabukiYakuziFight(
	fightData: DetailedFight,
	encounter: 'kabuki_yakuzi_forges' | 'kabuki_yakuzi_gorges' | undefined
): number {
	if (fightData.outcome !== FightOutcome.AttackerWin) return 0;

	if (encounter === 'kabuki_yakuzi_forges') {
		fightData.steps.push({
			action: 'fightText',
			text: { type: 'message', text: KABUKI_FIGHT_TEXT.yakuziRun }
		});

		let revived = 0;
		for (const fighter of fightData.fighters) {
			if (!fighter.attacker || fighter.type !== FighterType.DINOZ || fighter.hp > 0) continue;
			// Original scenario heals dead Dinoz to exactly one HP after victory.
			// Set combat HP before FightProcessResult.attackers is built.
			const hpToRestore = 1 - fighter.hp;
			fighter.hp = 1;
			fightData.steps.push({
				action: 'heal',
				fighter: {
					id: fighter.id,
					name: fighter.name,
					type: fighter.type,
					attacker: fighter.attacker
				},
				hp: hpToRestore,
				fx: LifeEffect.Heal
			});
			revived++;
		}
		return revived;
	}

	if (encounter === 'kabuki_yakuzi_gorges') {
		fightData.steps.push({
			action: 'fightText',
			text: { type: 'message', text: KABUKI_FIGHT_TEXT.strangeDinoz }
		});
	}
	return 0;
}
