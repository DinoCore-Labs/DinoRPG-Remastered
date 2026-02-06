import { DinozStatusId } from './statusList.js';

export interface DinozStatusDTO {
	statusId: number; // ou StatusId si tu as un enum
}

export interface DinozStatusLite {
	statusId: DinozStatusId;
}
