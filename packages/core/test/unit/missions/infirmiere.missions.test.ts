import { describe, expect, it } from 'vitest';

import { MapZone } from '../../../src/models/enums/MapZone.js';
import { PlaceEnum } from '../../../src/models/enums/PlaceEnum.js';
import { infirmiereMissions } from '../../../src/models/missions/data/infirmiere.missions.js';

const definitions = new Map(infirmiereMissions.map(mission => [mission.key, mission]));

describe('Anna Tomie — mission definitions from MT infirmiere.xml', () => {
	it('registers the seven original missions with their original keys', () => {
		expect(infirmiereMissions.map(mission => mission.key)).toEqual([
			'ingr1',
			'ingr2',
			'ingr3',
			'kill1',
			'kill2',
			'bless1',
			'bless2'
		]);
		expect(infirmiereMissions.every(mission => mission.group === 'infirmiere')).toBe(true);
	});
	it('preserves ingredient quantities and XP / gold rewards', () => {
		for (const [key, ingredientKey, quantity, xp, gold] of [
			['ingr1', 'feuilles_de_pelinae', 10, 10, 0],
			['ingr2', 'bolet_phalisk_blanc', 5, 20, 0],
			['ingr3', 'orchidee_fantasque', 1, 30, 500]
		] as const) {
			const mission = definitions.get(key)!;
			expect(mission.goals[0]).toMatchObject({
				type: 'USE_INGREDIENT',
				ingredientKey,
				quantity,
				place: PlaceEnum.CLINIQUE
			});
			expect(mission.rewards).toEqual([{ type: 'XP', value: xp }, ...(gold ? [{ type: 'GOLD', value: gold }] : [])]);
		}
	});
	it('preserves kill goals in the original MT zone 6', () => {
		for (const [key, monsterKey, gold] of [
			['kill1', 'gropi', 500],
			['kill2', 'coq', 600]
		] as const) {
			const mission = definitions.get(key)!;
			expect(mission.goals[0]).toMatchObject({
				type: 'KILL',
				kill: { monsterKeys: [monsterKey], count: 10, force: true, zone: MapZone.DINOWEST }
			});
			expect(mission.rewards).toEqual([
				{ type: 'XP', value: 10 },
				{ type: 'GOLD', value: gold }
			]);
		}
	});
	it('preserves the two rescues with their successive locations and NPCs', () => {
		expect(definitions.get('bless1')?.goals.map(goal => goal.type)).toEqual(['AT', 'TALK', 'AT', 'VALIDATE']);
		expect(definitions.get('bless2')?.goals.map(goal => goal.type)).toEqual(['AT', 'TALK', 'AT', 'TALK', 'VALIDATE']);
		expect(definitions.get('bless2')?.goals[1]).toMatchObject({ gfx: 'tourist_grill', background: '1' });
		expect(definitions.get('bless2')?.goals[3]).toMatchObject({ gfx: 'tourist_grill', background: '2' });
	});
});
