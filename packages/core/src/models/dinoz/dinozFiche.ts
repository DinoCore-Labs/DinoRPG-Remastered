import { ActionFiche } from './dinozActions.js';
import { DinozRace } from './dinozRace.js';
import { DinozSkillsDTO } from './dinozSkills.js';
import { DinozStatusDTO } from './dinozStatus.js';

// This is the model to use to communicate with the front
export interface DinozFiche {
	id: number;
	name: string;
	display: string;
	//unavailableReason: UnavailableReason | null;
	level: number;
	//missionId: number | undefined | null;
	//missionHUD: MissionHUD | null;
	leaderId: number | null;
	followers: Pick<DinozFiche, 'id' | 'fight' | 'remaining' | /*'gather' |*/ 'name'>[];
	life: number;
	maxLife: number;
	experience: number;
	maxExperience: number;
	race: DinozRace;
	placeId: number;
	actions: ActionFiche[];
	items: number[];
	maxItems: number;
	skills: DinozSkillsDTO[];
	status: DinozStatusDTO[];
	borderPlace: number[];
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	order: number | null;
	remaining: number;
	fight: boolean;
	//gather: boolean;
	//missions: DinozMission[];
	//concentration: Concentration | null;
	//tournament: Pick<TournamentState, 'id' | 'levelLimit'> | null;
	/*npcAwait?: {
		npcSpeech: string;
		npcName: string;
	};*/
	//build?: DinozBuild;
}

export interface DinozFicheLite {
	id: number;
	name: string;
	display: string;
	leaderId: number | null;
	life: number;
	maxLife: number;
	experience: number;
	maxExperience: number;
	placeId: number;
	order: number | null;
	//unavailableReason: UnavailableReason | null;
}

// This is the model to use to communicate with the admin panel
export interface DinozAdminFiche {
	id: number;
	name: string;
	//unavailableReason: UnavailableReason | null;
	level: number;
	canChangeName: boolean;
	leaderId: number | null;
	life: number;
	maxLife: number;
	experience: number;
	placeId: number;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	status: number[];
	skills: number[];
	//unlockableSkills: number[];
}

export interface DinozPublicFiche {
	id: number;
	name: string;
	display: string;
	//isFrozen: boolean;
	life: number;
	level: number;
	race: DinozRace;
	status: number[];
	order: number | null;
}

export interface DinozDojoFiche {
	id: number;
	name: string;
	display: string;
	level: number;
}
