import type { MissionDefinition } from '../mission.js';
import { papyJoeMissions } from './papyJoe.missions.js';

export const missionList: MissionDefinition[] = [...papyJoeMissions];
