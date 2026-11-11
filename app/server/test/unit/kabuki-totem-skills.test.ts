import { Boss, bossList } from '@dinorpg/core/models/monster/bossList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { describe, expect, it } from 'vitest';

import { KABUKI_TOTEM_ALLIES } from '../../src/Scenario/Controller/kabukiScenario.controller.js';

describe('Motion Twin Kabuki skill assignments', () => {
	it('Barbara and Choupette use Tornade; Poupoule uses Printemps précoce', () => {
		expect(bossList[Boss.IGOR_BARBARA].skills).toEqual([Skill.TORNADE]);
		expect(bossList[Boss.IGOR_CHOUPETTE].skills).toEqual([Skill.TORNADE]);
		expect(bossList[Boss.IGOR_POUPOULE].skills).toEqual([Skill.PRINTEMPS_PRECOCE]);
	});
	it('Ninjutsu has exactly the original four skills', () => {
		expect(KABUKI_TOTEM_ALLIES[1]?.name).toBe('Ninjutsu');
		expect(KABUKI_TOTEM_ALLIES[1]?.skills).toEqual([
			Skill.INSAISISSABLE,
			Skill.DISQUE_VACUUM,
			Skill.PERCEPTION,
			Skill.AGILITE
		]);
	});
	it('Kage keeps both copies of Disque Vacuum and Nuage toxique', () => {
		expect(KABUKI_TOTEM_ALLIES[2]?.name).toBe('Kage');
		expect(KABUKI_TOTEM_ALLIES[2]?.skills).toEqual([
			Skill.INSAISISSABLE,
			Skill.DISQUE_VACUUM,
			Skill.DISQUE_VACUUM,
			Skill.NUAGE_TOXIQUE,
			Skill.PERCEPTION,
			Skill.AGILITE
		]);
	});
	it('all assigned skills belong to the existing game enum', () => {
		for (const monster of [
			bossList[Boss.IGOR_BARBARA],
			bossList[Boss.IGOR_CHOUPETTE],
			bossList[Boss.IGOR_POUPOULE],
			...KABUKI_TOTEM_ALLIES.slice(1)
		]) {
			for (const skill of monster.skills ?? []) {
				expect(Object.values(Skill)).toContain(skill);
			}
		}
	});
});
