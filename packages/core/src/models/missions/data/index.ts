import type { MissionDefinition } from '../mission.js';
import { papyJoeMissions } from './papyJoe.missions.js';
import { shamanMouMissions } from './shamanMou.missions.js';

export const missionList: MissionDefinition[] = [...papyJoeMissions, ...shamanMouMissions];
