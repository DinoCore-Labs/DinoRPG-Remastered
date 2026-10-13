export enum MonsterHuntStatus {
	DRAFT = 'DRAFT',
	SCHEDULED = 'SCHEDULED',
	ACTIVE = 'ACTIVE',
	ENDED = 'ENDED',
	REWARDED = 'REWARDED'
}

export interface MonsterHuntEdition {
	id: string;
	name: string;
	slug: string;
	status: MonsterHuntStatus;
	startAt: Date;
	endAt: Date;
	softCap: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface MonsterHuntParticipantProgress {
	huntId: string;
	userId: string;
	points: number;
	objects: number;
	kills: number;
	dailyKills: number;
}

export interface MonsterHuntLootProgress {
	monsterKey: string;
	lootKey: string;
	count: number;
	pointsEarned: number;
}
