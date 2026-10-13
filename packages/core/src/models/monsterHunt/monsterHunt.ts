import { MonsterKey } from '../monster/monsterKey.js';

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

export enum MonsterHuntLootRarity {
	COMMON = 'COMMON',
	UNCOMMON = 'UNCOMMON',
	RARE = 'RARE',
	VERY_RARE = 'VERY_RARE'
}

export interface MonsterHuntMonsterConfig {
	/**
	 * Stable key identifying the monster variant used by the hunt.
	 *
	 * This key belongs to Monster Hunt and does not have to be an existing
	 * MonsterKey yet. The fight integration will resolve it later.
	 */
	monsterKey: MonsterKey;
	/**
	 * Stable key identifying the virtual hunt object.
	 */
	lootKey: string;
	/**
	 * Translation key for the object's displayed name.
	 */
	nameKey: string;
	/**
	 * Asset name used by the client.
	 * Hunt objects are not normal inventory items.
	 */
	icon?: string;
	/**
	 * Points awarded when this object is found.
	 */
	points: number;
	rarity: MonsterHuntLootRarity;
	/**
	 * Drop probability in basis points.
	 * 10000 = 100%, 2500 = 25%.
	 */
	dropRateBps: number;
	/**
	 * Relative encounter weight inside the Monster Hunt pool.
	 */
	spawnWeight: number;
	/**
	 * Allows this monster to ignore its normal zones while this edition
	 * is active and invade eligible maps throughout Dinoland.
	 */
	globalSpawn: boolean;
}

export interface MonsterHuntEditionConfig {
	slug: string;
	nameKey: string;
	softCap: number;
	monsters: readonly MonsterHuntMonsterConfig[];
}
