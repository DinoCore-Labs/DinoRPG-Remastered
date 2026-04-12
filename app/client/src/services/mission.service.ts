import type {
	DinozMissionDetailResponse,
	DinozMissionGroupResponse,
	StartDinozMissionResponse,
	StopDinozMissionResponse
} from '@dinorpg/core/models/missions/missionResponse.js';

import { http } from '../utils/http';

export const MissionService = {
	async getDinozMissionGroup(dinozId: number, group: string): Promise<DinozMissionGroupResponse> {
		return http()
			.get(`/missions/dinoz/${dinozId}/groups/${group}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => {
				return Promise.reject(err);
			});
	},
	async getDinozMissionDetail(dinozId: number, missionKey: string): Promise<DinozMissionDetailResponse> {
		return http()
			.get(`/missions/dinoz/${dinozId}/mission/${missionKey}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => {
				return Promise.reject(err);
			});
	},
	async startDinozMission(dinozId: number, missionKey: string): Promise<StartDinozMissionResponse> {
		return http()
			.post(`/missions/dinoz/${dinozId}/mission/${missionKey}/start`)
			.then(res => Promise.resolve(res.data))
			.catch(err => {
				return Promise.reject(err);
			});
	},
	async stopDinozMission(dinozId: number, missionKey: string): Promise<StopDinozMissionResponse> {
		return http()
			.post(`/missions/dinoz/${dinozId}/mission/${missionKey}/stop`)
			.then(res => Promise.resolve(res.data))
			.catch(err => {
				return Promise.reject(err);
			});
	}
};
