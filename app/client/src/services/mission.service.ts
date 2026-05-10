import type {
	MissionInteractionCompleteResponse,
	MissionInteractionStartResponse
} from '@dinorpg/core/models/missions/missionInteraction.js';
import type {
	DinozMissionDetailResponse,
	DinozMissionGroupResponse,
	StartDinozMissionResponse,
	StopDinozMissionResponse
} from '@dinorpg/core/models/missions/missionResponse.js';

import { api } from '../utils/http';

export const MissionService = {
	getDinozMissionGroup(dinozId: number, group: string): Promise<DinozMissionGroupResponse> {
		return api.get<DinozMissionGroupResponse>(`/missions/dinoz/${dinozId}/groups/${group}`);
	},
	getDinozMissionDetail(dinozId: number, missionKey: string): Promise<DinozMissionDetailResponse> {
		return api.get<DinozMissionDetailResponse>(`/missions/dinoz/${dinozId}/mission/${missionKey}`);
	},
	startDinozMission(dinozId: number, missionKey: string): Promise<StartDinozMissionResponse> {
		return api.post<StartDinozMissionResponse>(`/missions/dinoz/${dinozId}/mission/${missionKey}/start`);
	},
	stopDinozMission(dinozId: number, missionKey: string): Promise<StopDinozMissionResponse> {
		return api.post<StopDinozMissionResponse>(`/missions/dinoz/${dinozId}/mission/${missionKey}/stop`);
	},
	startAction(dinozId: number): Promise<MissionInteractionStartResponse> {
		return api.post<MissionInteractionStartResponse>(`/missions/dinoz/${dinozId}/mission/action/start`);
	},
	completeAction(
		dinozId: number,
		trigger: 'manual' | 'fight_victory' = 'manual'
	): Promise<MissionInteractionCompleteResponse> {
		return api.post<MissionInteractionCompleteResponse>(`/missions/dinoz/${dinozId}/mission/action/complete`, {
			trigger
		});
	}
};
