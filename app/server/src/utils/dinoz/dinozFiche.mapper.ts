import { DinozFiche, DinozFicheLite, DinozPublicFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { placeList } from '@dinorpg/core/models/place/placeList.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { actualPlace, getMaxXp, getRace } from '@dinorpg/core/utils/dinozUtils.js';

import {
	Dinoz,
	DinozItems,
	DinozSkills,
	DinozStatus,
	Ranking,
	User,
	UserItems,
	UserRewards
} from '../../../../prisma/index.js';

type Config = {
	dinoz: {
		maxLevel: number;
	};
};

export type UserForDinozFiche = Parameters<typeof toDinozFiche>[0];
export const toDinozFiche = (
	user: Pick<User, 'id' /*| 'engineer'*/> & {
		items: Pick<UserItems, 'itemId' | 'quantity'>[];
		rewards: Pick<UserRewards, 'rewardId'>[];
		//quests: Pick<PlayerQuest, 'questId' | 'progression'>[];
		ranking: Pick<Ranking, 'dinozCount' | 'points'> | null;
		dinoz: (Pick<
			Dinoz,
			| 'id'
			| 'name'
			| 'display'
			//| 'unavailableReason'
			| 'level'
			//| 'leaderId'
			| 'life'
			| 'maxLife'
			| 'experience'
			| 'raceId'
			| 'placeId'
			| 'nbrUpFire'
			| 'nbrUpWood'
			| 'nbrUpWater'
			| 'nbrUpLightning'
			| 'nbrUpAir'
			//| 'order'
			| 'remaining'
			| 'fight'
			//| 'gather'
		> & {
			//missions: DinozMission[];
			items: Pick<DinozItems, 'itemId'>[];
			status: Pick<DinozStatus, 'statusId'>[];
			skills: Pick<DinozSkills, 'skillId' | 'state'>[];
			//followers: Pick<Dinoz, 'id' | 'fight' | 'remaining' | 'gather' | 'name'>[];
			//concentration: Concentration | null;
			//TournamentTeam: Pick<TournamentTeam, 'tournamentId'>[];
			//build: DinozBuild | null;
		})[];
	},
	activeDinoz: number
	//currentTournament: TournamentState | null
): DinozFiche => {
	const userForCondition = structuredClone(user);
	const dinoz = user.dinoz.find(d => d.id === activeDinoz);
	if (!dinoz) {
		throw new ExpectedError('Inexistant dinoz');
	}
	userForCondition.dinoz = [dinoz];
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		//unavailableReason: dinoz.unavailableReason,
		level: dinoz.level,
		//missionId: dinoz.missions?.find(mission => !mission.isFinished)?.missionId ?? null,
		//leaderId: dinoz.leaderId,
		//followers: dinoz.followers,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		maxExperience: getMaxXp(dinoz),
		race: getRace(dinoz.raceId),
		placeId: dinoz.placeId,
		items: dinoz.items?.map(item => item.itemId),
		maxItems: backpackSlot(/*player.engineer,*/ dinoz),
		status: dinoz.status?.sort((a, b) => a.statusId - b.statusId),
		borderPlace:
			//dinoz.unavailableReason !== null || !dinoz.fight || dinoz.leaderId
			//? []
			/*:*/ actualPlace(dinoz)
				.borderPlace.map(placeId => {
					const place = Object.values(placeList).find(place => place.placeId === placeId);
					if (!place) {
						throw new Error(`Place ${placeId} doesn't exist.`);
					}
					return place;
				})
				//.filter(place => !place.conditions || checkCondition(place.conditions, playerForCondition, dinoz.id))
				.map(place => place.placeId),
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		//missionHUD: getHUDObjective(dinoz),
		actions: [],
		skills: dinoz.skills,
		//order: dinoz.order,
		remaining: dinoz.remaining,
		fight: dinoz.fight
		//gather: dinoz.gather,
		//missions: dinoz.missions,
		//concentration: dinoz.concentration,
		/*tournament: dinoz.TournamentTeam.find(team => team.tournamentId === currentTournament?.id)
			? currentTournament
			: null,*/
		//build: dinoz.build ?? undefined
	};
};

export const toDinozFicheLite = (
	dinoz: Pick<
		Dinoz,
		| 'id'
		| 'name'
		| 'display'
		//| 'leaderId'
		| 'life'
		| 'maxLife'
		| 'experience'
		| 'placeId'
		//| 'order'
		//| 'unavailableReason'
		| 'level'
	> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
): DinozFicheLite => {
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		//leaderId: dinoz.leaderId,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		maxExperience: getMaxXp(dinoz),
		placeId: dinoz.placeId
		//order: dinoz.order,
		//unavailableReason: dinoz.unavailableReason
	};
};

export const toDinozPublicFiche = (
	dinoz: Pick<
		Dinoz,
		'id' | 'name' | 'display' /*| 'unavailableReason' */ | 'level' | 'raceId' | 'life' /*| 'order'*/
	> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
): DinozPublicFiche => {
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		//isFrozen: dinoz.unavailableReason === UnavailableReason.frozen,
		level: dinoz.level,
		life: dinoz.life,
		race: getRace(dinoz.raceId),
		status: dinoz.status?.map(status => status.statusId).sort((a, b) => a - b)
		//order: dinoz.order
	};
};

export const canChangeSkillState = (dinoz: { status: Pick<DinozStatus, 'statusId'>[] }) => {
	return dinoz.status.some(status => status.statusId === DinozStatusId.STRATEGY_IN_130_LESSONS);
};

export const knowSkillId = (
	dinoz: {
		skills: Pick<DinozSkills, 'skillId'>[];
	},
	skillId: number
) => {
	return dinoz.skills.some(skill => skill.skillId === skillId);
};

export const remainingXPToLevelUp = (
	dinoz: Pick<Dinoz, 'experience' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	return getMaxXp(dinoz) - dinoz.experience;
};

export const isMaxLevel = (dinoz: Pick<Dinoz, 'level'>, config: Config) => dinoz.level >= config.dinoz.maxLevel;

export const canLevelUp = (
	dinoz: Pick<Dinoz, 'experience' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	},
	config: Config
) => {
	return remainingXPToLevelUp(dinoz) <= 0 && !isMaxLevel(dinoz, config);
};

export const backpackSlot = (
	//engineer: boolean,
	dinoz: Pick<Dinoz, 'id'> & {
		skills: Pick<DinozSkills, 'skillId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	let total = 2;
	if (dinoz.skills.find(skill => skill.skillId === skillList[Skill.POCHE_VENTRALE].id)) total++;
	if (dinoz.skills.find(skill => skill.skillId === skillList[Skill.SURPLIS_DHADES].id)) total++;
	if (dinoz.status.find(status => status.statusId === DinozStatusId.BACKPACK)) total++;
	//if (engineer) total++;

	// TODO: Check for other dinoz storekeeper here
	return total;
};

export const isAlive = (dinoz: Pick<Dinoz, 'life'>) => dinoz.life > 0;

export const calculateXPBonus = (
	dinoz: Pick<Dinoz, 'id'> & {
		skills: Pick<DinozSkills, 'skillId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
	},
	xp: number,
	player: Pick<User, 'id' /*'teacher'*/>
) => {
	let f = 1.0;
	if (dinoz.skills.some(s => s.skillId === Skill.INTELLIGENCE)) f *= 1.05;
	//if (player.teacher) f *= 1.05;
	//TODO encyclopedie et maudit
	/*if( d.hasEquip(Data.OBJECTS.list.mencly) )
		f *= 1.15;
	if( d.hasEffect(Data.EFFECTS.list.maudit) )
		f = 0;*/
	return Math.round(xp * f);
};
