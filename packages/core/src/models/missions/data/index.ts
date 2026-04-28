import type { MissionDefinition } from '../mission.js';
import { baoBobMissions } from './baoBob.missions.js';
import { dianKorgseyMissions } from './dianKorgsey.missions.js';
import { hulotMissions } from './hulot.missions.js';
import { papyJoeMissions } from './papyJoe.missions.js';
import { rodeurMissions } from './rodeur.missions.js';
import { shamanMouMissions } from './shamanMou.missions.js';

export const missionList: MissionDefinition[] = [
	...papyJoeMissions,
	...shamanMouMissions,
	...rodeurMissions,
	...baoBobMissions,
	...dianKorgseyMissions,
	...hulotMissions
];
