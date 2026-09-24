import { defineScenario } from '../scenario.js';

export const MAGNETITE_SCENARIO_KEY = 'magnet';

export const MagnetiteProgression = {
	INITIAL_AMBUSH: 0,
	TALK_TO_KING: 1,
	HUNT_DESTROYER: 2,
	HUNT_NIGHTMARE: 3,
	HUNT_THUNDER: 4,
	ENTER_TEAM_W_CAMP: 5,
	TALK_TO_CAPTAIN: 6,
	RETURN_TO_KING: 7,
	PREPARE_POTION: 8,
	POTION_READY: 9,
	FINAL_ASSAULT: 10,
	FINAL_ASSAULT_WON: 11,
	CLAIM_REWARD: 12,
	COMPLETED: 13
} as const;

export const magnetiteScenario = defineScenario({
	key: MAGNETITE_SCENARIO_KEY,
	sid: 4,
	nameKey: 'scenarios.magnet.name',
	maxProgression: MagnetiteProgression.COMPLETED
});
