export enum FighterType {
	DINOZ = 'dinoz',
	MONSTER = 'monster',
	BOSS = 'boss',
	CLONE = 'clone',
	REINFORCEMENT = 'reinforcement'
}

export const AllFighterTypeExceptBoss = [
	FighterType.DINOZ,
	FighterType.MONSTER,
	FighterType.CLONE,
	FighterType.REINFORCEMENT
];
