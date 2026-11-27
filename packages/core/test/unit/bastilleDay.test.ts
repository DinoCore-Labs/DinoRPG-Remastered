import { describe, expect, it } from 'vitest';

import { Action } from '../../src/models/dinoz/dinozActions.js';
import { GatherType } from '../../src/models/enums/GatherType.js';
import { PlaceEnum } from '../../src/models/enums/PlaceEnum.js';
import { GameEvent, GameTheme } from '../../src/models/game/gameEvents.js';
import { gatherListV2 } from '../../src/models/gather/gatherListV2.js';
import { NotificationType } from '../../src/models/notif/notifType.js';
import { placeListv2 } from '../../src/models/place/placeListv2.js';

describe('Bastille Day (14th of July) event core configurations', () => {
	it('defines GameEvent and GameTheme BASTILLE_DAY', () => {
		expect(GameEvent.BASTILLE_DAY).toBe('BASTILLE_DAY');
		expect(GameTheme.BASTILLE_DAY).toBe('bastille_day');
	});

	it('defines Action PARTY and NotificationType BASTILLE_DAY_REWARD', () => {
		expect(Action.PARTY).toBe('party');
		expect(NotificationType.BASTILLE_DAY_REWARD).toBe('bastilleDayReward');
	});

	it('configures GatherType.PARTY with exact 100 MT rewards', () => {
		const partyGather = gatherListV2[GatherType.PARTY];
		expect(partyGather).toBeDefined();
		expect(partyGather.action).toBe(Action.PARTY);
		expect(partyGather.apparence).toBe('PARTY');
		expect(partyGather.minimumClick).toBe(3);
		expect(partyGather.cost.itemId).toBe(118);
		expect(partyGather.cost.quantity).toBe(1);
		expect(partyGather.found).toBeDefined();

		const totalRewardCount = partyGather.found.reduce((sum, r) => sum + r.count, 0);
		expect(totalRewardCount).toBe(100);
	});

	it('includes GatherType.PARTY in Dinoville gathers', () => {
		const dinoville = placeListv2[PlaceEnum.DINOVILLE];
		expect(dinoville).toBeDefined();
		expect(dinoville.gathers).toContain(GatherType.PARTY);
	});
});
